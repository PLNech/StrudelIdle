```markdown
# Strudel.cc Mini-Notation Documentation

This report summarizes the complete base documentation for Strudel's Mini-Notation as described at [https://strudel.cc/learn/mini-notation/](https://strudel.cc/learn/mini-notation/).

---

## Table of Contents

1. [Introduction](#introduction)
2. [Mini-Notation Format](#mini-notation-format)
3. [Sequences and Events](#sequences-and-events)
4. [Multiplication](#multiplication)
5. [Division](#division)
6. [Angle Brackets](#angle-brackets)
7. [Subdividing Time with Bracket Nesting](#subdividing-time-with-bracket-nesting)
8. [Rests](#rests)
9. [Parallel / Polyphony](#parallel--polyphony)
10. [Elongation](#elongation)
11. [Replication](#replication)
12. [Mini-Notation Review](#mini-notation-review)
13. [Euclidean Rhythms](#euclidean-rhythms)
14. [Mini-Notation Exercise](#mini-notation-exercise)

---

## Introduction

Strudel, like Tidal Cycles, uses a concise "Mini-Notation" language for writing rhythmic patterns with minimal text. This notation is designed for live coding and rapid musical experimentation.

---

## Mini-Notation Format

- **Multi-line patterns**: Enclose in backticks (\``).
- **Single-line patterns**: Use double quotes (`"`).
- **Literal strings**: Use single quotes (`'`) for non-mini-notation text.

**Example:**
```
note(`  `)
```

---

## Sequences and Events

- **Space-separated notes** are events within a cycle.
- All events are squashed into one cycle, so adding more events makes each shorter but does not change the total cycle duration.

**Example:**
```
note("c e g b")        // 4 notes per cycle
note("c d e f g a b")  // 7 notes per cycle
```

---

## Multiplication

- Use `*` to **speed up** a sequence by a factor.
- Accepts decimals.

**Example:**
```
note("[e5 b4 d5 c5]*2")     // Plays sequence twice per cycle
note("[e5 b4 d5 c5]*2.75")  // Plays sequence 2.75 times per cycle
```

---

## Division

- Use `/` to **slow down** a sequence, stretching it over multiple cycles.
- Accepts decimals.

**Example:**
```
note("[e5 b4 d5 c5]/2")     // Sequence over 2 cycles
note("[e5 b4 d5 c5]/2.75")  // Sequence over 2.75 cycles
```

---

## Angle Brackets

- Use `` to **set the sequence length** by the number of events.
- Similar to piano roll: adding notes increases total duration.

**Example:**
```
note("")            // Equivalent to [e5 b4 d5 c5]/4
note("*8")    // 8 notes per cycle
```

---

## Subdividing Time with Bracket Nesting

- Use `[ ]` to **nest sequences**, subdividing time within events.

**Example:**
```
note("e5 [b4 c5] d5 [c5 b4]")
```
- Nested events share the duration of a single parent event, allowing complex rhythms.

---

## Rests

- Use `~` for a **rest** (silence).

**Example:**
```
note("[b4 [~ c5] d5 e5]")
```

---

## Parallel / Polyphony

- Use `,` to **play multiple notes (chords) simultaneously**.

**Examples:**
```
note("[g3,b3,e4]")            // Chord
note("g3,b3,e4")              // Chord (alternative syntax)
note("*2") // Chord sequence
```

---

## Elongation

- Use `@` to **specify temporal weight** (length) of an event.

**Example:**
```
note("*2") // First chord lasts twice as long
```

---

## Replication

- Use `!` to **repeat an event** without speeding up the sequence.

**Example:**
```
note("*2") // First chord repeats twice
```

---

## Mini-Notation Review

**Combined Examples:**
```
note("*2")
note("*2")
note("*2")
note("*2")
note("*2")
note("*2")
note("*2")
```

---

## Euclidean Rhythms

- Use `()` after an event for **Euclidean rhythm**: `(beats,segments,offset)`
    - **beats**: Number of onsets
    - **segments**: Total steps
    - **offset**: (optional) Starting position

**Example:**
```
s("bd(3,8,0)")    // 3 beats in 8 steps, offset 0 (Pop Clave)
s("bd(2,8)")
s("bd(5,8)")
s("bd(7,8)")
s("bd(3,4)")
s("bd(3,13)")
s("bd(3,8,3), hh cp")
s("bd(3,8,5), hh cp")
note("e5(2,8) b4(3,8) d5(2,8) c5(3,8)").slow(2)
```

---

## Mini-Notation Exercise

Try combining all elements in a single pattern string. For example:

```
n("60")
```
Challenge yourself to create a pattern using every mini-notation feature!

---

## Next Steps

Explore how samples interact with mini-notation, and experiment with combining these elements for complex and expressive musical patterns.

---

**Reference:**  
Original documentation: [https://strudel.cc/learn/mini-notation/](https://strudel.cc/learn/mini-notation/)
```
*This report is a structured summary of the official Strudel.cc Mini-Notation documentation as of June 2025.*

[1] https://strudel.cc/learn/mini-notation/
