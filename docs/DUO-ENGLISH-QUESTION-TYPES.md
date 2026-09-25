# Duolingo ENGLISH course — exercise / challenge type taxonomy

**Scope:** Duolingo Language app **English courses** for speakers of other languages (EN as target; 20+ L1 base courses), plus EN-as-base bilingual lessons where the same interaction kinds appear.  
**Out of scope (separate product):** Duolingo English Test (DET) — different item bank (Read and Select, Listen and Type, Interactive Reading, etc.). Noted only to avoid conflation.  
**Research date:** 2026-09-26 (Asia/Singapore).  
**Method:** Duo blog/help primary sources, community wiki (Exercise + Stories), duoplanet/guides, Duo method whitepaper, local Sprout/DuoLens forensics under `docs`. Not an official Duo catalog — Duo does not publish a complete public type list.

---

## Count summary

**Estimated total distinct learner-facing exercise kinds: ~34–40**  
- **Core path / Practice Hub reusable kinds:** ~22–26  
- **Stories-specific kinds (often only in Stories):** ~9–12  
- **Immersive / Max / timed surfaces (session formats more than atomic drills):** ~6–8  
- **Retired / removed:** ~4–6  

**Confidence:** **medium-high (~0.75)** on core path + Stories + Practice Tab names; **medium (~0.55)** on exact monolingual-English B1/B2 internal type set (Duo describes them by *purpose*, not always by public UI label); **low-medium (~0.45)** on complete Adventures micro-prompt inventory (scenario choices + env taps, not classic Check exercises).

**Surfaces covered:** classic path lessons · Tips / Smart Tips (feedback, not always a scored exercise) · Practice Hub / Practice tab (Mistakes, Words, Speak, Listen, Stories/Radio/Adventures revisit) · Stories · Legendary · DuoRadio · Adventures · Video Call (Lily / Falstaff) · Roleplay · English Sounds / pronunciation tab · Side Quests · Match Madness / XP Ramp Up / Rapid Review · Energy (resource, not an exercise type) · local forensic: desktop web `/lesson` image-MC + matching.

**Local prior notes used:** `docs/DUOLENS-FORENSIC-NOTE.md`, `docs/duo-word-pick/teardown/duo-vs-sprout-word-pick.md`, `docs/duo-word-pick/pack/duo-forensic-pack.md`, `docs/sprout-scan-harness/duo-forensic-pack.md`, `docs/sprout-lesson-sot/SOT-LOCK-B.md`.

---

## Product surfaces (what you cover)

| Surface | What it is | Exercise mix | Live (2026)? |
|---------|------------|--------------|--------------|
| **Classic path lessons** | Unit nodes on the learning path | Full mix of listening, speaking, tiles, type, MC, matching, cloze, translation / monolingual EN | Live |
| **Speaking practice nodes** | Path nodes focused on speaking | Mostly speak / repeat | Live (course-dependent) |
| **Personalized practice** | Path “practice tailored for you” | Mistakes-weighted mix | Live |
| **Legendary** | Harder redo of a completed node; **no hints** | Same kinds, harder selection / no word hints | Live |
| **Practice Hub / Practice tab** | Dumbbell tab — Mistakes, Words, Speak, Listen (+ Stories/Radio/Adventures; Max: Video Call/Roleplay) | Skill-filtered subsets of core kinds; Words ≈ matching/vocab; Speak/Listen = mono-skill lessons | Live; **made free for all** (Duo blog Feb 2026) |
| **Stories** | Path story nodes + Practice revisit | ~12 comprehension / cloze / pairs kinds; ends with Tap the pairs | Live in many EN-target courses |
| **DuoRadio** | Path headphone nodes — mini podcasts | Matching, Comprehension Check, Listen and Select (blog labels) | Live in popular courses; availability for every EN L1 varies |
| **Adventures** | Path scenario “board” game | Choice of utterances + env interactions; immersive redirect feedback | Live (e.g. Spanish→English); expanding |
| **Video Call** | Max AI call with Lily (unguided) or Falstaff (guided) | Free/guided spoken turns — not Check-button drills | Live Max |
| **Roleplay** | Max scenario chat with characters | Typed and/or spoken turns toward a goal | Live Max |
| **English Sounds tab** | Mouth icon — EN pronunciation | Identify sound, distinguish similar sounds, matching | Live on English courses |
| **Side Quests** | Timed stars under path characters | Timed normal lesson mix | Live (rollout-dependent) |
| **Match Madness / timed challenges** | Leaderboard / weekend Ramp Up / Rapid Review | Timed matching or timed lesson mix | Live |
| **Energy** | Stamina meter replacing hearts on many mobile clients | Consumes per exercise — **not** an exercise type | Live A/B; web often still hearts |
| **Tips / Explain My Answer** | Pre-lesson tips; post-error explain | Instructional; Explain can include a mini follow-up drill | Live (Explain now free per Feb 2026 blog) |

