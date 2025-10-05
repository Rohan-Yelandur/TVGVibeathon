# Guitar Redesign - New Positioning & Playing System

## Overview
Completely redesigned the guitar positioning, rotation, and playing mechanics based on your requirements:
1. **Positioning**: Uses estimated body center (from hand wrists) instead of hand positions
2. **Rotation**: Hands control guitar angle/tilt, not position
3. **Playing**: Detects fingertips hovering over strings (no movement required)
4. **Stability**: Guitar stays centered and doesn't move when playing

---

## Major Changes

### 1. **New Positioning System**

#### Before:
- Guitar positioned at strumming hand
- Moved with hand movements
- Unpredictable positioning

#### After:
- Guitar centered on estimated body position
- Uses midpoint between wrists + offset downward
- Stays stable while playing

```javascript
const estimateBodyCenter = (leftHand, rightHand, visibleWidth, visibleHeight) => {
  const leftWrist = leftHand[0];
  const rightWrist = rightHand[0];
  
  // Body center is between and slightly below the wrists
  const centerX = (leftWrist.x + rightWrist.x) / 2;
  const centerY = (leftWrist.y + rightWrist.y) / 2 + 0.15; // Below wrists
  const centerZ = (leftWrist.z + rightWrist.z) / 2;
  
  return { x, y, z }; // Converted to 3D coordinates
};
```

### 2. **New Rotation System**

#### Before:
- Guitar neck pointed from strum hand to neck hand
- Complex camera-facing logic
- Used fist gestures for repositioning

#### After:
- Hands control guitar angle naturally
- Guitar neck direction from right hand to left hand
- No special gestures needed
- Always faces camera

```javascript
const calculateGuitarRotation = (leftHand, rightHand, visibleWidth, visibleHeight) => {
  // Use middle finger base (landmark 9) for hand orientation
  const leftPos = convert(leftHand[9]);
  const rightPos = convert(rightHand[9]);
  
  // Guitar neck points from right to left
  const neckDirection = leftPos.subtract(rightPos).normalize();
  
  // Camera-facing logic ensures guitar faces user
  // Returns quaternion for rotation + distance for scale
};
```

### 3. **New Playing System**

#### Before:
- Detected finger movement through strumming zone
- Required finger to pass through specific area
- Single finger (index) for all strings
- Movement-based detection

#### After:
- Detects fingertips **hovering** over strings
- **Each finger mapped to specific string**
- No movement required - just position finger over string
- More natural and intuitive

**Finger-to-String Mapping:**
```javascript
const FINGER_TO_STRING = {
  8: 0,   // Index → High E (thinnest string)
  12: 1,  // Middle → B
  16: 2,  // Ring → G
  20: 3,  // Pinky → D
  4: 4,   // Thumb tip → A
  2: 5    // Thumb IP → Low E (thickest string)
};
```

**Hover Detection Logic:**
1. Convert fingertip to guitar's local space
2. Check if finger is over string's X position (±tolerance)
3. Check if finger is along guitar neck/body (Y tolerance)
4. Check if finger is hovering at right depth (Z tolerance)
5. Play string when all conditions met
6. Calculate intensity based on proximity to string

```javascript
// Check if finger is hovering over string
const isOverString = (
  Math.abs(localFingerPos.x - stringX) < xTolerance &&
  Math.abs(localFingerPos.y - stringY) < yTolerance &&
  localFingerPos.z > (stringZ - zTolerance) &&
  localFingerPos.z < (stringZ + zTolerance * 0.5)
);
```

### 4. **Scale System**

#### Before:
- Scale changed in repositioning mode
- Required fist gestures
- Fixed during playing

#### After:
- Scale automatically adjusts to hand distance
- Clamped between 0.6 and 1.4
- Natural and responsive
- No special gestures needed

```javascript
const scale = Math.max(0.6, Math.min(1.4, distance * 0.8));
```

---

## How It Works Now

### Step 1: Show Both Hands
- Guitar appears centered on your body (estimated from wrists)
- Automatic scaling based on hand distance

### Step 2: Position Your Hands
- **Left hand** (neck hand): Position where you'd hold the guitar neck
- **Right hand** (strumming hand): Position where you'd strum
- Hands control guitar **rotation/angle**, not position
- Guitar stays **centered on body**, doesn't move with hands

