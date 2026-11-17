import { useCallback, useState } from "react";
import { sfx } from "../../lib/sfx";

const N = 5;

function press(b: boolean[], i: number) {
  const n = b.slice();
  const r = Math.floor(i / N);
  const c = i % N;
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
    const rr = r + dr;
    const cc = c + dc;
    if (rr >= 0 && rr < N && cc >= 0 && cc < N) n[rr * N + cc] = !n[rr * N + cc];
  });
  return n;
}

function generate() {
  // scramble from the solved state so every board is guaranteed solvable
  let b: boolean[] = Array(N * N).fill(false);
  const count = 6 + Math.floor(Math.random() * 5);
  for (let k = 0; k < count; k++) b = press(b, Math.floor(Math.random() * N * N));
  return b.some(Boolean) ? b : press(b, 12);
}

export function Puzzle() {
  const [board, setBoard] = useState<boolean[]>(generate);
  const [moves, setMoves] = useState(0);
  const solved = !board.some(Boolean);

  const reset = useCallback(() => {
    setBoard(generate());
    setMoves(0);
    sfx.click();
  }, []);

  const tap = (i: number) => {
    if (solved) return;
    const nb = press(board, i);
    setBoard(nb);
    setMoves((m) => m + 1);
    if (!nb.some(Boolean)) sfx.win();
    else sfx.flip(nb[i]);
  };

  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
      <div className="well p-3 mx-auto" role="grid" aria-label="Circuit Mend puzzle, 5 by 5 grid of lights">
        <div className="grid grid-cols-5 gap-2">
          {board.map((on, i) => (
            <button
              key={i}
              role="gridcell"
              aria-label={`Row ${Math.floor(i / N) + 1}, column ${(i % N) + 1}, light ${on ? "on" : "off"}`}
              aria-pressed={on}
              onClick={() => tap(i)}
              className="w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-xl cursor-pointer transition-all duration-150 active:scale-95"
              style={{
                background: on ? "radial-gradient(circle at 35% 30%, #fffbe0, #ecd896 70%)" : "linear-gradient(160deg,#7d76a8,#5d5788)",
                boxShadow: on
                  ? "0 0 18px 4px rgba(236,216,150,.75), inset 0 -3px 6px rgba(184,130,40,.35), 0 3px 0 rgba(42,40,49,.3)"
                  : "inset 0 3px 8px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.4)",
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow">Circuit Mend</p>
        <h4 className="font-display text-3xl font-semibold leading-tight mt-1">Switch every light off.</h4>
        <p className="text-sm text-ink-soft mt-2 max-w-xs">Each press flips that light and its four neighbours. Order doesn't matter, only which cells you press. Plan it, don't spam it.</p>
        <div className="mt-4 flex items-center gap-3" aria-live="polite">
          <span className="chip" style={{ ["--chip" as string]: "var(--color-butter)" }}>
            Moves {moves}
          </span>
          {solved && <span className="chip" style={{ ["--chip" as string]: "var(--color-sage)" }}>Solved ✓</span>}
        </div>
        <button className="key key-lav mt-4" onClick={reset}>
          {solved ? "New puzzle" : "Shuffle new board"}
        </button>
      </div>
    </div>
  );
}
