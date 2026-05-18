"use client";

/**
 * SVG mouth diagram with 4 tappable quadrants for the patient brushing
 * mini-game. The diagram is drawn from a stylised top-down view: upper
 * teeth on top, lower teeth on the bottom. The four quadrants map to
 * dental conventions (UR/UL/LL/LR).
 *
 * Interaction model:
 *   - The parent tells us the `expectedOrder`.
 *   - Each tap is checked against `progress.length` — wrong order shakes
 *     the whole diagram red, correct lights the quadrant green with
 *     sparkles, and finishing all 4 triggers `onComplete(true)`.
 *   - Wrong taps DON'T reset; they're simply ignored after the shake so
 *     the player can keep trying without losing momentum.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/features/i18n/language-provider";

export type MouthQuadrant =
  | "top-right"
  | "top-left"
  | "bottom-left"
  | "bottom-right";

export type MouthDiagramProps = {
  expectedOrder: MouthQuadrant[];
  onComplete: (success: boolean) => void;
};

const QUADRANT_PATHS: Record<MouthQuadrant, string> = {
  // Each path is a rounded sector of the mouth oval — half-arcs joined
  // along the centerlines. Roughly the four corners of a 300x200 viewBox.
  "top-right":
    "M 150 100 L 290 100 A 140 90 0 0 0 150 10 Z",
  "top-left":
    "M 150 100 L 150 10 A 140 90 0 0 0 10 100 Z",
  "bottom-left":
    "M 150 100 L 10 100 A 140 90 0 0 0 150 190 Z",
  "bottom-right":
    "M 150 100 L 150 190 A 140 90 0 0 0 290 100 Z",
};

const QUADRANT_LABEL_POS: Record<MouthQuadrant, { x: number; y: number }> = {
  "top-right": { x: 215, y: 60 },
  "top-left": { x: 85, y: 60 },
  "bottom-left": { x: 85, y: 145 },
  "bottom-right": { x: 215, y: 145 },
};

export function MouthDiagram({ expectedOrder, onComplete }: MouthDiagramProps) {
  const t = useTranslation();
  const [progress, setProgress] = useState<MouthQuadrant[]>([]);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<"idle" | "wrong" | "done">("idle");
  const [sparks, setSparks] = useState<
    Array<{ id: number; q: MouthQuadrant; jitterX: number; jitterY: number }>
  >([]);
  const sparkIdRef = useRef(0);
  const completedRef = useRef(false);

  /**
   * Tap handler — branches on whether the quadrant matches the expected
   * next step. Wrong taps trigger a shake; correct taps push the quadrant
   * onto progress and spawn sparkles.
   */
  const handleTap = useCallback(
    (q: MouthQuadrant) => {
      if (completedRef.current) return;
      const expected = expectedOrder[progress.length];
      if (q !== expected) {
        setFeedback("wrong");
        setShake(true);
        window.setTimeout(() => setShake(false), 350);
        return;
      }
      if (progress.includes(q)) return;

      setFeedback("idle");
      setProgress((prev) => [...prev, q]);

      // Spawn 3 sparks per correct tap with pre-computed jitter so render
      // remains pure (no Math.random calls in render).
      const jitter = () => (Math.random() - 0.5) * 30;
      setSparks((prev) => [
        ...prev,
        { id: sparkIdRef.current++, q, jitterX: jitter(), jitterY: jitter() },
        { id: sparkIdRef.current++, q, jitterX: jitter(), jitterY: jitter() },
        { id: sparkIdRef.current++, q, jitterX: jitter(), jitterY: jitter() },
      ]);
    },
    [expectedOrder, progress.length],
  );

  // Auto-clear sparks after they finish their animation.
  useEffect(() => {
    if (sparks.length === 0) return;
    const id = window.setTimeout(() => setSparks([]), 750);
    return () => window.clearTimeout(id);
  }, [sparks]);

  // Notify the parent once all 4 quadrants are brushed in order.
  useEffect(() => {
    if (completedRef.current) return;
    if (progress.length !== expectedOrder.length) return;
    completedRef.current = true;
    setFeedback("done");
    // Tiny delay so the last quadrant's glow renders before the parent
    // potentially unmounts the diagram.
    const id = window.setTimeout(() => onComplete(true), 500);
    return () => window.clearTimeout(id);
  }, [progress, expectedOrder.length, onComplete]);

  const next = expectedOrder[progress.length];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative ${shake ? "denty-shake" : ""}`}
        aria-label="Mouth diagram with four quadrants"
      >
        <svg
          viewBox="0 0 300 200"
          className="h-auto w-full max-w-md"
          role="group"
        >
          {/* Soft background oval */}
          <ellipse
            cx="150"
            cy="100"
            rx="140"
            ry="90"
            fill="rgba(255,255,255,0.48)"
            stroke="rgba(10,22,40,0.12)"
            strokeWidth="1.5"
          />

          {(Object.keys(QUADRANT_PATHS) as MouthQuadrant[]).map((q) => {
            const isDone = progress.includes(q);
            const isNext = next === q;
            const isWrongTarget = feedback === "wrong" && isNext;
            return (
              <g key={q}>
                <path
                  d={QUADRANT_PATHS[q]}
                  fill={
                    isDone
                      ? "rgba(34,197,94,0.32)"
                      : isWrongTarget
                        ? "rgba(239,68,68,0.18)"
                        : "rgba(176,224,238,0.28)"
                  }
                  stroke={
                    isDone
                      ? "rgba(22,101,52,0.7)"
                      : isNext
                        ? "rgba(7,111,133,0.6)"
                        : "rgba(10,22,40,0.18)"
                  }
                  strokeWidth={isNext ? "2.5" : "1.4"}
                  className={`cursor-pointer transition-all duration-200 hover:brightness-105 ${
                    isDone ? "denty-quadrant-glow" : ""
                  }`}
                  onClick={() => handleTap(q)}
                />
                {/* Tooth dots */}
                {[0, 1, 2].map((i) => {
                  const center = QUADRANT_LABEL_POS[q];
                  const offsetX = (i - 1) * 22;
                  return (
                    <circle
                      key={i}
                      cx={center.x + offsetX}
                      cy={center.y}
                      r="6"
                      fill="white"
                      stroke="rgba(10,22,40,0.4)"
                      strokeWidth="1.2"
                      pointerEvents="none"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Sparkle overlays positioned over the freshly-tapped quadrant */}
        {sparks.map((spark) => {
          const pos = QUADRANT_LABEL_POS[spark.q];
          // Convert SVG coords (300x200 viewBox) to relative %
          const left = (pos.x / 300) * 100;
          const top = (pos.y / 200) * 100;
          return (
            <span
              key={spark.id}
              className="denty-spark"
              style={{
                left: `calc(${left}% + ${spark.jitterX}px)`,
                top: `calc(${top}% + ${spark.jitterY}px)`,
              }}
            />
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {expectedOrder.map((q, idx) => {
          const done = idx < progress.length;
          return (
            <span
              key={q}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                done
                  ? "bg-[rgba(34,197,94,0.85)] shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "bg-white/40"
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Live feedback line */}
      <p
        className={`text-sm font-medium transition-all min-h-6 ${
          feedback === "wrong"
            ? "text-rose-600"
            : feedback === "done"
              ? "text-emerald-600"
              : "text-[rgba(10,22,40,0.7)]"
        }`}
        aria-live="polite"
      >
        {feedback === "wrong"
          ? t("smile.brushing.retry")
          : feedback === "done"
            ? t("smile.brushing.success")
            : next
              ? `→ ${t(`smile.brushing.quadrant.${next}`)}`
              : ""}
      </p>
    </div>
  );
}
