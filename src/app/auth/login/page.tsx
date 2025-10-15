"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setErr("");

    // Validation
    if (!email.trim()) {
      setErr("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setErr("Please enter a valid email");
      return;
    }

    if (!password) {
      setErr("Password is required");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErr("Invalid email or password");
      } else if (res?.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setErr("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form className="w-full max-w-sm space-y-3" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Login</h1>

        {err && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {err}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input w-full"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input w-full"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="btn w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}