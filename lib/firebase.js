"use client";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const settingsRef = doc(db, "settings", "event");

// settings
export async function initSettings() {
  const snap = await getDoc(settingsRef);
  if (!snap.exists()) {
    await setDoc(settingsRef, {
      isLive: false,
      phase: "idle",
      currentApplicantId: null,
      currentApplicantName: null,
      currentSongTitle: null,
      currentSongArtist: null,
      currentSongLyrics: null,
      currentScore: null,
    });
  }
}

export function subscribeSettings(callback) {
  return onSnapshot(settingsRef, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export async function updateSettings(data) {
  return updateDoc(settingsRef, data);
}

// songs
export function subscribeSongs(callback) {
  const q = query(
    collection(db, "songs"),
    where("isActive", "==", true),
    orderBy("title"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addSong(data) {
  return addDoc(collection(db, "songs"), {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
  });
}

// applicants (queue)
export function subscribeQueue(callback) {
  const q = query(collection(db, "applicants"), orderBy("position"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addApplicant(data) {
  return runTransaction(db, async (transaction) => {
    const q = query(
      collection(db, "applicants"),
      where("status", "in", ["waiting", "on-stage"]),
    );
    const snap = await getDocs(q);
    const newRef = doc(collection(db, "applicants"));
    transaction.set(newRef, {
      ...data,
      status: "waiting",
      position: snap.size + 1,
      createdAt: serverTimestamp(),
    });
    return newRef;
  });
}

export async function updateApplicantStatus(id, status) {
  return updateDoc(doc(db, "applicants", id), { status });
}

// votes
export function subscribeVotes(applicantId, callback) {
  if (!applicantId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, "votes"),
    where("applicantId", "==", applicantId),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function submitVote(applicantId, deviceId, score) {
  const intScore = Math.round(score);
  if (intScore < 1 || intScore > 10) {
    throw new Error("Puan 1-10 arasında olmalıdır.");
  }

  return runTransaction(db, async (transaction) => {
    const q = query(
      collection(db, "votes"),
      where("applicantId", "==", applicantId),
      where("deviceId", "==", deviceId),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error("Bu performans için zaten oy kullandınız.");
    }

    const newRef = doc(collection(db, "votes"));
    transaction.set(newRef, {
      applicantId,
      deviceId,
      score: intScore,
      createdAt: serverTimestamp(),
    });
    return newRef;
  });
}

export async function hasVoted(applicantId, deviceId) {
  const q = query(
    collection(db, "votes"),
    where("applicantId", "==", applicantId),
    where("deviceId", "==", deviceId),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// admin triggers
export async function triggerStartSong(applicant) {
  const batch = writeBatch(db);
  batch.update(doc(db, "applicants", applicant.id), { status: "on-stage" });

  const songSnap = await getDoc(doc(db, "songs", applicant.songId));
  const lyrics = songSnap.exists() ? songSnap.data().lyrics || "" : "";

  batch.update(settingsRef, {
    phase: "performing",
    currentApplicantId: applicant.id,
    currentApplicantName: applicant.name,
    currentSongTitle: applicant.songTitle,
    currentSongArtist: applicant.songArtist,
    currentSongLyrics: lyrics,
    currentScore: null,
  });

  return batch.commit();
}

export async function triggerStartVoting() {
  return updateSettings({ phase: "voting" });
}

export async function triggerEndVoting(applicantId) {
  const q = query(
    collection(db, "votes"),
    where("applicantId", "==", applicantId),
  );
  const snap = await getDocs(q);
  const scores = snap.docs.map((d) => d.data().score);
  const avg =
    scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

  const batch = writeBatch(db);
  batch.update(doc(db, "applicants", applicantId), { status: "performed" });
  batch.update(settingsRef, {
    phase: "showing-score",
    currentScore: parseFloat(avg),
  });
  return batch.commit();
}

export async function triggerResetToIdle() {
  return updateSettings({
    phase: "idle",
    currentApplicantId: null,
    currentApplicantName: null,
    currentSongTitle: null,
    currentSongArtist: null,
    currentSongLyrics: null,
    currentScore: null,
  });
}

export async function showWinner() {
  const [applicantsSnap, allVotesSnap] = await Promise.all([
    getDocs(query(collection(db, "applicants"), where("status", "==", "performed"))),
    getDocs(collection(db, "votes")),
  ]);

  if (applicantsSnap.empty) return;

  const votesByApplicant = {};
  allVotesSnap.docs.forEach((d) => {
    const v = d.data();
    if (!votesByApplicant[v.applicantId]) votesByApplicant[v.applicantId] = [];
    votesByApplicant[v.applicantId].push(v.score);
  });

  let bestApplicant = null;
  let bestScore = -1;

  for (const applicantDoc of applicantsSnap.docs) {
    const applicant = { id: applicantDoc.id, ...applicantDoc.data() };
    const scores = votesByApplicant[applicant.id] || [];
    if (scores.length === 0) continue;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestScore) {
      bestScore = avg;
      bestApplicant = applicant;
    }
  }

  if (!bestApplicant) return;

  return updateSettings({
    phase: "showing-winner",
    currentApplicantId: bestApplicant.id,
    currentApplicantName: bestApplicant.name,
    currentSongTitle: bestApplicant.songTitle,
    currentSongArtist: bestApplicant.songArtist,
    currentScore: parseFloat(bestScore.toFixed(1)),
  });
}

// cleanup
async function deleteBatched(collectionRef) {
  const snap = await getDocs(collectionRef);
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 499) {
    const batch = writeBatch(db);
    docs.slice(i, i + 499).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function clearAll() {
  await deleteBatched(collection(db, "applicants"));
  await deleteBatched(collection(db, "votes"));

  await updateSettings({
    isLive: false,
    phase: "idle",
    currentApplicantId: null,
    currentApplicantName: null,
    currentSongTitle: null,
    currentSongArtist: null,
    currentSongLyrics: null,
    currentScore: null,
  });
}

export { db };
