/* HUD — the three currency chips at the top of the home screen.
   Each currency has ONE job (per the design system):
     🍃 leaves = progress/streak (earned, never spent)
     💎 gems   = premium spend (shop)
     💧 water  = energy/lives that gate lessons
   Emoji are used intentionally for currencies; line icons elsewhere. */

interface HUDProps {
  leaves: number;
  gems: number;
  water: number;
  onOpenShop?: () => void;
}

export default function HUD({ leaves, gems, water, onOpenShop }: HUDProps) {
  return (
    <header className="hud">
      <div className="chip chip--leaves" aria-label={`${leaves} leaves grown`}>
        <span className="chip__icon" aria-hidden="true">🍃</span>
        <span>{leaves}</span>
      </div>
      <div className="hud__spacer" />
      <button type="button" className="chip chip--gems" aria-label={`${gems} gems — open shop`} onClick={onOpenShop}>
        <span className="chip__icon" aria-hidden="true">💎</span>
        <span>{gems}</span>
      </button>
      <div className="chip chip--water" aria-label={`${water} water — energy for lessons`}>
        <span className="chip__icon" aria-hidden="true">💧</span>
        <span>{water}</span>
      </div>
    </header>
  );
}
