/* ShopScreen — spend 💎 gems on calm extras. Gems are never required:
   the whole garden can be grown for free. Reached from the HUD gems chip. */

import { hud } from '../data/course';

interface ShopScreenProps {
  onBack: () => void;
}

const items = [
  { id: 'water', emoji: '💧', name: 'Refill water', desc: 'Top up your water to keep learning', price: 50 },
  { id: 'leaf', emoji: '🍃', name: 'Streak leaf', desc: 'Keeps your garden safe on a missed day', price: 100 },
  { id: 'double', emoji: '✨', name: 'Double leaves', desc: 'Earn double leaves on your next lesson', price: 80 },
  { id: 'bundle', emoji: '🎁', name: 'Gardener bundle', desc: 'A water refill + 3 streak leaves', price: 200 },
];

export default function ShopScreen({ onBack }: ShopScreenProps) {
  return (
    <div className="screen shop">
      <header className="shop__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="shop__title">Shop</h1>
        <span className="shop__balance" aria-label={`${hud.gems} gems`}>💎 {hud.gems}</span>
      </header>

      <main className="screen__body">
        <ul className="shop__list">
          {items.map((it) => (
            <li key={it.id} className="shop__item">
              <span className="shop__item-icon" aria-hidden="true">{it.emoji}</span>
              <span className="shop__item-text">
                <span className="shop__item-name">{it.name}</span>
                <span className="shop__item-desc">{it.desc}</span>
              </span>
              <button type="button" className="shop__buy" disabled={it.price > hud.gems}>
                💎 {it.price}
              </button>
            </li>
          ))}
        </ul>
        <p className="shop__note">Gems are a treat, never required — you can grow your whole garden for free. 🌱</p>
      </main>
    </div>
  );
}
