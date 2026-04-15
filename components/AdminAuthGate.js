"use client";
import { useState, useEffect } from "react";
import Logo from "@/components/Logo";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-cream-300 animate-pulse tracking-widest">
          Yükleniyor...
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 w-full max-w-sm space-y-5 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <Logo variant="circle" size={110} priority />
            <div className="jukebox-strip py-1 w-full text-center">
              <p className="font-label text-sm">Admin Girişi</p>
            </div>
          </div>
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
            <p className="text-red-300 text-sm text-center font-label tracking-widest">
              {error}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Kontrol..." : "Giriş"}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
