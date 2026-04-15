"use client";
import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";
import * as fb from "./firebase";

const INITIAL_STATE = {
  songs: [],
  queue: [],
  votes: [],
  settings: {
    isLive: false,
    phase: "idle",
    currentApplicantId: null,
    currentApplicantName: null,
    currentSongTitle: null,
    currentSongArtist: null,
    currentSongLyrics: null,
    currentScore: null,
  },
  ready: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SETTINGS":
      return { ...state, settings: action.payload, ready: true };
    case "SET_SONGS":
      return { ...state, songs: action.payload };
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    case "SET_VOTES":
      return { ...state, votes: action.payload };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const currentApplicantIdRef = useRef(null);

  useEffect(() => {
    fb.initSettings().catch(console.error);

    const unsubSettings = fb.subscribeSettings((settings) => {
      dispatch({ type: "SET_SETTINGS", payload: settings });
    });

    const unsubSongs = fb.subscribeSongs((songs) => {
      dispatch({ type: "SET_SONGS", payload: songs });
    });

    const unsubQueue = fb.subscribeQueue((queue) => {
      dispatch({ type: "SET_QUEUE", payload: queue });
    });

    return () => {
      unsubSettings();
      unsubSongs();
      unsubQueue();
    };
  }, []);

  useEffect(() => {
    const applicantId = state.settings.currentApplicantId;
    currentApplicantIdRef.current = applicantId;

    const unsub = fb.subscribeVotes(applicantId, (votes) => {
      dispatch({ type: "SET_VOTES", payload: votes });
    });

    return () => unsub();
  }, [state.settings.currentApplicantId]);

  const actions = {
    addApplicant: useCallback(async (data) => {
      const ref = await fb.addApplicant(data);
      return { id: ref.id };
    }, []),

    updateApplicantStatus: useCallback(async (id, status) => {
      await fb.updateApplicantStatus(id, status);
    }, []),

    reorderQueue: useCallback(async (orderedIds) => {
      await fb.reorderQueue(orderedIds);
    }, []),

    triggerStartSong: useCallback(async (applicant) => {
      await fb.triggerStartSong(applicant);
    }, []),

    triggerStartVoting: useCallback(async () => {
      await fb.triggerStartVoting();
    }, []),

    triggerEndVoting: useCallback(async () => {
      const applicantId = currentApplicantIdRef.current;
      if (applicantId) await fb.triggerEndVoting(applicantId);
    }, []),

    triggerResetToIdle: useCallback(async () => {
      await fb.triggerResetToIdle();
    }, []),

    showWinner: useCallback(async () => {
      await fb.showWinner();
    }, []),

    submitVote: useCallback(async (applicantId, deviceId, score) => {
      await fb.submitVote(applicantId, deviceId, score);
    }, []),

    hasVoted: useCallback(async (applicantId, deviceId) => {
      return fb.hasVoted(applicantId, deviceId);
    }, []),

    updateSettings: useCallback(async (data) => {
      await fb.updateSettings(data);
    }, []),

    clearAll: useCallback(async () => {
      await fb.clearAll();
    }, []),
  };

  return (
    <StoreContext.Provider value={{ state, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
