"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

export function ImageUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      // Success - refresh the page to show the new image
      router.refresh();

      // Reset the form
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <input type="hidden" name="productId" value={productId} />
        <input
          type="file"
          name="file"
          accept="image/*"
          className="input"
          required
          disabled={uploading}
        />
        <button
          type="submit"
          className="btn flex items-center gap-1.5"
          disabled={uploading}
        >
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
