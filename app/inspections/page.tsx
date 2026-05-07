"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import "./inspections.css";
import Image from "next/image";

type Sample = {
  original: string;
  adversarial: string;
};

const INVALID_LABELS = new Set([
  "Failed to initialize",
  "N/A",
  "NA",
  "",
  null,
  undefined,
]);

function isInvalidAdversarial(text: string) {
  const t = (text || "").trim().toLowerCase();
  return t === "n/a" || t === "na" || t === "failed to initialize" || t === "";
}

function splitWords(a: string, b: string) {
  const o = a.split(" ");
  const v = b.split(" ");
  const len = Math.max(o.length, v.length);

  return Array.from({ length: len }).map((_, i) => {
    const ow = o[i] ?? "";
    const vw = v[i] ?? "";

    const isWhitespace = ow.trim() === "" && vw.trim() === "";

    return {
      o: ow,
      a: vw,
      changed: !isWhitespace && ow !== vw,
      whitespace: isWhitespace,
    };
  });
}

export default function Inspections() {
  const router = useRouter();

  const [data, setData] = useState<Sample[]>([]);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [index, setIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showIndices, setShowIndices] = useState(true);

  const leftRefs = useRef<HTMLSpanElement[]>([]);
  const rightRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("csv_data");
    if (stored) setData(JSON.parse(stored));
  }, []);

  const batchSize = 10;

  const visible = useMemo(() => {
    if (!data.length) return [];
    if (mode === "single") return [data[index]];
    return data.slice(index, index + batchSize);
  }, [data, index, mode]);

  const perturbationStats = useMemo(() => {
    return data.map((s) => {
      const invalid = isInvalidAdversarial(s.adversarial);

      if (!s || invalid) {
        return {
          valid: false,
          changed: 0,
          total: 0,
          wpr: 0,
        };
      }

      const o = s.original.split(" ");
      const a = s.adversarial.split(" ");
      const len = Math.max(o.length, a.length);

      let changed = 0;

      for (let i = 0; i < len; i++) {
        const ow = (o[i] ?? "").trim();
        const aw = (a[i] ?? "").trim();

        if (ow !== aw && !(ow === "" && aw === "")) {
          changed++;
        }
      }

      const total = o.length || 1;

      return {
        valid: true,
        changed,
        total,
        wpr: (changed / total) * 100,
      };
    });
  }, [data]);

  const animateHover = (i: number, enter: boolean) => {
    const l = leftRefs.current[i];
    const r = rightRefs.current[i];

    [l, r].forEach((el) => {
      if (!el) return;

      gsap.to(el, {
        scale: enter ? 1.08 : 1,
        boxShadow: enter
          ? "0 0 10px rgba(59,130,246,0.35)"
          : "0 0 0px rgba(0,0,0,0)",
        duration: 0.15,
      });
    });
  };

  if (!data.length) {
    return <div className="p-10 text-white">No dataset loaded</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Image
                          
                          src="/favicon.svg"
                          alt="App logo"
                          width={80}
                          height={80}
                          priority
                          onClick={() => router.push("/")}
                        />
                        
        <h1 className="text-3xl font-bold">Inspections</h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg"
        >
          Back
        </button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 items-center mb-6">

        <button
          onClick={() => setMode("single")}
          className={`px-3 py-2 border rounded-lg ${
            mode === "single" ? "bg-black text-white" : ""
          }`}
        >
          Single
        </button>

        <button
          onClick={() => setMode("batch")}
          className={`px-3 py-2 border rounded-lg ${
            mode === "batch" ? "bg-black text-white" : ""
          }`}
        >
          Batch (10)
        </button>

        <button
          onClick={() => setShowIndices((v) => !v)}
          className={`px-3 py-2 border rounded-lg ${
            showIndices ? "bg-black text-white" : ""
          }`}
        >
          Word Index
        </button>

        <input
          type="number"
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="border px-3 py-2 rounded-lg w-24"
        />

        <button
          onClick={() =>
            setIndex((i) => Math.max(i - (mode === "batch" ? 10 : 1), 0))
          }
          className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
        >
          Prev
        </button>

        <button
          onClick={() =>
            setIndex((i) =>
              Math.min(i + (mode === "batch" ? 10 : 1), data.length - 1)
            )
          }
          className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
        >
          Next
        </button>

      </div>

      {/* VIEW */}
      <div className="flex flex-col gap-6">

        {visible.map((sample, si) => {
          if (!sample) return null;

          const invalidAdv = isInvalidAdversarial(sample.adversarial);
          const diff = splitWords(sample.original, sample.adversarial);
          const stats = perturbationStats[index + si];

          return (
            <div key={si} className="flex flex-col gap-3">

              {/* TWO CARDS */}
              <div className="flex gap-4">

                {/* ORIGINAL */}
                <div className="flex-1 p-4 border rounded-xl bg-white dark:bg-zinc-900">
                  <h2 className="font-semibold mb-2">
                    Sample #{index + si + 1}
                  </h2>

                  <div className="flex flex-wrap leading-7">
                    {diff.map((d, i) => (
                      <div key={i} className="flex flex-col items-center mr-1">
                        <span
                          ref={(el) => {
                            if (el) leftRefs.current[i] = el;
                          }}
                          onMouseEnter={() => animateHover(i, true)}
                          onMouseLeave={() => animateHover(i, false)}
                          onClick={() =>
                            setActiveIndex(activeIndex === i ? null : i)
                          }
                          className={`px-3 rounded cursor-pointer transition ${
                            d.whitespace
                              ? ""
                              : d.changed
                              ? "bg-green-300/40"
                              : ""
                          } ${
                            activeIndex === i
                              ? "border border-white shadow-[0_0_0_2px_rgba(34,197,94,0.6)]"
                              : ""
                          }`}
                        >
                          {d.o}
                        </span>

                        {showIndices && (
                          <span className="text-[10px] opacity-50">
                            {i}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADVERSARIAL */}
                <div className="flex-1 p-4 border rounded-xl bg-white dark:bg-zinc-900">
                  <h2 className="font-semibold mb-2">Adversarial</h2>

                  {invalidAdv ? (
                    <div className="flex items-center justify-center h-full min-h-[120px]">
                      <div className="text-center text-yellow-500 font-semibold">
                        ⚠ Adversarial sample unavailable
                        <div className="text-sm opacity-80">
                          Failed to initialize / N/A
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap leading-7">
                      {diff.map((d, i) => (
                        <div key={i} className="flex flex-col items-center mr-1">
                          <span
                            ref={(el) => {
                              if (el) rightRefs.current[i] = el;
                            }}
                            onMouseEnter={() => animateHover(i, true)}
                            onMouseLeave={() => animateHover(i, false)}
                            onClick={() =>
                              setActiveIndex(activeIndex === i ? null : i)
                            }
                            className={`px-3 rounded cursor-pointer transition ${
                              d.whitespace
                                ? ""
                                : d.changed
                                ? "bg-red-300/40 opacity-90"
                                : ""
                            } ${
                              activeIndex === i
                                ? "border border-white shadow-[0_0_0_2px_rgba(239,68,68,0.6)]"
                                : ""
                            }`}
                          >
                            {d.a}
                          </span>

                          {showIndices && (
                            <span className="text-[10px] opacity-50">
                              {i}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* PERTURBATION RATE */}
              {!invalidAdv && stats?.valid && (
                <div className="text-m opacity-90">
                  Perturbation Rate:{" "}
                  <span className="font-mono">
                    {stats.wpr.toFixed(2)}%
                  </span>{" "}
                  ({stats.changed}/{stats.total} words changed)
                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}