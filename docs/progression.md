# Strudel.cc Learning Guide - Didactic Game Progression

Based on the official Strudel documentation, here is the precise learning order as presented in the workshop:

## 1. Getting Started
- **Introduction to Strudel**: Live coding music environment in the browser
- **What is Strudel**: Port of TidalCycles pattern language to JavaScript
- **Code Fields**: Interactive coding environment with `ctrl+enter` to play, `ctrl+.` to stop

## 2. First Sounds

### Basic Sound Functions
- `sound("casio")` - Play basic sounds
- Available sounds: `insect`, `wind`, `jazz`, `metal`, `east`, `crow`, `casio`, `space`, `numbers`

### Sample Selection
- `sound("casio:1")` - Select different samples with `:number`
- `:0` is default (can be omitted)

### Drum Sounds
- `sound("bd hh sd oh")` - Basic drum kit sounds
- **Drum abbreviations**:
  - `bd` = bass drum
  - `sd` = snare drum  
  - `rim` = rimshot
  - `hh` = hihat
  - `oh` = open hihat
  - `lt/mt/ht` = low/middle/high tom
  - `rd` = ride cymbal
  - `cr` = crash cymbal

### Drum Machines
- `sound("bd hh sd oh").bank("RolandTR909")` - Change drum machine character
- Available banks: `AkaiLinn`, `RhythmAce`, `RolandTR808`, `RolandTR707`, `ViscoSpaceDrum`

### Mini-Notation Basics

#### Sequences
- `sound("bd hh sd hh")` - Space-separated sequences
- Longer sequences = faster playback (squished into cycle)

#### Tempo Control
- `<bd hh sd>` - Angle brackets: one per cycle
- `<bd hh sd>*8` - Multiply for speed
- `.cpm(90/4)` - Cycles per minute (tempo control)

#### Rests and Structure
- `sound("bd hh - rim")` - Use `-` or `~` for rests
- `sound("bd [hh hh] sd")` - Square brackets for sub-sequences
- `sound("bd hh*2 rim")` - `*` for multiplication/speed
- `sound("bd [[rim rim] hh]")` - Nested brackets allowed

#### Parallel Patterns
- `sound("hh hh, bd bd")` - Comma for parallel patterns
- `sound("bd*2, - cp, hh*4")` - Multiple parallel layers

#### Sample Number Selection
- `n("0 1 4 2").sound("jazz")` - Alternative to `:` notation

## 3. First Notes

### Note Notation
- `note("48 52 55 59").sound("piano")` - MIDI numbers
- `note("c e g b").sound("piano")` - Letter names
- `note("db eb gb ab bb").sound("piano")` - Flats with `b`
- `note("c# d# f#").sound("piano")` - Sharps with `#`
- `note("c2 e3 g4 b5").sound("piano")` - Octave numbers

### Sound Selection
- `note("36 43, 52 59").sound("piano")` - Combine with different sounds
- Available sounds: `gm_electric_guitar_muted`, `gm_acoustic_bass`, `gm_voice_oohs`, `sawtooth`, `square`, `triangle`

### Pattern Combinations
- `note("48 67").sound("piano gm_guitar")` - Switch between sounds
- `note("48 67").sound("piano, gm_guitar")` - Stack multiple sounds

### Longer Sequences
- `note("[36 34 41 39]/4").sound("bass")` - `/` to slow down (over 4 cycles)
- `note("<36 34 41 39>").sound("bass")` - Angle brackets for one per cycle
- `note("<[36 48]*4 [34 46]*4>")` - Complex combinations

### Scales System
- `n("0 2 4 6").scale("C:minor").sound("piano")` - Scale degrees (zero-indexed)
- **Scale types**: `C:major`, `A2:minor`, `D:dorian`, `G:mixolydian`, `A2:minor:pentatonic`, `F:major:pentatonic`
- `n("0 2 4").scale("<C:major D:mixolydian>/4")` - Pattern scales

### Timing Controls
- `note("c@3 eb").sound("bass")` - `@` for elongation (c is 3 units long)
- `note("c!2 eb").sound("piano")` - `!` for replication
- Shuffle: `n("<[4@2 4] [5@2 5]>").scale("C2:mixolydian")` - Triplet swing

### Parallel Playing
- `$: note("...").sound("bass")` - Use `$:` to play multiple patterns
- `_$: note("...")` - Use `_$:` to mute a pattern

## 4. First Effects

### Basic Audio Effects
- `note("c2 c3").sound("sawtooth").lpf(800)` - Low-pass filter (frequency cutoff)
- `note("c3 eb3").sound("sawtooth").vowel("<a e i o>")` - Vowel formants
- `sound("hh*16").gain("[.25 1]*4")` - Volume/dynamics control