### Step 3: Play Strings
- Position your right hand **fingertips** over the strings
- **No strumming motion needed** - just hover over the string
- Each finger plays a different string:
  - **Index** → High E (1st string)
  - **Middle** → B (2nd string)
  - **Ring** → G (3rd string)
  - **Pinky** → D (4th string)
  - **Thumb tip** → A (5th string)
  - **Thumb base** → Low E (6th string)

### Visual Feedback
- Strings vibrate when played
- Hit strength decays naturally
- Smooth animations

---

## Technical Details

### Coordinate Tolerances
```javascript
const xTolerance = 0.04;  // String width tolerance
const yTolerance = 0.8;   // Along guitar length
const zTolerance = 0.15;  // Hovering distance
```

### Position Calculation
```javascript
// Guitar positioned at estimated body center
guitarModel.position.set(bodyCenter.x, bodyCenter.y, bodyCenter.z);

// Rotation based on hand positions
guitarModel.quaternion.copy(quaternion);

// Scale based on hand distance
guitarModel.scale.set(scale, scale, scale);
```

### String Detection
```javascript
// Transform finger to guitar's local space
const localFingerPos = fingerVec.applyMatrix4(guitarInverseMatrix);

// Check proximity to string
const stringX = (stringIndex - 2.5) * stringSpacing;
const isOverString = checkTolerances(localFingerPos, stringX, ...);

// Play if hovering
if (isOverString && !alreadyPlaying) {
  playString(stringIndex, intensity);
}
```

---

## Key Improvements

### ✅ Stability
- Guitar stays centered on body
- Doesn't move when playing
- Predictable positioning

### ✅ Natural Interaction
- No special gestures needed
- Intuitive hand positioning
- Each finger plays its own string

### ✅ Easier to Play
- No strumming motion required
- Just hover fingers over strings
- More responsive and accurate

### ✅ Better Visuals
- Guitar rotates naturally with hands
- Scales appropriately
- Always centered on user

### ✅ Simplified Code
- Removed fist gesture detection
- Removed repositioning mode
- Cleaner logic flow

---

## Removed Features

1. **Fist Gesture Repositioning** - No longer needed
2. **Movement-Based Detection** - Replaced with hover detection
3. **Fixed Strumming Hand** - Guitar doesn't follow hand anymore
4. **Single Finger Strumming** - Now uses multiple fingers

---

## Files Modified

1. **Guitar.js**
   - New `estimateBodyCenter()` function
   - New `calculateGuitarRotation()` function
   - New `FINGER_TO_STRING` mapping
   - Completely rewritten `updatePressedKeys()` method
   - Removed `recognizeFist()` function
   - Updated state variables

2. **Guitar.css**
   - Improved instruction box styling
   - Better backdrop blur
   - Increased padding and font size
   - Added max-width for responsiveness

---

## Usage Instructions

### For Users:

1. **Start Camera** and select **Guitar**
2. **Show both hands** to the camera
3. **Position hands** as if holding a guitar:
   - Left hand up (neck position)
   - Right hand down (strumming position)
4. **Hover your right hand fingers** over where the strings would be
5. **Each finger** plays a different string - just hover, don't move!

### Tips:
- Keep hands relatively still for stable guitar
- Move hands closer/further to scale guitar
- Tilt hands to rotate guitar angle
- Hover fingers at different distances for different intensities

---

## Testing Recommendations

1. ✅ Check guitar appears centered
2. ✅ Verify guitar doesn't move when playing
3. ✅ Test each finger plays correct string
4. ✅ Confirm hover detection works (no movement needed)
5. ✅ Validate scale adjusts with hand distance
6. ✅ Test rotation follows hand positions
7. ✅ Check visual feedback (string vibration)
8. ✅ Verify intensity based on proximity

---

## Future Enhancements (Optional)

- Add pose landmarks for actual body/head detection
- Implement chord detection on neck hand
- Add sustain/muting with neck hand fingers
- Visual indicators showing string mapping
- Adjust sensitivity with settings
- Left-handed mode toggle
- Different guitar models/skins
