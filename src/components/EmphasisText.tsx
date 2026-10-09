import { emphasisParts } from '../lib/scan/emphasis';

interface EmphasisTextProps {
  text: string;
  emphasis?: string[];
}

/** Underline and bold the sheet's own marked words. */
export default function EmphasisText({ text, emphasis = [] }: EmphasisTextProps) {
  return (
    <>
      {emphasisParts(text, emphasis).map((part, index) => (
        part.mark
          ? <strong key={index} className="emphasis-mark">{part.text}</strong>
          : <span key={index}>{part.text}</span>
      ))}
    </>
  );
}
