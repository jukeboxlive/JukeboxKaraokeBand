"use client";
import { useState, useEffect } from "react";
import {
  subscribeSongRequests,
  deleteSongRequest,
  addSong,
} from "@/lib/firebase";
import AdminAuthGate from "@/components/AdminAuthGate";
import Logo from "@/components/Logo";

const GENRES = ["Pop", "Rock", "Jazz", "R&B", "Hip-Hop", "Elektronik", "Türkü", "Arabesk"];

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "—";
  const d = new Date(timestamp.seconds * 1000);
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RequestsDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingSongFor, setAddingSongFor] = useState(null);
  const [songForm, setSongForm] = useState({ genre: "", lyrics: "" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const unsub = subscribeSongRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (req) => {
    if (!confirm(`"${req.title}" isteğini silmek istiyor musun?`)) return;
    try {
      await deleteSongRequest(req.id);
    } catch {
      showToast("Silme başarısız");
    }
  };

  const openAddSong = (req) => {
    setAddingSongFor(req);
    setSongForm({ genre: "", lyrics: "" });
  };

  const handleAddSong = async () => {
    if (!addingSongFor || busy) return;
    setBusy(true);
    try {
      await addSong({
        title: addingSongFor.title,
        artist: addingSongFor.artist,
        genre: songForm.genre,
        lyrics: songForm.lyrics,
      });
      await deleteSongRequest(addingSongFor.id);
      setAddingSongFor(null);
      showToast("Şarkı kütüphaneye eklendi");
    } catch {
      showToast("Ekleme başarısız");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Logo variant="square" size={56} />
            <div>
              <h1 className="heading-primary text-2xl">İstekler</h1>
              <p className="font-label text-cream-300 text-xs mt-1">
                Etkinlik Öncesi Gelen Şarkı İstekleri
              </p>
            </div>
          </div>
          <a href="/admin" className="btn-secondary">
            ← Admin Panel
          </a>
        </div>

        {toast && (
          <div className="rounded-full py-2 px-4 text-center border border-brass/40 bg-brass/10 text-brass-light font-label tracking-widest text-sm">
            {toast}
          </div>
        )}

        <div className="glass rounded-2xl p-6">
          <p className="font-label text-cream-300 text-sm mb-4">
            Toplam{" "}
            <span className="text-brass-light text-base ml-1">
              {requests.length}
            </span>
          </p>

          {loading ? (
            <p className="empty-state animate-pulse">Yükleniyor...</p>
          ) : requests.length === 0 ? (
            <p className="empty-state py-8">Henüz istek yok</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="paper-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="song-card__title">{req.title}</p>
                      <p className="song-card__artist">{req.artist}</p>
                    </div>
                    <span className="jukebox-meta whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </span>
                  </div>

                  {(req.requesterName || req.instagram) && (
                    <div className="text-sm text-cream-900">
                      {req.requesterName && (
                        <>
                          <span className="jukebox-meta">İsteyen</span>{" "}
                          <span className="font-semibold text-cream-900 ml-1">
                            {req.requesterName}
                          </span>
                        </>
                      )}
                      {req.instagram && (
                        <span className="text-jukebox-red-dark font-semibold ml-2">
                          @{req.instagram}
                        </span>
                      )}
                    </div>
                  )}

                  {req.note && (
                    <p className="text-sm text-cream-700 italic border-l-2 border-jukebox-red/50 pl-3 font-serif">
                      {req.note}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openAddSong(req)}
                      className="font-label tracking-widest text-xs bg-cream-900/80 text-cream hover:bg-cream-900 px-3 py-2 rounded-full transition-colors"
                    >
                      Şarkılara Ekle
                    </button>
                    <button
                      onClick={() => handleDelete(req)}
                      className="font-label tracking-widest text-xs bg-jukebox-red/90 text-cream hover:bg-jukebox-red px-3 py-2 rounded-full transition-colors"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {addingSongFor && (
        <div className="modal-overlay">
          <div className="glass p-6 w-full max-w-md space-y-4 rounded-2xl">
            <div>
              <h2 className="section-title">Şarkıyı Kütüphaneye Ekle</h2>
              <p className="font-display text-xl uppercase text-cream mt-2">
                {addingSongFor.title}
              </p>
              <p className="jukebox-artist text-cream-300">
                {addingSongFor.artist}
              </p>
            </div>

            <div>
              <label className="field-label">Tür</label>
              <select
                value={songForm.genre}
                onChange={(e) =>
                  setSongForm({ ...songForm, genre: e.target.value })
                }
                className="input-field"
              >
                <option value="">Tür seçin</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Şarkı Sözleri</label>
              <textarea
                value={songForm.lyrics}
                onChange={(e) =>
                  setSongForm({ ...songForm, lyrics: e.target.value })
                }
                rows={5}
                className="input-field resize-none"
                placeholder="Şarkı sözlerini buraya yapıştırın..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAddingSongFor(null)}
                className="btn-secondary flex-1"
              >
                İptal
              </button>
              <button
                onClick={handleAddSong}
                disabled={busy}
                className="btn-cream flex-1"
              >
                {busy ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  return (
    <AdminAuthGate>
      <RequestsDashboard />
    </AdminAuthGate>
  );
}
