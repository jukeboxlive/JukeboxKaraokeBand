"use client";
import { useEffect } from "react";

/**
 * Metin-salt consent modal. title + text verilir, kullanıcı okuyup kapatır.
 * onAccept opsiyonel — "Okudum, onaylıyorum" butonu için callback.
 */
export default function ConsentModal({ visible, title, text, onClose, onAccept }) {
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleBackdrop}>
      <div
        className="glass rounded-3xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-cream-300/20">
          <h3 className="font-display text-xl uppercase text-cream leading-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="text-cream-300 hover:text-cream text-2xl leading-none shrink-0"
          >
            ×
          </button>
        </div>

        <div
          className="px-6 py-4 overflow-y-auto text-cream-300 text-sm leading-relaxed whitespace-pre-wrap"
          style={{ flex: 1 }}
        >
          {text}
        </div>

        <div className="px-6 py-4 border-t border-cream-300/20 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Kapat
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="btn-primary flex-1"
            >
              Okudum, Onaylıyorum
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
