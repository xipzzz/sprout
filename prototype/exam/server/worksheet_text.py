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
    pair = re.fullmatch(r"([A-Z][a-z]{2,7})(and|or)([A-Z][a-z]{2,})", token)
    if pair:
        return list(pair.groups())
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
    for match in re.finditer(r"\b([A-Z][a-z]{2,7})(?:and|or)([A-Z][a-z]{2,})\b", text or ""):
        names.update(word for word in match.groups() if not _known(word))
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


_HAN = "\u3400-\u9fff"
_HAN_RE = re.compile(f"[{_HAN}]")
_FULL_WIDTH = str.maketrans(
    {"（": "(", "）": ")", "［": "[", "］": "]", "｛": "{", "｝": "}", "．": ".", "：": ":", "？": "?", "！": "!", "；": ";", "\u3000": " "}
)
_FOOTER_RE = re.compile(
    r"\bwww\b|https?://|\b[\w-]+\.(?:com|sg|net|org)\b|\bsgexam\b|copyright|©|\bpage\s+\d+\s+of\s+\d+",
    re.IGNORECASE,
)
_OPEN = r"[\(\[\{<|]"
_CLOSE = r"[\)\]\}>|]"
_JUNK_CHARS = set("®©€¢¥£§¶\\|[]{}<>«»^`@#*")
_DASHES = {"-", "—", "–", "~"}
_FUZZY_DIGITS = str.maketrans({"l": "1", "I": "1", "|": "1", "i": "1", "O": "0", "o": "0", "S": "5", "s": "5", "B": "8", "Z": "2", "A": "4", "q": "9", "g": "9"})
_WEAK_CHOICE_RE = re.compile(r"^(?:\S{1,2}\s)?([1-9])\s+(?=\S)")
_FUZZY_QUESTION_RE = re.compile(r"^\W{0,2}([0-9lI|iOoSsBZAqg]{1,2})\s*[\.\)]\s+(?P<rest>\S.*)$")
_INLINE_MARK_RE = re.compile(r"\((\d{1,2})\)")
_EDITING_RE = re.compile(r"\b(mistake|error|spelling|underlined|correct the)\b", re.IGNORECASE)


def normalize_text(text: str) -> str:
    """Full-width punctuation to ASCII, circled numbers to (1), and no spaces between Han characters."""
    text = (text or "").replace("\r", "").translate(_FULL_WIDTH)
    text = re.sub("(?<=[A-Za-z])[\u2460-\u2468]", lambda m: f" {ord(m.group(0)) - 0x2460 + 1}", text)
    text = re.sub("[\u2460-\u2468]", lambda m: f" ({ord(m.group(0)) - 0x2460 + 1}) ", text)
    text = re.sub(rf"(?<=[{_HAN}])[ \t]+(?=[{_HAN}。，！？、；：])", "", text)
    text = re.sub(rf"(?<=[。，！？、；：])[ \t]+(?=[{_HAN}])", "", text)
    text = re.sub(rf"(?m)(?<=[。？！])[ \t]+\S{{1,2}}[ \t]*$", "", text)
    return re.sub(rf"(?m)^(\s*\d{{1,2}})(?:、|，|,(?=\s*[{_HAN}]))", r"\1.", text)


