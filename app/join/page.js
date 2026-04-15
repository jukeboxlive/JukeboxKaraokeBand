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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  if (!settings?.isLive) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="font-display text-4xl font-bold neon-text-cyan">KARAOKE LIVE</p>
          <p className="text-gray-400 text-lg">Etkinlik henüz başlamadı</p>
          <p className="text-gray-600 text-sm">Birazdan tekrar dene</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 relative">
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
        ⭐
      </button>

      {showToast && (
        <div className="toast">Oylama şu an aktif değil</div>
      )}

      <VoteModal
        visible={showVoteModal}
        onClose={() => setShowVoteModal(false)}
      />
    </div>
  );
}
