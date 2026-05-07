"use client";

import Image from "next/image";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data as any[];

        // store dataset globally for dashboard
        if (typeof window !== "undefined") {
          localStorage.setItem("csv_data", JSON.stringify(parsed));
        }

        console.log("CSV Loaded:", parsed);

        // navigate to dashboard
        router.push("/dashboard");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-6">

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-10">
        <Image
          
          src="/favicon.svg"
          alt="App logo"
          width={120}
          height={30}
          priority
        />

        <h1 className="text-3xl font-semibold text-black dark:text-white">
          Welcome to Attack Insights
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
          Upload your CSV file to start analysis.
        </p>
      </div>

      {/* Upload Box */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">

        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Upload CSV File
        </label>

        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-black file:text-white hover:file:bg-zinc-800"
        />

      </div>
    </div>
  );
}