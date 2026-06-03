/* ============================================================
   Sprout — Course data (English class)
   The whole curriculum lives here as plain data:
   5 sections, each with 7–8 units. Screens read from this file.
   ============================================================ */

export type NodeStatus = 'done' | 'current' | 'locked';
export type NodeKind = 'lesson' | 'golden';

/** A node on the winding path: a unit, or a section's Golden Bloom. */
export interface PathNode {
  id: string;
  kind: NodeKind;
  status: NodeStatus;
  title: string;
}

/** A unit within a section. */
export interface Unit {
  id: string;
  title: string;
  status: NodeStatus;
}

/** A section of the course. Five of them, each with 7–8 units. */
export interface Section {
  id: string;
  index: number;
  title: string;
  status: NodeStatus;
  units: Unit[];
}

/** The HUD currencies — each has exactly ONE job. */
export const hud = {
  leaves: 34, // 🍃 progress/streak — earned, never spent
  gems: 420,  // 💎 premium spend (shop)
  water: 5,   // 💧 energy/lives that gate lessons
};

/* ---------------- The curriculum: 5 sections × 7–8 units ---------------- */

export const course: Section[] = [
  {
    id: 's1', index: 1, title: 'First Words', status: 'current',
    units: [
      { id: 's1u1', title: 'Hello',           status: 'done' },
      { id: 's1u2', title: 'Around the Home',  status: 'current' },
      { id: 's1u3', title: 'Family',           status: 'locked' },
      { id: 's1u4', title: 'Colors',           status: 'locked' },
      { id: 's1u5', title: 'Numbers',          status: 'locked' },
      { id: 's1u6', title: 'Food',             status: 'locked' },
      { id: 's1u7', title: 'Animals',          status: 'locked' },
    ],
  },
  {
    id: 's2', index: 2, title: 'Everyday Life', status: 'locked',
    units: [
      { id: 's2u1', title: 'Clothes',      status: 'locked' },
      { id: 's2u2', title: 'The Body',     status: 'locked' },
      { id: 's2u3', title: 'Weather',      status: 'locked' },
      { id: 's2u4', title: 'Days & Time',  status: 'locked' },
      { id: 's2u5', title: 'At School',    status: 'locked' },
      { id: 's2u6', title: 'Toys & Play',  status: 'locked' },
      { id: 's2u7', title: 'Feelings',     status: 'locked' },
      { id: 's2u8', title: 'Action Words', status: 'locked' },
    ],
  },
  {
    id: 's3', index: 3, title: 'Out and About', status: 'locked',
    units: [
      { id: 's3u1', title: 'The Park',       status: 'locked' },
      { id: 's3u2', title: 'Around Town',    status: 'locked' },
      { id: 's3u3', title: 'Getting There',  status: 'locked' },
      { id: 's3u4', title: 'Shopping',       status: 'locked' },
      { id: 's3u5', title: 'People at Work', status: 'locked' },
      { id: 's3u6', title: 'In Nature',      status: 'locked' },
      { id: 's3u7', title: 'Directions',     status: 'locked' },
    ],
  },
  {
    id: 's4', index: 4, title: 'Telling Stories', status: 'locked',
    units: [
      { id: 's4u1', title: 'Doing Words',       status: 'locked' },
      { id: 's4u2', title: 'Asking Questions',  status: 'locked' },
      { id: 's4u3', title: 'Describing Things', status: 'locked' },
      { id: 's4u4', title: 'More Than One',     status: 'locked' },
      { id: 's4u5', title: 'Yesterday',         status: 'locked' },
      { id: 's4u6', title: 'Talking Together',  status: 'locked' },
      { id: 's4u7', title: 'Reading Time',      status: 'locked' },
      { id: 's4u8', title: 'Story Time',        status: 'locked' },
    ],
  },
  {
    id: 's5', index: 5, title: 'Confident English', status: 'locked',
    units: [
      { id: 's5u1', title: 'Opinions',         status: 'locked' },
      { id: 's5u2', title: 'My Plans',         status: 'locked' },
      { id: 's5u3', title: 'Likes & Dislikes', status: 'locked' },
      { id: 's5u4', title: 'Comparing',        status: 'locked' },
      { id: 's5u5', title: 'Joining Ideas',    status: 'locked' },
      { id: 's5u6', title: 'Retelling',        status: 'locked' },
      { id: 's5u7', title: 'Everyday Chat',    status: 'locked' },
      { id: 's5u8', title: 'Big Words',        status: 'locked' },
    ],
  },
];

/* ---------------- Lesson content (English) ----------------
   The one playable lesson so far: the current unit, "Around the Home".
   Tap the picture that matches the word. */

export interface Choice {
  id: string;
  label: string; // shown under the picture
  emoji: string; // the picture
}

export interface Teach {
  meaning: string;
  inUse: string;
  tip: string;
}

/** Tap the picture that matches the word. */
export interface ChoiceExercise {
  kind: 'choice';
  id: string;
  word: string; // the English word being taught
  choices: Choice[];
  answerId: string;
  teach: Teach;
}

/** Tap word tiles in order to build a sentence. */
export interface ArrangeExercise {
  kind: 'arrange';
  id: string;
  prompt: string;   // the cue, e.g. "Put the words in order"
  tiles: string[];  // shuffled word tiles
  answer: string[]; // the correct order
  teach: Teach;
}

/** Match each word to its picture (two columns). */
export interface MatchExercise {
  kind: 'match';
  id: string;
  pairs: { id: string; word: string; emoji: string }[];
  teach: Teach;
}

/** Type the missing word to complete the sentence. */
export interface FillExercise {
  kind: 'fill';
  id: string;
  before: string; // sentence text before the blank
  after: string;  // sentence text after the blank
  answer: string;
  teach: Teach;
}

/** Hear a word read aloud (text-to-speech) and type what you heard. */
export interface ListenExercise {
  kind: 'listen';
  id: string;
  word: string; // the word spoken aloud and the expected answer
  teach: Teach;
}

export type Exercise = ChoiceExercise | ArrangeExercise | MatchExercise | FillExercise | ListenExercise;

export interface Lesson {
  id: string;
  title: string;
  reward: number; // 🍃 leaves earned on completion
  exercises: Exercise[];
}

/* "Around the Home" — fully authored. */
const aroundTheHome: Lesson = {
  id: 's1u2',
  title: 'Around the Home',
  reward: 12, // 🍃 leaves earned on completion
  exercises: [
    {
      kind: 'listen', id: 'e0', word: 'door',
      teach: {
        meaning: 'Listen, then type the word you hear.',
        inUse: 'Please close the door.',
        tip: 'Tap the speaker to hear it again.',
      },
    },
    {
      kind: 'choice',
      id: 'e1',
      word: 'door',
      answerId: 'door',
      choices: [
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'window', label: 'window', emoji: '🪟' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'chair', label: 'chair', emoji: '🪑' },
      ],
      teach: {
        meaning: 'A door is what you open to go in or out of a room.',
        inUse: 'Please close the door.',
        tip: 'Door starts with the letter D.',
      },
    },
    {
      kind: 'choice',
      id: 'e2',
      word: 'window',
      answerId: 'window',
      choices: [
        { id: 'window', label: 'window', emoji: '🪟' },
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'lamp', label: 'lamp', emoji: '💡' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
      ],
      teach: {
        meaning: 'A window lets light in so you can see outside.',
        inUse: 'Look out the window at the rain.',
        tip: 'Window is two parts joined: wind + ow.',
      },
    },
    {
      kind: 'choice',
      id: 'e3',
      word: 'chair',
      answerId: 'chair',
      choices: [
        { id: 'chair', label: 'chair', emoji: '🪑' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'window', label: 'window', emoji: '🪟' },
      ],
      teach: {
        meaning: 'A chair is a seat for one person.',
        inUse: 'Please sit on the chair.',
        tip: 'Chair starts with the “ch” sound, like cheese.',
      },
    },
    {
      kind: 'choice',
      id: 'e4',
      word: 'bed',
      answerId: 'bed',
      choices: [
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'chair', label: 'chair', emoji: '🪑' },
        { id: 'lamp', label: 'lamp', emoji: '💡' },
        { id: 'door', label: 'door', emoji: '🚪' },
      ],
      teach: {
        meaning: 'A bed is where you sleep at night.',
        inUse: 'It is time for bed.',
        tip: 'Bed has three letters: b-e-d.',
      },
    },
    {
      kind: 'arrange',
      id: 'e5',
      prompt: 'Put the words in order — a polite request:',
      tiles: ['door', 'the', 'Please', 'close'],
      answer: ['Please', 'close', 'the', 'door'],
      teach: {
        meaning: 'A polite way to ask someone to shut the door.',
        inUse: 'Please close the door.',
        tip: 'Start a polite request with “Please”.',
      },
    },
    {
      kind: 'arrange',
      id: 'e6',
      prompt: 'Put the words in order — it is bedtime:',
      tiles: ['for', 'It', 'bed', 'is', 'time'],
      answer: ['It', 'is', 'time', 'for', 'bed'],
      teach: {
        meaning: 'A way to say it is time to sleep.',
        inUse: 'It is time for bed.',
        tip: 'A sentence usually starts with a capital letter.',
      },
    },
    {
      kind: 'match',
      id: 'e7',
      pairs: [
        { id: 'door', word: 'door', emoji: '🚪' },
        { id: 'window', word: 'window', emoji: '🪟' },
        { id: 'chair', word: 'chair', emoji: '🪑' },
        { id: 'bed', word: 'bed', emoji: '🛏️' },
      ],
      teach: {
        meaning: 'You matched each word to its picture.',
        inUse: 'door · window · chair · bed',
        tip: 'Say each word aloud as you match it.',
      },
    },
    {
      kind: 'fill',
      id: 'e8',
      before: 'Please close the',
      after: '.',
      answer: 'door',
      teach: {
        meaning: 'Finish the sentence with the missing word.',
        inUse: 'Please close the door.',
        tip: 'It is a word you learned earlier this lesson.',
      },
    },
  ] as Exercise[],
};