---

## Taxonomy — for each type

Fields: **Canonical (+ aliases)** · **Learner does** · **Stimulus** · **Correctness** · **Where** · **Sprout Scan→Lock B** (KEEP / ADAPT / SKIP)

### A. Listening

#### A1. Tap what you hear
- **Aliases:** Listen + tap tiles; “Tap what you hear” (Duo blog accessibility post, 2026).
- **Does:** Tap word tiles in order to rebuild what was spoken.
- **Stimulus:** TTS / character audio; optional turtle (slow) replay; speaker replay.
- **Correctness:** Ordered tile sequence; often allows limited typos only via alternate accepted tokenizations; order-sensitive.
- **Where:** Path lessons, Practice → Listen, Legendary (harder audio).
- **Sprout:** **ADAPT** — great for phonics/spelling after Scan, but needs TTS + kid UX (replay unlimited, no streak punishment).

#### A2. Type what you hear
- **Aliases:** Listen and type; transcribe (wiki: “Type what you hear”).
- **Does:** Type the sentence/word heard into a keyboard field.
- **Stimulus:** Audio + turtle slow; “Can’t listen now” can skip listening block for the lesson.
- **Correctness:** Fuzzy string match vs accepted transcriptions (punctuation/accents tolerant to a degree; known learner complaints about strict grading).
- **Where:** Path, Practice → Listen, Legendary.
- **Sprout:** **ADAPT** (v1.5+) — valuable for spelling from homework words; hard for young typists → prefer tiles first.

#### A3. What do you hear? / Listen and select
- **Aliases:** Multiple-choice listening; Listen and Select (DuoRadio blog); wiki “What do you hear?”
- **Does:** Choose the correct transcription / meaning among 2–4 options.
- **Stimulus:** Audio only (or audio + distractor texts).
- **Correctness:** Exact option ID.
- **Where:** Path, DuoRadio, Practice → Listen.
- **Sprout:** **KEEP** — low friction; maps cleanly to Lock B chrome with audio icon.

#### A4. Listen passage → comprehension question
- **Aliases:** Monolingual listening comprehension (Duo blog 2019 “sneak peek” + 2024 English-without-translations).
- **Does:** Hear a short passage/dialogue; answer MC about meaning.
- **Stimulus:** Longer audio clip.
- **Correctness:** Option select.
- **Where:** Higher CEFR / monolingual EN units (B1–B2 sections); Stories-adjacent.
- **Sprout:** **SKIP** v1 (attention span / content gen); possible later for reading aloud homework.

#### A5. Form the sentence you just heard (Stories)
- **Aliases:** Wiki Stories: “Form the sentence you just heard.”
- **Does:** After audio, tap tiles to rebuild.
- **Stimulus:** Story character audio.
- **Correctness:** Ordered tiles.
- **Where:** Stories.
- **Sprout:** **ADAPT** as listen+tiles variant of A1.

---

### B. Speaking / pronunciation

#### B1. Speak this sentence
- **Aliases:** Speak; “Speak this sentence” (wiki); Practice → Speak.
- **Does:** Read on-screen text into mic.
- **Stimulus:** Text (± TTS model).
- **Correctness:** ASR / phonetic match (Duo has described phonetic grading for tonal langs; EN uses speech recognition with tolerance).
- **Where:** Path, Speak practice nodes, Practice → Speak, Legendary sometimes.
- **Sprout:** **SKIP** v1 — mic permission, ASR quality for kids, classroom noise, privacy.

#### B2. Repeat what you hear
- **Aliases:** Speak after audio; Reveal prompt (blog: Reveal shows text while character repeats).
- **Does:** Listen, then speak; optional Reveal.
- **Stimulus:** Audio (± revealed text).
- **Correctness:** ASR.
- **Where:** Path speaking exercises; Stories *speaking levels retired*.
- **Sprout:** **SKIP** v1.

