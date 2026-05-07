"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [data, setData] = useState<any[]>([]);

  const router = useRouter();

const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const parsed = results.data as any[];

      localStorage.setItem("csv_data", JSON.stringify(parsed));

      console.log("CSV Loaded:", parsed);

      router.push("/dashboard");
    },
  });
};

  return (
    <div style={{ padding: 20 }}>
      <h1>CSV Upload</h1>

      <input type="file" accept=".csv" onChange={handleUpload} />

      <div style={{ marginTop: 20 }}>
        <h2>Preview</h2>

        <pre style={{ background: "#111", padding: 10 }}>
          {JSON.stringify(data.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  );
}