/* "Hello" — first greetings, taught through words. */
const greetings: Lesson = {
  id: 's1u1',
  title: 'Hello',
  reward: 10,
  exercises: [
    {
      kind: 'arrange', id: 'g1', prompt: 'Say hello to a friend:',
      tiles: ['my', 'Hello', 'friend'], answer: ['Hello', 'my', 'friend'],
      teach: { meaning: 'A warm way to greet someone you know.', inUse: 'Hello my friend!', tip: 'Start a greeting with “Hello”.' },
    },
    {
      kind: 'fill', id: 'g2', before: 'Hello! How are', after: '?', answer: 'you',
      teach: { meaning: 'A kind question that asks how someone feels.', inUse: 'How are you?', tip: '“You” means the person you are talking to.' },
    },
    {
      kind: 'arrange', id: 'g3', prompt: 'A friendly goodbye:',
      tiles: ['you', 'See', 'soon'], answer: ['See', 'you', 'soon'],
      teach: { meaning: 'A gentle way to say goodbye for now.', inUse: 'See you soon!', tip: 'We say this when we will meet again.' },
    },
    {
      kind: 'fill', id: 'g4', before: 'Thank', after: ' very much.', answer: 'you',
      teach: { meaning: 'A polite way to show you are grateful.', inUse: 'Thank you very much.', tip: 'Saying “thank you” is always kind.' },
    },
  ] as Exercise[],
};

/* "Family" — the people you love. */
const family: Lesson = {
  id: 's1u3',
  title: 'Family',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'fa1', word: 'mom', answerId: 'mom',
      choices: [
        { id: 'mom', label: 'mom', emoji: '👩' },
        { id: 'dad', label: 'dad', emoji: '👨' },
        { id: 'baby', label: 'baby', emoji: '👶' },
        { id: 'sister', label: 'sister', emoji: '👧' },
      ],
      teach: { meaning: 'Your mom is your mother.', inUse: 'I love my mom.', tip: 'Mom and mother both start with “m”.' },
    },
    {
      kind: 'choice', id: 'fa2', word: 'dad', answerId: 'dad',
      choices: [
        { id: 'dad', label: 'dad', emoji: '👨' },
        { id: 'mom', label: 'mom', emoji: '👩' },
        { id: 'brother', label: 'brother', emoji: '👦' },
        { id: 'baby', label: 'baby', emoji: '👶' },
      ],
      teach: { meaning: 'Your dad is your father.', inUse: 'My dad is tall.', tip: 'Dad and father mean the same person.' },
    },
    {
      kind: 'choice', id: 'fa3', word: 'baby', answerId: 'baby',
      choices: [
        { id: 'baby', label: 'baby', emoji: '👶' },
        { id: 'mom', label: 'mom', emoji: '👩' },
        { id: 'dad', label: 'dad', emoji: '👨' },
        { id: 'sister', label: 'sister', emoji: '👧' },
      ],
      teach: { meaning: 'A baby is a very young child.', inUse: 'The baby is sleeping.', tip: 'Babies are little and new.' },
    },
    {
      kind: 'arrange', id: 'fa4', prompt: 'Put the words in order:',
      tiles: ['my', 'I', 'family', 'love'], answer: ['I', 'love', 'my', 'family'],
      teach: { meaning: 'A happy way to talk about the people you love.', inUse: 'I love my family.', tip: 'A sentence starts with a capital letter.' },
    },
    {
      kind: 'match', id: 'fa5',
      pairs: [
        { id: 'mom', word: 'mom', emoji: '👩' },
        { id: 'dad', word: 'dad', emoji: '👨' },
        { id: 'sister', word: 'sister', emoji: '👧' },
        { id: 'brother', word: 'brother', emoji: '👦' },
      ],
      teach: { meaning: 'You matched each family word to its picture.', inUse: 'mom · dad · sister · brother', tip: 'Say each word aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'fa6', before: 'This is my', after: '.', answer: 'family',
      teach: { meaning: 'Finish the sentence with the missing word.', inUse: 'This is my family.', tip: 'It is a word you learned this lesson.' },
    },
  ] as Exercise[],
};

