"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, Scissors } from "lucide-react";

export function ImageUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [needsCompression, setNeedsCompression] = useState(false);

  const MAX_FILE_SIZE = 150 * 1024; // 150kb in bytes

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      if (file.size > MAX_FILE_SIZE) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        setNeedsCompression(true);
        setError(`Image size is ${fileSizeKB}kb. Click "Compress and Upload" to reduce size below 150kb.`);
      } else {
        setNeedsCompression(false);
      }
    }
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions to reduce file size
          const MAX_DIMENSION = 1200;
          if (width > height && width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Try different quality levels to get under 150kb
          let quality = 0.8;
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  if (blob.size <= MAX_FILE_SIZE || quality <= 0.3) {
                    // Success or hit minimum quality
                    const compressedFile = new File([blob], file.name, {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                  } else {
                    // Try with lower quality
                    quality -= 0.1;
                    tryCompress();
                  }
                } else {
                  reject(new Error("Compression failed"));
                }
              },
              "image/jpeg",
              quality
            );
          };

          tryCompress();
        };

        img.onerror = () => reject(new Error("Failed to load image"));
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      let file = formData.get("file") as File;

      if (!file || !selectedFile) {
        throw new Error("No file selected");
      }

      // Use the selected file
      file = selectedFile;

      // Check if file needs compression
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        setError(`Image size (${fileSizeKB}kb) exceeds 150kb. Please use "Compress and Upload" button.`);
        setUploading(false);
        return;
      }

      // Upload the file
      const uploadData = new FormData();
      uploadData.append("productId", productId);
      uploadData.append("file", file);

      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      // Success - refresh the page to show the new image
      router.refresh();

      // Reset the form
      form.reset();
      setSelectedFile(null);
      setNeedsCompression(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleCompressAndUpload() {
    if (!selectedFile) return;

    setError(null);
    setUploading(true);

    try {
      const compressedFile = await compressImage(selectedFile);
      const compressedSizeKB = (compressedFile.size / 1024).toFixed(2);

      if (compressedFile.size > MAX_FILE_SIZE) {
        setError(`Could not compress image below 150kb (got ${compressedSizeKB}kb). Try using a smaller image.`);
        setUploading(false);
        return;
      }

      // Upload the compressed file
      const uploadData = new FormData();
      uploadData.append("productId", productId);
      uploadData.append("file", compressedFile);

      const res = await fetch("/api/upload/product-image", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      // Success - refresh the page to show the new image
      router.refresh();

      // Reset state
      setSelectedFile(null);
      setNeedsCompression(false);

      // Reset the form
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2 items-start flex-wrap">
          <input type="hidden" name="productId" value={productId} />
          <input
            type="file"
            name="file"
            accept="image/*"
            className="input"
            required
            disabled={uploading}
            onChange={handleFileChange}
          />
          {!needsCompression ? (
            <button
              type="submit"
              className="btn flex items-center gap-1.5"
              disabled={uploading || !selectedFile}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompressAndUpload}
              className="btn flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700"
              disabled={uploading}
            >
              <Scissors size={16} />
              {uploading ? "Compressing..." : "Compress & Upload"}
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Maximum file size: 150kb. Images over 150kb can be automatically compressed.
        </p>
      </form>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
