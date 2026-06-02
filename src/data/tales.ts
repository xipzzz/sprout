/* Garden Tales — short, calm reading stories in simple English.
   Each page is one gentle scene (a picture + a sentence or two) a young
   learner can read aloud. Content-as-data, English only. */

export interface TalePage {
  scene: string; // a big emoji illustration
  text: string;  // 1–2 simple sentences
}

export interface Tale {
  id: string;
  cover: string;  // cover emoji
  title: string;
  blurb: string;  // one calm line for the library
  pages: TalePage[];
}

export const tales: Tale[] = [
  {
    id: 'seed',
    cover: '🌱',
    title: 'Pip Plants a Seed',
    blurb: 'A tiny seed becomes a big surprise.',
    pages: [
      { scene: '🌱', text: 'Pip had one little seed. It was small and round.' },
      { scene: '🕳️', text: 'Pip dug a hole in the soft, brown soil.' },
      { scene: '💧', text: 'Pip gave the seed a long, cool drink of water.' },
      { scene: '☀️', text: 'The warm sun came out. Pip waited and waited.' },
      { scene: '🌻', text: 'A bright flower grew tall. Pip smiled with joy!' },
    ],
  },
  {
    id: 'kitten',
    cover: '🐱',
    title: 'The Lost Kitten',
    blurb: 'A small kitten finds the way home.',
    pages: [
      { scene: '🐱', text: 'A little kitten could not find her home.' },
      { scene: '🌳', text: 'She looked behind a big, green tree.' },
      { scene: '🐦', text: 'A kind bird said, "Follow me! I can help."' },
      { scene: '🏡', text: 'They walked to a warm house with a red door.' },
      { scene: '😺', text: 'The kitten was home at last. She felt happy and safe.' },
    ],
  },
  {
    id: 'rain',
    cover: '🌧️',
    title: 'A Rainy Day',
    blurb: 'Even rainy days end with a smile.',
    pages: [
      { scene: '🌧️', text: 'Rain fell softly on the window all morning.' },
      { scene: '📖', text: 'So Pip stayed inside and read a good book.' },
      { scene: '🍵', text: 'Pip had a warm drink and listened to the rain.' },
      { scene: '☀️', text: 'Then the rain stopped, and the sun peeked out.' },
      { scene: '🌈', text: 'A big rainbow filled the sky. What a lovely day!' },
    ],
  },
];