/* "Colors" — naming the rainbow. */
const colors: Lesson = {
  id: 's1u4',
  title: 'Colors',
  reward: 12,
  exercises: [
    {
      kind: 'listen', id: 'c0', word: 'red',
      teach: {
        meaning: 'Listen, then type the color you hear.',
        inUse: 'The apple is red.',
        tip: 'Tap the speaker to hear it again.',
      },
    },
    {
      kind: 'choice', id: 'c1', word: 'red', answerId: 'red',
      choices: [
        { id: 'red', label: 'red', emoji: '🟥' },
        { id: 'blue', label: 'blue', emoji: '🟦' },
        { id: 'green', label: 'green', emoji: '🟩' },
        { id: 'yellow', label: 'yellow', emoji: '🟨' },
      ],
      teach: { meaning: 'Red is the color of a strawberry.', inUse: 'The apple is red.', tip: 'Red starts with the letter R.' },
    },
    {
      kind: 'choice', id: 'c2', word: 'blue', answerId: 'blue',
      choices: [
        { id: 'blue', label: 'blue', emoji: '🟦' },
        { id: 'red', label: 'red', emoji: '🟥' },
        { id: 'green', label: 'green', emoji: '🟩' },
        { id: 'yellow', label: 'yellow', emoji: '🟨' },
      ],
      teach: { meaning: 'Blue is the color of the sky.', inUse: 'The sky is blue.', tip: 'The sea looks blue too.' },
    },
    {
      kind: 'choice', id: 'c3', word: 'green', answerId: 'green',
      choices: [
        { id: 'green', label: 'green', emoji: '🟩' },
        { id: 'red', label: 'red', emoji: '🟥' },
        { id: 'blue', label: 'blue', emoji: '🟦' },
        { id: 'yellow', label: 'yellow', emoji: '🟨' },
      ],
      teach: { meaning: 'Green is the color of grass and leaves.', inUse: 'The grass is green.', tip: 'Pip the sprout is green!' },
    },
    {
      kind: 'choice', id: 'c4', word: 'yellow', answerId: 'yellow',
      choices: [
        { id: 'yellow', label: 'yellow', emoji: '🟨' },
        { id: 'red', label: 'red', emoji: '🟥' },
        { id: 'blue', label: 'blue', emoji: '🟦' },
        { id: 'green', label: 'green', emoji: '🟩' },
      ],
      teach: { meaning: 'Yellow is the color of the sun.', inUse: 'The sun is yellow.', tip: 'Bananas are yellow too.' },
    },
    {
      kind: 'arrange', id: 'c5', prompt: 'Put the words in order:',
      tiles: ['is', 'The', 'blue', 'sky'], answer: ['The', 'sky', 'is', 'blue'],
      teach: { meaning: 'A sentence about the color of the sky.', inUse: 'The sky is blue.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'c6',
      pairs: [
        { id: 'red', word: 'red', emoji: '🟥' },
        { id: 'blue', word: 'blue', emoji: '🟦' },
        { id: 'green', word: 'green', emoji: '🟩' },
        { id: 'yellow', word: 'yellow', emoji: '🟨' },
      ],
      teach: { meaning: 'You matched each color word to its picture.', inUse: 'red · blue · green · yellow', tip: 'Say each color aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'c7', before: 'Grass is', after: '.', answer: 'green',
      teach: { meaning: 'Finish the sentence with the missing color.', inUse: 'Grass is green.', tip: 'It is the same color as Pip.' },
    },
  ] as Exercise[],
};

/* "Animals" — friendly creatures. */
const animals: Lesson = {
  id: 's1u7',
  title: 'Animals',
  reward: 12,
  exercises: [
    {
      kind: 'listen', id: 'a0', word: 'cat',
      teach: {
        meaning: 'Listen, then type the animal you hear.',
        inUse: 'The cat is sleeping.',
        tip: 'Tap the speaker to hear it again.',
      },
    },
    {
      kind: 'choice', id: 'a1', word: 'cat', answerId: 'cat',
      choices: [
        { id: 'cat', label: 'cat', emoji: '🐱' },
        { id: 'dog', label: 'dog', emoji: '🐶' },
        { id: 'bird', label: 'bird', emoji: '🐦' },
        { id: 'fish', label: 'fish', emoji: '🐟' },
      ],
      teach: { meaning: 'A cat is a soft pet that says “meow”.', inUse: 'The cat is sleeping.', tip: 'Cat starts with the letter C.' },
    },
    {
      kind: 'choice', id: 'a2', word: 'dog', answerId: 'dog',
      choices: [
        { id: 'dog', label: 'dog', emoji: '🐶' },
        { id: 'cat', label: 'cat', emoji: '🐱' },
        { id: 'bird', label: 'bird', emoji: '🐦' },
        { id: 'fish', label: 'fish', emoji: '🐟' },
      ],
      teach: { meaning: 'A dog is a friendly pet that says “woof”.', inUse: 'My dog likes to play.', tip: 'Dog starts with the letter D.' },
    },
    {
      kind: 'choice', id: 'a3', word: 'bird', answerId: 'bird',
      choices: [
        { id: 'bird', label: 'bird', emoji: '🐦' },
        { id: 'cat', label: 'cat', emoji: '🐱' },
        { id: 'dog', label: 'dog', emoji: '🐶' },
        { id: 'fish', label: 'fish', emoji: '🐟' },
      ],
      teach: { meaning: 'A bird has wings and can fly.', inUse: 'The bird sings in the tree.', tip: 'Birds lay eggs in a nest.' },
    },
    {
      kind: 'choice', id: 'a4', word: 'fish', answerId: 'fish',
      choices: [
        { id: 'fish', label: 'fish', emoji: '🐟' },
        { id: 'cat', label: 'cat', emoji: '🐱' },
        { id: 'dog', label: 'dog', emoji: '🐶' },
        { id: 'bird', label: 'bird', emoji: '🐦' },
      ],
      teach: { meaning: 'A fish lives and swims in water.', inUse: 'The fish swims fast.', tip: 'Fish breathe under water.' },
    },
    {
      kind: 'arrange', id: 'a5', prompt: 'Put the words in order:',
      tiles: ['a', 'I', 'cat', 'have', 'pet'], answer: ['I', 'have', 'a', 'pet', 'cat'],
      teach: { meaning: 'A sentence about having a pet.', inUse: 'I have a pet cat.', tip: 'A pet is an animal you care for.' },
    },
    {
      kind: 'match', id: 'a6',
      pairs: [
        { id: 'cat', word: 'cat', emoji: '🐱' },
        { id: 'dog', word: 'dog', emoji: '🐶' },
        { id: 'bird', word: 'bird', emoji: '🐦' },
        { id: 'fish', word: 'fish', emoji: '🐟' },
      ],
      teach: { meaning: 'You matched each animal to its picture.', inUse: 'cat · dog · bird · fish', tip: 'Say each animal aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'a7', before: 'The', after: ' says woof.', answer: 'dog',
      teach: { meaning: 'Finish the sentence with the right animal.', inUse: 'The dog says woof.', tip: 'Which pet barks?' },
    },
  ] as Exercise[],
};

/* "Numbers" — counting one to five. */
const numbers: Lesson = {
  id: 's1u5',
  title: 'Numbers',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'n1', word: 'one', answerId: 'one',
      choices: [
        { id: 'one', label: 'one', emoji: '1️⃣' },
        { id: 'two', label: 'two', emoji: '2️⃣' },
        { id: 'three', label: 'three', emoji: '3️⃣' },
        { id: 'four', label: 'four', emoji: '4️⃣' },
      ],
      teach: { meaning: 'One is the first number. It means a single thing.', inUse: 'I have one apple.', tip: 'Hold up one finger for one.' },
    },
    {
      kind: 'choice', id: 'n2', word: 'two', answerId: 'two',
      choices: [
        { id: 'two', label: 'two', emoji: '2️⃣' },
        { id: 'one', label: 'one', emoji: '1️⃣' },
        { id: 'three', label: 'three', emoji: '3️⃣' },
        { id: 'five', label: 'five', emoji: '5️⃣' },
      ],
      teach: { meaning: 'Two comes after one.', inUse: 'I see two birds.', tip: 'You have two hands.' },
    },
    {
      kind: 'choice', id: 'n3', word: 'three', answerId: 'three',
      choices: [
        { id: 'three', label: 'three', emoji: '3️⃣' },
        { id: 'two', label: 'two', emoji: '2️⃣' },
        { id: 'four', label: 'four', emoji: '4️⃣' },
        { id: 'one', label: 'one', emoji: '1️⃣' },
      ],
      teach: { meaning: 'Three comes after two.', inUse: 'A cat has three kittens.', tip: 'Count: one, two, three.' },
    },
    {
      kind: 'choice', id: 'n4', word: 'four', answerId: 'four',
      choices: [
        { id: 'four', label: 'four', emoji: '4️⃣' },
        { id: 'five', label: 'five', emoji: '5️⃣' },
        { id: 'three', label: 'three', emoji: '3️⃣' },
        { id: 'two', label: 'two', emoji: '2️⃣' },
      ],
      teach: { meaning: 'Four comes after three.', inUse: 'A chair has four legs.', tip: 'Two plus two makes four.' },
    },
    {
      kind: 'arrange', id: 'n5', prompt: 'Put the words in order:',
      tiles: ['can', 'I', 'to', 'count', 'five'], answer: ['I', 'can', 'count', 'to', 'five'],
      teach: { meaning: 'A proud sentence about counting.', inUse: 'I can count to five.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'n6',
      pairs: [
        { id: 'one', word: 'one', emoji: '1️⃣' },
        { id: 'two', word: 'two', emoji: '2️⃣' },
        { id: 'three', word: 'three', emoji: '3️⃣' },
        { id: 'four', word: 'four', emoji: '4️⃣' },
      ],
      teach: { meaning: 'You matched each number word to its number.', inUse: 'one · two · three · four', tip: 'Say each number aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'n7', before: 'One, two,', after: '.', answer: 'three',
      teach: { meaning: 'Finish counting the sentence.', inUse: 'One, two, three.', tip: 'What number comes after two?' },
    },
  ] as Exercise[],
};

/* "Food" — things we eat and drink. */
const food: Lesson = {
  id: 's1u6',
  title: 'Food',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'fd1', word: 'apple', answerId: 'apple',
      choices: [
        { id: 'apple', label: 'apple', emoji: '🍎' },
        { id: 'bread', label: 'bread', emoji: '🍞' },
        { id: 'milk', label: 'milk', emoji: '🥛' },
        { id: 'egg', label: 'egg', emoji: '🥚' },
      ],
      teach: { meaning: 'An apple is a sweet, round fruit.', inUse: 'I eat a red apple.', tip: 'Apple starts with the letter A.' },
    },
    {
      kind: 'choice', id: 'fd2', word: 'bread', answerId: 'bread',
      choices: [
        { id: 'bread', label: 'bread', emoji: '🍞' },
        { id: 'apple', label: 'apple', emoji: '🍎' },
        { id: 'milk', label: 'milk', emoji: '🥛' },
        { id: 'egg', label: 'egg', emoji: '🥚' },
      ],
      teach: { meaning: 'Bread is soft food made from flour.', inUse: 'I like warm bread.', tip: 'We make toast from bread.' },
    },
    {
      kind: 'choice', id: 'fd3', word: 'milk', answerId: 'milk',
      choices: [
        { id: 'milk', label: 'milk', emoji: '🥛' },
        { id: 'apple', label: 'apple', emoji: '🍎' },
        { id: 'bread', label: 'bread', emoji: '🍞' },
        { id: 'egg', label: 'egg', emoji: '🥚' },
      ],
      teach: { meaning: 'Milk is a white drink. It helps you grow.', inUse: 'I drink milk.', tip: 'Milk comes from cows.' },
    },
    {
      kind: 'choice', id: 'fd4', word: 'egg', answerId: 'egg',
      choices: [
        { id: 'egg', label: 'egg', emoji: '🥚' },
        { id: 'apple', label: 'apple', emoji: '🍎' },
        { id: 'bread', label: 'bread', emoji: '🍞' },
        { id: 'milk', label: 'milk', emoji: '🥛' },
      ],
      teach: { meaning: 'An egg comes from a hen. We cook it to eat.', inUse: 'I eat one egg.', tip: 'Birds lay eggs too.' },
    },
    {
      kind: 'arrange', id: 'fd5', prompt: 'Put the words in order:',
      tiles: ['to', 'I', 'bread', 'like', 'eat'], answer: ['I', 'like', 'to', 'eat', 'bread'],
      teach: { meaning: 'A sentence about food you enjoy.', inUse: 'I like to eat bread.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'fd6',
      pairs: [
        { id: 'apple', word: 'apple', emoji: '🍎' },
        { id: 'bread', word: 'bread', emoji: '🍞' },
        { id: 'milk', word: 'milk', emoji: '🥛' },
        { id: 'egg', word: 'egg', emoji: '🥚' },
      ],
      teach: { meaning: 'You matched each food to its picture.', inUse: 'apple · bread · milk · egg', tip: 'Say each food aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'fd7', before: 'I drink', after: ' in the morning.', answer: 'milk',
      teach: { meaning: 'Finish the sentence with the right drink.', inUse: 'I drink milk in the morning.', tip: 'It is the white drink.' },
    },
  ] as Exercise[],
};

/* "Clothes" — things we wear. */
const clothes: Lesson = {
  id: 's2u1',
  title: 'Clothes',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'cl1', word: 'shirt', answerId: 'shirt',
      choices: [
        { id: 'shirt', label: 'shirt', emoji: '👕' },
        { id: 'pants', label: 'pants', emoji: '👖' },
        { id: 'shoes', label: 'shoes', emoji: '👟' },
        { id: 'hat', label: 'hat', emoji: '🎩' },
      ],
      teach: { meaning: 'A shirt covers the top of your body.', inUse: 'I wear a clean shirt.', tip: 'Shirt starts with the “sh” sound.' },
    },
    {
      kind: 'choice', id: 'cl2', word: 'pants', answerId: 'pants',
      choices: [
        { id: 'pants', label: 'pants', emoji: '👖' },
        { id: 'shirt', label: 'shirt', emoji: '👕' },
        { id: 'socks', label: 'socks', emoji: '🧦' },
        { id: 'shoes', label: 'shoes', emoji: '👟' },
      ],
      teach: { meaning: 'Pants cover your legs.', inUse: 'These pants are blue.', tip: 'We say a pair of pants.' },
    },
    {
      kind: 'choice', id: 'cl3', word: 'shoes', answerId: 'shoes',
      choices: [
        { id: 'shoes', label: 'shoes', emoji: '👟' },
        { id: 'socks', label: 'socks', emoji: '🧦' },
        { id: 'hat', label: 'hat', emoji: '🎩' },
        { id: 'shirt', label: 'shirt', emoji: '👕' },
      ],
      teach: { meaning: 'Shoes go on your feet to keep them safe.', inUse: 'I tie my shoes.', tip: 'You wear two shoes — a pair.' },
    },
    {
      kind: 'choice', id: 'cl4', word: 'socks', answerId: 'socks',
      choices: [
        { id: 'socks', label: 'socks', emoji: '🧦' },
        { id: 'shoes', label: 'shoes', emoji: '👟' },
        { id: 'pants', label: 'pants', emoji: '👖' },
        { id: 'hat', label: 'hat', emoji: '🎩' },
      ],
      teach: { meaning: 'Socks go on your feet, under your shoes.', inUse: 'My socks are warm.', tip: 'Socks keep your feet cozy.' },
    },
    {
      kind: 'arrange', id: 'cl5', prompt: 'Put the words in order:',
      tiles: ['my', 'I', 'on', 'shoes', 'put'], answer: ['I', 'put', 'on', 'my', 'shoes'],
      teach: { meaning: 'A sentence about getting dressed.', inUse: 'I put on my shoes.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'cl6',
      pairs: [
        { id: 'shirt', word: 'shirt', emoji: '👕' },
        { id: 'pants', word: 'pants', emoji: '👖' },
        { id: 'shoes', word: 'shoes', emoji: '👟' },
        { id: 'socks', word: 'socks', emoji: '🧦' },
      ],
      teach: { meaning: 'You matched each clothing word to its picture.', inUse: 'shirt · pants · shoes · socks', tip: 'Say each one aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'cl7', before: 'I wear a', after: ' on my head.', answer: 'hat',
      teach: { meaning: 'Finish the sentence with the right clothing.', inUse: 'I wear a hat on my head.', tip: 'It keeps the sun off your face.' },
    },
  ] as Exercise[],
};

/* "The Body" — parts of you. */
const body: Lesson = {
  id: 's2u2',
  title: 'The Body',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'bo1', word: 'hand', answerId: 'hand',
      choices: [
        { id: 'hand', label: 'hand', emoji: '✋' },
        { id: 'eye', label: 'eye', emoji: '👁️' },
        { id: 'ear', label: 'ear', emoji: '👂' },
        { id: 'nose', label: 'nose', emoji: '👃' },
      ],
      teach: { meaning: 'You hold things with your hand.', inUse: 'I wave my hand.', tip: 'You have two hands.' },
    },
    {
      kind: 'choice', id: 'bo2', word: 'eye', answerId: 'eye',
      choices: [
        { id: 'eye', label: 'eye', emoji: '👁️' },
        { id: 'ear', label: 'ear', emoji: '👂' },
        { id: 'nose', label: 'nose', emoji: '👃' },
        { id: 'hand', label: 'hand', emoji: '✋' },
      ],
      teach: { meaning: 'You see with your eyes.', inUse: 'I close my eyes.', tip: 'You have two eyes.' },
    },
    {
      kind: 'choice', id: 'bo3', word: 'ear', answerId: 'ear',
      choices: [
        { id: 'ear', label: 'ear', emoji: '👂' },
        { id: 'eye', label: 'eye', emoji: '👁️' },
        { id: 'hand', label: 'hand', emoji: '✋' },
        { id: 'nose', label: 'nose', emoji: '👃' },
      ],
      teach: { meaning: 'You hear with your ears.', inUse: 'I cover my ears.', tip: 'You have two ears.' },
    },
    {
      kind: 'choice', id: 'bo4', word: 'nose', answerId: 'nose',
      choices: [
        { id: 'nose', label: 'nose', emoji: '👃' },
        { id: 'ear', label: 'ear', emoji: '👂' },
        { id: 'eye', label: 'eye', emoji: '👁️' },
        { id: 'hand', label: 'hand', emoji: '✋' },
      ],
      teach: { meaning: 'You smell with your nose.', inUse: 'I touch my nose.', tip: 'You have one nose.' },
    },
    {
      kind: 'arrange', id: 'bo5', prompt: 'Put the words in order:',
      tiles: ['my', 'I', 'with', 'see', 'eyes'], answer: ['I', 'see', 'with', 'my', 'eyes'],
      teach: { meaning: 'A sentence about how you see.', inUse: 'I see with my eyes.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'bo6',
      pairs: [
        { id: 'hand', word: 'hand', emoji: '✋' },
        { id: 'eye', word: 'eye', emoji: '👁️' },
        { id: 'ear', word: 'ear', emoji: '👂' },
        { id: 'nose', word: 'nose', emoji: '👃' },
      ],
      teach: { meaning: 'You matched each body part to its picture.', inUse: 'hand · eye · ear · nose', tip: 'Point to each part as you say it.' },
    },
    {
      kind: 'fill', id: 'bo7', before: 'I smell with my', after: '.', answer: 'nose',
      teach: { meaning: 'Finish the sentence with the right body part.', inUse: 'I smell with my nose.', tip: 'It is in the middle of your face.' },
    },
  ] as Exercise[],
};

/* "Weather" — what the sky is doing. */
const weather: Lesson = {
  id: 's2u3',
  title: 'Weather',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'we1', word: 'sun', answerId: 'sun',
      choices: [
        { id: 'sun', label: 'sun', emoji: '☀️' },
        { id: 'rain', label: 'rain', emoji: '🌧️' },
        { id: 'snow', label: 'snow', emoji: '❄️' },
        { id: 'cloud', label: 'cloud', emoji: '☁️' },
      ],
      teach: { meaning: 'The sun is bright and warm.', inUse: 'The sun is out today.', tip: 'The sun helps plants grow.' },
    },
    {
      kind: 'choice', id: 'we2', word: 'rain', answerId: 'rain',
      choices: [
        { id: 'rain', label: 'rain', emoji: '🌧️' },
        { id: 'sun', label: 'sun', emoji: '☀️' },
        { id: 'snow', label: 'snow', emoji: '❄️' },
        { id: 'cloud', label: 'cloud', emoji: '☁️' },
      ],
      teach: { meaning: 'Rain is water that falls from clouds.', inUse: 'The rain is cold.', tip: 'Plants drink the rain.' },
    },
    {
      kind: 'choice', id: 'we3', word: 'snow', answerId: 'snow',
      choices: [
        { id: 'snow', label: 'snow', emoji: '❄️' },
        { id: 'rain', label: 'rain', emoji: '🌧️' },
        { id: 'sun', label: 'sun', emoji: '☀️' },
        { id: 'cloud', label: 'cloud', emoji: '☁️' },
      ],
      teach: { meaning: 'Snow is soft, white, and cold.', inUse: 'We play in the snow.', tip: 'Snow falls when it is very cold.' },
    },
    {
      kind: 'choice', id: 'we4', word: 'cloud', answerId: 'cloud',
      choices: [
        { id: 'cloud', label: 'cloud', emoji: '☁️' },
        { id: 'sun', label: 'sun', emoji: '☀️' },
        { id: 'rain', label: 'rain', emoji: '🌧️' },
        { id: 'snow', label: 'snow', emoji: '❄️' },
      ],
      teach: { meaning: 'A cloud is white and floats in the sky.', inUse: 'A big cloud hid the sun.', tip: 'Rain comes from clouds.' },
    },
    {
      kind: 'arrange', id: 'we5', prompt: 'Put the words in order:',
      tiles: ['is', 'The', 'hot', 'sun'], answer: ['The', 'sun', 'is', 'hot'],
      teach: { meaning: 'A sentence about the weather.', inUse: 'The sun is hot.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'we6',
      pairs: [
        { id: 'sun', word: 'sun', emoji: '☀️' },
        { id: 'rain', word: 'rain', emoji: '🌧️' },
        { id: 'snow', word: 'snow', emoji: '❄️' },
        { id: 'cloud', word: 'cloud', emoji: '☁️' },
      ],
      teach: { meaning: 'You matched each weather word to its picture.', inUse: 'sun · rain · snow · cloud', tip: 'Look out the window and name the weather.' },
    },
    {
      kind: 'fill', id: 'we7', before: 'I use an umbrella in the', after: '.', answer: 'rain',
      teach: { meaning: 'Finish the sentence with the right weather.', inUse: 'I use an umbrella in the rain.', tip: 'It falls from the clouds.' },
    },
  ] as Exercise[],
};

/* "Days & Time" — parts of the day. */
const daysTime: Lesson = {
  id: 's2u4',
  title: 'Days & Time',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'dt1', word: 'morning', answerId: 'morning',
      choices: [
        { id: 'morning', label: 'morning', emoji: '🌅' },
        { id: 'night', label: 'night', emoji: '🌙' },
        { id: 'day', label: 'day', emoji: '☀️' },
        { id: 'clock', label: 'clock', emoji: '🕐' },
      ],
      teach: { meaning: 'Morning is the start of the day.', inUse: 'Good morning!', tip: 'The sun rises in the morning.' },
    },
    {
      kind: 'choice', id: 'dt2', word: 'night', answerId: 'night',
      choices: [
        { id: 'night', label: 'night', emoji: '🌙' },
        { id: 'morning', label: 'morning', emoji: '🌅' },
        { id: 'day', label: 'day', emoji: '☀️' },
        { id: 'clock', label: 'clock', emoji: '🕐' },
      ],
      teach: { meaning: 'Night is when the sky is dark and we sleep.', inUse: 'Good night!', tip: 'The moon comes out at night.' },
    },
    {
      kind: 'choice', id: 'dt3', word: 'clock', answerId: 'clock',
      choices: [
        { id: 'clock', label: 'clock', emoji: '🕐' },
        { id: 'day', label: 'day', emoji: '☀️' },
        { id: 'night', label: 'night', emoji: '🌙' },
        { id: 'morning', label: 'morning', emoji: '🌅' },
      ],
      teach: { meaning: 'A clock tells us the time.', inUse: 'Look at the clock.', tip: 'A clock has hands that move.' },
    },
    {
      kind: 'choice', id: 'dt4', word: 'day', answerId: 'day',
      choices: [
        { id: 'day', label: 'day', emoji: '☀️' },
        { id: 'night', label: 'night', emoji: '🌙' },
        { id: 'morning', label: 'morning', emoji: '🌅' },
        { id: 'clock', label: 'clock', emoji: '🕐' },
      ],
      teach: { meaning: 'Day is when the sky is light.', inUse: 'Have a nice day!', tip: 'The sun is out during the day.' },
    },
    {
      kind: 'arrange', id: 'dt5', prompt: 'Put the words in order:',
      tiles: ['time', 'It', 'bed', 'is', 'for'], answer: ['It', 'is', 'time', 'for', 'bed'],
      teach: { meaning: 'A way to say it is time to sleep.', inUse: 'It is time for bed.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'dt6',
      pairs: [
        { id: 'morning', word: 'morning', emoji: '🌅' },
        { id: 'night', word: 'night', emoji: '🌙' },
        { id: 'day', word: 'day', emoji: '☀️' },
        { id: 'clock', word: 'clock', emoji: '🕐' },
      ],
      teach: { meaning: 'You matched each time word to its picture.', inUse: 'morning · night · day · clock', tip: 'Say each one aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'dt7', before: 'Good', after: '!', answer: 'morning',
      teach: { meaning: 'A kind thing to say when you wake up.', inUse: 'Good morning!', tip: 'You say it at the start of the day.' },
    },
  ] as Exercise[],
};

/* "At School" — things in the classroom. */
const atSchool: Lesson = {
  id: 's2u5',
  title: 'At School',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'sc1', word: 'pencil', answerId: 'pencil',
      choices: [
        { id: 'pencil', label: 'pencil', emoji: '✏️' },
        { id: 'book', label: 'book', emoji: '📖' },
        { id: 'bag', label: 'bag', emoji: '🎒' },
        { id: 'pen', label: 'pen', emoji: '🖊️' },
      ],
      teach: { meaning: 'You write and draw with a pencil.', inUse: 'I have a yellow pencil.', tip: 'A pencil has an eraser on the end.' },
    },
    {
      kind: 'choice', id: 'sc2', word: 'book', answerId: 'book',
      choices: [
        { id: 'book', label: 'book', emoji: '📖' },
        { id: 'pencil', label: 'pencil', emoji: '✏️' },
        { id: 'bag', label: 'bag', emoji: '🎒' },
        { id: 'pen', label: 'pen', emoji: '🖊️' },
      ],
      teach: { meaning: 'You read a book.', inUse: 'This book is fun.', tip: 'A book is full of words and pictures.' },
    },
    {
      kind: 'choice', id: 'sc3', word: 'bag', answerId: 'bag',
      choices: [
        { id: 'bag', label: 'bag', emoji: '🎒' },
        { id: 'book', label: 'book', emoji: '📖' },
        { id: 'pencil', label: 'pencil', emoji: '✏️' },
        { id: 'pen', label: 'pen', emoji: '🖊️' },
      ],
      teach: { meaning: 'A bag carries your things to school.', inUse: 'My bag is heavy.', tip: 'You wear a school bag on your back.' },
    },
    {
      kind: 'choice', id: 'sc4', word: 'pen', answerId: 'pen',
      choices: [
        { id: 'pen', label: 'pen', emoji: '🖊️' },
        { id: 'pencil', label: 'pencil', emoji: '✏️' },
        { id: 'book', label: 'book', emoji: '📖' },
        { id: 'bag', label: 'bag', emoji: '🎒' },
      ],
      teach: { meaning: 'A pen writes with ink.', inUse: 'I sign my name with a pen.', tip: 'Pen ink does not rub out.' },
    },
    {
      kind: 'arrange', id: 'sc5', prompt: 'Put the words in order:',
      tiles: ['a', 'I', 'book', 'read'], answer: ['I', 'read', 'a', 'book'],
      teach: { meaning: 'A sentence about reading.', inUse: 'I read a book.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'sc6',
      pairs: [
        { id: 'pencil', word: 'pencil', emoji: '✏️' },
        { id: 'book', word: 'book', emoji: '📖' },
        { id: 'bag', word: 'bag', emoji: '🎒' },
        { id: 'pen', word: 'pen', emoji: '🖊️' },
      ],
      teach: { meaning: 'You matched each school word to its picture.', inUse: 'pencil · book · bag · pen', tip: 'Say each one aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'sc7', before: 'I write with a', after: '.', answer: 'pencil',
      teach: { meaning: 'Finish the sentence with the right tool.', inUse: 'I write with a pencil.', tip: 'It has an eraser on top.' },
    },
  ] as Exercise[],
};

/* "Toys & Play" — fun things to play with. */
const toysPlay: Lesson = {
  id: 's2u6',
  title: 'Toys & Play',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'tp1', word: 'ball', answerId: 'ball',
      choices: [
        { id: 'ball', label: 'ball', emoji: '⚽' },
        { id: 'teddy', label: 'teddy', emoji: '🧸' },
        { id: 'kite', label: 'kite', emoji: '🪁' },
        { id: 'car', label: 'car', emoji: '🚗' },
      ],
      teach: { meaning: 'You kick or throw a ball.', inUse: 'I kick the ball.', tip: 'A ball is round.' },
    },
    {
      kind: 'choice', id: 'tp2', word: 'teddy', answerId: 'teddy',
      choices: [
        { id: 'teddy', label: 'teddy', emoji: '🧸' },
        { id: 'ball', label: 'ball', emoji: '⚽' },
        { id: 'kite', label: 'kite', emoji: '🪁' },
        { id: 'car', label: 'car', emoji: '🚗' },
      ],
      teach: { meaning: 'A teddy is a soft toy bear.', inUse: 'I hug my teddy.', tip: 'A teddy is cuddly and soft.' },
    },
    {
      kind: 'choice', id: 'tp3', word: 'kite', answerId: 'kite',
      choices: [
        { id: 'kite', label: 'kite', emoji: '🪁' },
        { id: 'ball', label: 'ball', emoji: '⚽' },
        { id: 'teddy', label: 'teddy', emoji: '🧸' },
        { id: 'car', label: 'car', emoji: '🚗' },
      ],
      teach: { meaning: 'A kite flies high in the wind.', inUse: 'My kite is in the sky.', tip: 'You need wind to fly a kite.' },
    },
    {
      kind: 'choice', id: 'tp4', word: 'car', answerId: 'car',
      choices: [
        { id: 'car', label: 'car', emoji: '🚗' },
        { id: 'ball', label: 'ball', emoji: '⚽' },
        { id: 'teddy', label: 'teddy', emoji: '🧸' },
        { id: 'kite', label: 'kite', emoji: '🪁' },
      ],
      teach: { meaning: 'A toy car has wheels and rolls.', inUse: 'My toy car is red.', tip: 'A car drives on its wheels.' },
    },
    {
      kind: 'arrange', id: 'tp5', prompt: 'Put the words in order:',
      tiles: ['my', 'I', 'with', 'play', 'ball'], answer: ['I', 'play', 'with', 'my', 'ball'],
      teach: { meaning: 'A sentence about playing.', inUse: 'I play with my ball.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'tp6',
      pairs: [
        { id: 'ball', word: 'ball', emoji: '⚽' },
        { id: 'teddy', word: 'teddy', emoji: '🧸' },
        { id: 'kite', word: 'kite', emoji: '🪁' },
        { id: 'car', word: 'car', emoji: '🚗' },
      ],
      teach: { meaning: 'You matched each toy to its picture.', inUse: 'ball · teddy · kite · car', tip: 'Say each toy aloud as you match it.' },
    },
    {
      kind: 'fill', id: 'tp7', before: "Let's", after: '!', answer: 'play',
      teach: { meaning: 'A happy way to ask a friend to have fun.', inUse: "Let's play!", tip: 'It is what you do with toys.' },
    },
  ] as Exercise[],
};

