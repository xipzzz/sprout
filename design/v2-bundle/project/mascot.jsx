// Pip the Sprout — our mascot. Drawn as simple friendly SVG shapes.
function Pip({ size = 100, mood = 'happy', wave = false, body, leaf }) {
  // moods: happy, proud, sleepy, cheer, thinking, wave
  const bodyColor = body || '#6FBF5E';
  const leafColor = leaf || '#8AD577';
  const dark = '#2E5B29';

  const eye = (cx, cy, closed = false) => closed ? (
    <path d={`M${cx-4} ${cy} Q${cx} ${cy+3} ${cx+4} ${cy}`} stroke={dark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
  ) : (
    <ellipse cx={cx} cy={cy} rx="3" ry="4" fill={dark}/>
  );

  const mouth = () => {
    if (mood === 'cheer' || mood === 'proud') return <path d="M42 60 Q50 68 58 60" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if (mood === 'sleepy') return <path d="M45 62 Q50 64 55 62" stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round"/>;
    if (mood === 'thinking') return <circle cx="50" cy="62" r="2" fill={dark}/>;
    return <path d="M44 60 Q50 65 56 60" stroke={dark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {/* leaves on top */}
      <ellipse cx="40" cy="18" rx="10" ry="14" fill={leafColor} transform="rotate(-25 40 18)"/>
      <ellipse cx="60" cy="18" rx="10" ry="14" fill={leafColor} transform="rotate(25 60 18)"/>
      <path d="M50 30 L50 15" stroke={dark} strokeWidth="2" strokeLinecap="round"/>
      {/* leaf veins */}
      <path d="M35 22 L44 14" stroke={dark} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <path d="M65 22 L56 14" stroke={dark} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>

      {/* body — round sprout */}
      <ellipse cx="50" cy="58" rx="28" ry="30" fill={bodyColor}/>
      {/* belly highlight */}
      <ellipse cx="42" cy="55" rx="8" ry="12" fill={leafColor} opacity="0.5"/>

      {/* eyes */}
      {eye(40, 50, mood === 'sleepy')}
      {eye(60, 50, mood === 'sleepy')}
      {/* cheeks */}
      {(mood === 'happy' || mood === 'cheer' || mood === 'proud') && (
        <>
          <ellipse cx="36" cy="58" rx="3" ry="2" fill="#FF9AA2" opacity="0.6"/>
          <ellipse cx="64" cy="58" rx="3" ry="2" fill="#FF9AA2" opacity="0.6"/>
        </>
      )}

      {mouth()}

      {/* little arms */}
      {wave ? (
        <>
          <path d="M22 60 Q14 52 18 44" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="18" cy="43" r="3" fill={bodyColor} stroke={dark} strokeWidth="1.5"/>
          <path d="M78 62 Q84 68 82 76" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="82" cy="77" r="3" fill={bodyColor} stroke={dark} strokeWidth="1.5"/>
        </>
      ) : (
        <>
          <path d="M22 62 Q16 68 20 76" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="20" cy="76" r="3" fill={bodyColor} stroke={dark} strokeWidth="1.5"/>
          <path d="M78 62 Q84 68 80 76" stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="80" cy="76" r="3" fill={bodyColor} stroke={dark} strokeWidth="1.5"/>
        </>
      )}

      {/* pot / base hint */}
      <ellipse cx="50" cy="88" rx="22" ry="4" fill="#000" opacity="0.1"/>
    </svg>
  );
}

// A simpler tiny icon version for nav / small placements
function PipMini({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <ellipse cx="11" cy="7" rx="4" ry="5" fill="#8AD577" transform="rotate(-25 11 7)"/>
      <ellipse cx="21" cy="7" rx="4" ry="5" fill="#8AD577" transform="rotate(25 21 7)"/>
      <ellipse cx="16" cy="20" rx="11" ry="11" fill="#6FBF5E"/>
      <ellipse cx="12.5" cy="17" rx="1.3" ry="1.8" fill="#2E5B29"/>
      <ellipse cx="19.5" cy="17" rx="1.3" ry="1.8" fill="#2E5B29"/>
      <path d="M13.5 22 Q16 24.5 18.5 22" stroke="#2E5B29" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

Object.assign(window, { Pip, PipMini });