#### B3. Flashcards (speak or type)
- **Aliases:** Practice Words / Flashcards (writing blog 2026).
- **Does:** Prompt shows L1 or meaning; speak translation aloud **or** type if preferred.
- **Stimulus:** Word/phrase card.
- **Correctness:** ASR or typed fuzzy match.
- **Where:** Practice Hub Words / flashcard flows.
- **Sprout:** **ADAPT** — **type or tap** recall only (no speak); excellent for homework vocab list.

#### B4. English Sounds — identify sound
- **Aliases:** Pronunciation tab “identifying an important sound” (blog Nov 2024).
- **Does:** Hear/see IPA-ish symbol; pick which word/sound matches.
- **Stimulus:** Isolated phoneme audio + minimal pairs.
- **Correctness:** Option select.
- **Where:** English Sounds / mouth tab.
- **Sprout:** **ADAPT** later for phonics homework; not Lock B v1.

#### B5. English Sounds — distinguish similar sounds
- **Aliases:** Minimal-pair discrimination.
- **Does:** Choose which of two similar sounds was heard (e.g. sit/seat).
- **Stimulus:** Contrasting audio pair.
- **Correctness:** Option select.
- **Where:** Sounds tab lessons.
- **Sprout:** **ADAPT** (phonics packs) / **SKIP** Lock B core.

#### B6. English Sounds — matching
- **Aliases:** Sound↔example matching.
- **Does:** Match sound symbols to example words.
- **Stimulus:** Grid of sounds/words.
- **Correctness:** Pair matching (order-insensitive within pairs).
- **Where:** Sounds tab.
- **Sprout:** **ADAPT**.

#### B7. Video Call (Lily / Falstaff)
- **Aliases:** AI conversation; guided (Falstaff) vs unguided (Lily).
- **Does:** Multi-turn spoken dialogue; Falstaff coaches / suggests phrases.
- **Stimulus:** Avatar video + LLM turns.
- **Correctness:** Conversational success / soft grading — not binary Check.
- **Where:** Max; Practice tab revisit; some path units.
- **Sprout:** **SKIP** (cost, safety, age, Max-like infra).

#### B8. Roleplay
- **Aliases:** Max Roleplay scenarios.
- **Does:** Chat with a character to complete a goal (order coffee, etc.); type and/or speak.
- **Stimulus:** Scenario brief + character lines.
- **Correctness:** Goal completion + AI feedback on accuracy/complexity.
- **Where:** Max / Practice.
- **Sprout:** **SKIP** v1.

---

### C. Spelling / type word or sentence

#### C1. Type translation (free keyboard)
- **Aliases:** Translation; “Write this in English/…”.
- **Does:** Type full translation EN↔L1 (direction varies).
- **Stimulus:** Source sentence text (± audio).
- **Correctness:** Accepted-answer list + fuzzy (accents, punctuation, some synonyms).
- **Where:** Path (esp. bilingual lower CEFR); Legendary; keyboard toggle from word bank.
- **Sprout:** **SKIP** primary (SG kids homework is usually already English); **ADAPT** only if L1 support is a product goal.

#### C2. Type the missing word / Complete the translation
- **Aliases:** Wiki “Complete the translation”; fill-one-blank type-in.
- **Does:** Type the blanked word in an otherwise-given sentence.
- **Stimulus:** Partial sentence (± image/audio).
- **Correctness:** Exact/fuzzy against blank answers.
- **Where:** Path lessons.
- **Sprout:** **KEEP/ADAPT** — maps homework cloze → Duo Check chrome; prefer tiles for young kids.

#### C3. Type the missing phrase (Stories)
- **Aliases:** Stories listening cloze type-in.
- **Does:** Type missing words while hearing/seeing partial transcript.
- **Stimulus:** Story audio + gapped text.
- **Correctness:** Typed match.
- **Where:** Stories.
- **Sprout:** **ADAPT**.

#### C4. Keyboard toggle on word-bank items
- **Aliases:** “Switch between word banks and typing” (writing blog).
- **Does:** Same prompt as tile translation, but learner types instead.
- **Stimulus:** Same as F1/C1.
- **Correctness:** Typed grading.
- **Where:** Path (icon bottom-left).
- **Sprout:** **ADAPT** as power-user mode, not default for kids.

