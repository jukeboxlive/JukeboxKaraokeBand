"use client";
import { useState, useEffect } from "react";

const AUTH_KEY = "karaoke_admin";

export default function AdminAuthGate({ children }) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "true") {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem(AUTH_KEY, "true");
        setAuthed(true);
      } else {
        setError("Yanlış şifre!");
      }
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    }
    setSubmitting(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-4">
          <h1 className="heading-primary neon-text-cyan text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Şifre"
            className="input-field"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={submitting}
            className="btn-cyan w-full"
          >
            {submitting ? "Kontrol..." : "Giriş"}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
