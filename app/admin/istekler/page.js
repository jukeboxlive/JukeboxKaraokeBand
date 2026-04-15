"use client";
import { useState, useEffect } from "react";
import {
  subscribeSongRequests,
  deleteSongRequest,
  addSong,
} from "@/lib/firebase";
import AdminAuthGate from "@/components/AdminAuthGate";

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
    <div className="min-h-screen bg-dark-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="heading-primary neon-text-cyan">İstekler</h1>
            <p className="text-sm text-gray-400 mt-1">
              Etkinlik öncesi gelen şarkı istekleri
            </p>
          </div>
          <a href="/admin" className="btn-secondary">
            ← Admin Panel
          </a>
        </div>

        {toast && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-cyan-400 text-sm text-center">
            {toast}
          </div>
        )}

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-4">
            Toplam: <strong className="text-white">{requests.length}</strong>
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
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-white">
                        {req.title}
                      </p>
                      <p className="text-sm text-gray-400">{req.artist}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300">
                    <span className="text-gray-500">İsteyen:</span>{" "}
                    <span className="font-semibold text-white">
                      {req.requesterName}
                    </span>
                    {req.instagram && (
                      <span className="neon-text-magenta ml-2">
                        @{req.instagram}
                      </span>
                    )}
                  </div>

                  {req.note && (
                    <p className="text-sm text-gray-400 italic border-l-2 border-cyan-500/30 pl-3">
                      {req.note}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => openAddSong(req)}
                      className="text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Şarkılara Ekle
                    </button>
                    <button
                      onClick={() => handleDelete(req)}
                      className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
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
          <div className="glass rounded-2xl p-6 w-full max-w-md space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Şarkıyı Kütüphaneye Ekle
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {addingSongFor.title} — {addingSongFor.artist}
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
                className="btn-cyan flex-1"
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
