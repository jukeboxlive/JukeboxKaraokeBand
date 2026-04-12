"use client";
import { useState, useEffect } from "react";
import { useDeviceId } from "@/lib/hooks";
import { useStore } from "@/lib/store";

const MAX_NAME_LENGTH = 50;
const MAX_INSTAGRAM_LENGTH = 30;

export default function ApplicantForm({ song, onBack, onSubmitted }) {
  const deviceId = useDeviceId();
  const { actions } = useStore();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    instagram: "",
    kvkk: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Cihaz bazlı duplicate başvuru kontrolü
  useEffect(() => {
    if (deviceId) {
      const applied = localStorage.getItem("karaoke_applied");
      if (applied === "true") setAlreadyApplied(true);
    }
  }, [deviceId]);

  const handleSubmit = async () => {
    const name = form.name.trim();
    const surname = form.surname.trim();
    const instagram = form.instagram.trim();

    if (!name || !surname) return setError("İsim ve soyisim zorunlu.");
    if (name.length > MAX_NAME_LENGTH || surname.length > MAX_NAME_LENGTH)
      return setError(`İsim/soyisim en fazla ${MAX_NAME_LENGTH} karakter olabilir.`);
    if (instagram.length > MAX_INSTAGRAM_LENGTH)
      return setError(`Instagram kullanıcı adı en fazla ${MAX_INSTAGRAM_LENGTH} karakter olabilir.`);
    if (!form.kvkk) return setError("KVKK onayı zorunlu.");
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const ref = await actions.addApplicant({
        name,
        surname,
        instagram,
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        deviceId,
      });
      localStorage.setItem("karaoke_applied", "true");
      onSubmitted(ref.id, song.lyrics || "Sözler henüz eklenmemiş.");
    } catch (err) {
      setError("Bir hata oluştu. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  if (alreadyApplied) {
    return (
      <div className="page-container">
        <div className="glass rounded-2xl p-6 text-center space-y-4">
          <p className="font-display text-xl font-bold text-white">Zaten Sıradasınız</p>
          <p className="text-gray-400 text-sm">Bu cihazdan daha önce başvuru yapılmış.</p>
          <button onClick={onBack} className="btn-secondary">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">
        ← Şarkı Seçimine Dön
      </button>

      <div className="glass rounded-2xl p-4 mb-4">
        <p className="text-sm text-gray-400">Seçilen şarkı</p>
        <p className="font-display font-bold neon-text-cyan">{song?.title}</p>
        <p className="text-sm text-gray-400">{song?.artist}</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Bilgilerini Gir
        </h2>

        <div>
          <label className="field-label">İsim *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Adınız"
            maxLength={MAX_NAME_LENGTH}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">Soyisim *</label>
          <input
            type="text"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
            placeholder="Soyadınız"
            maxLength={MAX_NAME_LENGTH}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">Instagram</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              @
            </span>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="kullaniciadi"
              maxLength={MAX_INSTAGRAM_LENGTH}
              className="input-field pl-9"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.kvkk}
            onChange={(e) => setForm({ ...form, kvkk: e.target.checked })}
            className="mt-1 w-5 h-5 rounded accent-cyan-400"
          />
          <span className="text-xs text-gray-400 leading-relaxed">
            KVKK Aydınlatma Metni'ni okudum ve kişisel verilerimin işlenmesini
            kabul ediyorum.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mt-3">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-primary mt-4"
      >
        {submitting ? "Kaydediliyor..." : "Sıraya Gir!"}
      </button>
    </div>
  );
}
