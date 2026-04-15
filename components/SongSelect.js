"use client";
import { useState, useMemo } from "react";
import { useSongs, useSongUsageCounts } from "@/lib/hooks";

const MAX_SONG_USAGE = 2;

export default function SongSelect({ onSelect }) {
  const songs = useSongs();
  const songUsage = useSongUsageCounts();
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tümü");

  const genres = useMemo(() => {
    const set = new Set(songs.map((s) => s.genre).filter(Boolean));
    return ["Tümü", ...Array.from(set).sort()];
  }, [songs]);

  const filtered = useMemo(() => {
    let result = songs;

    if (selectedGenre !== "Tümü") {
      result = result.filter((s) => s.genre === selectedGenre);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [songs, search, selectedGenre]);

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

      {genres.length > 2 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGenre === genre
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        {songs.length === 0 ? (
          <p className="empty-state animate-pulse">Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Şarkı bulunamadı</p>
        ) : (
          filtered.map((song) => {
            const usage = songUsage[song.id] || 0;
            const isFull = usage >= MAX_SONG_USAGE;

            return (
              <button
                key={song.id}
                onClick={() => !isFull && onSelect(song)}
                disabled={isFull}
                className={`song-card ${isFull ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                  {isFull && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-lg shrink-0">
                      Dolu
                    </span>
                  )}
                  {!isFull && usage > 0 && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg shrink-0">
                      {usage}/{MAX_SONG_USAGE}
                    </span>
                  )}
                </div>
                {song.genre && (
                  <p className="text-xs text-gray-500 mt-1">{song.genre}</p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
