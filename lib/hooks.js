"use client";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "./store";

export function useSettings() {
  const { state } = useStore();
  return state.settings;
}

export function useReady() {
  const { state } = useStore();
  return state.ready;
}

export function useQueue() {
  const { state } = useStore();
  return state.queue
    .filter((a) => a.status === "waiting" || a.status === "on-stage")
    .sort((a, b) => a.position - b.position);
}

export function useAllQueue() {
  const { state } = useStore();
  return state.queue;
}

export function useSongs() {
  const { state } = useStore();
  return state.songs;
}

export function useVoteCount() {
  const { state } = useStore();
  return state.votes.length;
}

export function useSongUsageCounts() {
  const { state } = useStore();
  return useMemo(() => {
    const counts = {};
    for (const a of state.queue) {
      if (a.status !== "cancelled") {
        counts[a.songId] = (counts[a.songId] || 0) + 1;
      }
    }
    return counts;
  }, [state.queue]);
}

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState(null);
  useEffect(() => {
    let id = localStorage.getItem("karaoke_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("karaoke_device_id", id);
    }
    setDeviceId(id);
  }, []);
  return deviceId;
}

export function useClientUrl(path = "") {
  const [url, setUrl] = useState("");
  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);
  return url;
}
