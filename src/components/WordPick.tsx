/* WordPick — SoT Lock B word-pick exercise: tap-ready text cards.
   Minimal picture prompt (Pip + speech bubble), then word-choice buttons.
   States: question → selected (sky) → check → correct (green) / wrong (coral).
   Matches the approved SoT Lock B Figma design. */

interface WordPickProps {
  prompt: string;
  choices: string[];
  selected: string | null;
  correct: string;
  revealed: boolean;
  onSelect: (choice: string) => void;
}

export default function WordPick({
  choices,
  selected,
  correct,
  revealed,
  onSelect,
}: WordPickProps) {
  return (
    <div className="word-pick">
      <div className="word-pick__answers">
        {choices.map((choice) => {
          let cls = 'word-pick__answer';
          
          if (revealed && choice === correct) {
            cls += ' word-pick__answer--correct';
          } else if (revealed && choice === selected && choice !== correct) {
            cls += ' word-pick__answer--wrong';
          } else if (choice === selected) {
            cls += ' word-pick__answer--selected';
          }

          return (
            <button
              key={choice}
              type="button"
              className={cls}
              disabled={revealed}
              onClick={() => onSelect(choice)}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