def normalize_markers(line: str) -> str:
    """Repair choice and question markers that OCR noise broke: '{3)', '(L)', '(2)-on', '\\ 1) nurse', ': 9.'."""
    text = re.sub(r"^\(\s*[lLI|]\s*\)\s*", "(1) ", line)
    text = re.sub(r"^\(([1-9])[MJlI|](?=\s)", r"(\1)", text)
    text = re.sub(r"\(([1-9])\)\s*\1\)", r"(\1)", text)
    text = re.sub(r"\((\d{1,2})\)[._]+(?=\s|$)", r"(\1)", text)
    text = re.sub(r"(?<=\s)\(\s*[lLI|]\s*\)(?=\s|$)", "(1)", text)
    text = re.sub(rf"(?:(?<=\s)|^){_OPEN}\s?([1-9])\s?{_CLOSE}", r"(\1)", text)
    text = re.sub(r"(\([1-9]\))[-–—~:=]+\s*", r"\1 ", text)
    text = re.sub(r"(\([1-9]\))(?=[^\s\d.,)])", r"\1 ", text)
    text = re.sub(rf"(?:(?<=\s)|^)([1-9]\))(?=[A-Za-z{_HAN}])", r"\1 ", text)
    text = re.sub(rf"([A-D][\.\)])(?=[{_HAN}])", r"\1 ", text)
    text = re.sub(r"^(?:[^\w\s(]{1,3}|[A-Za-z])\s+(?=\([1-9]\)\s|[1-9]\)\s|[a-dA-D][\)\.]\s)", "", text)
    return re.sub(r"^[^\w\s(]{1,3}\s*(?=\d{1,2}\s*[\.\)]\s)", "", text)


def is_footer(line: str) -> bool:
    return bool(_FOOTER_RE.search(line))


def strip_junk(line: str) -> str:
    """Drop leading bars and trailing answer-bracket debris like '( )', '«9', 'C0)', '( I'."""
    text = line.strip().lstrip("|¦").strip()
    text = re.sub(r"_+", f" {_BLANK} ", text)
    text = re.sub(r"(?:(?<=\s)|^)~(?=\s|$)", f" {_BLANK} ", text)
    if re.match(r"\([1-9a-dA-D]\)\s+\S", text):
        text = re.sub(r"(?<=\S)\s+[\(\[\{][^\s()\[\]{}]{0,4}[\)\]\}]?\s*$", "", text)
    tail = re.search(r"\s+([\(\[\{]\s*\S{0,2}\s*[\)\]\}]?)\s*$", text)
    if tail and not re.fullmatch(r"\(\w+\)", tail.group(1)):
        text = text[: tail.start()]
    while True:
        parts = text.rsplit(None, 1)
        if len(parts) < 2:
            break
        end = parts[1]
        is_debris = len(end) <= 4 and any(char in _BRACKET_CHARS for char in end)
        if is_debris and not re.fullmatch(r"\(\w+\)", end):
            text = parts[0].rstrip()
            continue
        break
    text = re.sub(rf"{_BLANK}\s+(?=[.,!?;:])", _BLANK, text)
    text = re.sub(rf"(?<=[{_HAN}])\s+(?={_BLANK})|(?<={_BLANK})\s+(?=[{_HAN}。，])", "", text)
    return re.sub(r"\s{2,}", " ", text).strip()


def _is_number(token: str) -> bool:
    return bool(re.fullmatch(r"[\d.,/]+[A-Za-z]{0,2}", token.strip("()?.,")))


def _junk_token(token: str) -> bool:
    if token == _BLANK or any(char.isalnum() for char in token):
        return False
    if any(char in _JUNK_CHARS for char in token):
        return True
    if any(char in "()" for char in token) and any(char in "=:;~" for char in token):
        return True
    return token in {":", ";"}


def _junk_word(token: str) -> bool:
    """Short debris that OCR finds in picture boxes: 'Re', 'AR', 'TERY', 'TT]'."""
    core = token.strip(".,;:!?\"'“”")
    if not core or core == _BLANK or _is_number(core) or _HAN_RE.search(core):
        return False
    if re.fullmatch(r"[A-Za-z]{2,}['’][a-z]{1,2}", core):
        return False
    if not core.isalpha():
        return True
    if _known(core):
        return False
    return len(core) <= 2 or (core.isupper() and len(core) <= 4)


