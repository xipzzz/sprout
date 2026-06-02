/* ============================================================
   Sprout — Course data
   Lessons live here as plain data. To add a lesson, add an item
   to `nodes`. Screens read from this file; they don't hard-code
   content. (Later this can come from a server or a JSON file.)
   ============================================================ */

export type NodeStatus = 'done' | 'current' | 'locked';
export type NodeKind = 'lesson' | 'golden';

export interface PathNode {
  id: string;
  kind: NodeKind;
  status: NodeStatus;
  title: string;
}

export interface Unit {
  section: number;
  unit: number;
  title: string;
  nodes: PathNode[];
}

/** The HUD currencies — each has exactly ONE job. */
export const hud = {
  leaves: 34,  // 🍃 progress/streak — earned, never spent
  gems: 420,   // 💎 premium spend (shop)
  water: 5,    // 💧 energy/lives that gate lessons
};

/** The unit currently shown on the home path. */
export const currentUnit: Unit = {
  section: 1,
  unit: 1,
  title: 'Getting started',
  nodes: [
    { id: 'l1', kind: 'lesson', status: 'done',    title: 'First words' },
    { id: 'l2', kind: 'lesson', status: 'done',    title: 'Greetings' },
    { id: 'l3', kind: 'lesson', status: 'current', title: 'Around the home' },
    { id: 'l4', kind: 'lesson', status: 'locked',  title: 'Food & drink' },
    { id: 'l5', kind: 'lesson', status: 'locked',  title: 'Family' },
    { id: 'g1', kind: 'golden', status: 'locked',  title: 'Golden Bloom' },
  ],
};

/* ---- Lesson content (exercises as data) ----
   One target word per exercise, shown as a picture-choice. Add exercises by
   adding items here; the lesson screen reads from this. */

export interface Choice {
  id: string;
  label: string;   // shown under the picture
  emoji: string;   // the picture
}

export interface Exercise {
  id: string;
  word: string;    // the word being taught (Spanish here)
  choices: Choice[];
  answerId: string;
  teach: { meaning: string; inUse: string; why: string };
}

export const lesson = {
  id: 'l3',
  title: 'Around the home',
  reward: 12, // 🍃 leaves earned on completion
  exercises: [
    {
      id: 'e1',
      word: 'la puerta',
      answerId: 'door',
      choices: [
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'window', label: 'window', emoji: '🪟' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'chair', label: 'chair', emoji: '🪑' },
      ],
      teach: {
        meaning: 'la puerta = the door',
        inUse: 'Abre la puerta, por favor. — Open the door, please.',
        why: '“la” means “the” for feminine words like puerta.',
      },
    },
    {
      id: 'e2',
      word: 'la ventana',
      answerId: 'window',
      choices: [
        { id: 'window', label: 'window', emoji: '🪟' },
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'lamp', label: 'lamp', emoji: '💡' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
      ],
      teach: {
        meaning: 'la ventana = the window',
        inUse: 'Miro por la ventana. — I look out the window.',
        why: 'Spanish nouns have a gender; ventana is feminine.',
      },
    },
    {
      id: 'e3',
      word: 'la silla',
      answerId: 'chair',
      choices: [
        { id: 'chair', label: 'chair', emoji: '🪑' },
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'door', label: 'door', emoji: '🚪' },
        { id: 'window', label: 'window', emoji: '🪟' },
      ],
      teach: {
        meaning: 'la silla = the chair',
        inUse: 'Me siento en la silla. — I sit on the chair.',
        why: 'Use “la” for feminine nouns like silla.',
      },
    },
    {
      id: 'e4',
      word: 'la cama',
      answerId: 'bed',
      choices: [
        { id: 'bed', label: 'bed', emoji: '🛏️' },
        { id: 'chair', label: 'chair', emoji: '🪑' },
        { id: 'lamp', label: 'lamp', emoji: '💡' },
        { id: 'door', label: 'door', emoji: '🚪' },
      ],
      teach: {
        meaning: 'la cama = the bed',
        inUse: 'Voy a la cama. — I go to bed.',
        why: 'cama is feminine, so it takes “la”.',
      },
    },
  ] as Exercise[],
};
