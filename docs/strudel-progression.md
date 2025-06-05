# Strudel Feature Progression Map for AlgoRave IDLE

Based on Strudel.cc documentation, this outlines the incremental progression of Strudel features in the game.

## Phase 1: First Sounds (Basic Audio)
**Unlocks: 0-100 Beats**

### Core Concepts
- `sound("bd")` - Basic drum sounds
- `sound("hh sd oh")` - Multi-sample sequences
- `sound("casio:1")` - Sample variation selection
- Basic sample banks: bd, hh, sd, oh, casio

### Game Progression
1. **Kick Drum** - `sound("bd")` (Already implemented)
2. **Hi-Hat** - `sound("hh")` 
3. **Snare** - `sound("sd")`
4. **Open Hat** - `sound("oh")`
5. **Sample Variations** - `sound("bd:1")`, `sound("bd:2")`

## Phase 2: Mini-Notation Basics (Pattern Building)
**Unlocks: 100-500 Beats**

### Rhythm Notation
- **Sequences**: `sound("bd hh sd hh")` - Space-separated patterns
- **Rests**: `sound("bd ~ sd ~")` - Silence between beats
- **Speed**: `sound("bd*2")` - Faster patterns
- **Slow**: `sound("bd/2")` - Slower patterns

### Game Progression
1. **Sequence Builder** - Combine multiple sounds
2. **Rest Notes** - Add silence with `~`
3. **Speed Multiplier** - Make patterns faster `*2`
4. **Slow Division** - Make patterns slower `/2`
5. **Complex Sequences** - `sound("bd hh*2 sd hh")`

## Phase 3: Advanced Notation (Nested Patterns)
**Unlocks: 500-1500 Beats**

### Brackets & Nesting
- **Sub-sequences**: `sound("bd [hh hh] sd hh")`
- **Nested brackets**: `sound("bd [hh [oh oh oh]] sd")`
- **Parallel play**: `sound("[bd,hh] [sd,oh]")`
- **Angle brackets**: `sound("<bd hh sd oh>")`

### Game Progression
1. **Sub-sequences** - `[ ]` bracket notation
2. **Nested Patterns** - `[[ ]]` double nesting
3. **Polyphony** - `,` parallel sounds
4. **Cycling Patterns** - `< >` angle notation
5. **Weight/Elongation** - `@` temporal weight

## Phase 4: Melodic Elements (Notes & Chords)
**Unlocks: 1500-3000 Beats**

### Note Systems
- **Basic notes**: `note("c e g")`
- **Octaves**: `note("c3 e4 g5")`
- **Scales**: `note("c d e f g a b")`
- **Chords**: `note("c e g")` played together

### Game Progression
1. **Note C** - Basic note playback
2. **Note Scale** - C major scale notes
3. **Octave Control** - c3, c4, c5 variations
4. **Chord Triads** - c e g combinations
5. **Scale Patterns** - Full scale sequences

## Phase 5: Sound Shaping (Effects & Modulation)
**Unlocks: 3000-6000 Beats**

### Effects & Filters
- **Reverb**: `.room(0.5)`
- **Delay**: `.delay(0.25)`
- **Filter**: `.lpf(800)` - Low pass filter
- **Gain**: `.gain(0.8)` - Volume control
- **Pan**: `.pan(0.3)` - Stereo positioning

### Game Progression
1. **Reverb Engine** - Add space with `.room()`
2. **Delay Unit** - Echo effects with `.delay()`
3. **Filter Bank** - Frequency shaping `.lpf()` `.hpf()`
4. **Gain Control** - Volume automation `.gain()`
5. **Stereo Panning** - Spatial effects `.pan()`

## Phase 6: Rhythm Complexity (Euclidean & Polyrhythms)
**Unlocks: 6000-10000 Beats**

### Advanced Rhythms
- **Euclidean**: `sound("bd(3,8)")` - Distribute 3 beats over 8 steps
- **Polyrhythms**: Different time signatures together
- **Polymeter**: Different pattern lengths
- **Offset rhythms**: `sound("bd(3,8,2)")` - Start offset

### Game Progression
1. **Euclidean Engine** - `(beats,steps)` notation
2. **Polyrhythm Generator** - Multiple time signatures
3. **Offset Patterns** - `(beats,steps,offset)` 
4. **Complex Meters** - 5/4, 7/8 time signatures
5. **Rhythm Morphing** - Gradual rhythm changes

## Phase 7: Synthesis & Samples (Sound Design)
**Unlocks: 10000-20000 Beats**

### Synthesis
- **Oscillators**: `s("sawtooth")`, `s("sine")`
- **Wavetables**: Advanced waveform synthesis
- **Sample chopping**: Slice and dice audio
- **Tape effects**: Warble and speed modulation

### Game Progression
1. **Oscillator Bank** - Basic waveforms
2. **Wavetable Synth** - Complex synthesis
3. **Sample Slicer** - Chop breaks and loops
4. **Tape Machine** - Analog-style effects
5. **Custom Synthesis** - Build your own sounds

## Phase 8: Live Coding (Advanced Techniques)
**Unlocks: 20000+ Beats**

### Master Techniques
- **Function chaining**: Complex effect chains
- **Pattern morphing**: Live pattern evolution
- **Conditional logic**: `when()` and `if()` patterns
- **Algorithmic composition**: Generative music
- **Performance mode**: Live coding interface

### Game Progression
1. **Function Chains** - Complex effect combinations
2. **Live Morphing** - Real-time pattern evolution
3. **Conditional Patterns** - Logic-based music
4. **AI Composer** - Algorithmic generation
5. **Performance Mode** - Full live coding unlock

## Integration Strategy

### Incremental Unlocks
- Each phase unlocks based on total beats earned
- Previous concepts remain available and combinable
- New concepts build upon previous knowledge
- Pattern complexity increases organically

### Visual Progression
- Pattern display shows current capabilities
- New notation elements highlight when unlocked
- Code becomes more sophisticated over time
- Player sees their musical vocabulary expanding

### Audio Progression
- Start with simple sounds
- Gradually add complexity
- Build toward full AlgoRave performances
- Player experiences authentic Strudel journey

This progression mirrors real Strudel learning while maintaining engaging game mechanics.