---

### D. Matching / memory / flashcard-like

#### D1. Tap the pairs / Select the matching pairs
- **Aliases:** Match pairs; vocab matching; Match Madness atomic unit.
- **Does:** Tap a chip then its match (L1↔EN, EN↔EN synonym, word↔image).
- **Stimulus:** Even number of chips (often 5+5 in Stories finale).
- **Correctness:** Pair identity; order of completing pairs irrelevant; wrong tap resets selection.
- **Where:** Path (observed desktop 2026-09-16), Stories end, Practice → Words, Match Madness.
- **Sprout:** **KEEP** when Scan finds pairable items (word↔definition, word↔picture).

#### D2. Picture flashcard matching
- **Aliases:** Wiki “Picture flashcard matching.”
- **Does:** Given a cue word, pick matching image+label among several.
- **Stimulus:** Images + words.
- **Correctness:** Single select.
- **Where:** Early path units.
- **Sprout:** **KEEP** — closest cousin to Lock B image word-pick.

#### D3. Match Madness (timed pairs)
- **Aliases:** Timed challenge on leagues tab.
- **Does:** Rapid D1 under timer; tiers up to Extreme.
- **Stimulus:** Same as pairs.
- **Correctness:** Speed + accuracy.
- **Where:** Timed challenges (weekdays often).
- **Sprout:** **SKIP** v1 (timer stress for kids homework play).

#### D4. Words practice / vocab matching lesson
- **Aliases:** Practice Hub “Words.”
- **Does:** Match learned words to meanings.
- **Stimulus:** Vocab set from course history.
- **Correctness:** Pairing.
- **Where:** Practice tab (free as of Feb 2026).
- **Sprout:** **KEEP** as post-Scan vocab drill mode.

---

### E. Translation (EN ↔ L1)

#### E1. Full-sentence translation (tiles or type)
- **Aliases:** “Write this in English”; sentence shuffle with source.
- **Does:** Build or type translation of a given sentence.
- **Stimulus:** Source language sentence.
- **Correctness:** Tile order / typed accepted answers; often **extra distractor tiles** (wiki: commonly four extras).
- **Where:** Bilingual path units (lower sections); less central in new monolingual B1/B2 EN content (Aug 2024 blog).
- **Sprout:** **SKIP** default for SG English homework; **ADAPT** if bilingual product later.

#### E2. Mark the correct meaning
- **Aliases:** Wiki “Mark the correct meaning”; pick which sentence is a valid translation.
- **Does:** Choose among several candidate translations.
- **Stimulus:** Source sentence + option sentences.
- **Correctness:** Option ID (distractors often ungrammatical — “dead giveaways”).
- **Where:** Path.
- **Sprout:** **ADAPT** as “which sentence is right?” grammar MC without L1.

#### E3. Monolingual “no translation” meaning checks
- **Aliases:** English-to-teach-English exercises (blog Aug 2024).
- **Does:** Use known EN to introduce new EN (vocab via context, grammar contrast, reading).
- **Stimulus:** EN-only prompts; L1 hints still available on tap.
- **Correctness:** Depends on subtype (MC / cloze / etc.).
- **Where:** EN course sections 5–8 (B1/B2) across 20+ EN courses.
- **Sprout:** **KEEP** philosophy — Scan homework is already EN monolingual.

---

### F. Tap / tile word bank

#### F1. Sentence shuffle / word-bank build
- **Aliases:** Wiki “Sentence shuffle”; Arrange all the words; tile translation.
- **Does:** Tap tiles into a tray to form the answer sentence.
- **Stimulus:** Prompt sentence or audio; bank of tiles (± distractors).
- **Correctness:** Order-sensitive sequence vs accepted tokenizations; some variants have **no** extra words (smaller font).
- **Where:** Path (very common), Legendary, Stories (form heard sentence).
- **Sprout:** **KEEP** — excellent for unscramble / rearrange homework items.

#### F2. Arrange all the words (target-only)
- **Aliases:** Wiki “Arrange all the words.”
- **Does:** Reorder a shuffled target-language sentence for grammaticality (no L1 source).
- **Stimulus:** Shuffled EN tiles.
- **Correctness:** Correct word order.
- **Where:** Path (esp. monolingual / grammar focus).
- **Sprout:** **KEEP**.

