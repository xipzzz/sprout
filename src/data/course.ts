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

export type Exercise = ChoiceExercise | ArrangeExercise;

export const lesson = {
  id: 's1u2',
  title: 'Around the Home',
  reward: 12, // 🍃 leaves earned on completion
  exercises: [
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
  ] as Exercise[],
};
