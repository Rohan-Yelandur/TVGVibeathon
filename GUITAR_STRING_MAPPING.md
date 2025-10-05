# Guitar String Mapping Guide

## Finger-to-String Mapping

When using the virtual guitar, each finger of your **right hand (strumming hand)** controls a specific string:

```
┌─────────────────────────────────────────────────────┐
│                    GUITAR STRINGS                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  String 0 (High E) ←→ Index Finger (8)    🎸 ───    │
│  String 1 (B)      ←→ Middle Finger (12)  🎸 ───    │
│  String 2 (G)      ←→ Ring Finger (16)    🎸 ───    │
│  String 3 (D)      ←→ Pinky Finger (20)   🎸 ───    │
│  String 4 (A)      ←→ Thumb Tip (4)       🎸 ───    │
│  String 5 (Low E)  ←→ Thumb Base (2)      🎸 ───    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Hand Positions

### Left Hand (Neck Hand)
- Position where you'd hold the guitar neck
- Controls guitar **rotation/tilt**
- Landmark 9 (middle finger base) used for calculation

### Right Hand (Strumming Hand)
- Position where you'd strum
- Controls which strings are played
- Each fingertip hovers over its assigned string

## Playing Technique

### Traditional Guitar (Physical):
1. Fingers press frets on neck
2. Strumming hand moves across strings
3. Motion activates sound

### Virtual Guitar (Our System):
1. Left hand controls guitar angle
2. Right hand **hovers** fingers over strings
3. **No motion needed** - position activates sound

## Visual Guide

```
    LEFT HAND              GUITAR              RIGHT HAND
    (Neck)                (Centered)           (Strings)
       
       👆                    🎸                     👆
       │                     │                      │
       │                     │                      │
       └─── Controls ────────┼───── Plays ─────────┘
           Rotation          Body                Strings
           & Tilt          Position              Hover
```

## How to Play Each String

### High E (Thinnest - String 0)
- **Finger**: Index finger
- **Landmark**: 8
- **Position**: Hover index fingertip over top string area

### B (String 1)
- **Finger**: Middle finger
- **Landmark**: 12
- **Position**: Hover middle fingertip over second string

### G (String 2)
- **Finger**: Ring finger
- **Landmark**: 16
- **Position**: Hover ring fingertip over third string

### D (String 3)
- **Finger**: Pinky finger
- **Landmark**: 20
- **Position**: Hover pinky fingertip over fourth string

### A (String 4)
- **Finger**: Thumb tip
- **Landmark**: 4
- **Position**: Hover thumb tip over fifth string

### Low E (Thickest - String 5)
- **Finger**: Thumb base/IP joint
- **Landmark**: 2
- **Position**: Hover thumb base over bottom string

## Detection Zones

```
                    GUITAR BODY
    ┌─────────────────────────────────────┐
    │                                     │
    │  [Detection Zone]                   │
    │                                     │
    │  X: ±0.04 (string width)            │
    │  Y: ±0.8  (guitar length)           │
    │  Z: 0.15  (hover distance)          │
    │                                     │
    │  ─── String 0 (High E)              │
    │  ─── String 1 (B)                   │
    │  ─── String 2 (G)                   │
    │  ─── String 3 (D)                   │
    │  ─── String 4 (A)                   │
    │  ─── String 5 (Low E)               │
    │                                     │
    └─────────────────────────────────────┘
```

## Tips for Best Results

### ✅ DO:
- Keep hands steady for stable guitar
- Hover fingers about 2-4 inches from camera
- Spread fingers naturally
- Move hand closer/further to scale guitar
- Tilt hands to rotate guitar

### ❌ DON'T:
- Don't make strumming motions
- Don't move hands rapidly
- Don't hide fingers behind palm
- Don't position hands too close together

## Intensity Control

The **closer** your finger is to the virtual string, the **louder** the note:

```
Far from string    →  Soft/Quiet (intensity: 0.3)
│
│
│
Close to string    →  Loud/Strong (intensity: 1.0)
```

**Formula:**
```javascript
intensity = 1.0 - (distanceToString / maxDistance)
Clamped between: 0.3 (min) and 1.0 (max)
```

## Troubleshooting

### "Guitar doesn't appear"
- ✓ Show both hands to camera
- ✓ Make sure hands are clearly visible
- ✓ Check camera permissions

### "Strings don't play"
- ✓ Hover fingers over guitar body area
- ✓ Don't move hands too fast
- ✓ Try adjusting finger distance from camera

### "Wrong string plays"
- ✓ Check finger positioning
- ✓ Spread fingers more
- ✓ One finger at a time for testing

### "Guitar moves around"
- ✓ Keep hands relatively steady
- ✓ Guitar is centered on body, not hands
- ✓ Hand movements only affect rotation

## Standard Tuning Reference

```
String 0: E4 (329.63 Hz) - High E
String 1: B3 (246.94 Hz)
String 2: G3 (196.00 Hz)
String 3: D3 (146.83 Hz)
String 4: A2 (110.00 Hz)
String 5: E2 (82.41 Hz)  - Low E
```

## MediaPipe Hand Landmarks Reference

```
        8 (Index tip)
       /
      7
     /
    6
   /
  5 ─── 9 (Middle base)
       / \
      10  13
     /     \
    11      14
   /         \
  12 (Mid)    15
              /
            16 (Ring)
             \
              17
               \
               18
                \
                19
                 \
                20 (Pinky)

  4 (Thumb tip)
  |
  3
  |
  2 (Thumb IP)
  |
  1
  |
  0 (Wrist)
```

## Quick Start

1. **Open Camera** → Select **Guitar**
2. **Show both hands**
3. **Position** as if holding a guitar
4. **Hover fingers** over strings
5. **Play!** 🎸

---

*The guitar stays centered and stable - only your finger positions control the music!*