---

### G. Multiple choice (image, text, audio)

#### G1. Which one of these is “X”? (image cards)
- **Aliases:** Picture flashcard translation; tap-answer image MC.
- **Does:** Tap one of several image+label cards.
- **Stimulus:** Prompt word/phrase (± NEW WORD pill); horizontal image cards.
- **Correctness:** Single card ID. **Forensically observed** desktop web 2026-09-16 (Sprout Lock B SoT).
- **Where:** Early path lessons.
- **Sprout:** **KEEP** — **primary Lock B pattern** (text choices from worksheet when no images).

#### G2. Text-only multiple choice
- **Aliases:** Choose the correct option; Stories MC about conversation.
- **Does:** Tap one of 2–4 text answers.
- **Stimulus:** Question text (± dialogue context).
- **Correctness:** Option ID.
- **Where:** Path, Stories, DuoRadio comprehension.
- **Sprout:** **KEEP**.

#### G3. Read and respond (highlighted word)
- **Aliases:** Wiki “Read and respond.”
- **Does:** Sentence with highlighted word; pick meaning among alternatives (L1 or L2).
- **Stimulus:** Highlighted token in sentence.
- **Correctness:** Option ID.
- **Where:** Path.
- **Sprout:** **ADAPT** for vocabulary-in-context from Scan passages.

#### G4. Image → complete the sentence
- **Aliases:** Monolingual image sentence completion (blog 2019).
- **Does:** See image; complete describing sentence (MC or tiles/type).
- **Stimulus:** Image + gapped EN sentence.
- **Correctness:** Depends on input mode.
- **Where:** Higher / monolingual units.
- **Sprout:** **ADAPT** if worksheet has picture prompts.

---

### H. Fill-in-the-blank / cloze

#### H1. Select the missing word
- **Aliases:** Cloze MC; wiki “Select the missing word.”
- **Does:** Choose word/phrase to fill blank.
- **Stimulus:** Sentence with blank (± audio).
- **Correctness:** Option ID.
- **Where:** Path, Stories (“Select the missing word or phrase”).
- **Sprout:** **KEEP** — maps 1:1 to worksheet cloze with choices.

#### H2. Select the missing phrase (Stories)
- **Aliases:** duoplanet Stories list.
- **Does:** MC fill of multi-word gap, often with audio.
- **Stimulus:** Story line + options.
- **Correctness:** Option ID.
- **Where:** Stories.
- **Sprout:** **KEEP/ADAPT**.

#### H3. Type blank (see C2/C3)
- Covered under typing.

---

### I. Grammar / form selection

#### I1. Form / conjugation / pattern pick
- **Aliases:** “Follow the pattern” (method whitepaper); grammar contrast exercises; pick correct verb form.
- **Does:** Choose or build the grammatically correct form (tense, agreement, article, etc.).
- **Stimulus:** Partial sentence, paradigm table, or contrast pair.
- **Correctness:** Option / tile / typed form match.
- **Where:** Path grammar skills; Tips reinforce; monolingual EN grammar notices (2024).
- **Sprout:** **KEEP** — Scan often extracts have/has, tense, agreement items.

#### I2. Smart Tips mini-exercise
- **Aliases:** Explain My Answer follow-up drill.
- **Does:** After a recognized error, short explanation + tiny practice item.
- **Stimulus:** Error context.
- **Correctness:** Same as underlying mini type.
- **Where:** In-lesson feedback (Explain free for all, Feb 2026).
- **Sprout:** **ADAPT** as Pip “coach tip” after Almost — not a separate question bank.

---

### J. True / false / judge the sentence

#### J1. Stories True or False
- **Aliases:** “Yes, that's true” / “No, that's not right” (Stories wiki).
- **Does:** Judge a statement about the story.
- **Stimulus:** Base-language (or EN) claim about dialogue.
- **Correctness:** Binary.
- **Where:** Stories.
- **Sprout:** **KEEP** for true/false worksheet rows.

#### J2. Lesson “which sentence is correct?” / judge
- **Aliases:** Overlaps E2; sometimes presented as correct vs incorrect sentence.
- **Does:** Pick the well-formed / appropriate sentence.
- **Stimulus:** 2–3 candidate sentences.
- **Correctness:** Option ID.
- **Where:** Path grammar.
- **Sprout:** **KEEP**.

