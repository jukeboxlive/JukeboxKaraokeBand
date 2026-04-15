"use client";
import { useState, useEffect } from "react";
import { subscribeAllSongs } from "@/lib/firebase";
import { useStore } from "@/lib/store";

const GENRES = ["Pop", "Rock", "Jazz", "R&B", "Hip-Hop", "Elektronik", "Türkü", "Arabesk"];

const EMPTY_FORM = { title: "", artist: "", genre: "", lyrics: "" };

function SongForm({ form, setForm, onSave, onCancel, submitLabel, error }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-cyan-500/20 space-y-3">
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Şarkı adı *"
        className="input-field"
      />
      <input
        type="text"
        value={form.artist}
        onChange={(e) => setForm({ ...form, artist: e.target.value })}
        placeholder="Sanatçı *"
        className="input-field"
      />
      <select
        value={form.genre}
        onChange={(e) => setForm({ ...form, genre: e.target.value })}
        className="input-field"
      >
        <option value="">Tür seçin</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <textarea
        value={form.lyrics}
        onChange={(e) => setForm({ ...form, lyrics: e.target.value })}
        placeholder="Şarkı sözleri"
        rows={4}
        className="input-field resize-none"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">
          İptal
        </button>
        <button onClick={onSave} className="btn-cyan flex-1">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function SongManager() {
  const { actions } = useStore();
  const [songs, setSongs] = useState([]);
  const [addingNew, setAddingNew] = useState(false);
  const [editingSongId, setEditingSongId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = subscribeAllSongs((data) => setSongs(data));
    return () => unsub();
  }, []);

  const closeAllForms = () => {
    setAddingNew(false);
    setEditingSongId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const startAdd = () => {
    if (addingNew) {
      closeAllForms();
      return;
    }
    setEditingSongId(null);
    setForm(EMPTY_FORM);
    setError("");
    setAddingNew(true);
  };

  const startEdit = (song) => {
    setAddingNew(false);
    setForm({
      title: song.title || "",
      artist: song.artist || "",
      genre: song.genre || "",
      lyrics: song.lyrics || "",
    });
    setError("");
    setEditingSongId(song.id);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.artist.trim()) {
      setError("Şarkı adı ve sanatçı zorunlu.");
      return;
    }

    try {
      const data = {
        title: form.title.trim(),
        artist: form.artist.trim(),
        genre: form.genre.trim(),
        lyrics: form.lyrics.trim(),
      };

      if (editingSongId) {
        await actions.updateSong(editingSongId, data);
      } else {
        await actions.addSong(data);
      }
      closeAllForms();
    } catch {
      setError("Bir hata oluştu.");
    }
  };

  const handleToggleActive = async (song) => {
    await actions.updateSong(song.id, { isActive: !song.isActive });
  };

  const handleHardDelete = async (song) => {
    const ok = window.confirm(
      `"${song.title}" kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`,
    );
    if (!ok) return;
    await actions.deleteSongPermanent(song.id);
  };

  const activeSongs = songs.filter((s) => s.isActive !== false);
  const inactiveSongs = songs.filter((s) => s.isActive === false);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Şarkılar ({activeSongs.length})
        </h2>
        <button onClick={startAdd} className="btn-secondary">
          {addingNew ? "İptal" : "+ Şarkı Ekle"}
        </button>
      </div>

      {addingNew && (
        <div className="mb-4">
          <SongForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={closeAllForms}
            submitLabel="Ekle"
            error={error}
          />
        </div>
      )}

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {activeSongs.map((song) =>
          editingSongId === song.id ? (
            <SongForm
              key={song.id}
              form={form}
              setForm={setForm}
              onSave={handleSave}
              onCancel={closeAllForms}
              submitLabel="Güncelle"
              error={error}
            />
          ) : (
            <div
              key={song.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {song.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {song.artist}
                  {song.genre && ` · ${song.genre}`}
                </p>
              </div>
              <button
                onClick={() => startEdit(song)}
                className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleToggleActive(song)}
                className="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Kaldır
              </button>
              <button
                onClick={() => handleHardDelete(song)}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Sil
              </button>
            </div>
          ),
        )}
      </div>

      {inactiveSongs.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">
            Pasif şarkılar ({inactiveSongs.length})
          </p>
          <div className="space-y-1">
            {inactiveSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-2 rounded-lg opacity-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-sm truncate">
                    {song.title} – {song.artist}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleActive(song)}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Aktifleştir
                </button>
                <button
                  onClick={() => handleHardDelete(song)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
