"use client";
import { useState, useMemo } from "react";
import { useSongs, useSongUsageCounts } from "@/lib/hooks";
import Logo from "@/components/Logo";

const MAX_SONG_USAGE = 2;

export default function SongSelect({ onSelect, myApplicant, onViewMyLyrics }) {
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
        <div className="flex justify-center mb-2">
          <Logo variant="circle" size={120} priority />
        </div>
        <div className="jukebox-strip py-1">
          <p className="font-label text-xs">Şarkını Seç · Sahneye Çık</p>
        </div>
        <p className="font-label text-cream-300/50 text-xs mt-2 tracking-widest">
          @jukeboxlive · @jukeboxliveband
        </p>
      </div>

      {myApplicant && onViewMyLyrics && (
        <button
          onClick={onViewMyLyrics}
          className="w-full mb-5 on-stage-card text-left"
        >
          <span className="on-stage-badge">Sıradasın</span>
          <p className="font-display text-xl uppercase mt-2 text-cream">
            {myApplicant.songTitle}
          </p>
          <p className="jukebox-artist text-cream-300">
            {myApplicant.songArtist} · Sözlerine dön →
          </p>
        </button>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Şarkı veya sanatçı ara..."
          className="input-field"
        />
      </div>

      {genres.length > 2 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-chip ${selectedGenre === genre ? "genre-chip--active" : ""}`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
        {songs.length === 0 ? (
          <p className="empty-state animate-pulse">Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Şarkı bulunamadı</p>
        ) : (
          filtered.map((song, idx) => {
            const usage = songUsage[song.id] || 0;
            const isFull = usage >= MAX_SONG_USAGE;
            const number = String(idx + 1).padStart(3, "0");

            return (
              <button
                key={song.id}
                onClick={() => !isFull && onSelect(song)}
                disabled={isFull}
                className={`song-card pl-4 ${isFull ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="jukebox-meta text-cream-700 pt-1 shrink-0">
                      {number}
                    </span>
                    <div className="min-w-0">
                      <p className="song-card__title truncate">{song.title}</p>
                      <p className="song-card__artist truncate">{song.artist}</p>
                      {song.genre && (
                        <p className="song-card__genre">{song.genre}</p>
                      )}
                    </div>
                  </div>
                  {isFull && (
                    <span className="song-card__badge song-card__badge--full">
                      Dolu
                    </span>
                  )}
                  {!isFull && usage > 0 && (
                    <span className="song-card__badge song-card__badge--count">
                      {usage}/{MAX_SONG_USAGE}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