---

### K. Listening / reading comprehension & dialogue

#### K1. Reading comprehension (short passage)
- **Aliases:** Monolingual reading Q (blog 2019/2024).
- **Does:** Read passage; answer MC.
- **Stimulus:** EN paragraph.
- **Correctness:** Option ID.
- **Where:** B1+ EN content; advanced Stories writing prompts also appear (writing blog).
- **Sprout:** **ADAPT** for comprehension worksheets; length-cap for kids.

#### K2. What comes next? / What has just happened?
- **Aliases:** Stories reading comprehension family (wiki).
- **Does:** Predict next line or summarize beat.
- **Stimulus:** Story context so far.
- **Correctness:** Option ID.
- **Where:** Stories.
- **Sprout:** **ADAPT** for dialogue homework.

#### K3. What do we know for now?
- **Aliases:** Stories mid-comprehension.
- **Does:** Pick which summary matches current story state.
- **Stimulus:** 3 alternatives after a few lines.
- **Correctness:** Option ID.
- **Where:** Stories.
- **Sprout:** **ADAPT**.

#### K4. Define the concept / What does X mean?
- **Aliases:** Stories definition MC.
- **Does:** Pick definition of a word/phrase in context.
- **Stimulus:** Story token + 3 definitions (hints available).
- **Correctness:** Option ID.
- **Where:** Stories.
- **Sprout:** **KEEP**.

#### K5. Click on the option that means…
- **Aliases:** Inline boxed-word select in Stories.
- **Does:** Tap which boxed span answers the question.
- **Stimulus:** Sentence with multiple boxed candidates.
- **Correctness:** Span ID.
- **Where:** Stories.
- **Sprout:** **ADAPT** for “find the word that means…” Scan items.

---

### L. DuoRadio-specific (session format)

#### L1. DuoRadio Matching / Comprehension Check / Listen and Select
- **Aliases:** Blog screenshot labels (Nov 2023).
- **Does:** Interleaved short checks during podcast episode.
- **Stimulus:** Radio audio narrative.
- **Correctness:** Matching or MC.
- **Where:** DuoRadio path nodes; Practice revisit.
- **Sprout:** **SKIP** v1 (longform audio production).

---

### M. Adventures (session format)

#### M1. Scenario choice + environment interaction
- **Aliases:** Adventures immersive dialogue (blog Sep 2024).
- **Does:** Move on a board; pick what to say; tap objects; NPCs redirect mistakes (“Did you mean…?”) instead of red X.
- **Stimulus:** Illustrated scenario + character dialogue.
- **Correctness:** Soft / branching — immersive feedback, not classic binary Check.
- **Where:** Path Adventures (EN for Spanish speakers among early rollouts).
- **Sprout:** **SKIP** v1 (heavy content + engine).

---

### N. Timed / special wrappers (reuse core kinds)

| Wrapper | Effect | Sprout |
|---------|--------|--------|
| **Legendary** | Same kinds, no hints, harder | **SKIP** pressure; optional later “challenge mode” |
| **Side Quest** | Timed lesson | **SKIP** v1 |
| **XP Ramp Up / Rapid Review** | Timed mixed exercises / timed lesson | **SKIP** |
| **Match Madness** | Timed D1 | **SKIP** |
| **Mistakes practice** | Re-serves failed items | **KEEP** as “try again” queue |
| **Energy / Hearts** | Resource gate | **SKIP** (Sprout SoT: no hearts) |

---

### O. Retired / removed (do not implement as “live Duo”)

| Type | Notes | Source |
|------|-------|--------|
| **Character Challenges** | Character asks; answer may depend on gender/context | Wiki — unavailable as of Jan 2023 |
| **Conversation Challenges** | Respond to character | Wiki — retired |
| **Stories speaking level** | Repeat character lines | duoplanet — removed ~2021 |
| **Stories listening level** | Hide some written dialogue | duoplanet — removed ~2021 |
| **Audio lessons (2019 test)** | Hands-free 5-min listen+speak | Blog 2019 — precursor vibe to Radio/Call; not the modern product name |
| **Lightning Round** | Older timed-challenge naming in third-party guides | Superseded by Match Madness / Ramp Up / Rapid Review naming |

---

