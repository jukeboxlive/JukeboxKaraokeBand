"use client";
import { useState } from "react";
import { useAllQueue } from "@/lib/hooks";

const RANK_COLORS = ["text-brass-light", "text-cream-200", "text-[#cd7f32]"];

function scoreColor(score) {
  const n = parseFloat(score);
  if (!Number.isFinite(n)) return "#9aa";
  const hue = Math.max(0, Math.min(10, n)) * 12; // 0=kırmızı,10=yeşil
  return `hsl(${hue}, 65%, 55%)`;
}

export default function ScoreBoard() {
  const allQueue = useAllQueue();
  const [sortBy, setSortBy] = useState("score"); // "score" | "time"

  const performed = allQueue.filter(
    (a) => a.status === "performed" && Number.isFinite(parseFloat(a.score)),
  );

  const sorted = [...performed].sort((a, b) => {
    if (sortBy === "score") return parseFloat(b.score) - parseFloat(a.score);
    // zamana göre: en son sahne alan en üstte
    const ta = a.performedAt?.seconds || a.performedAt?.toMillis?.() / 1000 || 0;
    const tb = b.performedAt?.seconds || b.performedAt?.toMillis?.() / 1000 || 0;
    return tb - ta;
  });

  const avg =
    performed.length > 0
      ? (
          performed.reduce((s, a) => s + parseFloat(a.score), 0) /
          performed.length
        ).toFixed(1)
      : null;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="section-title">
          Puanlar{" "}
          <span className="text-brass-light ml-1">({performed.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {avg && (
            <span className="font-label text-cream-300 text-xs mr-1">
              Ort. <span className="text-cream">{avg}</span>
            </span>
          )}
          <div className="flex rounded-full overflow-hidden border border-cream-300/25">
            <button
              onClick={() => setSortBy("score")}
              className={`px-4 py-2 text-xs font-label tracking-widest transition-colors ${
                sortBy === "score"
                  ? "bg-brass/30 text-cream"
                  : "text-cream-300 hover:text-cream"
              }`}
            >
              Puana Göre
            </button>
            <button
              onClick={() => setSortBy("time")}
              className={`px-4 py-2 text-xs font-label tracking-widest transition-colors ${
                sortBy === "time"
                  ? "bg-brass/30 text-cream"
                  : "text-cream-300 hover:text-cream"
              }`}
            >
              Sıraya Göre
            </button>
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="empty-state py-8">Henüz puanlanan performans yok</p>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 touch-scroll">
          {sorted.map((a, i) => {
            const rankBadge =
              sortBy === "score" && i < 3 ? RANK_COLORS[i] : "text-cream-300";
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-cream/5 border border-cream-300/10"
              >
                <span
                  className={`font-display text-3xl w-10 shrink-0 text-center ${rankBadge}`}
                >
                  {sortBy === "score"
                    ? i < 3
                      ? ["🥇", "🥈", "🥉"][i]
                      : i + 1
                    : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-base font-semibold truncate">
                    {a.name} {a.surname || ""}
                  </p>
                  <p className="text-sm text-cream-300 italic truncate">
                    {a.songTitle}
                    {a.songArtist ? ` — ${a.songArtist}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-display text-3xl leading-none"
                    style={{ color: scoreColor(a.score) }}
                  >
                    {a.score}
                  </p>
                  <p className="font-label text-cream-300/70 text-[10px] tracking-widest mt-1">
                    {a.voteCount ?? 0} OY
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