/* "Feelings" — how we feel. */
const feelings: Lesson = {
  id: 's2u7',
  title: 'Feelings',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'fe1', word: 'happy', answerId: 'happy',
      choices: [
        { id: 'happy', label: 'happy', emoji: '😀' },
        { id: 'sad', label: 'sad', emoji: '😢' },
        { id: 'angry', label: 'angry', emoji: '😠' },
        { id: 'scared', label: 'scared', emoji: '😨' },
      ],
      teach: { meaning: 'Happy is the good feeling when you smile.', inUse: 'I am happy today.', tip: 'A happy face smiles.' },
    },
    {
      kind: 'choice', id: 'fe2', word: 'sad', answerId: 'sad',
      choices: [
        { id: 'sad', label: 'sad', emoji: '😢' },
        { id: 'happy', label: 'happy', emoji: '😀' },
        { id: 'angry', label: 'angry', emoji: '😠' },
        { id: 'scared', label: 'scared', emoji: '😨' },
      ],
      teach: { meaning: 'Sad is the feeling that can make you cry.', inUse: 'I feel sad.', tip: 'It is okay to feel sad sometimes.' },
    },
    {
      kind: 'choice', id: 'fe3', word: 'angry', answerId: 'angry',
      choices: [
        { id: 'angry', label: 'angry', emoji: '😠' },
        { id: 'happy', label: 'happy', emoji: '😀' },
        { id: 'sad', label: 'sad', emoji: '😢' },
        { id: 'scared', label: 'scared', emoji: '😨' },
      ],
      teach: { meaning: 'Angry is a hot, cross feeling.', inUse: 'He looks angry.', tip: 'Take a deep breath when you feel angry.' },
    },
    {
      kind: 'choice', id: 'fe4', word: 'scared', answerId: 'scared',
      choices: [
        { id: 'scared', label: 'scared', emoji: '😨' },
        { id: 'happy', label: 'happy', emoji: '😀' },
        { id: 'sad', label: 'sad', emoji: '😢' },
        { id: 'angry', label: 'angry', emoji: '😠' },
      ],
      teach: { meaning: 'Scared is the feeling of being afraid.', inUse: 'The loud noise made me scared.', tip: 'A hug helps when you feel scared.' },
    },
    {
      kind: 'arrange', id: 'fe5', prompt: 'Put the words in order:',
      tiles: ['very', 'I', 'happy', 'am'], answer: ['I', 'am', 'very', 'happy'],
      teach: { meaning: 'A sentence about feeling good.', inUse: 'I am very happy.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'fe6',
      pairs: [
        { id: 'happy', word: 'happy', emoji: '😀' },
        { id: 'sad', word: 'sad', emoji: '😢' },
        { id: 'angry', word: 'angry', emoji: '😠' },
        { id: 'scared', word: 'scared', emoji: '😨' },
      ],
      teach: { meaning: 'You matched each feeling to its face.', inUse: 'happy · sad · angry · scared', tip: 'Make each face as you match it.' },
    },
    {
      kind: 'fill', id: 'fe7', before: 'I feel', after: ' today.', answer: 'happy',
      teach: { meaning: 'Finish the sentence about how you feel.', inUse: 'I feel happy today.', tip: 'It is the smiling feeling.' },
    },
  ] as Exercise[],
};