def clean_stem(text: str) -> tuple[str, list[str]]:
    """Drop stray symbols and picture-box debris from a stem. Returns the text and what was dropped."""
    tokens = text.split()
    kept: list[str] = []
    removed: list[str] = []
    for index, token in enumerate(tokens):
        before = tokens[index - 1] if index else ""
        after = tokens[index + 1] if index + 1 < len(tokens) else ""
        beside_number = _is_number(before) or _is_number(after)
        single_letter = len(token) == 1 and token.isalpha() and token not in {"a", "A", "I"} and not _HAN_RE.match(token)
        if _junk_token(token) or (token in _DASHES and not beside_number) or (single_letter and not beside_number):
            removed.append(token)
            continue
        kept.append(token)
    out: list[str] = []
    boundary = True
    for token in kept:
        if boundary and _junk_word(token) and not _HAN_RE.search(token):
            removed.append(token)
            continue
        out.append(token)
        boundary = token.endswith((".", "?", "!", "。"))
    return " ".join(out), removed


def clean_choice(value: str) -> str:
    tokens = strip_junk(value).split()
    while len(tokens) > 1:
        last = tokens[-1]
        rest = " ".join(tokens[:-1])
        drop = (
            _junk_token(last)
            or not any(char.isalnum() for char in last)
            or bool(re.fullmatch(r"[-–—=~]+\S{0,2}", last))
            or (len(last) == 1 and last.isalpha() and last not in {"a", "A", "I"})
            or bool(re.fullmatch(r"[A-Za-z][:;,.]", last))
            or (last.isdigit() and len(last) == 1 and not re.search(r"\d", rest))
            or (last.isupper() and len(last) <= 4 and last.isalpha() and not _known(last) and tokens[0].islower())
        )
        if not drop:
            break
        tokens.pop()
    while tokens and (
        _junk_token(tokens[0])
        or re.fullmatch(r"[-–—=~]+", tokens[0])
        or (len(tokens) > 1 and re.fullmatch(r"[\[\]{}|]\S{0,2}|\S{0,2}[\[\]{}|]", tokens[0]))
    ):
        tokens.pop(0)
    return " ".join(tokens)


def _choice_key(raw: str) -> int:
    return int(raw) if raw.isdigit() else ord(raw.lower()) - ord("a") + 1


@dataclass
class _Hit:
    part: int
    start: int
    end: int
    key: int
    family: str
    strong: bool


def _hits(parts: list[str]) -> list[_Hit]:
    hits: list[_Hit] = []
    for index, part in enumerate(parts):
        taken: set[int] = set()
        for match in _CHOICE_TOKEN_RE.finditer(part):
            raw = match.group(1) or match.group(2)
            family = "num" if raw.isdigit() else "letter"
            hits.append(_Hit(index, match.start(), match.end(), _choice_key(raw), family, True))
            taken.add(match.start())
        weak = _WEAK_CHOICE_RE.match(part) if index else None
        if weak and weak.start(1) not in taken and not any(h.part == index and h.start <= weak.end() for h in hits):
            hits.append(_Hit(index, weak.start(1), weak.end(), int(weak.group(1)), "num", False))
        for match in _BARE_LETTER_RE.finditer(part):
            hits.append(_Hit(index, match.start(), match.end(), _choice_key(match.group(1)), "bare", False))
    hits.sort(key=lambda hit: (hit.part, hit.start))
    return hits


def _best_chain(hits: list[_Hit], families: set[str]) -> list[_Hit]:
    pool = [hit for hit in hits if hit.family in families]
    best: list[tuple[float, int]] = []
    for i, hit in enumerate(pool):
        own = 2.0 if hit.strong else 1.0
        score, previous = (own if hit.key == 1 else own - 1.5 if hit.key == 2 else float("-inf")), -1
        for j in range(i):
            earlier = pool[j]
            step = hit.key - earlier.key
            if earlier.family != hit.family or step not in (1, 2) or best[j][0] == float("-inf"):
                continue
            candidate = best[j][0] + own - (1.5 if step == 2 else 0.0)
            if candidate > score:
                score, previous = candidate, j
        best.append((score, previous))
    if not best:
        return []
    end = max(range(len(best)), key=lambda k: (best[k][0], k))
    if best[end][0] <= 0:
        return []
    chain = []
    while end != -1:
        chain.append(pool[end])
        end = best[end][1]
    return chain[::-1]


