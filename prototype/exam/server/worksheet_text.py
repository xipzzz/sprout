"""Turn Tesseract text from a printed worksheet into questions.

Question numbers: "1.", "1)", "1 " and "Q1". Choices: "A.", "a)", "(1)", "1)",
bare "A ... B ...", or several on one line. Lines before question 1 are the
title and instructions. Light cleanup strips answer-bracket debris and re-splits
words Tesseract ran together, only when every piece is a known word.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

# Kept small on purpose. A re-split needs every piece to be in this list, except a
# leading name, so the list doubles as a guard: anything listed is never split.
_BASE_WORDS = """
a an the this that these those there here
i me my mine you your yours he him his she her hers it its we us our they them their
myself yourself himself herself itself ourselves themselves
who whom whose what which where when why how
is am are was were be been being has have had do does did done can could will would
shall should may might must not no yes cannot
and or but so because if then than as of to in into on onto at by for from with
within without about above below under over up down out off through across along
around after before behind beside besides between near past till until upon inside
outside together
all any some many much more most few each every both other another such own same
anyone someone everyone nothing something everything anything
very too also just only even still again once never always often sometimes maybe
one two three four five six seven eight nine ten first second third last next
new old big small little long short tall high low good bad hot cold fast slow
happy sad kind nice best better young full empty right wrong red blue green yellow
white black brown pink
boy girl man woman child children baby mother father mum dad brother sister friend
teacher pupil class school home house room door window table chair bed desk book
pen pencil bag box ball toy toys game fun cake bread rice milk water tea sugar salt
jar cup plate bowl food apple egg fish meat dog cat bird horse cow hen duck pig
sheep goat rabbit mouse lion tiger fence field side garden tree flower grass park
road street car bus bike train shop market sun moon star rain wind sky day night
morning time week year today tonight tomorrow yesterday knee hand head eye eyes leg
foot face hair arm
bedroom classroom playground football indoor outdoor sunset upset
mr mrs miss
play go goes went come came see saw seen look get got give gave take took make made
put run ran jump walk eat ate drink drank sleep slept read write wrote sing sang
swim swam sit sat stand stood fall fell fallen hurt cry cried help like love want
need say said tell told ask think thought know knew pour clean wash open close
carry carried buy bought find found keep kept live work
become became behave forget forgot inform
""".split()

_KNOWN = {word.lower() for word in _BASE_WORDS}

# A split must produce one of these, so compounds like "whiteboard" stay whole.
_FUNCTION_WORDS = {
    "a", "an", "the", "is", "am", "are", "was", "were", "be", "has", "have", "had",
    "and", "or", "but", "so", "of", "to", "in", "on", "at", "by", "for", "from", "with",
    "up", "down", "out", "off", "over", "into", "his", "her", "its", "my", "your",
    "our", "their", "he", "she", "it", "we", "they", "i", "you", "this", "that",
}

_BRACKET_CHARS = set("()[]{}«»<>|")
_QUESTION_RE = re.compile(
    r"^\s*(?P<q>(?:Q|Question)\s*\.?\s*)?(?P<n>\d{1,2})(?P<mark>\s*[\.\)]\s*|\s+)(?P<rest>\S.*)$",
    re.IGNORECASE,
)
_CHOICE_TOKEN_RE = re.compile(r"(?:(?<=\s)|^)(?:\(([1-9a-dA-D])\)|([1-9a-dA-D])[\)\.])(?=\s)")
_BARE_LETTER_RE = re.compile(r"(?:(?<=\s)|^)([A-D])(?=\s+\S)")
_BLANK = "____"


def _known(word: str) -> bool:
    lower = word.lower()
    if lower in _KNOWN:
        return True
    for suffix, extra in (("ing", ""), ("ed", ""), ("ed", "e"), ("es", ""), ("s", ""), ("d", "")):
        if lower.endswith(suffix) and len(lower) > len(suffix) + 1:
            if lower[: -len(suffix)] + extra in _KNOWN:
                return True
    return False


def _segment_known(text: str) -> list[str] | None:
    """Fewest-piece split of text into known words, or None."""
    lower = text.lower()
    size = len(lower)
    best: list[list[int] | None] = [None] * (size + 1)
    best[0] = []
    for end in range(1, size + 1):
        for start in range(max(0, end - 14), end):
            prefix = best[start]
            if prefix is None:
                continue
            piece = lower[start:end]
            if not _known(piece) or (len(piece) == 1 and piece not in {"a", "i"}):
                continue
            candidate = prefix + [end]
            current = best[end]
            if current is None or len(candidate) < len(current):
                best[end] = candidate
    cuts = best[size]
    if not cuts:
        return None
    pieces, previous = [], 0
    for cut in cuts:
        pieces.append(text[previous:cut])
        previous = cut
    return pieces


def _has_function_word(pieces: list[str]) -> bool:
    return any(piece.lower() in _FUNCTION_WORDS for piece in pieces)


def _split_token(token: str, next_word: str, names: set[str]) -> list[str] | None:
    if len(token) < 5 or _known(token):
        return None
    pieces = _segment_known(token)
    if pieces and len(pieces) >= 2 and _has_function_word(pieces):
        return pieces
    if not token[0].isupper():
        return None
    # A leading name glued to the next word, e.g. "Aliis" or "Fionafelldown".
    # Only with evidence, so real names like "Ethan" or "Simon" stay whole.
    options = []
    for cut in range(3, min(8, len(token) - 1) + 1):
        name, rest = token[:cut], token[cut:]
        tail = _segment_known(rest)
        if not tail or not _has_function_word(tail):
            continue
        seen_alone = name in names
        long_tail = len(tail) >= 2
        name_and_name = [p.lower() for p in tail] == ["and"] and next_word[:1].isupper()
        if seen_alone or long_tail or name_and_name:
            cost = 1 + sum(2 if len(piece) == 1 else 1 for piece in tail)
            options.append((cost, cut, [name] + tail))
    if not options:
        return None
    options.sort(key=lambda option: (option[0], option[1]))
    return options[0][2]


def standalone_names(text: str) -> set[str]:
    """Capitalized words that appear on their own mid-sentence, like 'Ali' in 'and Ali'."""
    names = set()
    for match in re.finditer(r"(?<=[a-z,]\s)([A-Z][a-z]{2,})(?![A-Za-z])", text or ""):
        word = match.group(1)
        if not _known(word):
            names.add(word)
    return names


def resplit_glued(text: str, names: set[str] | None = None) -> tuple[str, list[str]]:
    """Add spaces inside run-together words. Returns the text and what changed."""
    names = names or set()
    changes: list[str] = []
    words = list(re.finditer(r"[A-Za-z]+", text))
    out, last = [], 0
    for index, match in enumerate(words):
        token = match.group(0)
        next_word = words[index + 1].group(0) if index + 1 < len(words) else ""
        pieces = _split_token(token, next_word, names)
        out.append(text[last : match.start()])
        if pieces:
            joined = " ".join(pieces)
            changes.append(f"{token} → {joined}")
            out.append(joined)
        else:
            out.append(token)
        last = match.end()
    out.append(text[last:])
    fixed = "".join(out)

    quoted, quotes = [], 0
    for index, char in enumerate(fixed):
        quoted.append(char)
        following = fixed[index + 1] if index + 1 < len(fixed) else ""
        if char == '"':
            quotes += 1
            closing = quotes % 2 == 0
        else:
            closing = char == "\u201d"
        if closing and following.isalpha():
            quoted.append(" ")
            changes.append(f"{char}{following} → {char} {following}")
    return "".join(quoted), changes


def strip_junk(line: str) -> str:
    """Drop leading bars and trailing answer-bracket debris like '( )', '«9', 'C0)'."""
    text = line.strip().lstrip("|¦").strip()
    text = re.sub(r"_+", f" {_BLANK} ", text)
    while True:
        parts = text.rsplit(None, 1)
        if len(parts) < 2:
            break
        tail = parts[1]
        is_debris = len(tail) <= 4 and any(char in _BRACKET_CHARS for char in tail)
        if is_debris and not re.fullmatch(r"\(\w+\)", tail):
            text = parts[0].rstrip()
            continue
        break
    text = re.sub(rf"{_BLANK}\s+(?=[.,!?;:])", _BLANK, text)
    return re.sub(r"\s{2,}", " ", text).strip()


def _choice_key(raw: str) -> int:
    return int(raw) if raw.isdigit() else ord(raw.lower()) - ord("a") + 1


def _sequential(found: list[tuple[int, int, int]], expected: int) -> list[tuple[int, int, int]]:
    run: list[tuple[int, int, int]] = []
    for start, end, key in found:
        if key == ((run[-1][2] + 1) if run else expected):
            run.append((start, end, key))
    return run


def split_choices(text: str, expected: int) -> tuple[str, list[str]]:
    """Find a run of sequential choice markers. Returns (text before, choices)."""
    marked = [
        (m.start(), m.end(), _choice_key(m.group(1) or m.group(2)))
        for m in _CHOICE_TOKEN_RE.finditer(text)
    ]
    run = _sequential(marked, expected)
    if len(run) == 1 and run[0][0] != 0:
        run = []
    if not run:
        bare = [(m.start(), m.end(), _choice_key(m.group(1))) for m in _BARE_LETTER_RE.finditer(text)]
        run = _sequential(bare, expected)
        if len(run) < 2 and not (run and expected > 1 and run[0][0] == 0):
            run = []
    if not run:
        return text, []
    before = text[: run[0][0]].strip()
    choices = []
    for index, (_, end, _) in enumerate(run):
        stop = run[index + 1][0] if index + 1 < len(run) else len(text)
        value = text[end:stop].strip()
        if value:
            choices.append(value)
    return before, choices


@dataclass
class _Draft:
    number: int
    stem_parts: list[str] = field(default_factory=list)
    choices: list[str] = field(default_factory=list)


@dataclass
class ParsedQuestion:
    number: int
    stem: str
    choices: list[str]
    stem_changes: list[str]
    choice_changes: list[str]


@dataclass
class ParsedSheet:
    title: str
    questions: list[ParsedQuestion]


def _question_match(line: str):
    if line.lstrip().startswith("("):
        return None
    return _QUESTION_RE.match(line)


def _looks_like_choice(match, current: _Draft) -> bool:
    """'2) He' under question 1 is a choice, not question 2."""
    if match.group("q"):
        return False
    rest = match.group("rest")
    number = int(match.group("n"))
    return number == len(current.choices) + 1 and len(rest.split()) <= 3 and _BLANK not in rest


def _drafts_from_lines(lines: list[str]) -> tuple[list[str], list[_Draft]]:
    has_question_one = any((m := _question_match(line)) and int(m.group("n")) == 1 for line in lines)
    header: list[str] = []
    drafts: list[_Draft] = []
    for line in lines:
        if re.fullmatch(r"\d{1,3}", line):
            continue
        current = drafts[-1] if drafts else None
        match = _question_match(line)
        if match:
            number = int(match.group("n"))
            expected = current.number + 1 if current else (1 if has_question_one else number)
            if number == expected and not (current and _looks_like_choice(match, current)):
                stem, choices = split_choices(match.group("rest"), 1)
                drafts.append(_Draft(number=number, stem_parts=[stem] if stem else [], choices=choices))
                continue
        if current:
            before, choices = split_choices(line, len(current.choices) + 1)
            if choices and not before:
                current.choices.extend(choices)
                continue
        if not current:
            header.append(line)
        elif current.choices:
            current.choices[-1] = f"{current.choices[-1]} {line}"
        else:
            current.stem_parts.append(line)
    return header, drafts


def _unnumbered_draft(lines: list[str]) -> list[_Draft]:
    if not lines:
        return []
    stem_index = next((i for i, line in enumerate(lines) if "?" in line), 0)
    draft = _Draft(number=1, stem_parts=[lines[stem_index]])
    for line in lines[stem_index + 1 :]:
        before, choices = split_choices(line, len(draft.choices) + 1)
        if choices and not before:
            draft.choices.extend(choices)
    return [draft]


def parse_worksheet_text(text: str) -> ParsedSheet:
    raw = (text or "").replace("\r", "")
    lines = [line for line in (strip_junk(line) for line in raw.split("\n")) if line]
    names = standalone_names("\n".join(lines))
    header, drafts = _drafts_from_lines(lines)
    if not drafts:
        header, drafts = [], _unnumbered_draft(lines)

    questions = []
    for draft in drafts:
        stem, stem_changes = resplit_glued(re.sub(r"\s{2,}", " ", " ".join(draft.stem_parts)).strip(), names)
        choices: list[str] = []
        choice_changes: list[str] = []
        for value in draft.choices:
            cleaned, changes = resplit_glued(strip_junk(value), names)
            if cleaned:
                choices.append(cleaned)
                choice_changes.extend(changes)
        if len(choices) < 2:
            choices, choice_changes = [], []
        questions.append(ParsedQuestion(draft.number, stem, choices, stem_changes, choice_changes))
    return ParsedSheet(title=header[0] if header else "", questions=questions)
