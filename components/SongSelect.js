"use client";
import { useState, useMemo } from "react";
import { useSongs, useSongUsageCounts } from "@/lib/hooks";
import BrandHeader from "@/components/BrandHeader";

const MAX_SONG_USAGE = 2;

export default function SongSelect({ onSelect, myApplicant, onViewMyLyrics, disabled = false }) {
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
        <BrandHeader size={92} gap="gap-8" className="mb-3" priority />
        <div className="jukebox-strip py-1">
          <p className="font-label text-xs">
            {disabled ? "Sahne Şu An Kapalı · Listeye Göz At" : "Şarkını Seç · Sahneye Çık"}
          </p>
        </div>
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
            {myApplicant.songArtist}
          </p>
          <p className="jukebox-artist text-brass-light mt-1">
            Sözlerine dön →
          </p>
        </button>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Şarkı veya sanatçı ara..."
          className="input-field flex-1 min-w-0"
        />
        <a
          href="/istek"
          className="shrink-0 px-5 rounded-lg border text-cream font-label tracking-widest uppercase text-sm flex items-center justify-center whitespace-nowrap transition-colors"
          style={{
            background: "#376452",
            borderColor: "#2a4d3f",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#41745f")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#376452")}
          aria-label="Çalınmasını istediğin şarkıyı bildir"
        >
          İstek
        </a>
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

      <div className="space-y-2.5 max-h-[62vh] overflow-y-auto pr-1 touch-scroll">
        {songs.length === 0 ? (
          <p className="empty-state animate-pulse">Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">Şarkı bulunamadı</p>
        ) : (
          filtered.map((song, idx) => {
            const usage = songUsage[song.id] || 0;
            const isFull = usage >= MAX_SONG_USAGE;
            const cardDisabled = isFull || disabled;
            const number = String(idx + 1).padStart(3, "0");

            return (
              <button
                key={song.id}
                onClick={() => !cardDisabled && onSelect(song)}
                disabled={cardDisabled}
                className={`song-card pl-4 ${cardDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
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