/* "Action Words" — things we do. */
const actions: Lesson = {
  id: 's2u8',
  title: 'Action Words',
  reward: 12,
  exercises: [
    {
      kind: 'choice', id: 'ac1', word: 'run', answerId: 'run',
      choices: [
        { id: 'run', label: 'run', emoji: '🏃' },
        { id: 'jump', label: 'jump', emoji: '🤸' },
        { id: 'eat', label: 'eat', emoji: '🍽️' },
        { id: 'sleep', label: 'sleep', emoji: '😴' },
      ],
      teach: { meaning: 'To run is to move fast on your feet.', inUse: 'I run in the park.', tip: 'You run faster than you walk.' },
    },
    {
      kind: 'choice', id: 'ac2', word: 'jump', answerId: 'jump',
      choices: [
        { id: 'jump', label: 'jump', emoji: '🤸' },
        { id: 'run', label: 'run', emoji: '🏃' },
        { id: 'eat', label: 'eat', emoji: '🍽️' },
        { id: 'sleep', label: 'sleep', emoji: '😴' },
      ],
      teach: { meaning: 'To jump is to push up off the ground.', inUse: 'I jump up high.', tip: 'Frogs jump too.' },
    },
    {
      kind: 'choice', id: 'ac3', word: 'eat', answerId: 'eat',
      choices: [
        { id: 'eat', label: 'eat', emoji: '🍽️' },
        { id: 'run', label: 'run', emoji: '🏃' },
        { id: 'jump', label: 'jump', emoji: '🤸' },
        { id: 'sleep', label: 'sleep', emoji: '😴' },
      ],
      teach: { meaning: 'To eat is to have food.', inUse: 'I eat my lunch.', tip: 'We eat when we are hungry.' },
    },
    {
      kind: 'choice', id: 'ac4', word: 'sleep', answerId: 'sleep',
      choices: [
        { id: 'sleep', label: 'sleep', emoji: '😴' },
        { id: 'run', label: 'run', emoji: '🏃' },
        { id: 'jump', label: 'jump', emoji: '🤸' },
        { id: 'eat', label: 'eat', emoji: '🍽️' },
      ],
      teach: { meaning: 'To sleep is to rest with your eyes closed.', inUse: 'I sleep in my bed.', tip: 'We sleep at night.' },
    },
    {
      kind: 'arrange', id: 'ac5', prompt: 'Put the words in order:',
      tiles: ['to', 'I', 'run', 'like'], answer: ['I', 'like', 'to', 'run'],
      teach: { meaning: 'A sentence about an action you enjoy.', inUse: 'I like to run.', tip: 'Start with a capital letter.' },
    },
    {
      kind: 'match', id: 'ac6',
      pairs: [
        { id: 'run', word: 'run', emoji: '🏃' },
        { id: 'jump', word: 'jump', emoji: '🤸' },
        { id: 'eat', word: 'eat', emoji: '🍽️' },
        { id: 'sleep', word: 'sleep', emoji: '😴' },
      ],
      teach: { meaning: 'You matched each action to its picture.', inUse: 'run · jump · eat · sleep', tip: 'Act each one out as you match it.' },
    },
    {
      kind: 'fill', id: 'ac7', before: 'I', after: ' at night.', answer: 'sleep',
      teach: { meaning: 'Finish the sentence with the right action.', inUse: 'I sleep at night.', tip: 'It is what you do in bed.' },
    },
  ] as Exercise[],
};

