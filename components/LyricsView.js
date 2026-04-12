"use client";

export default function LyricsView({ song, lyrics, onBack }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b border-dark-600 px-4 py-3 flex items-center">
        {onBack && (
          <button onClick={onBack} className="back-button mr-3">
            ←
          </button>
        )}
        <div className="flex-1 text-center">
          <p className="font-display font-bold neon-text-cyan">{song?.title}</p>
          <p className="text-xs text-gray-400">{song?.artist}</p>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <p className="text-white text-center text-lg leading-loose whitespace-pre-line max-w-lg">
          {lyrics}
        </p>
      </div>
      <div className="border-t border-dark-600 px-4 py-3 text-center">
        <p className="text-xs text-gray-500">
          Sıran geldiğinde sahneye davet edileceksin
        </p>
      </div>
    </div>
  );
}
