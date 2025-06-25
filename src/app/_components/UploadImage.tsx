"use client";

import { useState } from "react";

export default function UploadImage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    console.log("Parsed file:", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setImageUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err.message);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md max-w-sm mx-auto">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium">Image uploaded:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View Image
          </a>
          <img src={imageUrl} alt="Uploaded preview" className="mt-2 rounded shadow w-full h-auto" />
        </div>
      )}
    </div>
  );
}
