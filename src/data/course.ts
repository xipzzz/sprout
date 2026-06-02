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