/* A compact builder for picture-vocabulary lessons: 4 picture choices (each
   word is the answer once, the other three are distractors), then arrange,
   match, and fill. Keeps later sections terse and consistent. */
interface VocabWordSpec { id: string; emoji: string; teach: Teach }
interface VocabLessonSpec {
  id: string;
  title: string;
  reward?: number;
  words: VocabWordSpec[];
  arrange: { prompt?: string; tiles: string[]; answer: string[]; teach: Teach };
  fill: { before: string; after: string; answer: string; teach: Teach };
  matchTip?: string;
}
function vocabLesson(spec: VocabLessonSpec): Lesson {
  const choices: Choice[] = spec.words.map((w) => ({ id: w.id, label: w.id, emoji: w.emoji }));
  const exercises: Exercise[] = [
    ...spec.words.map((w, i): Exercise => ({
      kind: 'choice', id: `${spec.id}c${i + 1}`, word: w.id, answerId: w.id, choices, teach: w.teach,
    })),
    {
      kind: 'arrange', id: `${spec.id}a`,
      prompt: spec.arrange.prompt ?? 'Put the words in order:',
      tiles: spec.arrange.tiles, answer: spec.arrange.answer, teach: spec.arrange.teach,
    },
    {
      kind: 'match', id: `${spec.id}m`,
      pairs: spec.words.map((w) => ({ id: w.id, word: w.id, emoji: w.emoji })),
      teach: {
        meaning: 'You matched each word to its picture.',
        inUse: spec.words.map((w) => w.id).join(' · '),
        tip: spec.matchTip ?? 'Say each one aloud as you match it.',
      },
    },
    {
      kind: 'fill', id: `${spec.id}f`,
      before: spec.fill.before, after: spec.fill.after, answer: spec.fill.answer, teach: spec.fill.teach,
    },
  ];
  return { id: spec.id, title: spec.title, reward: spec.reward ?? 12, exercises };
}

/* ---- Section 3: Out and About ---- */
const park = vocabLesson({
  id: 's3u1', title: 'The Park',
  words: [
    { id: 'tree', emoji: '🌳', teach: { meaning: 'A tree is a tall plant with a trunk and leaves.', inUse: 'The tree gives cool shade.', tip: 'Trees grow very tall.' } },
    { id: 'flower', emoji: '🌸', teach: { meaning: 'A flower is the pretty, colorful part of a plant.', inUse: 'I smell the flower.', tip: 'Flowers smell sweet.' } },
    { id: 'slide', emoji: '🛝', teach: { meaning: 'A slide is fun to slide down at the park.', inUse: 'I go down the slide.', tip: 'Climb up, then slide down.' } },
    { id: 'grass', emoji: '🌿', teach: { meaning: 'Grass is the green plant that covers the ground.', inUse: 'I sit on the grass.', tip: 'Grass is soft and green.' } },
  ],
  arrange: { tiles: ['at', 'I', 'the', 'play', 'park'], answer: ['I', 'play', 'at', 'the', 'park'], teach: { meaning: 'A sentence about the park.', inUse: 'I play at the park.', tip: 'Start with a capital letter.' } },
  fill: { before: 'I sit on the green', after: '.', answer: 'grass', teach: { meaning: 'Finish the sentence.', inUse: 'I sit on the green grass.', tip: 'It is soft and green underfoot.' } },
});
const town = vocabLesson({
  id: 's3u2', title: 'Around Town',
  words: [
    { id: 'house', emoji: '🏠', teach: { meaning: 'A house is a building where people live.', inUse: 'I live in a house.', tip: 'A home keeps you warm and safe.' } },
    { id: 'shop', emoji: '🏪', teach: { meaning: 'A shop is where you buy things.', inUse: 'I go to the shop.', tip: 'You buy food at a shop.' } },
    { id: 'school', emoji: '🏫', teach: { meaning: 'A school is where children learn.', inUse: 'I walk to school.', tip: 'You learn and play at school.' } },
    { id: 'park', emoji: '🏞️', teach: { meaning: 'A park is a green place to play outside.', inUse: 'We run in the park.', tip: 'Parks have grass and trees.' } },
  ],
  arrange: { tiles: ['in', 'I', 'a', 'live', 'house'], answer: ['I', 'live', 'in', 'a', 'house'], teach: { meaning: 'A sentence about where you live.', inUse: 'I live in a house.', tip: 'Start with a capital letter.' } },
  fill: { before: 'I buy food at the', after: '.', answer: 'shop', teach: { meaning: 'Finish the sentence.', inUse: 'I buy food at the shop.', tip: 'It is where you go shopping.' } },
});
const gettingThere = vocabLesson({
  id: 's3u3', title: 'Getting There',
  words: [
    { id: 'bus', emoji: '🚌', teach: { meaning: 'A bus carries many people on roads.', inUse: 'I ride the bus to school.', tip: 'A bus is big and stops often.' } },
    { id: 'bike', emoji: '🚲', teach: { meaning: 'A bike has two wheels and pedals.', inUse: 'I ride my bike.', tip: 'You pedal a bike with your feet.' } },
    { id: 'train', emoji: '🚆', teach: { meaning: 'A train runs along tracks.', inUse: 'The train is fast.', tip: 'Trains have many cars joined together.' } },
    { id: 'car', emoji: '🚗', teach: { meaning: 'A car drives on the road.', inUse: 'We go by car.', tip: 'A car has four wheels.' } },
  ],
  arrange: { tiles: ['by', 'I', 'bus', 'go'], answer: ['I', 'go', 'by', 'bus'], teach: { meaning: 'A sentence about travel.', inUse: 'I go by bus.', tip: 'Start with a capital letter.' } },
  fill: { before: 'I ride my', after: ' to the park.', answer: 'bike', teach: { meaning: 'Finish the sentence.', inUse: 'I ride my bike to the park.', tip: 'It has two wheels and pedals.' } },
});
const shopping = vocabLesson({
  id: 's3u4', title: 'Shopping',
  words: [
    { id: 'money', emoji: '💵', teach: { meaning: 'Money is what we use to buy things.', inUse: 'I pay with money.', tip: 'You keep money in a wallet.' } },
    { id: 'cart', emoji: '🛒', teach: { meaning: 'A cart holds your shopping.', inUse: 'I push the cart.', tip: 'A cart has wheels.' } },
    { id: 'gift', emoji: '🎁', teach: { meaning: 'A gift is a present you give someone.', inUse: 'I wrap a gift.', tip: 'We give gifts on birthdays.' } },
    { id: 'bag', emoji: '🛍️', teach: { meaning: 'A bag carries the things you buy.', inUse: 'I fill my bag.', tip: 'You carry shopping in a bag.' } },
  ],
  arrange: { tiles: ['a', 'I', 'gift', 'buy'], answer: ['I', 'buy', 'a', 'gift'], teach: { meaning: 'A sentence about shopping.', inUse: 'I buy a gift.', tip: 'Start with a capital letter.' } },
  fill: { before: 'I pay with', after: '.', answer: 'money', teach: { meaning: 'Finish the sentence.', inUse: 'I pay with money.', tip: 'It is what you buy things with.' } },
});
const peopleAtWork = vocabLesson({
  id: 's3u5', title: 'People at Work',
  words: [
    { id: 'doctor', emoji: '👩‍⚕️', teach: { meaning: 'A doctor helps people who are sick.', inUse: 'The doctor is kind.', tip: 'You see a doctor when you are ill.' } },
    { id: 'teacher', emoji: '🧑‍🏫', teach: { meaning: 'A teacher helps children learn.', inUse: 'My teacher is nice.', tip: 'You meet your teacher at school.' } },
    { id: 'chef', emoji: '🧑‍🍳', teach: { meaning: 'A chef cooks food.', inUse: 'The chef makes soup.', tip: 'A chef works in a kitchen.' } },
    { id: 'farmer', emoji: '🧑‍🌾', teach: { meaning: 'A farmer grows food and cares for animals.', inUse: 'The farmer grows corn.', tip: 'Farmers work on a farm.' } },
  ],
  arrange: { tiles: ['a', 'She', 'doctor', 'is'], answer: ['She', 'is', 'a', 'doctor'], teach: { meaning: 'A sentence about a job.', inUse: 'She is a doctor.', tip: 'Start with a capital letter.' } },
  fill: { before: 'A', after: ' helps sick people.', answer: 'doctor', teach: { meaning: 'Finish the sentence.', inUse: 'A doctor helps sick people.', tip: 'You see them when you are ill.' } },
});
const inNature = vocabLesson({
  id: 's3u6', title: 'In Nature',
  words: [
    { id: 'mountain', emoji: '⛰️', teach: { meaning: 'A mountain is a very tall hill.', inUse: 'The mountain is high.', tip: 'Mountains can have snow on top.' } },
    { id: 'star', emoji: '⭐', teach: { meaning: 'A star shines in the night sky.', inUse: 'I see a star.', tip: 'Stars come out at night.' } },
    { id: 'rainbow', emoji: '🌈', teach: { meaning: 'A rainbow has many colors in the sky.', inUse: 'Look at the rainbow!', tip: 'Rainbows come after rain.' } },
    { id: 'leaf', emoji: '🍃', teach: { meaning: 'A leaf is the flat green part of a plant.', inUse: 'A leaf fell down.', tip: 'Leaves grow on trees.' } },
  ],
  arrange: { tiles: ['is', 'The', 'high', 'mountain'], answer: ['The', 'mountain', 'is', 'high'], teach: { meaning: 'A sentence about nature.', inUse: 'The mountain is high.', tip: 'Start with a capital letter.' } },
  fill: { before: 'A', after: ' has many colors.', answer: 'rainbow', teach: { meaning: 'Finish the sentence.', inUse: 'A rainbow has many colors.', tip: 'You see it after the rain.' } },
});
const directions = vocabLesson({
  id: 's3u7', title: 'Directions',
  words: [
    { id: 'up', emoji: '⬆️', teach: { meaning: 'Up means toward the sky.', inUse: 'Look up!', tip: 'The opposite of up is down.' } },
    { id: 'down', emoji: '⬇️', teach: { meaning: 'Down means toward the ground.', inUse: 'Sit down, please.', tip: 'The opposite of down is up.' } },
    { id: 'left', emoji: '⬅️', teach: { meaning: 'Left is one side — the side of your left hand.', inUse: 'Turn left here.', tip: 'The opposite of left is right.' } },
    { id: 'right', emoji: '➡️', teach: { meaning: 'Right is the other side — the side of your right hand.', inUse: 'Look to the right.', tip: 'The opposite of right is left.' } },
  ],
  arrange: { tiles: ['up', 'Look', 'the', 'at', 'sky'], answer: ['Look', 'up', 'at', 'the', 'sky'], teach: { meaning: 'A sentence using a direction.', inUse: 'Look up at the sky.', tip: 'Start with a capital letter.' } },
  fill: { before: 'Turn', after: ' at the corner.', answer: 'left', teach: { meaning: 'Finish the sentence.', inUse: 'Turn left at the corner.', tip: 'It is the opposite of right.' } },
});

