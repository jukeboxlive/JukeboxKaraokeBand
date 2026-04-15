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
    currentStageId: null,
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
  const stageIdRef = useRef(null);

  useEffect(() => {
    fb.initSettings().catch(console.error);

    const unsubSettings = fb.subscribeSettings((settings) => {
      dispatch({ type: "SET_SETTINGS", payload: settings });
    });

    const unsubSongs = fb.subscribeSongs((songs) => {
      dispatch({ type: "SET_SONGS", payload: songs });
    });

    return () => {
      unsubSettings();
      unsubSongs();
    };
  }, []);

  // queue subscription depends on stageId
  useEffect(() => {
    const stageId = state.settings.currentStageId;
    stageIdRef.current = stageId;

    const unsub = fb.subscribeQueue(stageId, (queue) => {
      dispatch({ type: "SET_QUEUE", payload: queue });
    });

    return () => unsub();
  }, [state.settings.currentStageId]);

  // vote subscription depends on currentApplicantId
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
      const stageId = stageIdRef.current;
      await fb.showWinner(stageId);
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

    createStage: useCallback(async () => {
      return fb.createStage();
    }, []),

    endStage: useCallback(async () => {
      const stageId = stageIdRef.current;
      await fb.endStage(stageId);
    }, []),

    clearAll: useCallback(async () => {
      const stageId = stageIdRef.current;
      await fb.clearAll(stageId);
    }, []),

    checkCooldown: useCallback(async (deviceId, stageId) => {
      return fb.checkCooldown(deviceId, stageId);
    }, []),

    addSong: useCallback(async (data) => {
      return fb.addSong(data);
    }, []),

    updateSong: useCallback(async (id, data) => {
      return fb.updateSong(id, data);
    }, []),

    deleteSong: useCallback(async (id) => {
      return fb.deleteSong(id);
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
