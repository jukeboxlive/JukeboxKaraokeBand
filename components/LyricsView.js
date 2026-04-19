"use client";

export default function LyricsView({ song, lyrics, onBack }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-cream-300/15 bg-[rgba(2,14,22,0.82)] backdrop-blur">
        {onBack && (
          <button onClick={onBack} className="back-button mr-1 mb-0">
            ←
          </button>
        )}
        <div className="flex-1 text-center">
          <p className="font-display uppercase text-cream text-xl leading-none">
            {song?.title}
          </p>
          <p className="jukebox-artist text-cream-300 text-sm">{song?.artist}</p>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div className="paper-card p-6 md:p-8 max-w-lg w-full">
          <p className="text-cream-900 text-lg leading-loose whitespace-pre-line font-serif text-center">
            {lyrics}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 text-center border-t border-cream-300/15 bg-[rgba(2,14,22,0.82)] backdrop-blur">
        <p className="font-label text-cream-300 text-xs">
          Sıran Geldiğinde Sahneye Davet Edileceksin
        </p>
      </div>
    </div>
  );
}
