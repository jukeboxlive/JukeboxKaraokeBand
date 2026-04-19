"use client";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
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
  const defaults = {
    isLive: false,
    phase: "idle",
    currentStageId: null,
    currentApplicantId: null,
    currentApplicantName: null,
    currentSongTitle: null,
    currentSongArtist: null,
    currentSongLyrics: null,
    currentScore: null,
  };

  const snap = await getDoc(settingsRef);
  if (!snap.exists()) {
    await setDoc(settingsRef, defaults);
    return;
  }

  // only backfill fields that are actually missing (never overwrite existing values)
  const data = snap.data();
  const missing = {};
  for (const key of Object.keys(defaults)) {
    if (!(key in data)) missing[key] = defaults[key];
  }
  if (Object.keys(missing).length > 0) {
    await updateDoc(settingsRef, missing);
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

// stages
export async function createStage() {
  const ref = await addDoc(collection(db, "stages"), {
    startedAt: serverTimestamp(),
    endedAt: null,
  });
  await updateSettings({ currentStageId: ref.id, isLive: true });
  return ref.id;
}

export async function endStage(stageId) {
  if (stageId) {
    await updateDoc(doc(db, "stages", stageId), {
      endedAt: serverTimestamp(),
    });
  }
  await updateSettings({ isLive: false });
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

export function subscribeAllSongs(callback) {
  const q = query(collection(db, "songs"), orderBy("title"));
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

export async function updateSong(id, data) {
  return updateDoc(doc(db, "songs", id), data);
}

export async function deleteSong(id) {
  return updateDoc(doc(db, "songs", id), { isActive: false });
}

export async function deleteSongPermanent(id) {
  return deleteDoc(doc(db, "songs", id));
}

// song requests (public wishlist — independent from live state)
export function subscribeSongRequests(callback) {
  const q = query(collection(db, "songRequests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function addSongRequest(data) {
  return addDoc(collection(db, "songRequests"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSongRequest(id) {
  return deleteDoc(doc(db, "songRequests", id));
}

// applicants (queue) — scoped to stageId
export function subscribeQueue(stageId, callback) {
  if (!stageId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, "applicants"),
    where("stageId", "==", stageId),
    orderBy("position"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function checkCooldown(deviceId, stageId) {
  if (!deviceId || !stageId) return { canApply: true, remainingMinutes: 0 };

  const q = query(
    collection(db, "applicants"),
    where("deviceId", "==", deviceId),
    where("stageId", "==", stageId),
  );
  const snap = await getDocs(q);
  const active = snap.docs
    .map((d) => d.data())
    .filter((a) => a.status !== "cancelled");

  if (active.length === 0) return { canApply: true, remainingMinutes: 0 };

  const latest = active.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
  )[0];

  if (!latest.createdAt) return { canApply: true, remainingMinutes: 0 };

  const elapsed = Date.now() / 1000 - latest.createdAt.seconds;
  if (elapsed >= 600) return { canApply: true, remainingMinutes: 0 };

  return {
    canApply: false,
    remainingMinutes: Math.ceil((600 - elapsed) / 60),
  };
}

export async function addApplicant(data) {
  if (!data.stageId) {
    throw new Error("Etkinlik henüz başlamamış. Sayfayı yenileyin.");
  }

  if (!data.consent?.kvkk || !data.consent?.acikRiza) {
    throw new Error(
      "KVKK Aydınlatma Metni ve Açık Rıza Beyanı onaylanmadan başvuru yapılamaz.",
    );
  }

  const cooldown = await checkCooldown(data.deviceId, data.stageId);
  if (!cooldown.canApply) {
    throw new Error(
      `${cooldown.remainingMinutes} dakika sonra tekrar başvurabilirsiniz.`,
    );
  }

  // 1) users koleksiyonuna kalıcı onay kaydı yaz
  const userRef = doc(collection(db, "users"));
  await setDoc(userRef, {
    ad: data.name,
    soyad: data.surname,
    instagram: data.instagram || "",
    kvkk_onay_tarihi: serverTimestamp(),
    acik_riza_onay_tarihi: serverTimestamp(),
    onaylayan_ip_adresi: data.consent.ip || "unknown",
    onay_durumu: true,
    deviceId: data.deviceId,
    stageId: data.stageId,
    createdAt: serverTimestamp(),
  });

  // 2) applicants koleksiyonuna operasyonel kayıt — users doc id referanslı
  const { consent: _consent, ...applicantData } = data;
  return runTransaction(db, async (transaction) => {
    const q = query(
      collection(db, "applicants"),
      where("stageId", "==", data.stageId),
      where("status", "in", ["waiting", "on-stage"]),
    );
    const snap = await getDocs(q);
    const newRef = doc(collection(db, "applicants"));
    transaction.set(newRef, {
      ...applicantData,
      userId: userRef.id,
      consentKvkk: true,
      consentAcikRiza: true,
      consentIp: data.consent.ip || "unknown",
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

export async function reorderQueue(orderedIds) {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, "applicants", id), { position: index + 1 });
  });
  return batch.commit();
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
  batch.update(doc(db, "applicants", applicant.id), {
    status: "on-stage",
    stageStartedAt: serverTimestamp(),
  });

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
  batch.update(doc(db, "applicants", applicantId), {
    status: "performed",
    score: parseFloat(avg),
    voteCount: scores.length,
    performedAt: serverTimestamp(),
  });
  batch.update(settingsRef, {
    phase: "showing-score",
    currentScore: parseFloat(avg),
  });
  await batch.commit();

  await deleteBatched(
    query(collection(db, "votes"), where("applicantId", "==", applicantId)),
  );
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

export async function showWinner(stageId) {
  const q = stageId
    ? query(
        collection(db, "applicants"),
        where("stageId", "==", stageId),
        where("status", "==", "performed"),
      )
    : query(
        collection(db, "applicants"),
        where("status", "==", "performed"),
      );

  const applicantsSnap = await getDocs(q);
  if (applicantsSnap.empty) return;

  let bestApplicant = null;
  let bestScore = -1;

  for (const d of applicantsSnap.docs) {
    const applicant = { id: d.id, ...d.data() };
    if (applicant.score > bestScore) {
      bestScore = applicant.score;
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
    currentScore: bestApplicant.score,
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

export async function clearAll(stageId) {
  if (stageId) {
    await deleteBatched(
      query(collection(db, "applicants"), where("stageId", "==", stageId)),
    );
  } else {
    await deleteBatched(collection(db, "applicants"));
  }
  await deleteBatched(collection(db, "votes"));

  await updateSettings({
    isLive: false,
    phase: "idle",
    currentStageId: null,
    currentApplicantId: null,
    currentApplicantName: null,
    currentSongTitle: null,
    currentSongArtist: null,
    currentSongLyrics: null,
    currentScore: null,
  });
}

export { db };
