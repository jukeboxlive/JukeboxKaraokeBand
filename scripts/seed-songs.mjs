// Şarkıları Firestore'a yükle
// Kullanım: node scripts/seed-songs.mjs
// NOT: Çalıştırmadan önce .env.local dosyasını oluşturun

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local'dan environment variables yükle
try {
  const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let val = trimmed.slice(eqIndex + 1).trim();
    // Tırnak işaretlerini kaldır
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
} catch {
  console.log(".env.local bulunamadı, mevcut env vars kullanılıyor");
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

const SONGS = [
  {
    title: "Anlatamıyorum",
    artist: "Tarkan",
    genre: "Pop",
    language: "tr",
    lyrics: "Anlatamıyorum sana\nNe kadar çok sevdiğimi\nKelimelere sığmıyor\nBu duygu büyük çok büyük\n\nAnlatamıyorum sana\nSensizliğin acısını\nGözlerimde biriken\nYaşlarla söylüyorum",
  },
  {
    title: "Firuze",
    artist: "Sezen Aksu",
    genre: "Pop",
    language: "tr",
    lyrics: "Saçlarına yıldız düşmüş\nTaramışsın benim için\nGözlerinden süzülüyorum\nGönlünce yaşa güzelim\n\nFiruze firuze\nYandım aman aman\nFiruze firuze\nBu ne zaman",
  },
  {
    title: "Yalnızlık Senfonisi",
    artist: "Mor ve Ötesi",
    genre: "Rock",
    language: "tr",
    lyrics: "Yalnızlık senfonisi\nÇalıyor kulaklarımda\nBir başıma kaldım yine\nGökyüzünün altında\n\nSesini duyamıyorum\nKayboldum karanlıkta\nBir ışık göster bana\nYalnızlık senfonisi",
  },
  {
    title: "Yağmur",
    artist: "Teoman",
    genre: "Rock",
    language: "tr",
    lyrics: "Yağmur yağıyor üstüme\nIslak sokaklar benim\nSensiz geçen geceler\nBitmek bilmiyor bir türlü\n\nYağmur yağıyor yine\nAklımdasın her zaman\nBu şehir sensiz soğuk\nYağmur yağıyor yine",
  },
  {
    title: "Seni Dert Etmeler",
    artist: "Madrigal",
    genre: "Rock",
    language: "tr",
    lyrics: "Seni dert etmeler\nBeni mahvediyor yavaş yavaş\nHer gece uykusuz\nHer sabah sensiz başlıyor",
  },
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    genre: "Rock",
    language: "en",
    lyrics: "Is this the real life\nIs this just fantasy\nCaught in a landslide\nNo escape from reality\n\nOpen your eyes\nLook up to the skies and see\nI'm just a poor boy\nI need no sympathy",
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    genre: "Rock",
    language: "en",
    lyrics: "On a dark desert highway\nCool wind in my hair\nWarm smell of colitas\nRising up through the air\n\nUp ahead in the distance\nI saw a shimmering light\nMy head grew heavy and my sight grew dim\nI had to stop for the night",
  },
  {
    title: "Don't Stop Me Now",
    artist: "Queen",
    genre: "Rock",
    language: "en",
    lyrics: "Tonight I'm gonna have myself\nA real good time\nI feel alive\nAnd the world turning inside out\n\nI'm floating around in ecstasy\nSo don't stop me now\nDon't stop me now\nI'm having such a good time",
  },
];

async function seed() {
  console.log("🎵 Mevcut şarkılar temizleniyor...");
  const existing = await getDocs(collection(db, "songs"));
  for (const d of existing.docs) await deleteDoc(d.ref);
  console.log(`  ${existing.size} eski şarkı silindi`);

  console.log("🎵 Şarkılar yükleniyor...");
  for (const song of SONGS) {
    await addDoc(collection(db, "songs"), {
      ...song,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    console.log(`  ✅ ${song.title} - ${song.artist}`);
  }

  console.log(`\n🎉 ${SONGS.length} şarkı başarıyla yüklendi!`);
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Hata:", e.message);
  process.exit(1);
});
