// Sprout icon system — ONE shared, consistently-sized set.
// Phosphor DUOTONE, loaded via Iconify (<iconify-icon icon="ph:…-duotone">).
// Every UI icon in the app + the Exploration chrome routes through this set,
// so the whole prototype shares a single, uniform icon language.
//
// Duotone icons carry a secondary layer at ~20% opacity using currentColor,
// so passing `color` tints both layers harmoniously. Tint in Sprout greens:
// deep green #3fa52e for active/featured, a muted grey-green for inactive.
//
// NOTE: colourful CONTENT emoji (vocabulary like 🐈🍎🚗, garden flora 🌷🌳) and
// the language flag are intentionally NOT icons — keep those as emoji. Pip the
// mascot stays custom art.
const Icon = (() => {
  const make = (icon, defColor = 'currentColor') => (
    ({ size = 24, color = defColor }) => (
      <iconify-icon
        icon={icon}
        width={size}
        height={size}
        style={{ color, display: 'inline-flex', lineHeight: 0, verticalAlign: 'middle' }}
      ></iconify-icon>
    )
  );
  return {
    // ── Bottom nav ──
    Home:  make('ph:house-duotone'),
    Book:  make('ph:book-open-duotone'),
    Target: make('ph:target-duotone'),
    Trophy: make('ph:shield-duotone'),   // League → shield
    Shield: make('ph:shield-duotone'),
    User:  make('ph:user-duotone'),
    Users: make('ph:users-duotone'),

    // ── HUD ──
    Leaf:    make('ph:leaf-duotone', '#3fa52e'),
    Gem:     make('ph:diamond-duotone', '#6C8AE4'),
    Diamond: make('ph:diamond-duotone', '#6C8AE4'),
    Droplet: make('ph:drop-duotone', '#2BB8E6'),
    Drop:    make('ph:drop-duotone', '#2BB8E6'),

    // ── Path nodes ──
    Star:   make('ph:star-duotone', '#F5B94A'),       // active / featured
    Lock:   make('ph:lock-duotone', '#B5B0A5'),       // locked
    Plant:  make('ph:plant-duotone', '#3fa52e'),      // grow
    Sun:    make('ph:sun-duotone', '#E5A93A'),         // sunshine nudge (warm gold)
    Crown:  make('ph:crown-duotone', '#F5B94A'),      // milestone
    Headphones: make('ph:headphones-duotone'),         // audio node

    // ── Stats ──
    Sparkle: make('ph:sparkle-duotone', '#E0A21C'),   // seeds / XP
    Flame:   make('ph:flame-duotone', '#E5A93A'),       // streak (calm gold, not harsh red)
    Hand:    make('ph:hand-waving-duotone', '#3fa52e'),  // wave / nudge a friend
    Clock:   make('ph:clock-duotone'),                 // time
    Compass: make('ph:compass-duotone', '#3fa52e'),    // motivation / direction
    Calendar: make('ph:calendar-dots-duotone', '#3fa52e'), // days / streak count
    ChartLine: make('ph:chart-line-duotone'),          // insights

    // ── States ──
    Check:       make('ph:check-duotone', '#fff'),
    CheckCircle: make('ph:check-circle-duotone', '#3fa52e'),   // completed / correct
    X:           make('ph:x-duotone', '#fff'),
    XCircle:     make('ph:x-circle-duotone', '#ff8a80'),       // wrong (clay, never harsh red)
    Heart:       make('ph:heart-duotone', '#F47A7A'),
    Flame:       make('ph:flame-duotone', '#F5833E'),          // streak

    // ── Actions / chrome ──
    ArrowLeft: make('ph:arrow-left-duotone'),
    ChevL:     make('ph:caret-left-duotone'),
    ChevR:     make('ph:caret-right-duotone'),
    Gear:      make('ph:gear-duotone'),
    Bell:      make('ph:bell-duotone'),
    Share:     make('ph:share-network-duotone'),
    ShoppingBag: make('ph:shopping-bag-duotone'),
    Mail:      make('ph:envelope-simple-duotone'),
    Play:      make('ph:play-duotone', '#fff'),
    Volume:    make('ph:speaker-high-duotone', '#fff'),
    Mic:       make('ph:microphone-duotone', '#fff'),
    Flower:    make('ph:flower-duotone', '#E0A21C'),
    Chest:     make('ph:treasure-chest-duotone', '#C98A3C'),
    Basket:    make('ph:basket-duotone', '#A87C1B'),   // woven seed-basket reward (garden, not treasure)

    // Water "glass" → drop (water currency). Extra gauge props are ignored;
    // the HUD water gauge (WaterGauge) is a separate custom component.
    WaterGlass: make('ph:drop-duotone', '#5AB9D9'),
  };
})();
Object.assign(window, { Icon });
