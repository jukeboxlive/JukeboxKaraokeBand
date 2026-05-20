"use client";
import { useSettings } from "@/lib/hooks";
import AdminAuthGate from "@/components/AdminAuthGate";

function TabletLyrics() {
  const settings = useSettings();
  const phase = settings?.phase || "idle";
  const onStage =
    phase === "performing" ||
    phase === "voting" ||
    phase === "showing-score";

  const name = settings?.currentApplicantName;
  const songTitle = settings?.currentSongTitle;
  const songArtist = settings?.currentSongArtist;
  const lyrics = (settings?.currentSongLyrics || "").trim();

  if (!onStage || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <p className="font-label tracking-widest text-cream-300 text-sm mb-3">
            Tablet · Şarkı Sözleri
          </p>
          <p className="font-display text-4xl text-cream uppercase">
            Sahne Boş
          </p>
          <p className="font-serif italic text-cream-300 text-lg mt-4">
            Sahneye biri alındığında sözler burada görünecek.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* sabit üst başlık */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-navy-900/85 border-b border-cream-300/15 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-baseline justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <p className="font-display text-2xl uppercase text-cream truncate">
              {name}
            </p>
            <p className="font-serif italic text-cream-300 text-lg truncate">
              {songTitle}
              {songArtist ? ` — ${songArtist}` : ""}
            </p>
          </div>
          <span className="badge badge--live shrink-0">● Sahnede</span>
        </div>
      </div>

      {/* sözler — kaydırılabilir, büyük tipografi */}
      <div className="flex-1 overflow-y-auto touch-scroll px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {lyrics ? (
            <pre
              className="font-serif text-cream whitespace-pre-wrap leading-relaxed text-center"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
                lineHeight: 1.55,
                fontFamily: "inherit",
              }}
            >
              {lyrics}
            </pre>
          ) : (
            <p className="font-serif italic text-cream-300 text-center text-2xl mt-12">
              Bu şarkı için sözler henüz eklenmemiş.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabletPage() {
  return (
    <AdminAuthGate>
      <TabletLyrics />
    </AdminAuthGate>
  );
}
