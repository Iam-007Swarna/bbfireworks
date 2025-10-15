"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { verifyPasswordForCostEdit } from "./actions";

type Props = {
  onEditModeChange: (enabled: boolean) => void;
};

export default function CostEditButton({ onEditModeChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("password", password);

    try {
      const result = await verifyPasswordForCostEdit(formData);

      if (result.success) {
        setEditMode(true);
        onEditModeChange(true);
        setIsOpen(false);
        setPassword("");
      } else {
        setError(result.error || "Invalid password");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function handleDisableEdit() {
    setEditMode(false);
    onEditModeChange(false);
  }

  if (editMode) {
    return (
      <button
        onClick={handleDisableEdit}
        className="btn flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
      >
        <Unlock size={16} />
        Disable Cost Edit
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn flex items-center gap-2"
      >
        <Lock size={16} />
        Enable Cost Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Verify Password</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setPassword("");
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your password to enable cost editing
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your password"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setPassword("");
                    setError("");
                  }}
                  className="btn"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
