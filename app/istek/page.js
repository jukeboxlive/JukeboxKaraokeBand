"use client";
import { useState } from "react";
import { addSongRequest } from "@/lib/firebase";
import BrandHeader from "@/components/BrandHeader";

const LIMITS = {
  title: 100,
  artist: 100,
  note: 200,
};

export default function RequestPage() {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const title = form.title.trim();
    const artist = form.artist.trim();
    const note = form.note.trim();

    if (!title || !artist) {
      setError("Şarkı adı ve sanatçı zorunlu.");
      return;
    }
    if (
      title.length > LIMITS.title ||
      artist.length > LIMITS.artist ||
      note.length > LIMITS.note
    ) {
      setError("Karakter sınırını aştınız.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await addSongRequest({ title, artist, note });
      setSubmitted(true);
    } catch {
      setError("Gönderim başarısız. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="paper-card p-8 w-full max-w-md text-center space-y-5">
          <BrandHeader size={82} gap="gap-6" className="justify-center" />
          <div className="divider-ornament">
            <span className="font-label text-xs">★ ★ ★</span>
          </div>
          <h1 className="font-display text-3xl uppercase leading-tight">
            İsteğin Alındı
          </h1>
          <p className="jukebox-artist text-base">
            Seçtiğin şarkıyı listemize ekleyeceğiz.
            <br />
            Etkinlikte sahneye çıkman için seni bekliyoruz.
          </p>
          <button
            onClick={() => {
              setForm({ title: "", artist: "", note: "" });
              setSubmitted(false);
              setSubmitting(false);
            }}
            className="btn-jukebox-red"
          >
            Başka İstek Gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <BrandHeader size={110} gap="gap-8" className="mb-4" priority />
          <div className="jukebox-strip mb-3">
            <p className="font-label text-cream-300 text-sm">
              Karaoke Band · Sıra Sende
            </p>
          </div>
          <p className="jukebox-artist text-cream-300 mt-2 max-w-xs mx-auto leading-relaxed">
            Söylemek istediğin şarkıyı bize bildir. Listeye alalım, etkinlikte
            sahneye çık.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-6 space-y-4 rounded-2xl">
          <div>
            <label className="field-label">Şarkı Adı</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn: Bohemian Rhapsody"
              maxLength={LIMITS.title}
              className="input-field"
            />
          </div>

          <div>
            <label className="field-label">Sanatçı</label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              placeholder="Örn: Queen"
              maxLength={LIMITS.artist}
              className="input-field"
            />
          </div>

          <div>
            <label className="field-label">Not (opsiyonel)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Eklemek istediğin bir şey?"
              maxLength={LIMITS.note}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center font-label tracking-widest">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
