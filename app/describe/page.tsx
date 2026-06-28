"use client";

import { useState } from "react";
import clsx from "clsx";
import { UploadCloud, Loader2 } from "lucide-react";

const AGE_GROUPS = [
  { value: "infant", label: "Infant" },
  { value: "toddler", label: "Toddler" },
  { value: "preschooler", label: "Preschooler" },
] as const;

export default function DescribeImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string>("infant");
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setDescription(null);
    setError(null);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image.");
      return;
    }

    setLoading(true);
    setError(null);
    setDescription(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("ageGroup", ageGroup);

      const res = await fetch("/api/describe-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setDescription(data.description);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-navy-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl bg-navy-900 border border-navy-700 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Picture Description</h1>
        <p className="text-slate-400 text-sm mb-8">
          Upload a photo, pick an age group, and get a description of what&apos;s happening.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Photo
            </label>
            <label
              className={clsx(
                "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-navy-700 rounded-xl py-8 cursor-pointer hover:border-accent/50 transition-colors overflow-hidden",
                previewUrl && "border-accent/50"
              )}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-slate-500" />
                  <span className="text-sm text-slate-500">
                    Click to choose an image
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Age group
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_GROUPS.map((group) => (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => setAgeGroup(group.value)}
                  className={clsx(
                    "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                    ageGroup === group.value
                      ? "bg-accent/10 text-accent border-accent/40"
                      : "border-navy-700 text-slate-400 hover:text-white hover:bg-navy-800"
                  )}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Describing..." : "Describe Picture"}
          </button>
        </form>

        {error && (
          <p className="mt-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {description && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-300 mb-2">Description</h2>
            <p className="text-slate-200 leading-relaxed bg-navy-800 border border-navy-700 rounded-xl px-4 py-4 whitespace-pre-wrap">
              {description}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
