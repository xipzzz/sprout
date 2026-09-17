# Pip Art Fixes - Implementation Summary

## Issue Report (from Xip feedback on live ?sot=1)

**Screenshot:** Red-box issue on Pip Lock B
1. **Left leaf looks broken/detached** — white cream gap between leaf and head
2. **Face is too flat/neutral** — needs to be happier

## Root Cause

PipPose.tsx was using Figma-exported `<path>` elements for leaves that didn't overlap the head circle, causing a visible white gap. The hypothesis was correct: Figma-exported leaf paths floated instead of overlapping the stem/head geometry.

## Solution

### 1. Leaf Attachment Fix
**Before:** Disconnected path elements like:
```xml
<path d="M20.274 16.0128C23.6001 11.2625..." fill="#6FBF5E"/>
```

**After:** Overlapping ellipses with junction seal:
```xml
<ellipse cx="23" cy="15" rx="10.5" ry="6" fill="#6FBF5E" transform="rotate(-35 28 16.8)"/>
<circle id="junction" cx="28" cy="16.8" r="2.4" fill="#3f7a2e"/>
```

The junction seal circle ensures leaves can never float away from the stem.

### 2. Happier Faces
**Correct pose (celebrate):**
- Deeper grin: `d="M20.65 36.75 q7.35 10.85 14.7 0"` (scaled from celebrate SVG)
- Circle eyes positioned lower: `cy="34.65"` (was ~35.2)
- Result: BIG joyful smile

**Neutral + Almost poses:**
- Bigger smiles with deeper quadratic curves
- Eyes changed to taller ellipses: `rx="1.8" ry="2.3"` (height > width)
- Result: More cheerful resting expressions

### 3. Celebrate Pip Integration
Used `pip-celebrate.svg` as the source of truth for Correct pose:
- Arms-up leaf positioning (rotate ±36° from center)
- Taller stem for celebration reach
- Exact grin path from celebrate version
- All geometry scaled from 80×80 to 56×56 viewBox (factor: 0.7)

## Geometry Comparison

| Element | Old (Figma export) | New (Celebrate-based) |
|---------|-------------------|----------------------|
| Leaves | Complex `<path>` | Simple `<ellipse>` with transforms |
| Stem | `<path>` rounded rect | `<rect rx="1.75">` |
| Junction | None (gap!) | `<circle r="2.24">` seal |
| Eyes (correct) | Ellipse `rx=2.1 ry=2.8` | Circle `r=1.89` |
| Smile (correct) | `d="M22.4 39.9C26.133 43.167..."` | `d="M20.65 36.75 q7.35 10.85 14.7 0"` |

## Colors (as specified)
- Light green: `#6FBF5E`
- Dark green: `#4D9E3F`
- Stem: `#3f7a2e`
- Face/eyes: `#2f3b24`

## Files Modified
- `src/components/PipPose.tsx` — all three poses (neutral, correct, almost)

## Verification
- ✅ `npm run build` passes
- ✅ Leaves attach properly (no white gap)
- ✅ Faces are happier across all poses
- ✅ Celebrate geometry integrated for Correct pose
- ✅ Lock B chrome unchanged
- ✅ Used in LessonScreenSoT (navigate to `?sot=1`)

## PR
[#86](https://github.com/xipzzz/sprout/pull/86) - Draft only, ready for review

## Visual Reference
Open `pip-poses-demo.html` in a browser to see all three poses side-by-side with detailed annotations.