def _fill_gaps(parts: list[str], chain: list[_Hit]) -> list[_Hit]:
    """A missing marker between B and D, like '5. 公园' or '.学校', becomes C."""
    filled: list[_Hit] = []
    for index, hit in enumerate(chain):
        filled.append(hit)
        if index + 1 >= len(chain) or chain[index + 1].key - hit.key != 2 or chain[index + 1].part != hit.part:
            continue
        nxt = chain[index + 1]
        segment = parts[hit.part][hit.end : nxt.start]
        pseudo = re.search(r"(?:(?<=\s)|^)\S{0,2}[\.\)](?=\s*\S)", segment)
        if pseudo and segment[: pseudo.start()].strip():
            filled.append(_Hit(hit.part, hit.end + pseudo.start(), hit.end + pseudo.end(), hit.key + 1, hit.family, False))
    return filled


def _sentence_line(line: str) -> bool:
    return len(line.split()) >= 4 and line[:1].isupper() and line.rstrip().endswith((".", "!", "?"))


def _label(hit: _Hit) -> str:
    return str(hit.key) if hit.family == "num" else chr(ord("A") + hit.key - 1)


def _split_body(parts: list[str]) -> tuple[list[str], list[str], list[str], list[str]]:
    """Split a question's lines into stem text, choices, trailing lines that belong to neither, and choice labels."""
    hits = _hits(parts)
    chain = _best_chain(hits, {"num", "letter"})
    if len(chain) < 2:
        bare = _best_chain(hits, {"bare"})
        if len(bare) >= 2 or (bare and bare[0].start == 0 and bare[0].part > 0):
            chain = bare
    if len(chain) == 1 and (chain[0].start != 0 or not chain[0].strong):
        chain = []
    if not chain:
        return parts, [], [], []
    chain = _fill_gaps(parts, chain)
    chosen = {(hit.part, hit.start) for hit in chain}
    stray_lines = {
        hit.part
        for hit in hits
        if hit.start == 0 and (hit.part, hit.start) not in chosen and hit.family != "bare" and hit.part > chain[0].part
    }
    first = chain[0]
    stem = [part for index, part in enumerate(parts[: first.part])] + [parts[first.part][: first.start]]
    choices = []
    trailing: list[str] = []
    for index, hit in enumerate(chain):
        nxt = chain[index + 1] if index + 1 < len(chain) else None
        if nxt and nxt.part == hit.part:
            value = parts[hit.part][hit.end : nxt.start]
        else:
            pieces = [parts[hit.part][hit.end :]]
            stop = nxt.part if nxt else len(parts)
            for middle in range(hit.part + 1, stop):
                if middle in stray_lines:
                    continue
                if not nxt and (trailing or _sentence_line(parts[middle])):
                    trailing.append(parts[middle])
                    continue
                pieces.append(parts[middle])
            if nxt:
                pieces.append(parts[nxt.part][: nxt.start])
            value = " ".join(pieces)
        choices.append(value)
    return [piece for piece in stem if piece.strip()], choices, trailing, [_label(hit) for hit in chain]


@dataclass
class _Draft:
    number: int
    stem_parts: list[str] = field(default_factory=list)


@dataclass
class ParsedQuestion:
    number: int
    stem: str
    choices: list[str]
    stem_changes: list[str]
    choice_changes: list[str]
    removed: list[str] = field(default_factory=list)
    set_aside: list[str] = field(default_factory=list)
    choice_labels: list[str] = field(default_factory=list)


@dataclass
class ParsedSheet:
    title: str
    questions: list[ParsedQuestion]
    layout: str = "questions"


@dataclass
class _Candidate:
    index: int
    number: int
    rest: str
    mark: str
    prefixed: bool
    strong: bool


def _stem_like(rest: str) -> bool:
    words = re.findall(r"[A-Za-z']+|\d+(?:\.\d+)?", rest)
    return len(words) >= 4 or len(_HAN_RE.findall(rest)) >= 5 or "?" in rest or _BLANK in rest


