In TidalCycles, the `once` function is used to play a pattern only once, rather than repeating it every cycle. In Strudel, which is a JavaScript port of the TidalCycles pattern language, there is not a built-in function named exactly `once` in the core documentation or examples as of the current available documentation[2][4][8]. However, you can achieve similar behavior using Strudel's pattern manipulation functions.

**How to Mimic `once` in Strudel**

There are a few approaches you could take:

- **Conditional Modifiers:**  
  Strudel offers conditional modifiers like `when`, but these are typically used to apply functions or changes to patterns only when certain conditions are met, not to play a pattern exactly once[6].
- **Custom Pattern Construction:**  
  You could manually construct a pattern that plays once and then is silent. For example, you could concatenate your desired pattern with a silent pattern for subsequent cycles:
  ```javascript
  cat(pattern, silence)
  ```
  ...but this would play the pattern for one cycle and then silence for one cycle, repeating this sequence, not just once.
- **Using `firstOf` or `lastOf` with a Large Cycle Count:**  
  The `firstOf` and `lastOf` functions apply a function every n cycles, but do not directly play a pattern just once[6]. For example, `pattern.firstOf(1000, x => x)` would play the pattern once every 1000 cycles, which is not the same as "once ever."
- **Custom Function or Scheduler Logic:**  
  For true "play once" behavior, you would need to use custom JavaScript logic outside the pattern language, such as stopping the scheduler after the first cycle or using a stateful approach. This is not natively supported in the pattern DSL as of now, but you could implement it in your live coding environment.

**Summary Table**

| Feature                | TidalCycles `once` | Strudel Equivalent         |
|------------------------|--------------------|---------------------------|
| Play pattern once      | `once`             | Not natively available    |
| Play once every n      | —                  | `firstOf(n, f)`[6]        |
| Play once, then silent | —                  | Custom pattern needed     |

**Conclusion**

There is no direct equivalent to TidalCycles' `once` in Strudel at the moment. You would need to use custom logic or pattern manipulation to achieve a similar effect[6]. If you want to play a pattern only once in a live coding session, you could manually stop playback after the first cycle, or use a custom function to inject silence after the first occurrence.

[1] https://strudel.cc/learn/factories/
[2] https://strudel.cc/technical-manual/patterns/
[3] https://strudel.cc/technical-manual/repl/
[4] https://strudel.cc
[5] https://strudel.cc/blog/
[6] https://strudel.cc/learn/conditional-modifiers/
[7] https://strudel.cc/functions/value-modifiers/
[8] https://strudel.cc/learn/strudel-vs-tidal/
[9] https://strudel.cc/learn/time-modifiers/
[10] https://strudel.cc/learn/stepwise/
