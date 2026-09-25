/* SentenceJudge — true/false, or "which sentence is right?".
   Big tappable cards. A miss is warm clay, never red. */

interface Option {
  id: string;
  label: string;
}

interface SentenceJudgeProps {
  mode: 'tf' | 'which';
  prompt: string;
  options: Option[];
  selectedId: string | null;
  answerId: string;
  revealed: boolean;
  onSelect: (id: string) => void;
}

export default function SentenceJudge({
  mode, prompt, options, selectedId, answerId, revealed, onSelect,
}: SentenceJudgeProps) {
  return (
    <div className="judge">
      <p className="mc__cue">{mode === 'tf' ? 'True or false?' : 'Which sentence is right?'}</p>
      {mode === 'tf' && <p className="judge__statement">{prompt}</p>}
      <div className={mode === 'tf' ? 'judge__tf' : 'judge__list'}>
        {options.map((opt) => {
          let cls = 'judge__opt';
          if (revealed && opt.id === answerId) cls += ' judge__opt--correct';
          else if (revealed && opt.id === selectedId) cls += ' judge__opt--wrong';
          else if (opt.id === selectedId) cls += ' judge__opt--selected';
          return (
            <button
              key={opt.id}
              type="button"
              className={cls}
              disabled={revealed}
              aria-pressed={opt.id === selectedId}
              onClick={() => onSelect(opt.id)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
