"use client";
import { useState } from "react";
import {
  useSettings,
  useReady,
  useAllQueue,
  useSongs,
  useDeviceId,
} from "@/lib/hooks";
import SongSelect from "@/components/SongSelect";
import ApplicantForm from "@/components/ApplicantForm";
import LyricsView from "@/components/LyricsView";
import VoteModal from "@/components/VoteModal";
import Logo from "@/components/Logo";

export default function JoinPage() {
  const settings = useSettings();
  const ready = useReady();
  const queue = useAllQueue();
  const songs = useSongs();
  const deviceId = useDeviceId();

  const [view, setView] = useState("select-song");
  const [selectedSong, setSelectedSong] = useState(null);
  const [cachedLyrics, setCachedLyrics] = useState("");

  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Detect this device's active (waiting/on-stage) applicant in the current stage
  const myApplicant =
    deviceId && queue.length
      ? queue.find(
          (a) =>
            a.deviceId === deviceId &&
            (a.status === "waiting" || a.status === "on-stage"),
        )
      : null;

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setView("form");
  };

  const handleFormSubmitted = (applicantId, lyrics) => {
    setCachedLyrics(lyrics);
    setView("lyrics");
  };

  const handleViewMyLyrics = () => {
    if (!myApplicant) return;
    const song = songs.find((s) => s.id === myApplicant.songId);
    setSelectedSong({
      id: myApplicant.songId,
      title: myApplicant.songTitle,
      artist: myApplicant.songArtist,
    });
    setCachedLyrics(song?.lyrics || "Sözler henüz eklenmemiş.");
    setView("lyrics");
  };

  const handleFabClick = () => {
    if (settings?.phase === "voting" && settings?.currentApplicantId) {
      setShowVoteModal(true);
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-cream-300 animate-pulse tracking-widest">
          Yükleniyor...
        </p>
      </div>
    );
  }

  if (!settings?.isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-sm">
          <div className="flex justify-center">
            <Logo variant="circle" size={180} priority />
          </div>
          <div className="jukebox-strip py-1">
            <p className="font-label text-sm">Sahne Şu An Kapalı</p>
          </div>
          <p className="jukebox-artist text-cream-300 mt-2">
            Etkinlik henüz başlamadı. Birazdan tekrar dene.
          </p>
          <a href="/istek" className="inline-block">
            <span className="btn-secondary">İstek Bırak →</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {view === "select-song" && (
        <SongSelect
          onSelect={handleSongSelect}
          myApplicant={myApplicant}
          onViewMyLyrics={handleViewMyLyrics}
        />
      )}

      {view === "form" && (
        <ApplicantForm
          song={selectedSong}
          onBack={() => setView("select-song")}
          onSubmitted={handleFormSubmitted}
        />
      )}

      {view === "lyrics" && (
        <LyricsView
          song={selectedSong}
          lyrics={cachedLyrics}
          onBack={() => setView("select-song")}
        />
      )}

      <button
        onClick={handleFabClick}
        aria-label="Oy ver"
        className={`fab ${
          settings?.phase === "voting"
            ? "fab--active animate-bounce"
            : "fab--inactive"
        }`}
      >
        <span>★</span>
      </button>

      {showToast && <div className="toast">Oylama Şu An Kapalı</div>}

      <VoteModal
        visible={showVoteModal}
        onClose={() => setShowVoteModal(false)}
      />
    </div>
  );
}
