/** Run: npx tsx src/lib/lessonStars.test.ts */
import { starsForAccuracy } from './lessonStars';

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

assert(starsForAccuracy(1, 6) === 3, 'low accuracy still earns 3 stars');
assert(starsForAccuracy(4, 6) === 4, 'mid accuracy earns 4');
assert(starsForAccuracy(6, 6) === 5, 'perfect earns 5');
assert(starsForAccuracy(9, 10) === 5, '90% earns 5');

console.log('lesson star tests passed');
