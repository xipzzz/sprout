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
  {
    id: 'park',
    cover: '🌳',
    title: 'A Walk in the Park',
    blurb: 'A sunny day full of little joys.',
    pages: [
      { scene: '🌳', text: 'Maya went to the park on a warm, sunny day.' },
      { scene: '🛝', text: 'First, she went down the big green slide.' },
      { scene: '🌸', text: 'Then she smelled a pretty pink flower.' },
      { scene: '🐦', text: 'A little bird sang high up in a tall tree.' },
      { scene: '😊', text: 'Maya had so much fun. What a happy day!' },
    ],
  },
  {
    id: 'cat',
    cover: '🐱',
    title: 'The Hungry Cat',
    blurb: 'Breakfast, then a cozy nap.',
    pages: [
      { scene: '🐱', text: 'Tom the cat woke up very, very hungry.' },
      { scene: '🥛', text: 'He drank a bowl of cool, white milk.' },
      { scene: '🐟', text: 'Then he ate one little silver fish.' },
      { scene: '😺', text: 'Now Tom was full and happy.' },
      { scene: '😴', text: 'He curled up in the sun and went to sleep.' },
    ],
  },
  {
    id: 'grandpa',
    cover: '👴',
    title: "Grandpa's Garden",
    blurb: 'Little seeds, lots of love.',
    pages: [
      { scene: '👴', text: 'Grandpa loved his little garden very much.' },
      { scene: '🌱', text: 'Each morning he planted one tiny seed.' },
      { scene: '💧', text: 'He gave every plant a cool drink of water.' },
      { scene: '🌻', text: 'Soon tall yellow flowers grew in a row.' },
      { scene: '😊', text: 'Grandpa and the busy bees were both happy.' },
    ],
  },
  {
    id: 'frog',
    cover: '🐸',
    title: 'The Happy Frog',
    blurb: 'Sunshine, rain, and a smile.',
    pages: [
      { scene: '🐸', text: 'A little green frog sat by the quiet pond.' },
      { scene: '☀️', text: 'The warm sun made him feel very happy.' },
      { scene: '🌧️', text: 'Then grey clouds came and it began to rain.' },
      { scene: '🍃', text: 'The frog hid under a big green leaf.' },
      { scene: '🌈', text: 'After the rain, a rainbow made him smile again.' },
    ],
  },
  {
    id: 'sheep',
    cover: '🐑',
    title: 'Counting Sheep',
    blurb: 'One, two, three… off to sleep.',
    pages: [
      { scene: '🌙', text: 'It was night, and Pip could not fall asleep.' },
      { scene: '🐑', text: 'So Pip counted one fluffy white sheep.' },
      { scene: '🐑', text: 'Then two more sheep hopped over the fence.' },
      { scene: '😌', text: 'Three, four, five… Pip\'s eyes grew heavy.' },
      { scene: '😴', text: 'Soon Pip was fast asleep. Good night!' },
    ],
  },
];
