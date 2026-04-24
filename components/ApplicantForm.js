"use client";
import { useState, useEffect } from "react";
import { useDeviceId, useSettings } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import ConsentModal from "@/components/ConsentModal";
import {
  KVKK_TEXT,
  KVKK_TITLE,
  RIZA_TEXT,
  RIZA_TITLE,
} from "@/lib/consentTexts";

const MAX_NAME_LENGTH = 50;
const MAX_INSTAGRAM_LENGTH = 30;

// Client IP best-effort — consent kaydı için bilgi amaçlı.
async function fetchClientIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
    });
    if (!res.ok) return "unknown";
    const json = await res.json();
    return json?.ip || "unknown";
  } catch {
    return "unknown";
  }
}

export default function ApplicantForm({ song, onBack, onSubmitted }) {
  const deviceId = useDeviceId();
  const settings = useSettings();
  const { actions } = useStore();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    instagram: "",
    kvkk: false,
    acikRiza: false,
  });
  const [kvkkModal, setKvkkModal] = useState(false);
  const [rizaModal, setRizaModal] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (deviceId && settings?.currentStageId) {
      actions
        .checkCooldown(deviceId, settings.currentStageId)
        .then((result) => {
          setCooldown(result);
          setChecking(false);
        })
        .catch(() => setChecking(false));
    } else if (deviceId) {
      setChecking(false);
    }
  }, [deviceId, settings?.currentStageId, actions]);

  // KVKK iptal edilirse Açık Rıza da otomatik iptal olur.
  const toggleKvkk = (checked) => {
    setForm((f) => ({
      ...f,
      kvkk: checked,
      acikRiza: checked ? f.acikRiza : false,
    }));
  };

  const toggleRiza = (checked) => {
    if (!form.kvkk) return; // disabled guard
    setForm((f) => ({ ...f, acikRiza: checked }));
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const surname = form.surname.trim();
    const instagram = form.instagram.trim();

    if (!name || !surname) return setError("İsim ve soyisim zorunlu.");
    if (name.length > MAX_NAME_LENGTH || surname.length > MAX_NAME_LENGTH)
      return setError(
        `İsim/soyisim en fazla ${MAX_NAME_LENGTH} karakter olabilir.`,
      );
    if (instagram.length > MAX_INSTAGRAM_LENGTH)
      return setError(
        `Instagram kullanıcı adı en fazla ${MAX_INSTAGRAM_LENGTH} karakter olabilir.`,
      );
    if (!form.kvkk || !form.acikRiza) {
      return setError(
        "Sıraya girebilmek için KVKK Aydınlatma Metni ve Açık Rıza Beyanı'nı onaylamanız zorunludur.",
      );
    }
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const ip = await fetchClientIp();
      const ref = await actions.addApplicant({
        name,
        surname,
        instagram,
        songId: song.id,
        songTitle: song.title,
        songArtist: song.artist,
        stageId: settings.currentStageId,
        deviceId,
        consent: {
          kvkk: true,
          acikRiza: true,
          ip,
        },
      });
      onSubmitted(ref.id, song.lyrics || "Sözler henüz eklenmemiş.");
    } catch (err) {
      setError(err.message || "Bir hata oluştu. Tekrar deneyin.");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="page-container">
        <p className="empty-state animate-pulse">Kontrol ediliyor...</p>
      </div>
    );
  }

  if (cooldown && !cooldown.canApply) {
    return (
      <div className="page-container">
        <div className="paper-card p-6 text-center space-y-4">
          <p
            className="font-display text-2xl uppercase"
            style={{ color: "#14242e" }}
          >
            Biraz Bekle
          </p>
          <p className="jukebox-artist" style={{ color: "#14242e" }}>
            {cooldown.remainingMinutes} dakika sonra tekrar başvurabilirsin.
          </p>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{ color: "#14242e", borderColor: "#14242e" }}
          >
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

      <div className="paper-card p-4 mb-4">
        <p className="jukebox-meta">Seçilen Şarkı</p>
        <p className="song-card__title mt-1">{song?.title}</p>
        <p className="song-card__artist">{song?.artist}</p>
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="section-title">Bilgilerini Gir</h2>

        <div>
          <label className="field-label">İsim</label>
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
          <label className="field-label">Soyisim</label>
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
          <label className="field-label">Instagram (opsiyonel)</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-cream-300 text-sm pointer-events-none">
              @
            </span>
            <input
              type="text"
              value={form.instagram || ""}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="kullaniciadi"
              maxLength={MAX_INSTAGRAM_LENGTH}
              className="input-field has-icon w-full"
            />
          </div>
        </div>

        {/* ── KVKK onayı ── */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.kvkk}
            onChange={(e) => toggleKvkk(e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-jukebox-red shrink-0"
            style={{ accentColor: "#c4302a" }}
          />
          <span className="text-xs text-cream-300 leading-relaxed">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setKvkkModal(true);
              }}
              className="underline text-cream hover:text-brass-light"
            >
              KVKK Aydınlatma Metni
            </button>
            ’ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
          </span>
        </label>

        {/* ── Açık Rıza onayı (KVKK onaylanmadan pasif) ── */}
        <label
          className={`flex items-start gap-3 ${
            form.kvkk ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
        >
          <input
            type="checkbox"
            checked={form.acikRiza}
            disabled={!form.kvkk}
            onChange={(e) => toggleRiza(e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-jukebox-red shrink-0"
            style={{ accentColor: "#c4302a" }}
          />
          <span className="text-xs text-cream-300 leading-relaxed">
            <button
              type="button"
              disabled={!form.kvkk}
              onClick={(e) => {
                e.preventDefault();
                if (form.kvkk) setRizaModal(true);
              }}
              className={`underline ${
                form.kvkk
                  ? "text-cream hover:text-brass-light"
                  : "text-cream-300"
              }`}
            >
              Açık Rıza Beyanı
            </button>
            ’nı okudum; ses/görüntü kayıtlarımın alınmasına ve sosyal medyada
            yayınlanmasına açık rıza veriyorum.
          </span>
        </label>
      </div>

      {error && (
        <p className="text-red-300 text-sm text-center mt-3 font-label tracking-widest">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="btn-primary mt-4"
      >
        {submitting ? "Kaydediliyor..." : "Sıraya Gir!"}
      </button>

      <ConsentModal
        visible={kvkkModal}
        title={KVKK_TITLE}
        text={KVKK_TEXT}
        onClose={() => setKvkkModal(false)}
        onAccept={() => toggleKvkk(true)}
      />
      <ConsentModal
        visible={rizaModal}
        title={RIZA_TITLE}
        text={RIZA_TEXT}
        onClose={() => setRizaModal(false)}
        onAccept={() => toggleRiza(true)}
      />
    </div>
  );
}
