"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("csv_data");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data.length) {
    return (
      <div className="p-10 text-black dark:text-white">
        No dataset found. Please upload a CSV first.
      </div>
    );
  }

  // ---------------- METRICS ----------------

  const total = data.length;

  const successCount = data.filter(
    (d) => String(d.success).toLowerCase() === "true"
  ).length;

  const asr = (successCount / total) * 100;

  const flips = data.filter(
    (d) =>
      d.original_label &&
      d.final_label &&
      d.original_label !== d.final_label
  ).length;

  const flipRate = (flips / total) * 100;

  return (
    <div className="min-h-screen p-10 bg-zinc-50 dark:bg-black text-black dark:text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <Image
                  
                  src="/favicon.svg"
                  alt="App logo"
                  width={80}
                  height={80}
                  priority
                  onClick={() => router.push("/")}
                />
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800"
          >
            Upload New
          </button>

          <button
            onClick={() => router.push("/inspections")}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Go to Inspections
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="p-6 bg-white dark:bg-zinc-900 border rounded-xl">
          <h2 className="text-sm text-zinc-500">ASR</h2>
          <p className="text-2xl font-bold">{asr.toFixed(2)}%</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border rounded-xl">
          <h2 className="text-sm text-zinc-500">Label Flip Rate</h2>
          <p className="text-2xl font-bold">{flipRate.toFixed(2)}%</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border rounded-xl">
          <h2 className="text-sm text-zinc-500">Total Samples</h2>
          <p className="text-2xl font-bold">{total}</p>
        </div>

      </div>
    </div>
  );
}