def _candidates(lines: list[str]) -> list[_Candidate]:
    found = []
    for index, line in enumerate(lines):
        if line.lstrip().startswith("("):
            continue
        match = _QUESTION_RE.match(line)
        if not match:
            continue
        rest = match.group("rest")
        prefixed = bool(match.group("q"))
        mark = "q" if prefixed else (match.group("mark").strip() or " ")
        found.append(_Candidate(index, int(match.group("n")), rest, mark, prefixed, prefixed or _stem_like(rest)))
    return found


def _backbone(candidates: list[_Candidate]) -> list[_Candidate]:
    """The longest believable run of question numbers among stem-like lines. Gaps cost a little."""
    strong = [c for c in candidates if c.strong]
    best: list[tuple[float, int]] = []
    for i, cand in enumerate(strong):
        own = 3.0 + (0.5 if cand.mark in {".", "q"} else 0.0)
        score, previous = own, -1
        for j in range(i):
            earlier = strong[j]
            step = cand.number - earlier.number
            if not 1 <= step <= 3:
                continue
            value = best[j][0] + own - 1.5 * (step - 1) - (1.0 if earlier.mark != cand.mark else 0.0)
            if value > score:
                score, previous = value, j
        best.append((score, previous))
    if not best:
        return []
    end = max(range(len(best)), key=lambda k: (best[k][0], -k))
    chain = []
    while end != -1:
        chain.append(strong[end])
        end = best[end][1]
    return chain[::-1]


def _choice_marker_line(line: str) -> bool:
    return bool(_CHOICE_TOKEN_RE.match(line) or _WEAK_CHOICE_RE.match(line))


def _looks_like_choice(cand: _Candidate, marker_lines: int) -> bool:
    """'2) He' under question 1 is a choice, not question 2."""
    if cand.prefixed:
        return False
    return cand.number == marker_lines + 1 and len(cand.rest.split()) <= 3 and _BLANK not in cand.rest


def _fuzzy_number(line: str, wanted: int) -> str | None:
    match = _FUZZY_QUESTION_RE.match(line)
    if not match or not _stem_like(match.group("rest")):
        return None
    digits = match.group(1).translate(_FUZZY_DIGITS)
    return match.group("rest") if digits.isdigit() and int(digits) == wanted else None


def _drafts_from_lines(lines: list[str]) -> tuple[list[str], list[_Draft]]:
    candidates = _candidates(lines)
    by_line = {cand.index: cand for cand in candidates}
    backbone = _backbone(candidates)
    spine = {cand.index for cand in backbone}
    if not backbone and candidates:
        has_one = any(cand.number == 1 for cand in candidates)
        first = next((c for c in candidates if c.number == 1), candidates[0]) if has_one else candidates[0]
        spine = {first.index}
    spine_numbers = sorted((by_line[i].number, i) for i in spine)
    header: list[str] = []
    drafts: list[_Draft] = []
    marker_lines = 0
    for index, line in enumerate(lines):
        if re.fullmatch(r"\d{1,3}", line):
            continue
        current = drafts[-1] if drafts else None
        upcoming = next((number for number, at in spine_numbers if at > index), None)
        cand = by_line.get(index)
        start_rest = None
        if index in spine:
            start_rest = (cand.number, cand.rest)
        elif current and cand and cand.number == current.number + 1 and (upcoming is None or cand.number < upcoming):
            if not _looks_like_choice(cand, marker_lines):
                start_rest = (cand.number, cand.rest)
        elif current and upcoming is not None and upcoming - current.number >= 2:
            rest = _fuzzy_number(line, current.number + 1)
            if rest:
                start_rest = (current.number + 1, rest)
        if start_rest:
            number, rest = start_rest
            drafts.append(_Draft(number=number, stem_parts=[rest]))
            marker_lines = 0
            continue
        if not current:
            header.append(line)
            continue
        if _choice_marker_line(line):
            marker_lines += 1
        current.stem_parts.append(line)
    return header, drafts


def _unnumbered_draft(lines: list[str]) -> list[_Draft]:
    if not lines:
        return []
    stem_index = next((i for i, line in enumerate(lines) if "?" in line), 0)
    return [_Draft(number=1, stem_parts=lines[stem_index:])]


