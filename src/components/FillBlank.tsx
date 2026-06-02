/* FillBlank — type the missing word to complete the sentence.
   Autofill/password-manager bar is suppressed (autoComplete off, plain text). */

interface FillBlankProps {
  before: string;
  after: string;
  value: string;
  revealed: boolean;
  onChange: (v: string) => void;
}

export default function FillBlank({ before, after, value, revealed, onChange }: FillBlankProps) {
  return (
    <div className="fill">
      <p className="mc__cue">Type the missing word</p>
      <p className="fill__sentence">
        <span>{before} </span>
        <input
          className="fill__input"
          type="text"
          value={value}
          disabled={revealed}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          aria-label="missing word"
          placeholder="…"
        />
        <span> {after}</span>
      </p>
    </div>
  );
}