/* A builder for word-based (grammar) lessons — no pictures: a few listen,
   arrange, and fill exercises. For units like questions, plurals, past tense. */
interface SentenceLessonSpec {
  id: string;
  title: string;
  reward?: number;
  listen?: { word: string; teach: Teach }[];
  arranges: { prompt?: string; tiles: string[]; answer: string[]; teach: Teach }[];
  fills: { before: string; after: string; answer: string; teach: Teach }[];
}
function sentenceLesson(spec: SentenceLessonSpec): Lesson {
  const exercises: Exercise[] = [];
  (spec.listen ?? []).forEach((l, i) => exercises.push({ kind: 'listen', id: `${spec.id}l${i + 1}`, word: l.word, teach: l.teach }));
  spec.arranges.forEach((a, i) => exercises.push({ kind: 'arrange', id: `${spec.id}a${i + 1}`, prompt: a.prompt ?? 'Put the words in order:', tiles: a.tiles, answer: a.answer, teach: a.teach }));
  spec.fills.forEach((f, i) => exercises.push({ kind: 'fill', id: `${spec.id}f${i + 1}`, before: f.before, after: f.after, answer: f.answer, teach: f.teach }));
  return { id: spec.id, title: spec.title, reward: spec.reward ?? 12, exercises };
}

/* ---- Section 4: Telling Stories ---- */
const doingWords = vocabLesson({
  id: 's4u1', title: 'Doing Words',
  words: [
    { id: 'walk', emoji: '🚶', teach: { meaning: 'To walk is to move on your feet, step by step.', inUse: 'I walk to school.', tip: 'Walking is slower than running.' } },
    { id: 'sing', emoji: '🎤', teach: { meaning: 'To sing is to make music with your voice.', inUse: 'I sing a happy song.', tip: 'You sing songs.' } },
    { id: 'draw', emoji: '🎨', teach: { meaning: 'To draw is to make a picture.', inUse: 'I draw a cat.', tip: 'You draw with pencils.' } },
    { id: 'cook', emoji: '🍳', teach: { meaning: 'To cook is to make food hot to eat.', inUse: 'I cook an egg.', tip: 'You cook in the kitchen.' } },
  ],
  arrange: { tiles: ['to', 'I', 'sing', 'like'], answer: ['I', 'like', 'to', 'sing'], teach: { meaning: 'A sentence about a thing you do.', inUse: 'I like to sing.', tip: 'Start with a capital letter.' } },
  fill: { before: 'I', after: ' a picture.', answer: 'draw', teach: { meaning: 'Finish the sentence.', inUse: 'I draw a picture.', tip: 'You do it with crayons.' } },
});
const askingQuestions = sentenceLesson({
  id: 's4u2', title: 'Asking Questions',
  listen: [
    { word: 'what', teach: { meaning: '"What" asks about a thing.', inUse: 'What is this?', tip: 'Use "what" to ask about things.' } },
    { word: 'where', teach: { meaning: '"Where" asks about a place.', inUse: 'Where is it?', tip: 'Use "where" to ask about places.' } },
  ],
  arranges: [
    { tiles: ['is', 'What', 'this'], answer: ['What', 'is', 'this'], teach: { meaning: 'A question about a thing.', inUse: 'What is this?', tip: 'Questions often start with "What".' } },
    { tiles: ['the', 'Where', 'cat', 'is'], answer: ['Where', 'is', 'the', 'cat'], teach: { meaning: 'A question about a place.', inUse: 'Where is the cat?', tip: '"Where" asks about a place.' } },
  ],
  fills: [
    { before: '', after: ' is your name?', answer: 'What', teach: { meaning: 'Ask someone their name.', inUse: 'What is your name?', tip: 'It asks about a thing — your name.' } },
    { before: '', after: ' are you going?', answer: 'Where', teach: { meaning: 'Ask about a place.', inUse: 'Where are you going?', tip: 'It asks about a place.' } },
  ],
});
const describing = vocabLesson({
  id: 's4u3', title: 'Describing Things',
  words: [
    { id: 'big', emoji: '🐘', teach: { meaning: 'Big means large in size.', inUse: 'An elephant is big.', tip: 'The opposite of big is small.' } },
    { id: 'small', emoji: '🐭', teach: { meaning: 'Small means little in size.', inUse: 'A mouse is small.', tip: 'The opposite of small is big.' } },
    { id: 'hot', emoji: '🔥', teach: { meaning: 'Hot means very warm.', inUse: 'The fire is hot.', tip: 'The opposite of hot is cold.' } },
    { id: 'cold', emoji: '🧊', teach: { meaning: 'Cold means not warm at all.', inUse: 'The ice is cold.', tip: 'The opposite of cold is hot.' } },
  ],
  arrange: { tiles: ['is', 'The', 'big', 'elephant'], answer: ['The', 'elephant', 'is', 'big'], teach: { meaning: 'A sentence that describes size.', inUse: 'The elephant is big.', tip: 'Start with a capital letter.' } },
  fill: { before: 'Ice is very', after: '.', answer: 'cold', teach: { meaning: 'Finish the sentence.', inUse: 'Ice is very cold.', tip: 'The opposite of hot.' } },
});
const moreThanOne = sentenceLesson({
  id: 's4u4', title: 'More Than One',
  listen: [
    { word: 'cats', teach: { meaning: '"Cats" means more than one cat.', inUse: 'Two cats play.', tip: 'Add "s" for more than one.' } },
    { word: 'dogs', teach: { meaning: '"Dogs" means more than one dog.', inUse: 'The dogs run.', tip: 'Add "s" for more than one.' } },
  ],
  arranges: [
    { tiles: ['two', 'I', 'cats', 'have'], answer: ['I', 'have', 'two', 'cats'], teach: { meaning: 'A sentence about more than one.', inUse: 'I have two cats.', tip: 'Many cats → "cats".' } },
    { tiles: ['red', 'Three', 'apples'], answer: ['Three', 'red', 'apples'], teach: { meaning: 'Counting more than one.', inUse: 'Three red apples.', tip: 'Add "s": apple → apples.' } },
  ],
  fills: [
    { before: 'One cat, two', after: '.', answer: 'cats', teach: { meaning: 'Make it more than one.', inUse: 'One cat, two cats.', tip: 'Add an "s".' } },
    { before: 'I see three', after: '.', answer: 'dogs', teach: { meaning: 'More than one dog.', inUse: 'I see three dogs.', tip: 'Add an "s": dog → dogs.' } },
  ],
});
const yesterday = sentenceLesson({
  id: 's4u5', title: 'Yesterday',
  listen: [
    { word: 'played', teach: { meaning: '"Played" means you played before, in the past.', inUse: 'I played yesterday.', tip: 'Add "ed" for the past.' } },
    { word: 'walked', teach: { meaning: '"Walked" means you walked in the past.', inUse: 'We walked home.', tip: 'Add "ed" for the past.' } },
  ],
  arranges: [
    { tiles: ['yesterday', 'I', 'played'], answer: ['I', 'played', 'yesterday'], teach: { meaning: 'Talk about the past.', inUse: 'I played yesterday.', tip: 'play → played.' } },
    { tiles: ['to', 'We', 'school', 'walked'], answer: ['We', 'walked', 'to', 'school'], teach: { meaning: 'Talk about the past.', inUse: 'We walked to school.', tip: 'walk → walked.' } },
  ],
  fills: [
    { before: 'Yesterday I', after: ' a game.', answer: 'played', teach: { meaning: 'Past tense of "play".', inUse: 'Yesterday I played a game.', tip: 'Add "ed".' } },
    { before: 'We', after: ' to the park.', answer: 'walked', teach: { meaning: 'Past tense of "walk".', inUse: 'We walked to the park.', tip: 'Add "ed".' } },
  ],
});
const talkingTogether = sentenceLesson({
  id: 's4u6', title: 'Talking Together',
  listen: [
    { word: 'please', teach: { meaning: '"Please" is a polite word when you ask.', inUse: 'Help me, please.', tip: 'Always ask with "please".' } },
    { word: 'sorry', teach: { meaning: '"Sorry" is what you say when you make a mistake.', inUse: 'I am sorry.', tip: 'Saying sorry is kind.' } },
  ],
  arranges: [
    { tiles: ['help', 'Can', 'me', 'you'], answer: ['Can', 'you', 'help', 'me'], teach: { meaning: 'A polite request for help.', inUse: 'Can you help me?', tip: 'Ask nicely.' } },
    { tiles: ['I', 'Yes', 'can'], answer: ['Yes', 'I', 'can'], teach: { meaning: 'A friendly answer.', inUse: 'Yes, I can.', tip: 'A kind way to agree.' } },
  ],
  fills: [
    { before: '', after: ' you very much.', answer: 'Thank', teach: { meaning: 'Show you are grateful.', inUse: 'Thank you very much.', tip: 'Say it when someone helps you.' } },
    { before: 'I am very', after: '.', answer: 'sorry', teach: { meaning: 'Say it after a mistake.', inUse: 'I am very sorry.', tip: 'A kind, caring word.' } },
  ],
});
const readingTime = vocabLesson({
  id: 's4u7', title: 'Reading Time',
  words: [
    { id: 'book', emoji: '📖', teach: { meaning: 'A book has pages and a story to read.', inUse: 'I open my book.', tip: 'Books are full of words.' } },
    { id: 'story', emoji: '📚', teach: { meaning: 'A story tells about people and things that happen.', inUse: 'I love this story.', tip: 'Stories can be real or pretend.' } },
    { id: 'page', emoji: '📄', teach: { meaning: 'A page is one sheet in a book.', inUse: 'Turn the page.', tip: 'A book has many pages.' } },
    { id: 'letter', emoji: '🔤', teach: { meaning: 'Letters make up the words we read.', inUse: 'A is a letter.', tip: 'There are 26 letters.' } },
  ],
  arrange: { tiles: ['a', 'I', 'story', 'read'], answer: ['I', 'read', 'a', 'story'], teach: { meaning: 'A sentence about reading.', inUse: 'I read a story.', tip: 'Start with a capital letter.' } },
  fill: { before: 'Please turn the', after: '.', answer: 'page', teach: { meaning: 'Finish the sentence.', inUse: 'Please turn the page.', tip: 'It is one sheet in a book.' } },
});
const storyTime = vocabLesson({
  id: 's4u8', title: 'Story Time',
  words: [
    { id: 'king', emoji: '🤴', teach: { meaning: 'A king rules a land in many stories.', inUse: 'The king is wise.', tip: 'A king wears a crown.' } },
    { id: 'dragon', emoji: '🐉', teach: { meaning: 'A dragon is a big pretend animal that breathes fire.', inUse: 'The dragon flew away.', tip: 'Dragons live in stories.' } },
    { id: 'castle', emoji: '🏰', teach: { meaning: 'A castle is a huge stone home for a king or queen.', inUse: 'They live in a castle.', tip: 'Castles have tall towers.' } },
    { id: 'crown', emoji: '👑', teach: { meaning: 'A crown is worn on the head by a king or queen.', inUse: 'The crown is gold.', tip: 'A crown shows who rules.' } },
  ],
  arrange: { tiles: ['a', 'in', 'castle', 'They', 'live'], answer: ['They', 'live', 'in', 'a', 'castle'], teach: { meaning: 'A sentence from a story.', inUse: 'They live in a castle.', tip: 'Start with a capital letter.' } },
  fill: { before: 'The king wears a gold', after: '.', answer: 'crown', teach: { meaning: 'Finish the sentence.', inUse: 'The king wears a gold crown.', tip: 'It sits on his head.' } },
});