def _inline_chain(lines: list[str]) -> list[tuple[int, int, int]]:
    """Sequential '(n)' markers anywhere in the text, as (line, offset, number)."""
    marks = [
        (index, match.start(), int(match.group(1)))
        for index, line in enumerate(lines)
        for match in _INLINE_MARK_RE.finditer(line)
    ]
    best: list[list[tuple[int, int, int]]] = []
    for mark in marks:
        runs = [run for run in best if 1 <= mark[2] - run[-1][2] <= 2]
        chosen = max(runs, key=len) if runs else None
        best.append((chosen + [mark]) if chosen else [mark])
    return max(best, key=len) if best else []


def _chain_is_prose(lines: list[str], chain: list[tuple[int, int, int]]) -> bool:
    """Markers sit in running text (a passage), not in a row of short choices."""
    joined, starts = "", []
    for line in lines:
        starts.append(len(joined))
        joined += line + " "
    positions = [starts[line] + offset for line, offset, _ in chain]
    gaps = [len(re.findall(r"[A-Za-z]+|[\u3400-\u9fff]", joined[a:b])) - 1 for a, b in zip(positions, positions[1:])]
    return bool(gaps) and sum(gaps) / len(gaps) >= 3


def _is_cloze(lines: list[str], drafts: list[_Draft]) -> list[tuple[int, int, int]]:
    chain = _inline_chain(lines)
    if len(chain) < 3:
        return []
    with_choices = sum(1 for draft in drafts if len(_split_body(draft.stem_parts)[1]) >= 2)
    blanks = sum(1 for line, offset, _ in chain if lines[line][offset:].split(")", 1)[1].lstrip().startswith(_BLANK))
    mid_line = sum(1 for line, offset, _ in chain if offset > 0)
    if not _chain_is_prose(lines, chain):
        return []
    if len(chain) >= 5 and with_choices <= len(chain) // 3:
        return chain
    if with_choices <= 1 and (blanks >= 2 or mid_line >= 2):
        return chain
    return []


_INSTRUCTION_RE = re.compile(
    r"marks?\)|^\s*(section|part)\b|\b(fill|read|blank|blanks|passage|choose|complete|underlined|mistake|error|spelling|correct)\b",
    re.IGNORECASE,
)


def _cloze_questions(
    lines: list[str], chain: list[tuple[int, int, int]], names: set[str]
) -> tuple[str, list[ParsedQuestion], bool]:
    marker_line = chain[0][0]
    cues = [index for index in range(marker_line) if _INSTRUCTION_RE.search(lines[index])]
    first_line = cues[-1] + 1 if cues else marker_line
    header = lines[:first_line]
    editing = any(_EDITING_RE.search(line) for line in header)
    body = ""
    offsets: dict[int, int] = {}
    starts = []
    for index in range(first_line, len(lines)):
        starts.append(len(body))
        body += lines[index] + " "
    for line, offset, number in chain:
        offsets[number] = starts[line - first_line] + offset
    sentences = [(m.start(), m.end()) for m in re.finditer(r"[^.!?。]+[.!?。]*\s*", body)]
    questions = []
    for _, _, number in chain:
        at = offsets[number]
        start, end = next(((s, e) for s, e in sentences if s <= at < e), (0, len(body)))
        sentence = body[start:end]
        local = at - start
        marker = f"({number})"
        own = sentence[:local] + "\u0000" + sentence[local + len(marker) :]
        own = re.sub(rf"\((\d{{1,2}})\)\s*(?:{_BLANK})?", lambda m: "…" if not editing else "", own)
        if editing:
            own = own.replace("\u0000", marker)
        else:
            own = re.sub(rf"\u0000\s*(?:{_BLANK})?", f"{_BLANK} ", own)
        stem = re.sub(r"\s{2,}", " ", own).strip()
        stem = re.sub(rf"{_BLANK}\s+(?=[.,!?;:])", _BLANK, stem)
        stem, changes = resplit_glued(stem, names)
        stem, removed = clean_stem(stem)
        questions.append(ParsedQuestion(number, stem, [], changes, [], removed))
    return (header[0] if header else ""), questions, editing


