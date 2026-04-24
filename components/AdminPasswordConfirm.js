"use client";
import { useEffect, useState } from "react";

/**
 * Kritik admin aksiyonları için ek şifre onayı modalı.
 * Ekranda: özel başlık + uyarı mesajı + şifre input + onay butonu.
 * Şifre /api/admin'e POST edilir; doğruysa onConfirm çağrılır.
 */
export default function AdminPasswordConfirm({
  visible,
  title = "Onay Gerekli",
  message,
  confirmLabel = "Onayla",
  tone = "danger", // danger | primary
  onConfirm,
  onClose,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPassword("");
    setError("");
    setSubmitting(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!password || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError("Yanlış şifre.");
        setSubmitting(false);
        return;
      }
      // şifre doğru — aksiyonu çalıştır
      await Promise.resolve(onConfirm?.());
      onClose?.();
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const confirmClass =
    tone === "primary" ? "btn-primary flex-1" : "btn-danger flex-1";

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div className="glass p-6 w-full max-w-sm space-y-4 rounded-2xl">
        <div>
          <h3 className="font-display text-xl uppercase text-cream leading-tight">
            {title}
          </h3>
          {message && (
            <p className="text-sm text-cream-300 mt-2 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Admin Şifresi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Şifre"
            className="input-field"
            autoFocus
            disabled={submitting}
          />
        </div>

        {error && (
          <p className="text-red-300 text-sm font-label tracking-widest">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary flex-1"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !password}
            className={confirmClass}
          >
            {submitting ? "Kontrol..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
