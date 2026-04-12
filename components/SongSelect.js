"use client";
import { useState, useMemo } from "react";
import { useSongs } from "@/lib/hooks";

export default function SongSelect({ onSelect }) {
  const songs = useSongs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q),
    );
  }, [songs, search]);

  return (
    <div className="page-container">
      <div className="text-center mb-6">
        <h1 className="heading-primary neon-text-cyan">🎤 Karaoke Live</h1>
        <p className="text-gray-500 text-sm mt-1">Şarkını seç, sahneye çık!</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Şarkı veya sanatçı ara..."
          className="input-field"
        />
      </div>

      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        {songs.length === 0 ? (
          <p className="empty-state animate-pulse">Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Şarkı bulunamadı</p>
        ) : (
          filtered.map((song) => (
            <button
              key={song.id}
              onClick={() => onSelect(song)}
              className="song-card"
            >
              <p className="font-semibold text-white">{song.title}</p>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