def text_script(text: str) -> dict:
    """How the OCR text looks: Han share, and whether English OCR produced gibberish."""
    han = len(_HAN_RE.findall(text or ""))
    letters = len(re.findall(r"[A-Za-z]", text or ""))
    tokens = re.findall(r"[A-Za-z]{3,}", text or "")
    upper = sum(1 for token in tokens if token.isupper())
    known = sum(1 for token in tokens if _known(token))
    garbled = len(tokens) >= 6 and upper / len(tokens) >= 0.5 and known / len(tokens) < 0.2
    return {
        "han_share": han / max(1, han + letters),
        "garbled": garbled and han == 0,
    }


def parse_worksheet_text(text: str) -> ParsedSheet:
    raw = normalize_text(text)
    lines = []
    for line in raw.split("\n"):
        if is_footer(line):
            continue
        cleaned = strip_junk(normalize_markers(line))
        if cleaned:
            lines.append(cleaned)
    names = standalone_names("\n".join(lines))
    header, drafts = _drafts_from_lines(lines)

    cloze = _is_cloze(lines, drafts)
    if cloze:
        title, questions, editing = _cloze_questions(lines, cloze, names)
        return ParsedSheet(title=title, questions=questions, layout="editing" if editing else "cloze")

    if not drafts:
        header, drafts = [], _unnumbered_draft(lines)

    questions = []
    for draft in drafts:
        stem_parts, raw_choices, set_aside, raw_labels = _split_body(draft.stem_parts)
        joined = re.sub(r"\s{2,}", " ", " ".join(stem_parts)).strip()
        stem, stem_changes = resplit_glued(joined, names)
        stem, removed = clean_stem(stem)
        choices: list[str] = []
        labels: list[str] = []
        choice_changes: list[str] = []
        for value, label in zip(raw_choices, raw_labels):
            cleaned, changes = resplit_glued(clean_choice(value), names)
            if cleaned:
                choices.append(cleaned)
                labels.append(label)
                choice_changes.extend(changes)
        if len(choices) < 2:
            choices, labels, choice_changes = [], [], []
        elif sum(choice.islower() for choice in choices) >= len(choices) - 1:
            choices = [c.lower() if c.isupper() and len(c) <= 4 and _known(c) else c for c in choices]
        questions.append(
            ParsedQuestion(draft.number, stem, choices, stem_changes, choice_changes, removed, set_aside, labels)
        )
    title = next(
        (
            line
            for line in header
            if (len(re.findall(r"[A-Za-z]", line)) >= 3 or _HAN_RE.search(line))
            and not re.match(r"(name|class|date|index)\b", line, re.IGNORECASE)
        ),
        "",
    )
    return ParsedSheet(title=title, questions=questions)


_PRINTED_RE = re.compile(rf"^[^\w(]{{0,3}}(?:Q\s*)?(\d{{1,2}})(?:\s*[\.\)、]\s*|\s+)(?P<rest>[A-Za-z{_HAN}\"“].*)$")


def printed_numbers(text: str) -> list[int]:
    """Question numbers printed at the start of stem-like lines, or the inline (n) blanks of a passage.

    A cross-check for the parser: it does not use the parser's backbone.
    """
    lines = [normalize_markers(line.strip()) for line in normalize_text(text).split("\n")]
    lines = [line for line in lines if line and not is_footer(line)]
    found = set()
    for line in lines:
        match = _PRINTED_RE.match(line)
        if not match:
            continue
        rest = match.group("rest")
        if len(re.findall(r"[A-Za-z']+|\d+", rest)) >= 3 or len(_HAN_RE.findall(rest)) >= 5:
            found.add(int(match.group(1)))
    chain = _inline_chain(lines)
    if len(chain) >= 3 and len(chain) > len(found) and _chain_is_prose(lines, chain):
        return sorted({number for _, _, number in chain})
    return sorted(found)
