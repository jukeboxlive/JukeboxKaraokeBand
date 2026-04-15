"use client";
import { useState } from "react";
import { addSongRequest } from "@/lib/firebase";

const LIMITS = {
  title: 100,
  artist: 100,
  name: 50,
  instagram: 30,
  note: 200,
};

export default function RequestPage() {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    requesterName: "",
    instagram: "",
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
    const requesterName = form.requesterName.trim();
    const instagram = form.instagram.trim();
    const note = form.note.trim();

    if (!title || !artist || !requesterName) {
      setError("Şarkı adı, sanatçı ve isim zorunlu.");
      return;
    }
    if (
      title.length > LIMITS.title ||
      artist.length > LIMITS.artist ||
      requesterName.length > LIMITS.name ||
      instagram.length > LIMITS.instagram ||
      note.length > LIMITS.note
    ) {
      setError("Karakter sınırını aştınız.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await addSongRequest({
        title,
        artist,
        requesterName,
        instagram,
        note,
      });
      setSubmitted(true);
    } catch {
      setError("Gönderim başarısız. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          <p className="text-5xl">🎉</p>
          <h1 className="font-display text-2xl font-bold text-white">
            Teşekkürler!
          </h1>
          <p className="text-gray-400">
            Şarkı isteğin kaydedildi. Etkinlikte söylemek istediğin şarkıyı
            listemize ekleyeceğiz.
          </p>
          <button
            onClick={() => {
              setForm({
                title: "",
                artist: "",
                requesterName: "",
                instagram: "",
                note: "",
              });
              setSubmitted(false);
              setSubmitting(false);
            }}
            className="btn-secondary"
          >
            Başka Bir İstek Gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="heading-primary neon-text-cyan">🎤 Karaoke Live</h1>
          <p className="text-gray-400 text-sm mt-2">
            Etkinlikte söylemek istediğin şarkıyı bize bildir. Listemize
            ekleyeceğiz, gelirsen söyleyebilirsin!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="field-label">Şarkı Adı *</label>
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
            <label className="field-label">Sanatçı *</label>
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
            <label className="field-label">İsmin *</label>
            <input
              type="text"
              value={form.requesterName}
              onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
              placeholder="Adın"
              maxLength={LIMITS.name}
              className="input-field"
            />
          </div>

          <div>
            <label className="field-label">Instagram</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-500 text-sm pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="kullaniciadi"
                maxLength={LIMITS.instagram}
                className="input-field has-icon w-full"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Not (opsiyonel)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Mesela neden bu şarkıyı istiyorsun?"
              maxLength={LIMITS.note}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