## Correctness models (cross-cutting)

| Model | Used by | Notes for Sprout |
|-------|---------|------------------|
| **Exact option ID** | All MC, True/False, highlighted-span | Lock B default |
| **Ordered tiles** | Word bank, tap-what-you-hear | Allow alternate accepted orders only if grammar permits |
| **Order-insensitive pairs** | Matching | Complete-all-pairs then Continue |
| **Fuzzy typed string** | Type translation / type what you hear / blanks | Need accepted-answer lists from Scan key |
| **ASR / phonetic** | Speak / repeat / spoken flashcards | Out of v1 |
| **Soft / LLM success** | Video Call, Roleplay, Adventures redirect | Out of v1 |
| **Hints** | Tap word for L1 gloss; Legendary removes | Sprout: Pip tip optional; never punish |

---

## Sprout Scan→Duo-style Lock B — priority map

| Priority | Types | Why |
|----------|-------|-----|
| **P0 KEEP** | G1/G2 image or text MC, H1 cloze MC, D1 matching, F1/F2 tiles, J1/J2 T/F/judge, I1 grammar form | Fit worksheet shapes + Lock B chrome already SoT |
| **P1 ADAPT** | A3 listen+MC, C2 type blank → tiles, B3 flashcard tap/type, G3 in-context vocab, K\* short comprehension | Need TTS or OCR structure; still Check-button UX |
| **P2 later** | A1/A2 listen tiles/type, B4–B6 phonics Sounds, K1 longer reading | Bigger content/audio investment |
| **SKIP v1** | B1/B2 speak, B7/B8 Call/Roleplay, L1 Radio, M1 Adventures, all timed wrappers, hearts/energy, L1 translation-first | Safety, cost, not homework-shaped |

---

## Key citations (primary / strong secondary)

1. https://duolingo.fandom.com/wiki/Exercise — classic exercise list + retired Character/Conversation Challenges  
2. https://duolingo.fandom.com/wiki/Duolingo_Stories — ~12 Stories exercise kinds  
3. https://blog.duolingo.com/learning-with-hearing-aids/ — “Tap what you hear”, “Repeat what you hear”, Listen practice, DuoRadio skip  
4. https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-writing-skills/ — word banks, type what you hear, flashcards speak-or-type, Stories writing  
5. https://blog.duolingo.com/how-duolingo-teaches-english/ — monolingual EN B1/B2, no-translation exercises (Aug 2024)  
6. https://blog.duolingo.com/how-weve-improved-the-duolingo-learning-experience-this-year-and-a-sneak-peek-toward-2020/ — monolingual reading/listening/image-sentence types  
7. https://blog.duolingo.com/duolingo-english-sounds-tab/ — EN pronunciation tab exercises (Nov 2024)  
8. https://blog.duolingo.com/guide-to-duolingo-practice-hub/ — Practice tab free; Mistakes/Words/Speak/Listen (Feb 2026)  
9. https://blog.duolingo.com/ways-to-practice-in-duolingo/ — Legendary, Side Quest, Match Madness, Video Call, Stories, DuoRadio (Dec 2025)  
10. https://blog.duolingo.com/duoradio-listening-practice/ — Matching / Comprehension Check / Listen and Select  
11. https://blog.duolingo.com/adventures/ — Adventures immersive feedback (Sep 2024)  
12. https://blog.duolingo.com/ai-and-video-call/ + https://blog.duolingo.com/beginner-video-call-with-falstaff/ — Video Call structure  
13. https://duolingo-papers.s3.amazonaws.com/reports/duolingo-method-whitepaper.pdf — method: varied exercises, adaptive sequencing, pattern exercises  
14. https://duoplanet.com/duolingo-stories-the-complete-guide-what-you-need-to-know/ — Stories prompts + retired speak/listen levels  
15. Local: `docs/duo-word-pick/teardown/duo-vs-sprout-word-pick.md`, `docs/DUOLENS-FORENSIC-NOTE.md`, `docs/sprout-scan-harness/duo-forensic-pack.md`

---

## DET note (do not mix into app taxonomy)

DET items (Read and Select, Fill in the Blanks, Listen and Type, Interactive Reading subtasks, etc.) are a **proctored test product**, not path lesson exercises. Overlap in *names* (“type what you hear”) is coincidental branding — different UX, timing, and scoring.