### Envelope Shaping (ADSR)
- `.attack(.1)` - Fade in time
- `.decay(.1)` - Time to reach sustain level  
- `.sustain(.25)` - Sustain level after decay
- `.release(.2)` - Fade out time after note ends
- `.adsr(".1:.1:.5:.2")` - Shorthand notation

### Time-Based Effects
- `.delay(.5)` - Echo effect
- `.delay(".8:.125:.8")` - delay(volume:time:feedback)
- `.room(2)` - Reverb/room ambience

### Spatial Effects
- `.pan("0 0.3 .6 1")` - Stereo positioning (0=left, 1=right)

### Speed/Pitch Effects
- `.speed("<1 2 -1 -2>")` - Playback speed (negative = reverse)

### Pattern Speed
- `.fast(2)` / `.slow(2)` - Change pattern tempo
- `.fast("<1 [2 4]>")` - Pattern the speed changes

### Signal Modulation
- `sound("hh*16").gain(sine)` - Use waveforms for modulation
- **Waveforms**: `sine`, `saw`, `square`, `tri`, `rand`, `perlin`
- `.range(500, 2000)` - Set waveform range
- `.slow(4)` / `.fast(2)` - Control modulation speed
- `sound("hh*16").lpf(sine.range(100, 2000).slow(4))` - Slow filter sweep

## 5. Pattern Effects

### Unique Tidal Functions
- `.rev()` - Reverse pattern
- `.jux(rev)` - Split left/right, apply effect to right channel
- Multiple tempos: `.slow("0.5,1,1.5")` - Different speeds simultaneously

### Note Manipulation
- `.add("<0 1 -1>")` - Add numbers to notes/pitches
- `.add("0,7")` - Add multiple values (like harmony)
- Works with scales: `n("0 2 4").add("<0 [0,2,4]>").scale("C:minor")`

### Repetition Effects
- `.ply(2)` - Repeat each event n times
- `.ply("<1 2 1 3>")` - Pattern the repetition

### Echo/Offset Effects
- `.off(1/16, x=>x.add(4))` - Copy pattern, offset in time, modify
- Can nest: `.off(2/16, x=>x.speed(1.5).off(3/16, y=>y.vowel("a")))`

## 6. Tonal Functions & Harmony

### Chord Symbols
- `chord("<C^7 A7b13 Dm7 G7>")` - Jazz chord notation
- `chord("<C^9 C7b9 Fm9 Db^7>/2").dict('ireal').voicing()` - Chord voicings

### Voicing System
- `.voicing()` - Turn chord symbols into playable voicings
- **Parameters**:
  - `chord`: Note + chord symbol (C Am G7 Bb^7)
  - `dict`: Voicing dictionary ('ireal', default)
  - `anchor`: Reference note for alignment
  - `mode`: Alignment method (below, duck, above)
  - `offset`: Shift voicing up/down
  - `n`: Play voicing like scale

### Advanced Chord Progressions
```javascript
chord("<C^7 A7b13 Dm7 G7>*2")
.dict('ireal').layer(
  x=>x.struct("[~ x]*2").voicing(),      // Chord hits
  x=>n("0*4").set(x).mode("root:g2")     // Walking bass
   .voicing().s('sawtooth')
)
```

### Root Notes & Bass Lines
- `.rootNotes(2)` - Extract root notes from chords (octave 2)
- Combine with `.layer()` for backing tracks

## 7. Advanced Concepts

### Samples & Custom Sounds
- `samples('github:user/repo')` - Load samples from GitHub
- `samples({'name': 'url'})` - Load individual samples
- Local samples via browser import or local server

### MIDI & External Integration
- `.midi()` - Send to external MIDI devices
- `.osc()` - Send via OSC protocol
- Sync with DAWs and hardware

### Visual Feedback
- Automatic pattern visualization in REPL
- Piano roll, waveform, and scope displays
- Color coding with `.color("cyan")`

### Advanced Pattern Manipulation
- `.struct()` - Apply rhythmic structure
- `.mask()` - Pattern-based muting
- `.chunk()`, `.segment()` - Pattern subdivision
- `.layer()` - Combine multiple pattern transformations

## Summary of Learning Progression

1. **Sounds** → Basic sound playback and drum patterns
2. **Notes** → Pitch, scales, and melody
3. **Effects** → Audio processing and modulation  
4. **Pattern Effects** → Unique algorithmic transformations
5. **Harmony** → Chords, progressions, and voicings
6. **Advanced** → Custom samples, MIDI, and complex compositions

Each level builds upon the previous, following a logical progression from simple sound generation to complex musical compositions with algorithmic pattern manipulation.