/** Authored lessons, keyed by unit id. Units without an entry get a gentle review. */
export const lessons: Record<string, Lesson> = {
  s1u1: greetings,
  s1u2: aroundTheHome,
  s1u3: family,
  s1u4: colors,
  s1u5: numbers,
  s1u6: food,
  s1u7: animals,
  s2u1: clothes,
  s2u2: body,
  s2u3: weather,
  s2u4: daysTime,
  s2u5: atSchool,
  s2u6: toysPlay,
  s2u7: feelings,
  s2u8: actions,
  s3u1: park,
  s3u2: town,
  s3u3: gettingThere,
  s3u4: shopping,
  s3u5: peopleAtWork,
  s3u6: inNature,
  s3u7: directions,
  s4u1: doingWords,
  s4u2: askingQuestions,
  s4u3: describing,
  s4u4: moreThanOne,
  s4u5: yesterday,
  s4u6: talkingTogether,
  s4u7: readingTime,
  s4u8: storyTime,
};

/** Back-compat: the original single lesson export (Around the Home). */
export const lesson = aroundTheHome;

/** A gentle, always-playable review for units without authored content yet. */
function fallbackLesson(unitId: string): Lesson {
  const title =
    course.flatMap((s) => s.units).find((u) => u.id === unitId)?.title ?? 'Practice';
  return {
    id: unitId,
    title,
    reward: 8,
    exercises: [
      {
        kind: 'choice', id: 'p1', word: 'sprout', answerId: 'sprout',
        choices: [
          { id: 'sprout', label: 'sprout', emoji: '🌱' },
          { id: 'tree', label: 'tree', emoji: '🌳' },
          { id: 'flower', label: 'flower', emoji: '🌸' },
          { id: 'leaf', label: 'leaf', emoji: '🍃' },
        ],
        teach: { meaning: 'A sprout is a tiny new plant — just like your English!', inUse: 'A little sprout grew in the garden.', tip: 'Sprout starts with the “s” sound.' },
      },
      {
        kind: 'arrange', id: 'p2', prompt: 'Put the words in order:',
        tiles: ['grow', 'Let', 'us'], answer: ['Let', 'us', 'grow'],
        teach: { meaning: 'A cheerful way to say we will learn more.', inUse: 'Let us grow together.', tip: 'Start a sentence with a capital letter.' },
      },
      {
        kind: 'fill', id: 'p3', before: 'Practice helps me', after: '.', answer: 'grow',
        teach: { meaning: 'Finish the sentence with the missing word.', inUse: 'Practice helps me grow.', tip: 'It rhymes with “snow”.' },
      },
    ] as Exercise[],
  };
}

/** The lesson for a unit: authored content if we have it, else a gentle review. */
export function getLesson(unitId: string | null): Lesson {
  if (unitId && lessons[unitId]) return lessons[unitId];
  return fallbackLesson(unitId ?? 's1u2');
}

/* ---------------- Vocabulary ----------------
   Derived from the authored lessons so the Words hub always reflects real
   content (and grows automatically as more lessons are added). Only words
   that have a picture (choice options + match pairs) are included. */

export interface VocabWord {
  word: string;
  emoji: string;
}

export const vocabulary: VocabWord[] = (() => {
  const seen = new Map<string, string>(); // word (lowercased) → emoji
  for (const l of Object.values(lessons)) {
    for (const ex of l.exercises) {
      if (ex.kind === 'choice') {
        for (const c of ex.choices) {
          const key = c.label.toLowerCase();
          if (!seen.has(key)) seen.set(key, c.emoji);
        }
      } else if (ex.kind === 'match') {
        for (const p of ex.pairs) {
          const key = p.word.toLowerCase();
          if (!seen.has(key)) seen.set(key, p.emoji);
        }
      }
    }
  }
  return [...seen.entries()]
    .map(([word, emoji]) => ({ word, emoji }))
    .sort((a, b) => a.word.localeCompare(b.word));
})();

/* ---------------- Progress helpers ---------------- */

/** Every unit id, in learning order (section 1 → 5). */
const UNIT_ORDER = course.flatMap((s) => s.units.map((u) => u.id));

/** The next unit to play: the first one not yet completed. */
export function firstUnlockedUnit(completed: string[]): string | null {
  return UNIT_ORDER.find((id) => !completed.includes(id)) ?? null;
}

/** The course with live statuses derived from which units are completed. */
export function courseWithProgress(completed: string[]): Section[] {
  const currentId = firstUnlockedUnit(completed);
  const statusOf = (id: string): NodeStatus =>
    completed.includes(id) ? 'done' : id === currentId ? 'current' : 'locked';
  return course.map((s) => {
    const units = s.units.map((u) => ({ ...u, status: statusOf(u.id) }));
    const allDone = units.every((u) => u.status === 'done');
    const anyOpen = units.some((u) => u.status !== 'locked');
    return { ...s, status: allDone ? 'done' : anyOpen ? 'current' : 'locked', units };
  });
}

/** If completing `unitId` finished its whole section, return that section (else null).
    Drives the Golden Bloom milestone celebration. */
export function sectionCompletedByUnit(unitId: string, completed: string[]): Section | null {
  const section = course.find((s) => s.units.some((u) => u.id === unitId));
  if (!section) return null;
  return section.units.every((u) => completed.includes(u.id)) ? section : null;
}
