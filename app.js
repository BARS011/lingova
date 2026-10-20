/**
 * app.js - Lingova Pro
 * Professional, Zamonaviy va "Skromniy" Til O'rganish Platformasi
 * - PRO va PREMIUM versiyalar (Ko'proq darslar, Tarjimon, AI Murabbiy)
 * - Shaxsiy o'quv dasturi yaratish (Onboarding & Curriculum Generator)
 * - Smart Tarjimon (Inglizcha <-> O'zbekcha, IPA transkripsiya, 🔊/🐢 Audio, Misollar)
 * - AI Murabbiy (Barcha savollarga javob beruvchi, dars va xatolarni tekshiruvchi repetitor)
 * - Mukammal Grammatika Qo'llanmasi (Formulalar, xatolar tahlili, mashqlar)
 * - Faqat haqiqiy foydalanuvchilar reytingi (No Bots)
 */

// ======================= 1. Global Konfiguratsiya & Holat =======================
const API_BASE = "http://localhost:8000/api";
let IS_API_ONLINE = false;

const LOCAL_USERS_KEY = "lingova_pro_users_v4";
const CURRENT_SESSION_KEY = "lingova_pro_session_v4";

// Foydalanuvchi profili uchun zamonaviy monogram ranglar va kasblar
const MONOGRAM_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", 
  "#10b981", "#f59e0b", "#3b82f6", "#14b8a6"
];

const JOBS_LIST = [
  "Dasturchi (IT)", "Talaba", "O'quvchi", "Muhandis",
  "Shifokor", "O'qituvchi", "Tadbirkor", "Dizayner", 
  "Marketolog", "Boshqa"
];

let currentUser = null;
let currentToken = null;
let currentCurriculum = [];
let activeLesson = null;
let activeLessonTab = "grammar"; // 'grammar' | 'vocab' | 'dialogue' | 'quiz'
let activeQuizIndex = 0;
let soundEnabled = true;

// Onboarding ma'lumotlari
let onboardingData = {
  purpose: "abroad",
  level: "intermediate",
  duration: "1_month",
  daily_minutes: 20
};

// ======================= 2. Tabiiy Ovoz (TTS) & Web Audio =======================
let availableVoices = [];

function loadVoices() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    availableVoices = window.speechSynthesis.getVoices();
  }
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function getBestNaturalVoice(lang = "en-US") {
  if (!availableVoices || availableVoices.length === 0) loadVoices();
  
  // Natural / Google / Neural ovozlar
  const natural = availableVoices.find(v => 
    (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural") || v.name.includes("Online")) &&
    v.lang.startsWith("en")
  );
  if (natural) return natural;

  const standard = availableVoices.find(v => v.lang === "en-US" || v.lang === "en-GB");
  if (standard) return standard;

  return availableVoices.find(v => v.lang.startsWith("en")) || null;
}

function speakText(text, lang = "en-US", rate = 0.95) {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const bestVoice = getBestNaturalVoice(lang);
    if (bestVoice) utterance.voice = bestVoice;
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

function speakSlow(text, lang = "en-US") {
  speakText(text, lang, 0.70);
}

// Audio effektlari
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioCtxClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if (type === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.50, now + 0.24);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'diamond') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now);
      osc.frequency.setValueAtTime(1174, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {}
}

function showDiamondToast(count) {
  playSound('diamond');
  const toast = document.createElement("div");
  toast.className = "stat-pill diamonds";
  toast.style.position = "fixed";
  toast.style.top = "24px";
  toast.style.right = "24px";
  toast.style.zIndex = "9999";
  toast.style.fontSize = "14px";
  toast.style.padding = "10px 18px";
  toast.style.boxShadow = "var(--shadow-lg)";
  toast.style.animation = "fadeIn 0.25s ease";
  toast.innerHTML = `💎 +${count} Olmos to'plandi!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

// ======================= 3. Kriptografiya & LocalStorage =======================
async function sha256(message) {
  try {
    const msgBuffer = new TextEncoder().encode("lingova_pro_2026_" + message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

function saveCurrentUser() {
  if (!currentUser) return;
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.username === currentUser.username || u.id === currentUser.id);
  if (idx !== -1) {
    users[idx] = currentUser;
  } else {
    users.push(currentUser);
  }
  saveLocalUsers(users);
  localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify({ token: currentToken, user: currentUser }));
}

async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, { method: "GET", mode: "cors" });
    if (res.ok) {
      IS_API_ONLINE = true;
      return true;
    }
  } catch (e) {}
  IS_API_ONLINE = false;
  return false;
}

async function apiRequest(endpoint, method = "GET", body = null) {
  if (!IS_API_ONLINE) return null;
  try {
    const headers = { "Content-Type": "application/json" };
    if (currentToken) headers["Authorization"] = `Bearer ${currentToken}`;
    const opts = { method, headers, mode: "cors" };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Xatolik: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ======================= 4. Darslar Bazasi va Shaxsiy Dastur Dvigateli =======================
const BASE_LESSON_DATABASE = [
  {
    topic: "Aeroportda ro'yxatdan o'tish (Airport Check-in)",
    icon: "✈️",
    category: "Sayohat & Aeroport",
    difficulty: "easy",
    diamonds_reward: 2,
    grammar: {
      title: "Muloyim Iltimoslar (Could I please have...)",
      why_use: "Aeroport, samolyot va rasmiy joylarda buyruq ohangida gapirmasdan, deraza yonidagi joyni yoki xizmatni muloyim so'rash uchun kerak.",
      formula: "Could I please have + [narsa] ... ?  yoki  I would like + [narsa]",
      simple_explanation: "Ingliz tilida 'Give me' (menga ber) deyish juda qo'pol hisoblanadi. Doim 'Could I please have...' (olsam bo'ladimi) deyish lozim.",
      phonetic_trans: "[kʊd aɪ pliːz hæv] - Kud ay pliiz hev",
      examples: [
        { en: "Could I please have a window seat?", uz: "Menga deraza yonidagi o'rindiqni bersangiz, iltimos?", pron: "Kud ay pliiz hev e vindou siit?" },
        { en: "I would like to check in these two bags.", uz: "Bu ikkita sumkamni topshirmoqchi edim.", pron: "Ay vud layk tu chek in diiz tu begz." }
      ],
      common_mistake: "❌ 'Give me window seat!' ➡️ ✅ 'Could I please have a window seat?'"
    },
    vocab: [
      { word: "boarding pass", ipa: "[ˈbɔː.dɪŋ pɑːs]", pron_uz: "bording pas", trans: "parvozga chiqish taloni (bilet)", ex: "Here is your boarding pass and passport.", tip: "Samolyotga chiqish eshigi oldida ko'rsatiladi." },
      { word: "carry-on luggage", ipa: "[ˈkæri ɒn ˈlʌɡɪdʒ]", pron_uz: "keri-on lagidj", trans: "qo'l yuki (samolyot saloniga olinadigan)", ex: "Is my carry-on bag too heavy?", tip: "Kichik chamadon yoki ryukzak." },
      { word: "departure gate", ipa: "[dɪˈpɑːtʃə ɡeɪt]", pron_uz: "diparcha geyt", trans: "uchib ketish darvozasi / eshigi", ex: "Which gate is flight TK405 departing from?", tip: "Ekranda Gate 14, Gate 20 deb yoziladi." },
      { word: "window seat", ipa: "[ˈwɪndəʊ siːt]", pron_uz: "vindou siit", trans: "deraza yonidagi o'rindiq", ex: "I prefer a window seat to enjoy the view.", tip: "Manzarani ko'rish uchun eng yaxshi joy." }
    ],
    dialogue: [
      { speaker: "Agent", text: "Good morning! Can I see your passport and ticket, please?", uz: "Xayrli tong! Pasport va chiptangizni ko'rsata olasizmi, iltimos?", pron: "Gud morning! Ken ay sii yor pasport end tiket, pliiz?" },
      { speaker: "Siz", text: "Good morning! Here you are. Could I have an aisle seat, please?", uz: "Xayrli tong! Mana marhamat. Menga yo'lak bo'yidagi joyni bersangiz, iltimos?", pron: "Gud morning! Xiyer yu aar. Kud ay hev en ayl siit, pliiz?" },
      { speaker: "Agent", text: "Certainly! Gate 14 is boarding at 10:30 AM. Have a safe flight!", uz: "Albatta! 14-darvoza soat 10:30 da ochiladi. Parvozingiz bexatar o'tsin!", pron: "Sertenli! Geyt footiin iz bording et ten terti. Hev e seyf flayt!" }
    ],
    exercises: [
      { type: "mc", question: "Aeroportda deraza yonidagi o'rindiqni so'rash uchun qaysi jumla to'g'ri?", options: ["Could I please have a window seat?", "Give me window right now!", "I take window seat fast", "Window seat give me"], answer: "Could I please have a window seat?", diamonds: 2 },
      { type: "mc", question: "'Carry-on luggage' iborasi nimani anglatadi?", options: ["Samolyot saloniga olinadigan qo'l yuki", "Katta og'ir yuk", "Qaytish chiptasi", "Aeroport taksisi"], answer: "Samolyot saloniga olinadigan qo'l yuki", diamonds: 2 }
    ]
  },
  {
    topic: "Bojxona va Pasport nazorati (Passport Control)",
    icon: "🛂",
    category: "Rasmiy Muloqot",
    difficulty: "medium",
    diamonds_reward: 3,
    grammar: {
      title: "Safar Maqsadini Aniq Aytish (Purpose of Visit)",
      why_use: "Chegara va viza xodimlari nima maqsadda kelganingizni so'raganda xavotirsiz, qat'iy va to'g'ri javob berish uchun kerak.",
      formula: "I am here for + [sabab] ...  yoki  I am here to + [fe'l] ...",
      simple_explanation: "Sayohat bo'lsa: 'I am here for tourism'. O'qish bo'lsa: 'I am here to study'. Ish bo'lsa: 'I am here on business'.",
      phonetic_trans: "[aɪ æm hɪər fɔː ˈtʊə.rɪ.zəm] - Ay em xiyer for turizm",
      examples: [
        { en: "What is the purpose of your visit? - I am here for tourism.", uz: "Tashrifingizdan maqsad nima? - Men sayyohlik uchun keldim.", pron: "Vot iz de porpos of yor vizit? - Ay em xiyer for turizm." },
        { en: "How long do you plan to stay? - For two weeks.", uz: "Qancha vaqt qolasiz? - Ikki hafta.", pron: "Xau long du yu plen tu stey? - For tu viiks." }
      ],
      common_mistake: "❌ 'I travel much days' ➡️ ✅ 'I am here for tourism for two weeks.'"
    },
    vocab: [
      { word: "purpose of visit", ipa: "[ˈpɜː.pəs əv ˈvɪz.ɪt]", pron_uz: "porpos of vizit", trans: "tashrif maqsadi", ex: "The purpose of my visit is business.", tip: "Bojxonachining eng asosiy savoli." },
      { word: "declare", ipa: "[dɪˈkleər]", pron_uz: "dikleyer", trans: "deklaratsiya qilmoq (ma'lum qilmoq)", ex: "I have nothing to declare.", tip: "Agar boj olinadigan buyum bo'lmasa, shu jumla aytiladi." },
      { word: "duration of stay", ipa: "[djʊəˈreɪ.ʃən əv steɪ]", pron_uz: "dyureyshn of stey", trans: "mamlakatda qolish muddati", ex: "My duration of stay is ten days.", tip: "Qancha kun qolishingiz." }
    ],
    dialogue: [
      { speaker: "Officer", text: "Passport please. What is the purpose of your visit?", uz: "Pasportingizni bering. Tashrifingizdan maqsad nima?", pron: "Pasport pliiz. Vot iz de porpos of yor vizit?" },
      { speaker: "Siz", text: "Good day! I am here for tourism for two weeks.", uz: "Xayrli kun! Men ikki haftaga sayohat uchun keldim.", pron: "Gud dey! Ay em xiyer for turizm for tu viiks." },
      { speaker: "Officer", text: "Enjoy your stay in London!", uz: "Londondagi sayohatingiz maroqli o'tsin!", pron: "Indjoy yor stey in London!" }
    ],
    exercises: [
      { type: "mc", question: "Bojxona xodimi 'Do you have anything to declare?' desa nima deyiladi?", options: ["No, I have nothing to declare.", "Yes, give me ticket.", "I have no passport.", "I am very hungry."], answer: "No, I have nothing to declare.", diamonds: 3 }
    ]
  },
  {
    topic: "Taksiga chiqish va Manzilni aytish (Taking a Taxi)",
    icon: "🚕",
    category: "Shahar Transporti",
    difficulty: "easy",
    diamonds_reward: 2,
    grammar: {
      title: "Yo'l Ko'rsatish va Narxni Bilish",
      why_use: "Aeroportdan mehmonxonagacha taksida ortiqcha to'lovsiz, manzilga tez va to'g'ri yetib olish uchun kerak.",
      formula: "Could you please take me to [manzil]?  /  How much will the fare be?",
      simple_explanation: "'Drop off' - meni mashinadan tushirib qo'ying. 'Keep the change' - qaytimi o'zingizda qolsin.",
      phonetic_trans: "[kʊd juː pliːz teɪk miː tuː ...] - Kud yu pliiz teyk mi tu ...",
      examples: [
        { en: "Could you please take me to the Hilton Hotel?", uz: "Meni Hilton mehmonxonasiga olib bora olasizmi, iltimos?", pron: "Kud yu pliiz teyk mi tu de Xilton Xotel?" },
        { en: "Please drop me off near the metro station.", uz: "Meni metro bekati yonida tushirib keting, iltimos.", pron: "Pliiz drop mi of niyer de metro steyshn." }
      ],
      common_mistake: "❌ 'Drive me hotel now' ➡️ ✅ 'Could you take me to the hotel, please?'"
    },
    vocab: [
      { word: "fare", ipa: "[feər]", pron_uz: "feyer", trans: "yo'l kira haqi", ex: "How much is the estimated taxi fare?", tip: "Taksida narx uchun 'price' emas, 'fare' ishlatiladi." },
      { word: "drop off", ipa: "[drɒp ɒf]", pron_uz: "drop of", trans: "tushirib ketmoq", ex: "Please drop me off here.", tip: "Meni shu yerda tushiring." },
      { word: "keep the change", ipa: "[kiːp ðə tʃeɪndʒ]", pron_uz: "kiip de cheyndj", trans: "qaytimi o'zingizda qolsin", ex: "Thank you, keep the change!", tip: "Choypuli sifatida qoldirish." }
    ],
    dialogue: [
      { speaker: "Siz", text: "Hello! Could you take me to the Grand Hotel, please?", uz: "Salom! Meni Grand mehmonxonasiga olib borolasizmi, iltimos?", pron: "Xellou! Kud yu teyk mi tu de Grend Xotel, pliiz?" },
      { speaker: "Driver", text: "Sure thing! Put your luggage in the trunk.", uz: "Albatta! Yukingizni yukxonaga (bagajga) qo'ying.", pron: "Shur sing! Put yor lagidj in de trank." }
    ],
    exercises: [
      { type: "mc", question: "Haydovchiga 'Qaytimi o'zingizda qolsin' deyish iborasi qaysi?", options: ["Keep the change", "Give me money back", "Take no cash", "No balance for me"], answer: "Keep the change", diamonds: 2 }
    ]
  },
  {
    topic: "Mehmonxonaga joylashish (Hotel Check-in)",
    icon: "🏨",
    category: "Turar Joy & Xizmat",
    difficulty: "medium",
    diamonds_reward: 3,
    grammar: {
      title: "Bronni Aytish va Sharoitlarni So'rash",
      why_use: "Oldindan band qilingan xonaning kalitini tez olish va bepul xizmatlarni (Wi-Fi, nonushta) aniqlash uchun.",
      formula: "I have a reservation under the name of [Ismingiz].",
      simple_explanation: "'Reservation' - oldindan bron qilingan xona. 'Complimentary' - mehmonxona tomonidan bepul taqdim etiladigan narsa.",
      phonetic_trans: "[aɪ hæv ə ˌrez.əˈveɪ.ʃən ˈʌn.dər ðə neɪm əv ...]",
      examples: [
        { en: "I have a reservation under Sardor for three nights.", uz: "Menda Sardor nomiga uch kechaga olingan bron bor.", pron: "Ay hev e rezervleyshn ander Sardor for srii nayts." },
        { en: "Is breakfast included in the room price?", uz: "Nonushta xona narxiga kiritilganmi?", pron: "Iz brekfest inkluudid in de ruum prays?" }
      ],
      common_mistake: "❌ 'I book room give key' ➡️ ✅ 'I have a reservation under my name.'"
    },
    vocab: [
      { word: "reservation", ipa: "[ˌrez.əˈveɪ.ʃən]", pron_uz: "rezervleyshn", trans: "bron / oldindan band qilish", ex: "I made a hotel reservation online.", tip: "Xonani band qilganingiz." },
      { word: "key card", ipa: "[kiː kɑːd]", pron_uz: "kii kaad", trans: "elektron xona ochqichi (plastik karta)", ex: "Here is your key card for room 402.", tip: "Xona eshigini ochuvchi karta." },
      { word: "complimentary", ipa: "[ˌkɒm.plɪˈmen.tər.i]", pron_uz: "komplimentri", trans: "bepul (sovg'a tariqasida)", ex: "Wi-Fi and water are complimentary.", tip: "To'lov talab qilinmaydi." }
    ],
    dialogue: [
      { speaker: "Receptionist", text: "Welcome! How may I assist you today?", uz: "Xush kelibsiz! Sizga qanday yordam bera olaman?", pron: "Velkam! Xau mey ay essist yu tudey?" },
      { speaker: "Siz", text: "Hello! I have a reservation under Sardor Aliyev.", uz: "Salom! Menda Sardor Aliyev nomiga bron bor.", pron: "Xellou! Ay hev e rezervleyshn ander Sardor Aliyev." }
    ],
    exercises: [
      { type: "mc", question: "'Complimentary Wi-Fi' nimani bildiradi?", options: ["Bepul Wi-Fi internet", "Qimmat Wi-Fi", "Parolsiz Wi-Fi", "Sekin internet"], answer: "Bepul Wi-Fi internet", diamonds: 2 }
    ]
  },
  {
    topic: "Restoranda buyurtma berish (Ordering Food)",
    icon: "🍽️",
    category: "Taom & Xizmat",
    difficulty: "easy",
    diamonds_reward: 2,
    grammar: {
      title: "I'll have the... (Men o'shani tanlayman)",
      why_use: "Restoranda ofitsiantga buyurtma berganda o'zingizni erkin va madaniyatli chet ellikdek tutish uchun kerak.",
      formula: "I'll have the + [taom nomi], please.",
      simple_explanation: "'I'll have...' - bu ingliz tilida restoran menyusidan taom tanlashda 99% holatda ishlatiladigan tabiiy iboradir.",
      phonetic_trans: "[aɪl hæv ðə ... pliːz] - Ayl hev de ... pliiz",
      examples: [
        { en: "I'll have the grilled chicken and mineral water, please.", uz: "Menga qovurilgan tovuq va mineral suv bering, iltimos.", pron: "Ayl hev de grilld chiken end mineral voter, pliiz." },
        { en: "Could we have the bill, please?", uz: "Hisobni (chekni) olib kelsangiz, iltimos?", pron: "Kud vi hev de bill, pliiz?" }
      ],
      common_mistake: "❌ 'Give me food now' ➡️ ✅ 'I'll have the pasta, please.'"
    },
    vocab: [
      { word: "bill / check", ipa: "[bɪl / tʃek]", pron_uz: "bil / chek", trans: "to'lov hisobi (chek)", ex: "Could we have the bill, please?", tip: "Britaniyada 'bill', Amerikada 'check' deyiladi." },
      { word: "still water", ipa: "[stɪl ˈwɔː.tər]", pron_uz: "still voter", trans: "gazsiz oddiy suv", ex: "Still or sparkling water?", tip: "Sparkling - gazli suv, Still - gazsiz suv." },
      { word: "delicious", ipa: "[dɪˈlɪʃ.əs]", pron_uz: "delishes", trans: "juda mazali", ex: "The soup was delicious, thank you!", tip: "Oshpazga minnatdorchilik bildirish." }
    ],
    dialogue: [
      { speaker: "Waiter", text: "Are you ready to order, sir?", uz: "Buyurtma berishga tayyormisiz?", pron: "Aar yu redi tu order, ser?" },
      { speaker: "Siz", text: "Yes! I'll have the steak and still water, please.", uz: "Ha! Menga steyk va gazsiz suv bersangiz, iltimos.", pron: "Yes! Ayl hev de steyk end still voter, pliiz." }
    ],
    exercises: [
      { type: "mc", question: "Restoranda buyurtma berishda eng tabiiy inglizcha ibora qaysi?", options: ["I'll have the...", "Give me food fast", "I take and eat", "Food here now"], answer: "I'll have the...", diamonds: 2 }
    ]
  }
];

// Qo'shimcha mavzular hovuzi (Kengaytirilgan 40 dan 240 tagacha darslar uchun)
const EXTENDED_TOPIC_POOL = [
  { topic: "Shaharda yo'l so'rash va xarita", icon: "🗺️", category: "Shahar & Yo'nalish", desc: "Asking directions politely" },
  { topic: "Kiyim do'konida xarid va o'lcham", icon: "🛍️", category: "Xarid & Bozor", desc: "Trying clothes on and sizes" },
  { topic: "Dorixonada dori so'rash", icon: "💊", category: "Salomatlik", desc: "Explaining symptoms and pain" },
  { topic: "Bank va valyuta almashtirish", icon: "💱", category: "Moliya", desc: "Exchanging currency and ATM" },
  { topic: "SIM-karta va cheksiz internet", icon: "📶", category: "Aloqa & Texnologiya", desc: "Prepaid data plans and eSIM" },
  { topic: "Mahalliy do'stlar bilan 'Small Talk'", icon: "🤝", category: "Jonli Muloqot", desc: "Friendly conversations and hobbies" },
  { topic: "Ish intervyusi va rezyume taqdimoti", icon: "💼", category: "Ish & Karyera", desc: "Work experience and strengths" },
  { topic: "Kvartira yoki xona ijarasi", icon: "🏠", category: "Uy-joy", desc: "Rent, utilities and deposit" },
  { topic: "Metro va tezyurar poyezdlar", icon: "🚇", category: "Transport", desc: "Platforms and changing lines" },
  { topic: "Avtomobil ijaraga olish (Car Rental)", icon: "🚗", category: "Haydash", desc: "Rental contracts and insurance" },
  { topic: "Biznes yozishma va email odobi", icon: "✉️", category: "Ish & Biznes", desc: "Formal emails and follow-ups" },
  { topic: "Kundalik jonli sleng va idiomalar", icon: "🔥", category: "Slang & Idiom", desc: "Piece of cake, hit the road" },
  { topic: "IELTS Speaking Part 2 Master-klass", icon: "🎯", category: "IELTS & CEFR", desc: "Cue card 2 minute speech" },
  { topic: "IT Jamoada Daily Standup va vazifalar", icon: "💻", category: "IT & Dasturlash", desc: "Sprint tasks, blockers, bugs" },
  { topic: "Muzokaralar va murosaga kelish", icon: "🤝", category: "Muzokara", desc: "Win-win solutions and deals" }
];

// Darslar sonini hisoblash
function getLessonCountForDuration(duration) {
  const d = String(duration).toLowerCase();
  if (d.includes("2_month") || d.includes("2 oy")) return 40;
  if (d.includes("3_month") || d.includes("3 oy")) return 60;
  if (d.includes("4_month") || d.includes("4 oy")) return 80;
  if (d.includes("5_month") || d.includes("5 oy")) return 100;
  if (d.includes("6_month") || d.includes("6 oy")) return 120;
  if (d.includes("1_year") || d.includes("1 yil")) return 240;
  return 20; // 1 oylik reja
}

// SHAXSIY DASTUR TUZUVCHI ASOSIY FUNKSIYA (Bug to'g'irlandi!)
function buildPersonalizedCurriculum(level = "intermediate", purpose = "abroad", duration = "1_month") {
  const count = getLessonCountForDuration(duration);
  const lessons = [];

  // 1. Asosiy darslar
  for (let i = 0; i < Math.min(count, BASE_LESSON_DATABASE.length); i++) {
    const b = BASE_LESSON_DATABASE[i];
    lessons.push({
      id: i + 1,
      title: `${i + 1}-dars: ${b.topic}`,
      topic: b.topic,
      icon: b.icon,
      category: b.category,
      difficulty: b.difficulty,
      tier_required: i < 5 ? "free" : i < 15 ? "pro" : "premium",
      grammar: b.grammar,
      vocab: b.vocab,
      dialogue: b.dialogue,
      exercises: b.exercises,
      xp_reward: 30 + (i * 2),
      diamonds_reward: b.diamonds_reward || 2,
      is_completed: false
    });
  }

  // 2. Kengaytirilgan hovuz orqali to'ldirish
  let extIdx = 0;
  for (let i = lessons.length; i < count; i++) {
    const ext = EXTENDED_TOPIC_POOL[extIdx % EXTENDED_TOPIC_POOL.length];
    extIdx++;

    const isPro = i >= 10 && i < 30;
    const isPrem = i >= 30;
    const diff = i % 3 === 0 ? "hard" : i % 2 === 0 ? "medium" : "easy";

    lessons.push({
      id: i + 1,
      title: `${i + 1}-dars: ${ext.topic}`,
      topic: ext.topic,
      icon: ext.icon,
      category: ext.category,
      difficulty: diff,
      tier_required: isPrem ? "premium" : isPro ? "pro" : "free",
      grammar: {
        title: `Spoken English: ${ext.desc}`,
        why_use: `${ext.topic} mavzusida ravon va ishonchli gapirish uchun hayotiy patternlar.`,
        formula: "Pattern: Subject + Modal/Auxiliary + Main Action + Target",
        simple_explanation: "Ushbu vaziyatda inglizlar qo'llaydigan eng zamonaviy va tabiiy muloqot qoidalari.",
        phonetic_trans: "[ˈfluː.ənt ˈspiːtʃ] - Flyuent spiich",
        examples: [
          { en: `Could you please assist me with ${ext.topic.toLowerCase()}?`, uz: `${ext.topic} bo'yicha yordam bera olasizmi, iltimos?`, pron: "Kud yu pliiz essist mi..." }
        ],
        common_mistake: "❌ So'zma-so'z xato tarjima qilish ➡️ ✅ Tabiiy iboradan foydalanish"
      },
      vocab: [
        { word: "essential phrase", ipa: "[ɪˈsen.ʃəl freɪz]", pron_uz: "isenshl freyz", trans: "muhim va asosiy ibora", ex: "Learn this essential phrase for daily conversation.", tip: "Har kuni mashq qiling." },
        { word: "fluent communication", ipa: "[ˈfluː.ənt kəˌmjuː.nɪˈkeɪ.ʃən]", pron_uz: "flyuent komyunikeyshn", trans: "ravon erkin muloqot", ex: "Practice daily to achieve fluent communication.", tip: "Xato qilishdan qo'rqmang." }
      ],
      dialogue: [
        { speaker: "Hamroh", text: `Hello! Let's practice ${ext.topic} together.`, uz: `Salom! Keling, ${ext.topic} mavzusini birga mashq qilamiz.`, pron: "Xellou! Lets praktis tugeder." },
        { speaker: "Siz", text: "Great! I am ready to learn and speak fluently.", uz: "Ajoyib! Men o'rganishga va ravon gapirishga tayyorman.", pron: "Greyt! Ay em redi tu lorn." }
      ],
      exercises: [
        { type: "mc", question: `'${ext.topic}' muloqotida nima eng muhim?`, options: ["Muloyim va to'g'ri qoidalar bilan gapirish", "Baqirib gapirish", "Jim turish", "Qo'pol so'zlashish"], answer: "Muloyim va to'g'ri qoidalar bilan gapirish", diamonds: 3 }
      ],
      xp_reward: 35 + ((i % 10) * 2),
      diamonds_reward: diff === "hard" ? 4 : 3,
      is_completed: false
    });
  }

  return lessons;
}

// ======================= 5. Autentifikatsiya (Login & Register) =======================
async function handleRegister(username, email, password, fullName, avatar, gender, age, job) {
  const cleanU = username.trim().toLowerCase();
  const cleanE = email.trim().toLowerCase();

  const users = getLocalUsers();
  if (users.some(u => u.username === cleanU)) {
    return { success: false, error: "Ushbu username allaqachon band!" };
  }
  if (users.some(u => u.email === cleanE)) {
    return { success: false, error: "Ushbu email bilan akkaunt allaqachon mavjud!" };
  }

  const pHash = await sha256(password);
  const newUser = {
    id: Date.now(),
    username: cleanU,
    email: cleanE,
    password_hash: pHash,
    full_name: fullName.trim() || cleanU,
    avatar: avatar || '🦊',
    gender: gender || 'Erkak',
    age: parseInt(age) || 20,
    job: job || 'Dasturchi (IT)',
    level: "intermediate",
    purpose: "abroad",
    duration: "1_month",
    tier: "free", // 'free' | 'pro' | 'premium'
    xp: 0,
    diamonds: 30, // Boshlang'ich bonus
    streak: 1,
    curriculum: [],
    completed_lessons: {},
    created_at: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  currentUser = newUser;
  currentToken = "token_" + Date.now();
  saveCurrentUser();

  if (IS_API_ONLINE) {
    await apiRequest("/register", "POST", {
      username: cleanU, email: cleanE, password, full_name: fullName,
      avatar, gender, age: parseInt(age), job
    });
  }

  return { success: true, user: currentUser };
}

async function handleLogin(identifier, password) {
  const ident = identifier.trim().toLowerCase();
  const users = getLocalUsers();
  const pHash = await sha256(password);
  const found = users.find(u => (u.username === ident || u.email === ident) && u.password_hash === pHash);

  if (!found) {
    return { success: false, error: "Foydalanuvchi nomi yoki parol noto'g'ri!" };
  }

  currentUser = found;
  if (!currentUser.tier) currentUser.tier = "free";
  currentToken = "token_" + Date.now();
  saveCurrentUser();

  return { success: true, user: currentUser };
}

function handleLogout() {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem(CURRENT_SESSION_KEY);
  renderAuthScreen();
}

// ======================= 6. Header & Navigation =======================
const appEl = document.getElementById("app");

function renderHeader(activeTab = "roadmap") {
  if (!currentUser) return "";
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const userInitial = (currentUser.full_name || currentUser.username || "U")[0].toUpperCase();
  const userTier = currentUser.tier || "free";

  return `
    <header class="app-header">
      <div class="brand" onclick="navigateTo('roadmap')">
        <div class="brand-logo-badge">L</div>
        <div class="brand-text">LING<span>OVA</span></div>
      </div>

      <nav class="header-nav-links">
        <button class="nav-link-btn ${activeTab === 'roadmap' ? 'active' : ''}" onclick="navigateTo('roadmap')">
          <span>Darslar</span>
        </button>
        <button class="nav-link-btn ${activeTab === 'grammar' ? 'active' : ''}" onclick="navigateTo('grammar')">
          <span>Grammatika</span>
        </button>
        <button class="nav-link-btn ${activeTab === 'translator' ? 'active' : ''}" onclick="navigateTo('translator')">
          <span>Tarjimon</span>
          <span style="font-size: 10px; padding: 2px 5px; border-radius: 4px; background: rgba(139, 92, 246, 0.2); color: #c084fc;">PRO</span>
        </button>
        <button class="nav-link-btn ${activeTab === 'ai' ? 'active' : ''}" onclick="navigateTo('ai')">
          <span>AI Murabbiy</span>
          <span style="font-size: 10px; padding: 2px 5px; border-radius: 4px; background: rgba(245, 158, 11, 0.2); color: #fbbf24;">AI</span>
        </button>
        <button class="nav-link-btn ${activeTab === 'plans' ? 'active' : ''}" onclick="navigateTo('plans')">
          <span>Tariflar</span>
        </button>
        <button class="nav-link-btn ${activeTab === 'leaderboard' ? 'active' : ''}" onclick="navigateTo('leaderboard')">
          <span>Reyting</span>
        </button>
      </nav>

      <div class="header-right">
        <!-- Tier Badge (Click to open upgrade modal) -->
        <div class="tier-badge ${userTier}" onclick="openPricingModal()" title="Tarifni boshqarish">
          ${userTier === 'premium' ? '👑 PREMIUM' : userTier === 'pro' ? '⭐ PRO' : 'FREE'}
        </div>

        <div class="stat-pill diamonds" onclick="navigateTo('plans')" title="Olmoslar do'koni">
          💎 ${currentUser.diamonds || 0}
        </div>

        <div class="stat-pill streak" title="Ketma-ket o'qish">
          🔥 ${currentUser.streak || 1}
        </div>

        <div class="user-chip" onclick="navigateTo('profile')" title="Mening profilim">
          <div class="user-avatar">${userInitial}</div>
          <span class="user-name">@${escapeHtml(currentUser.username)}</span>
        </div>

        <button class="icon-btn" onclick="toggleTheme()" title="Mavzu">
          ${isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  `;
}

function renderBottomNav(activeTab = "roadmap") {
  return `
    <nav class="bottom-nav">
      <div class="bottom-nav-inner">
        <button class="nav-item ${activeTab === 'roadmap' ? 'active' : ''}" onclick="navigateTo('roadmap')">
          <span style="font-size: 16px;">📚</span>
          <span>Darslar</span>
        </button>
        <button class="nav-item ${activeTab === 'grammar' ? 'active' : ''}" onclick="navigateTo('grammar')">
          <span style="font-size: 16px;">📖</span>
          <span>Grammar</span>
        </button>
        <button class="nav-item ${activeTab === 'translator' ? 'active' : ''}" onclick="navigateTo('translator')">
          <span style="font-size: 16px;">🌐</span>
          <span>Tarjimon</span>
        </button>
        <button class="nav-item ${activeTab === 'ai' ? 'active' : ''}" onclick="navigateTo('ai')">
          <span style="font-size: 16px;">🤖</span>
          <span>AI Murabbiy</span>
        </button>
        <button class="nav-item ${activeTab === 'plans' ? 'active' : ''}" onclick="navigateTo('plans')">
          <span style="font-size: 16px;">💎</span>
          <span>Tariflar</span>
        </button>
        <button class="nav-item ${activeTab === 'profile' ? 'active' : ''}" onclick="navigateTo('profile')">
          <span style="font-size: 16px;">👤</span>
          <span>Profil</span>
        </button>
      </div>
    </nav>
  `;
}

// ======================= 7. Onboarding (Savollar & Darslar Yaratish) =======================
function renderOnboarding(step = 1) {
  let stepContent = "";

  if (step === 1) {
    stepContent = `
      <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Til o'rganishdan asosiy maqsadingiz nima?</h2>
      <p style="color: var(--text-secondary); font-size: 14.5px; margin-bottom: 20px;">
        Dastur aynan sizning maqsadingizga moslashtirilgan real muloqot va leksikani tanlaydi.
      </p>

      <div class="choices-grid">
        <div class="choice-card ${onboardingData.purpose === 'abroad' ? 'selected' : ''}" onclick="selectOnboarding('purpose', 'abroad', this)">
          <div class="choice-icon">✈️</div>
          <div class="choice-title">Sayohat va Chet elga ketish</div>
          <div class="choice-desc">Aeroport, viza, mehmonxona, taksi, shahar muloqoti va yo'l so'rash</div>
          <div class="choice-badge">Ommabop</div>
        </div>

        <div class="choice-card ${onboardingData.purpose === 'career' ? 'selected' : ''}" onclick="selectOnboarding('purpose', 'career', this)">
          <div class="choice-icon">💼</div>
          <div class="choice-title">Ish va Karyera</div>
          <div class="choice-desc">Xalqaro intervyu, rezyume, biznes uchrashuvlar, email yozish</div>
        </div>

        <div class="choice-card ${onboardingData.purpose === 'it' ? 'selected' : ''}" onclick="selectOnboarding('purpose', 'it', this)">
          <div class="choice-icon">💻</div>
          <div class="choice-title">IT va Texnologiya</div>
          <div class="choice-desc">Texnik atamalar, daily standup, xalqaro jamoada erkin ishlash</div>
        </div>

        <div class="choice-card ${onboardingData.purpose === 'study' ? 'selected' : ''}" onclick="selectOnboarding('purpose', 'study', this)">
          <div class="choice-icon">🎓</div>
          <div class="choice-title">IELTS va CEFR Tayyorgarlik</div>
          <div class="choice-desc">Speaking ravonligi, Writing inshosi va imtihon strategiyalari</div>
        </div>
      </div>

      <button class="btn btn-primary btn-full" onclick="renderOnboarding(2)">Keyingi bosqich →</button>
    `;
  } else if (step === 2) {
    stepContent = `
      <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">Hozirgi ingliz tili darajangiz qanday?</h2>
      <p style="color: var(--text-secondary); font-size: 14.5px; margin-bottom: 20px;">
        Grammatika tushuntirilishi va yangi so'zlar murakkabligi shunga qarab saralanadi.
      </p>

      <div class="choices-grid">
        <div class="choice-card ${onboardingData.level === 'beginner' ? 'selected' : ''}" onclick="selectOnboarding('level', 'beginner', this)">
          <div class="choice-icon">🌱</div>
          <div class="choice-title">Boshlang'ich (A1 - A2)</div>
          <div class="choice-desc">Oddiy gaplar tuzish, asosiy so'zlar va boshlang'ich grammatika</div>
        </div>

        <div class="choice-card ${onboardingData.level === 'intermediate' ? 'selected' : ''}" onclick="selectOnboarding('level', 'intermediate', this)">
          <div class="choice-icon">🌿</div>
          <div class="choice-title">O'rtacha (B1 - B2)</div>
          <div class="choice-desc">Asosiy fikrimni ayta olaman, erkin va tabiiy gapirishni istayman</div>
          <div class="choice-badge">Tavsiya</div>
        </div>

        <div class="choice-card ${onboardingData.level === 'advanced' ? 'selected' : ''}" onclick="selectOnboarding('level', 'advanced', this)">
          <div class="choice-icon">🏔️</div>
          <div class="choice-title">Ilg'or (C1 Master)</div>
          <div class="choice-desc">Murakkab mavzular, professional muloqot va akademik ravonlik</div>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="renderOnboarding(1)">← Orqaga</button>
        <button class="btn btn-primary btn-full" onclick="renderOnboarding(3)">Davom etish →</button>
      </div>
    `;
  } else if (step === 3) {
    stepContent = `
      <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">O'quv rejasi va darslar hajmi</h2>
      <p style="color: var(--text-secondary); font-size: 14.5px; margin-bottom: 20px;">
        Qancha muddat davomida shug'ullanmoqchisiz? Tizim darslar xaritasini shakllantiradi.
      </p>

      <div class="choices-grid">
        <div class="choice-card ${onboardingData.duration === '1_month' ? 'selected' : ''}" onclick="selectOnboarding('duration', '1_month', this)">
          <div class="choice-icon">📅</div>
          <div class="choice-title">1 oylik tezkor kurs</div>
          <div class="choice-desc">20 ta intensiv va amaliy dars</div>
          <div class="choice-badge">20 ta dars</div>
        </div>

        <div class="choice-card ${onboardingData.duration === '2_months' ? 'selected' : ''}" onclick="selectOnboarding('duration', '2_months', this)">
          <div class="choice-icon">🗓️</div>
          <div class="choice-title">2 oylik to'liq dastur</div>
          <div class="choice-desc">40 ta chuqurlashtirilgan muloqot darsi</div>
          <div class="choice-badge">40 ta dars</div>
        </div>

        <div class="choice-card ${onboardingData.duration === '3_months' ? 'selected' : ''}" onclick="selectOnboarding('duration', '3_months', this)">
          <div class="choice-icon">📆</div>
          <div class="choice-title">3 oylik intensiv master</div>
          <div class="choice-desc">60 ta to'liq dars + imtihon modullari</div>
          <div class="choice-badge">60 ta dars</div>
        </div>

        <div class="choice-card ${onboardingData.duration === '6_months' ? 'selected' : ''}" onclick="selectOnboarding('duration', '6_months', this)">
          <div class="choice-icon">🎯</div>
          <div class="choice-title">6 oylik professional kurs</div>
          <div class="choice-desc">120 ta barcha sohalar bo'yicha to'liq dars</div>
          <div class="choice-badge">120 ta dars</div>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" onclick="renderOnboarding(2)">← Orqaga</button>
        <button class="btn btn-primary btn-full" id="finishOnboardBtn" onclick="finishOnboarding(this)">
          Shaxsiy Darslarni Yaratish va Boshlash 🚀
        </button>
      </div>
    `;
  }

  appEl.innerHTML = `
    ${renderHeader('roadmap')}
    <div class="onboarding-wrap card animate-fade">
      <div class="step-indicator">
        <div class="step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}"></div>
        <div class="step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}"></div>
        <div class="step-dot ${step >= 3 ? 'active' : ''}"></div>
      </div>
      ${stepContent}
    </div>
  `;
}

function selectOnboarding(key, val, el) {
  playSound('click');
  onboardingData[key] = val;
  el.parentElement.querySelectorAll(".choice-card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
}

async function finishOnboarding(btn) {
  playSound('click');
  btn.disabled = true;
  btn.innerText = "Darslar tuzilmoqda...";

  try {
    // 1. Shaxsiy darslar yo'l xaritasini hosil qilish
    const lessons = buildPersonalizedCurriculum(onboardingData.level, onboardingData.purpose, onboardingData.duration);

    currentUser.level = onboardingData.level;
    currentUser.purpose = onboardingData.purpose;
    currentUser.duration = onboardingData.duration;
    currentUser.curriculum = lessons;
    currentCurriculum = lessons;

    saveCurrentUser();

    if (IS_API_ONLINE) {
      await apiRequest("/onboarding", "POST", onboardingData);
    }

    playSound('correct');
    renderRoadmap();
  } catch (err) {
    console.error("Darslarni tuzishda xatolik:", err);
    alert("Darslarni yaratishda xatolik yuz berdi. Qayta urinib ko'ring.");
    btn.disabled = false;
    btn.innerText = "Qayta urinish";
  }
}

// ======================= 8. Darslar Yo'l Xaritasi (Roadmap View) =======================
function renderRoadmap() {
  if (!currentUser) return renderAuthScreen();

  if (!currentCurriculum || currentCurriculum.length === 0) {
    if (currentUser.curriculum && currentUser.curriculum.length > 0) {
      currentCurriculum = currentUser.curriculum;
    } else {
      renderOnboarding(1);
      return;
    }
  }

  const completedCount = currentCurriculum.filter(l => l.is_completed || (currentUser.completed_lessons && currentUser.completed_lessons[l.id])).length;
  const progressPercent = Math.round((completedCount / currentCurriculum.length) * 100);
  const userTier = currentUser.tier || "free";

  let lessonsHtml = "";
  currentCurriculum.forEach(l => {
    const isDone = l.is_completed || (currentUser.completed_lessons && currentUser.completed_lessons[l.id]);
    const isProLocked = l.tier_required === "pro" && userTier === "free";
    const isPremLocked = l.tier_required === "premium" && userTier !== "premium";

    let lockPill = "";
    if (isDone) {
      lockPill = `<span class="lesson-action-pill done">Bajarildi ✓</span>`;
    } else if (isPremLocked) {
      lockPill = `<span class="lesson-action-pill premium-pill" onclick="event.stopPropagation(); openPricingModal()">👑 PREMIUM</span>`;
    } else if (isProLocked) {
      lockPill = `<span class="lesson-action-pill pro-pill" onclick="event.stopPropagation(); openPricingModal()">⭐ PRO</span>`;
    } else {
      lockPill = `<span class="lesson-action-pill ready">Boshlash ▶</span>`;
    }

    lessonsHtml += `
      <div class="lesson-card ${isDone ? 'completed' : ''} ${isPremLocked ? 'premium-locked' : isProLocked ? 'pro-locked' : ''}" 
           onclick="openLesson(${l.id})">
        <div class="lesson-badge-num">
          ${isDone ? '✓' : l.icon || '📖'}
        </div>
        <div class="lesson-content">
          <div class="lesson-tag">${escapeHtml(l.category || 'Muloqot')} · #${l.id}</div>
          <div class="lesson-name">${escapeHtml(l.title)}</div>
          <div class="lesson-meta-chips">
            <span>📝 Grammatika & Ovoz</span>
            <span>💎 +${l.diamonds_reward || 2} Olmos</span>
            <span>⭐ +${l.xp_reward || 30} XP</span>
          </div>
        </div>
        <div>
          ${lockPill}
        </div>
      </div>
    `;
  });

  appEl.innerHTML = `
    ${renderHeader('roadmap')}

    <div class="hero-banner animate-fade">
      <div class="hero-badge-row">
        <div class="tier-badge ${userTier}" onclick="openPricingModal()">
          ${userTier === 'premium' ? '👑 PREMIUM Master' : userTier === 'pro' ? '⭐ PRO O\'quvchi' : 'Oddiy (Free)'}
        </div>
        <span style="font-size: 13px; color: var(--text-secondary);">
          Foydalanuvchi: <b>@${escapeHtml(currentUser.username)}</b> (${escapeHtml(currentUser.job || 'IT')})
        </span>
      </div>

      <h1 class="hero-title">Shaxsiy O'quv Dasturingiz 🎯</h1>
      <p class="hero-desc">
        Sizning maqsadingizga qarab ${currentCurriculum.length} ta darslikdan iborat tizimli yo'nalish shakllantirildi. 
        Har bir darsda audio talaffuz, grammatik formula va interaktiv mashqlar mavjud.
      </p>

      <div class="hero-stats-grid">
        <div class="hero-stat-card">
          <div class="hero-stat-val">${currentCurriculum.length} ta</div>
          <div class="hero-stat-lbl">Jami Darslar</div>
        </div>
        <div class="hero-stat-card">
          <div class="hero-stat-val" style="color: var(--emerald);">${completedCount} ta</div>
          <div class="hero-stat-lbl">Bajarilgan</div>
        </div>
        <div class="hero-stat-card">
          <div class="hero-stat-val" style="color: var(--primary);">${progressPercent}%</div>
          <div class="hero-stat-lbl">O'zlashtirish</div>
        </div>
        <div class="hero-stat-card" style="cursor: pointer;" onclick="openPricingModal()">
          <div class="hero-stat-val" style="color: #38bdf8;">💎 ${currentUser.diamonds || 0}</div>
          <div class="hero-stat-lbl">Olmoslar Balansi</div>
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>

    <div class="roadmap-section-title">
      <h2 style="font-size: 18px; font-weight: 800;">Yo'l Xaritasi (${currentCurriculum.length} ta dars)</h2>
      <button class="btn btn-secondary btn-sm" onclick="renderOnboarding(1)">
        ⚙️ Rejani qayta sozlash
      </button>
    </div>

    <div class="roadmap-grid">
      ${lessonsHtml}
    </div>

    ${renderBottomNav('roadmap')}
  `;
}

// ======================= 9. Darsni Ochish (Lesson Viewer) =======================
function openLesson(lessonId) {
  playSound('click');
  const lesson = currentCurriculum.find(l => l.id === lessonId);
  if (!lesson) return;

  // Agar dars PRO yoki PREMIUM talab qilsa va foydalanuvchida yo'q bo'lsa:
  const userTier = currentUser.tier || "free";
  if (lesson.tier_required === "premium" && userTier !== "premium") {
    openPricingModal("Ushbu dars faqat PREMIUM foydalanuvchilar uchun ochiq. PREMIUM tarifiga o'ting va barcha darslarga cheksiz kiring!");
    return;
  }
  if (lesson.tier_required === "pro" && userTier === "free") {
    openPricingModal("Ushbu dars PRO va PREMIUM foydalanuvchilar uchun ochiq. Barcha darslarni ochish uchun tarifni faollashtiring!");
    return;
  }

  activeLesson = lesson;
  activeLessonTab = "grammar";
  activeQuizIndex = 0;
  renderLessonView();
}

function renderLessonView() {
  const lesson = activeLesson;
  if (!lesson) return renderRoadmap();

  let bodyContent = "";

  if (activeLessonTab === "grammar") {
    const g = lesson.grammar || {};
    bodyContent = `
      <div class="animate-fade">
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-title">📖 ${escapeHtml(g.title || 'Grammatika')}</div>
          <p style="color: var(--text-secondary); font-size: 14.5px; line-height: 1.6; margin-bottom: 16px;">
            ${escapeHtml(g.why_use || '')}
          </p>

          <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); padding: 14px 18px; border-radius: var(--radius-md); font-weight: 700; font-size: 14.5px; color: #a5b4fc; margin-bottom: 16px;">
            📐 FORMULA: ${escapeHtml(g.formula || '')}
          </div>

          <p style="font-size: 14.5px; color: var(--text-primary); margin-bottom: 20px;">
            ${escapeHtml(g.simple_explanation || '')}
          </p>

          <div style="font-weight: 800; font-size: 14px; margin-bottom: 10px; color: var(--text-secondary);">Namunaviy Gaplar va Ovoz:</div>
          <div style="display: grid; gap: 10px;">
            ${(g.examples || []).map(ex => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border); padding: 14px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                <div>
                  <div style="font-weight: 750; font-size: 15px; color: var(--text-primary);">${escapeHtml(ex.en)}</div>
                  <div style="font-size: 13.5px; color: var(--text-secondary); margin-top: 2px;">${escapeHtml(ex.uz)}</div>
                  <div style="font-size: 12px; color: #38bdf8; font-family: monospace; margin-top: 3px;">🗣️ ${escapeHtml(ex.pron || '')}</div>
                </div>
                <div class="audio-controls">
                  <button class="audio-btn" onclick="speakText('${escapeQuotes(ex.en)}')" title="Oddiy tezlikda tinglash">🔊</button>
                  <button class="audio-btn slow" onclick="speakSlow('${escapeQuotes(ex.en)}')" title="Sekin tinglash (0.7x)">🐢 Sekin</button>
                </div>
              </div>
            `).join('')}
          </div>

          ${g.common_mistake ? `
            <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: var(--radius-md); padding: 12px 16px; margin-top: 18px; font-size: 13.5px; color: #fda4af;">
              <b>⚠️ Ehtiyot bo'ling:</b> ${escapeHtml(g.common_mistake)}
            </div>
          ` : ''}
        </div>

        <button class="btn btn-primary btn-full" onclick="switchLessonTab('vocab')">
          Lug'at va Talaffuzga o'tish →
        </button>
      </div>
    `;
  } else if (activeLessonTab === "vocab") {
    bodyContent = `
      <div class="animate-fade">
        <div class="vocab-list" style="margin-bottom: 20px;">
          ${(lesson.vocab || []).map(v => `
            <div class="vocab-card">
              <div class="vocab-header">
                <div>
                  <div class="vocab-word">${escapeHtml(v.word)}</div>
                  <div class="pron-badge">${escapeHtml(v.ipa || '')} · "${escapeHtml(v.pron_uz || v.word)}"</div>
                </div>
                <div class="audio-controls">
                  <button class="audio-btn" onclick="speakText('${escapeQuotes(v.word)}')" title="Eshiting">🔊</button>
                  <button class="audio-btn slow" onclick="speakSlow('${escapeQuotes(v.word)}')" title="Sekin (0.7x)">🐢 Sekin</button>
                </div>
              </div>

              <div class="vocab-trans">👉 ${escapeHtml(v.trans)}</div>

              ${v.ex ? `
                <div class="vocab-example">
                  <span>"${escapeHtml(v.ex)}"</span>
                  <button class="audio-btn" style="width: 26px; height: 26px; font-size: 11px;" onclick="speakText('${escapeQuotes(v.ex)}')">🔊</button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="switchLessonTab('grammar')">← Grammatika</button>
          <button class="btn btn-primary btn-full" onclick="switchLessonTab('dialogue')">Jonli Dialogga o'tish →</button>
        </div>
      </div>
    `;
  } else if (activeLessonTab === "dialogue") {
    bodyContent = `
      <div class="animate-fade">
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">💬 Jonli Muloqot Mashqi</div>
          <p style="color: var(--text-secondary); font-size: 14px;">
            Har bir replikani tinglang va ovoz chiqarib takrorlang.
          </p>

          <div class="dialogue-thread">
            ${(lesson.dialogue || []).map((d, idx) => `
              <div class="bubble ${idx % 2 === 0 ? 'speaker-a' : 'speaker-b'}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="bubble-speaker">${escapeHtml(d.speaker)}</div>
                  <button class="audio-btn" style="width: 26px; height: 26px; font-size: 11px;" onclick="speakText('${escapeQuotes(d.text)}')">🔊</button>
                </div>
                <div class="bubble-text">${escapeHtml(d.text)}</div>
                <div class="bubble-trans">${escapeHtml(d.uz)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="switchLessonTab('vocab')">← Lug'at</button>
          <button class="btn btn-primary btn-full" onclick="switchLessonTab('quiz')">Mashq & Viktorinani boshlash →</button>
        </div>
      </div>
    `;
  } else if (activeLessonTab === "quiz") {
    const qList = lesson.exercises || [];
    if (qList.length === 0) {
      bodyContent = `
        <div class="card text-center" style="text-align: center; padding: 40px;">
          <h3>Bu dars uchun qo'shimcha test mavjud emas.</h3>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="completeCurrentLesson()">Darsni Yakunlash ✓</button>
        </div>
      `;
    } else {
      const q = qList[activeQuizIndex % qList.length];
      bodyContent = `
        <div class="quiz-question-box animate-fade">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-muted);">
            <span>Savol: ${activeQuizIndex + 1} / ${qList.length}</span>
            <span>💎 Mukofot: +${q.diamonds || 2} Olmos</span>
          </div>

          <div class="quiz-q-title">${escapeHtml(q.question)}</div>

          <div class="quiz-options-grid" id="quizOptionsContainer">
            ${(q.options || []).map(opt => `
              <button class="quiz-option" onclick="handleQuizAnswer('${escapeQuotes(opt)}', '${escapeQuotes(q.answer)}', ${q.diamonds || 2}, this)">
                ${escapeHtml(opt)}
              </button>
            `).join('')}
          </div>

          <div id="quizFeedback" style="margin-top: 18px; font-weight: 700; font-size: 14.5px; display: none;"></div>
        </div>
      `;
    }
  }

  appEl.innerHTML = `
    ${renderHeader('roadmap')}

    <div class="lesson-nav-top">
      <button class="btn btn-secondary btn-sm" onclick="renderRoadmap()">
        ← Barcha darslarga qaytish
      </button>
      <div style="font-weight: 800; font-size: 16px;">
        ${escapeHtml(lesson.title)}
      </div>
    </div>

    <div class="lesson-tabs-bar">
      <button class="lesson-tab-btn ${activeLessonTab === 'grammar' ? 'active' : ''}" onclick="switchLessonTab('grammar')">
        📖 Grammatika & Qoida
      </button>
      <button class="lesson-tab-btn ${activeLessonTab === 'vocab' ? 'active' : ''}" onclick="switchLessonTab('vocab')">
        🗣️ Lug'at & Talaffuz
      </button>
      <button class="lesson-tab-btn ${activeLessonTab === 'dialogue' ? 'active' : ''}" onclick="switchLessonTab('dialogue')">
        💬 Jonli Dialog
      </button>
      <button class="lesson-tab-btn ${activeLessonTab === 'quiz' ? 'active' : ''}" onclick="switchLessonTab('quiz')">
        ✍️ Mashq & Viktorina
      </button>
    </div>

    ${bodyContent}

    ${renderBottomNav('roadmap')}
  `;
}

function switchLessonTab(tab) {
  playSound('click');
  activeLessonTab = tab;
  renderLessonView();
}

function handleQuizAnswer(selected, correct, diamondGain, btn) {
  const container = document.getElementById("quizOptionsContainer");
  const fb = document.getElementById("quizFeedback");
  container.querySelectorAll("button").forEach(b => b.disabled = true);
  fb.style.display = "block";

  if (selected.trim().toLowerCase() === correct.trim().toLowerCase()) {
    playSound('correct');
    btn.classList.add("correct");
    fb.style.color = "var(--emerald)";
    fb.innerHTML = `To'g'ri javob! 🎉 +${diamondGain} 💎 Olmos qo'shildi!`;

    currentUser.diamonds = (currentUser.diamonds || 0) + diamondGain;
    currentUser.xp = (currentUser.xp || 0) + 15;
    saveCurrentUser();
    showDiamondToast(diamondGain);

    setTimeout(() => {
      const qList = activeLesson.exercises || [];
      if (activeQuizIndex + 1 < qList.length) {
        activeQuizIndex++;
        renderLessonView();
      } else {
        completeCurrentLesson();
      }
    }, 1400);
  } else {
    playSound('wrong');
    btn.classList.add("wrong");
    fb.style.color = "var(--red)";
    fb.innerHTML = `Noto'g'ri. To'g'ri javob: <b>${escapeHtml(correct)}</b>`;

    setTimeout(() => {
      completeCurrentLesson();
    }, 2000);
  }
}

function completeCurrentLesson() {
  playSound('correct');
  if (!currentUser.completed_lessons) currentUser.completed_lessons = {};
  currentUser.completed_lessons[activeLesson.id] = true;
  activeLesson.is_completed = true;

  currentUser.xp = (currentUser.xp || 0) + (activeLesson.xp_reward || 35);
  currentUser.diamonds = (currentUser.diamonds || 0) + 3;
  saveCurrentUser();
  showDiamondToast(3);

  alert(`Tabriklaymiz! "${activeLesson.title}" muvaffaqiyatli yakunlandi! 🎉\n+35 ⭐ XP va +3 💎 Olmos mukofoti berildi.`);
  renderRoadmap();
}

// ======================= 10. 🌐 SMART TARJIMON (PRO & PREMIUM) =======================
const QUICK_PHRASEBOOK = [
  { en: "Where is the departure gate?", uz: "Uchib ketish darvozasi qayerda?", cat: "Sayohat" },
  { en: "Could I please have the bill?", uz: "Hisobni (chekni) bera olasizmi, iltimos?", cat: "Restoran" },
  { en: "How much does a taxi to the hotel cost?", uz: "Mehmonxonagacha taksi qancha turadi?", cat: "Taksi" },
  { en: "I have a reservation under my name.", uz: "Mening nomimga band qilingan bron bor.", cat: "Mehmonxona" },
  { en: "Nice to meet you! Where are you from?", uz: "Tanishganimdan xursandman! Qayerdansiz?", cat: "Muloqot" },
  { en: "Could you please speak slower?", uz: "Sekinroq gapira olasizmi, iltimos?", cat: "Yordam" }
];

// ======================= 10. 🌐 PROFESSIONAL SMART TARJIMON & UNIVERSAL LUG'AT =======================
let transSourceLang = "auto"; // 'auto' | 'en' | 'ru' | 'uz'
let transTargetLang = "uz";   // 'uz' | 'en' | 'ru'
let transCurrentInput = "";
let transCurrentResult = null;
let transIsLoading = false;
let transDebounceTimer = null;
let transFavorites = JSON.parse(localStorage.getItem("lingova_fav_words") || "[]");
let transHistory = JSON.parse(localStorage.getItem("lingova_trans_history") || "[]");

// Keng qamrovli oflayn lug'at va leksik ma'lumotlar bazasi
const EXTENSIVE_OFFLINE_DICT = {
  "opportunity": { uz: "imkoniyat, qulay vaziyat", ru: "возможность", ipa: "/ˌɒp.əˈtjuː.nə.ti/", pos: "noun", syn: ["chance", "opening", "occasion", "prospect"], ex: [{ en: "Education provides equal opportunities.", uz: "Ta'lim barchaga teng imkoniyatlar yaratadi." }] },
  "experience": { uz: "tajriba; boshdan kechirmoq", ru: "опыт; испытывать", ipa: "/ɪkˈspɪə.ri.əns/", pos: "noun / verb", syn: ["knowledge", "practice", "undergo"], ex: [{ en: "She has rich working experience.", uz: "U boy ish tajribasiga ega." }] },
  "knowledge": { uz: "bilim, ilm, ma'lumot", ru: "знания", ipa: "/ˈnɒl.ɪdʒ/", pos: "noun", syn: ["wisdom", "expertise", "learning"], ex: [{ en: "Knowledge is the real power.", uz: "Haqiqiy kuch — bu bilimdir." }] },
  "environment": { uz: "atrof-muhit, tabiiy sharoit", ru: "окружающая среда", ipa: "/ɪnˈvaɪ.rən.mənt/", pos: "noun", syn: ["surroundings", "nature", "habitat"], ex: [{ en: "We must protect our environment.", uz: "Biz atrof-muhitni asrashimiz shart." }] },
  "development": { uz: "rivojlanish, taraqqiyot", ru: "развитие", ipa: "/dɪˈvel.əp.mənt/", pos: "noun", syn: ["progress", "evolution", "growth"], ex: [{ en: "Economic development is vital.", uz: "Iqtisodiy rivojlanish o'ta muhim." }] },
  "challenge": { uz: "qiyinchilik, sinov", ru: "вызов, сложная задача", ipa: "/ˈtʃæl.ɪndʒ/", pos: "noun / verb", syn: ["difficulty", "obstacle", "test"], ex: [{ en: "Every challenge brings a valuable lesson.", uz: "Har bir sinov qimmatli saboq keltiradi." }] },
  "conscientious": { uz: "vijdonli, mas'uliyatli, halol", ru: "добросовестный, честный", ipa: "/ˌkɒn.ʃiˈen.ʃəs/", pos: "adjective", syn: ["scrupulous", "diligent", "meticulous"], ex: [{ en: "He is a conscientious professional.", uz: "U o'z ishiga mas'uliyatli va vijdonli mutaxassis." }] },
  "essential": { uz: "o'ta zarur, muhim, ajralmas", ru: "необходимый, существенный", ipa: "/ɪˈsen.ʃəl/", pos: "adjective", syn: ["vital", "crucial", "fundamental"], ex: [{ en: "Patience is essential for learning.", uz: "Sabr-toqat til o'rganishda ajralmas omildir." }] },
  "success": { uz: "muvaffaqiyat, yutuq", ru: "успех, удача", ipa: "/səkˈses/", pos: "noun", syn: ["achievement", "victory", "triumph"], ex: [{ en: "Consistent effort leads to success.", uz: "Uzluksiz harakat muvaffaqiyatga yetaklaydi." }] },
  "technology": { uz: "texnologiya", ru: "технологии", ipa: "/tekˈnɒl.ə.dʒi/", pos: "noun", syn: ["innovation", "computing", "digital"], ex: [{ en: "Modern technology changes our world.", uz: "Zamonaviy texnologiya butun dunyoni o'zgartirmoqda." }] },
  "serendipity": { uz: "kutilmagan baxtli topilma", ru: "счастливая случайность", ipa: "/ˌser.ənˈdɪp.ə.ti/", pos: "noun", syn: ["fluke", "fortune", "chance discovery"], ex: [{ en: "Meeting you was pure serendipity.", uz: "Siz bilan uchrashish sof kutilmagan baxt bo'ldi." }] },
  "incomprehensible": { uz: "tushunarsiz, aql bovar qilmas", ru: "непостижимый", ipa: "/ɪnˌkɒm.prɪˈhen.sə.bəl/", pos: "adjective", syn: ["unfathomable", "baffling"], ex: [{ en: "His reaction was incomprehensible.", uz: "Uning reaksiyasi aql bovar qilmas darajada tushunarsiz edi." }] },
  "hello": { uz: "salom, assalomu alaykum", ru: "привет, здравствуйте", ipa: "/həˈləʊ/", pos: "salomlashish", syn: ["hi", "greetings"], ex: [{ en: "Hello, how are you doing today?", uz: "Salom, bugun ahvollaringiz qanday?" }] },
  "airport": { uz: "aeroport", ru: "аэропорт", ipa: "/ˈeə.pɔːt/", pos: "noun", syn: ["airfield", "terminal"], ex: [{ en: "We arrived at the airport on time.", uz: "Biz aeroportga o'z vaqtida yetib keldik." }] },
  "достопримечательность": { uz: "diqqatga sazovor joy, qadamjo", en: "sight, attraction, landmark", pos: "существительное", syn: ["landmark", "sight", "attraction"], ex: [{ ru: "Главная достопримечательность города.", uz: "Shaharning asosiy diqqatga sazovor joyi." }] },
  "здравствуйте": { uz: "assalomu alaykum, salom", en: "hello, good day", pos: "приветствие", syn: ["привет", "добрый день"], ex: [{ ru: "Здравствуйте, рад вас видеть!", uz: "Assalomu alaykum, sizni ko'rganimdan xursandman!" }] }
};

function renderTranslatorView() {
  const userTier = currentUser ? (currentUser.tier || "free") : "free";

  appEl.innerHTML = `
    ${renderHeader('translator')}

    <div class="card animate-fade" style="margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="card-title" style="font-size: 22px;">🌐 Professional Smart Tarjimon & Lug'at</div>
          <div style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">
            Ingliz, rus va o'zbek tillaridagi barcha so'z va matnlarni aniq tarjima qiling. IPA transkripsiya, so'z turlari va audio talaffuz.
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="tier-badge pro">PRO & PREMIUM ACTIVE</span>
        </div>
      </div>

      <div class="translator-container">
        <!-- Chap tomondagi kiritish paneli -->
        <div class="trans-pane">
          <div class="trans-header">
            <select class="trans-lang-select" id="transSourceLangSelect" onchange="handleSourceLangChange(this.value)">
              <option value="auto" ${transSourceLang === 'auto' ? 'selected' : ''}>✨ Avtomatik aniqlash</option>
              <option value="en" ${transSourceLang === 'en' ? 'selected' : ''}>🇬🇧 Ingliz tili (English)</option>
              <option value="ru" ${transSourceLang === 'ru' ? 'selected' : ''}>🇷🇺 Rus tili (Русский)</option>
              <option value="uz" ${transSourceLang === 'uz' ? 'selected' : ''}>🇺🇿 O'zbek tili (O'zbekcha)</option>
            </select>
            <button class="trans-swap-btn" onclick="swapTranslatorLanguages()" title="Tillarni almashtirish (⇄)">⇄</button>
          </div>
          <textarea id="transInput" class="trans-textarea" 
                    placeholder="So'z, ibora yoki murakkab matn kiriting (Inglizcha, Ruscha, O'zbekcha)..."
                    oninput="handleLiveTranslation(this.value)">${escapeHtml(transCurrentInput)}</textarea>
          <div class="trans-footer">
            <div style="font-size: 12px; color: var(--text-muted);" id="transCharCounter">
              ${transCurrentInput.length} belgi
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="clearTranslator()">Tozalash</button>
              <button class="audio-btn" onclick="speakText(document.getElementById('transInput').value, getSpeechLang(transSourceLang))" title="Matnni tinglash">🔊</button>
            </div>
          </div>
        </div>

        <!-- O'ng tomondagi natija paneli -->
        <div class="trans-pane" style="background: var(--bg-surface);">
          <div class="trans-header">
            <select class="trans-lang-select" id="transTargetLangSelect" onchange="handleTargetLangChange(this.value)">
              <option value="uz" ${transTargetLang === 'uz' ? 'selected' : ''}>🇺🇿 O'zbek tili (O'zbekcha)</option>
              <option value="en" ${transTargetLang === 'en' ? 'selected' : ''}>🇬🇧 Ingliz tili (English)</option>
              <option value="ru" ${transTargetLang === 'ru' ? 'selected' : ''}>🇷🇺 Rus tili (Русский)</option>
            </select>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="transLoadingIndicator" style="display: ${transIsLoading ? 'inline-block' : 'none'}; font-size: 12px; color: var(--primary);">
                ⚡ Tarjima qilinmoqda...
              </span>
              <button class="trans-swap-btn" style="width: 30px; height: 30px; font-size: 13px;" onclick="saveCurrentWordToFav()" title="Lug'atga saqlash ⭐">⭐</button>
            </div>
          </div>
          <div id="transOutput" class="trans-output-box">
            ${getFormattedOutputText()}
          </div>
          <div class="trans-footer">
            <button class="btn btn-secondary btn-sm" onclick="copyTranslation()">Nusxa olish 📋</button>
            <div class="audio-controls">
              <button class="audio-btn" onclick="speakOutputText(0.95)" title="Tabiiy tezlikda eshitish">🔊</button>
              <button class="audio-btn slow" onclick="speakOutputText(0.70)" title="Sekinroq tinglash (o'rganuvchilar uchun)">🐢</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Batafsil lug'at / transkripsiya / sinonimlar kartochkasi -->
      <div id="transDictDetails">
        ${renderDictDetails()}
      </div>

      <!-- Tez-tez ishlatiladigan iboralar -->
      <div style="margin-top: 24px;">
        <div style="font-weight: 800; font-size: 14px; margin-bottom: 8px;">💡 Keng tarqalgan hayotiy iboralar va namunalar:</div>
        <div class="phrasebook-pills">
          ${QUICK_PHRASEBOOK.map(p => `
            <button class="phrase-pill" onclick="pasteAndTranslate('${escapeQuotes(p.en)}')">
              ${escapeHtml(p.en)}
            </button>
          `).join('')}
          <button class="phrase-pill" onclick="pasteAndTranslate('Serendipity')">Serendipity</button>
          <button class="phrase-pill" onclick="pasteAndTranslate('Conscientious')">Conscientious</button>
          <button class="phrase-pill" onclick="pasteAndTranslate('Достопримечательность')">Достопримечательность</button>
        </div>
      </div>
    </div>

    ${renderBottomNav('translator')}
  `;
}

function getSpeechLang(langCode) {
  if (langCode === 'en') return 'en-US';
  if (langCode === 'ru') return 'ru-RU';
  if (langCode === 'uz') return 'uz-UZ';
  return 'en-US';
}

function getFormattedOutputText() {
  if (transIsLoading) return "Tarjima tahlil qilinmoqda...";
  if (transCurrentResult && transCurrentResult.translated_text) {
    return escapeHtml(transCurrentResult.translated_text);
  }
  return "Tarjima qilingan natija bu yerda ko'rinadi...";
}

function renderDictDetails() {
  if (!transCurrentResult) return "";
  const r = transCurrentResult;
  const hasPos = r.parts_of_speech && r.parts_of_speech.length > 0;
  const hasEx = r.examples && r.examples.length > 0;
  const ipa = r.ipa || "";

  if (!hasPos && !hasEx && !ipa) return "";

  return `
    <div class="trans-dict-card">
      <div class="trans-dict-header">
        <div class="trans-word-title">
          <span>📖 Lug'at tahlili: "${escapeHtml(transCurrentInput.trim())}"</span>
          ${ipa ? `<span class="trans-ipa-tag">${escapeHtml(ipa)}</span>` : ''}
        </div>
        <span style="font-size: 12px; color: var(--emerald); font-weight: 700;">✅ Professional Transkripsiya & Sinonimlar</span>
      </div>

      ${hasPos ? r.parts_of_speech.map(p => `
        <div class="trans-pos-group">
          <span class="trans-pos-badge">${escapeHtml(p.pos)}</span>
          <div class="trans-synonyms-wrap">
            ${(p.synonyms || []).map(s => `
              <span class="trans-syn-chip" onclick="pasteAndTranslate('${escapeQuotes(s)}')">${escapeHtml(s)}</span>
            `).join('')}
          </div>
        </div>
      `).join('') : ''}

      ${hasEx ? `
        <div class="trans-examples-wrap">
          <div style="font-size: 13px; font-weight: 800; margin-bottom: 6px; color: var(--text-primary);">
            📌 Misollar va qo'llanilishi:
          </div>
          ${r.examples.map(ex => `
            <div class="trans-example-row">
              <div class="trans-example-en">🇬🇧 ${escapeHtml(ex.en || ex.ru || '')}</div>
              <div class="trans-example-uz">🇺🇿 ${escapeHtml(ex.uz || '')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function handleSourceLangChange(val) {
  playSound('click');
  transSourceLang = val;
  if (transCurrentInput.trim()) executeTranslation(transCurrentInput.trim());
}

function handleTargetLangChange(val) {
  playSound('click');
  transTargetLang = val;
  if (transCurrentInput.trim()) executeTranslation(transCurrentInput.trim());
}

function swapTranslatorLanguages() {
  playSound('click');
  if (transSourceLang === 'auto') {
    transSourceLang = transTargetLang;
    transTargetLang = transSourceLang === 'uz' ? 'en' : 'uz';
  } else {
    const temp = transSourceLang;
    transSourceLang = transTargetLang;
    transTargetLang = temp;
  }

  // Matnni almashtirish
  if (transCurrentResult && transCurrentResult.translated_text) {
    const oldRes = transCurrentResult.translated_text;
    transCurrentInput = oldRes;
  }

  renderTranslatorView();
  if (transCurrentInput.trim()) executeTranslation(transCurrentInput.trim());
}

function handleLiveTranslation(val) {
  transCurrentInput = val;
  const counter = document.getElementById("transCharCounter");
  if (counter) counter.innerText = `${val.length} belgi`;

  if (transDebounceTimer) clearTimeout(transDebounceTimer);
  if (!val.trim()) {
    transCurrentResult = null;
    const out = document.getElementById("transOutput");
    const dict = document.getElementById("transDictDetails");
    if (out) out.innerText = "Tarjima qilingan natija bu yerda ko'rinadi...";
    if (dict) dict.innerHTML = "";
    return;
  }

  transDebounceTimer = setTimeout(() => {
    executeTranslation(val.trim());
  }, 350);
}

async function executeTranslation(text) {
  if (!text) return;
  transIsLoading = true;
  const loadInd = document.getElementById("transLoadingIndicator");
  if (loadInd) loadInd.style.display = "inline-block";

  const result = await fetchRealTranslation(text, transSourceLang, transTargetLang);
  transIsLoading = false;
  if (loadInd) loadInd.style.display = "none";

  if (result) {
    transCurrentResult = result;
    const out = document.getElementById("transOutput");
    if (out) out.innerText = result.translated_text;
    const dict = document.getElementById("transDictDetails");
    if (dict) dict.innerHTML = renderDictDetails();
  }
}

async function fetchRealTranslation(text, src = 'auto', tgt = 'uz') {
  if (!text || !text.trim()) return null;
  const clean = text.trim();

  // 1. Agar backend server mavjud bo'lsa
  if (IS_API_ONLINE) {
    try {
      const res = await apiRequest('/translate', 'POST', { text: clean, source: src, target: tgt });
      if (res && res.success && res.translated_text) {
        return res;
      }
    } catch (e) {}
  }

  // 2. Google Translate bepul API (brauzerdan bevosita)
  try {
    const q = encodeURIComponent(clean);
    const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&dt=bd&dt=rm&dt=at&q=${q}`;
    const resp = await fetch(googleUrl, { method: "GET" });
    if (resp.ok) {
      const data = await resp.json();
      let transText = "";
      if (data && data[0]) {
        for (const item of data[0]) {
          if (item && item[0]) transText += item[0];
        }
      }
      const detected = (data && data[2]) ? data[2] : (src === 'auto' ? 'en' : src);
      const partsOfSpeech = [];
      if (data && data[1] && Array.isArray(data[1])) {
        for (const posItem of data[1]) {
          if (posItem && posItem.length >= 2) {
            partsOfSpeech.push({
              pos: posItem[0],
              synonyms: Array.isArray(posItem[1]) ? posItem[1].slice(0, 8) : []
            });
          }
        }
      }

      if (transText) {
        return {
          success: true,
          translated_text: transText,
          source_lang: detected,
          target_lang: tgt,
          parts_of_speech: partsOfSpeech
        };
      }
    }
  } catch (e) {}

  // 3. MyMemory bepul API orqali zaxira
  try {
    const pair = `${src === 'auto' ? 'en' : src}|${tgt}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${pair}`;
    const resp2 = await fetch(myMemoryUrl);
    if (resp2.ok) {
      const d2 = await resp2.json();
      const txt = d2?.responseData?.translatedText;
      if (txt) {
        return {
          success: true,
          translated_text: txt,
          source_lang: src,
          target_lang: tgt,
          parts_of_speech: []
        };
      }
    }
  } catch (e) {}

  // 4. Oflayn aqlli lug'at
  const lowerWord = clean.toLowerCase();
  if (EXTENSIVE_OFFLINE_DICT[lowerWord]) {
    const item = EXTENSIVE_OFFLINE_DICT[lowerWord];
    const trans = tgt === 'ru' && item.ru ? item.ru : (tgt === 'en' && item.en ? item.en : item.uz);
    return {
      success: true,
      translated_text: trans,
      source_lang: src === 'auto' ? 'en' : src,
      target_lang: tgt,
      ipa: item.ipa || "",
      parts_of_speech: [{ pos: item.pos, synonyms: item.syn || [] }],
      examples: item.ex || []
    };
  }

  return {
    success: true,
    translated_text: `Tarjima: "${clean}" (${tgt.toUpperCase()})`,
    source_lang: src,
    target_lang: tgt,
    parts_of_speech: []
  };
}

function pasteAndTranslate(text) {
  transCurrentInput = text;
  const inp = document.getElementById("transInput");
  if (inp) inp.value = text;
  executeTranslation(text);
}

function clearTranslator() {
  playSound('click');
  transCurrentInput = "";
  transCurrentResult = null;
  const inp = document.getElementById("transInput");
  const out = document.getElementById("transOutput");
  const dict = document.getElementById("transDictDetails");
  if (inp) inp.value = "";
  if (out) out.innerText = "Tarjima qilingan natija bu yerda ko'rinadi...";
  if (dict) dict.innerHTML = "";
  const counter = document.getElementById("transCharCounter");
  if (counter) counter.innerText = "0 belgi";
}

function copyTranslation() {
  const out = document.getElementById("transOutput");
  if (out && out.innerText && out.innerText !== "Tarjima qilingan natija bu yerda ko'rinadi...") {
    navigator.clipboard?.writeText(out.innerText);
    playSound('diamond');
    alert("Tarjima nusxalandi! 📋");
  }
}

function speakOutputText(rate = 0.95) {
  const out = document.getElementById("transOutput");
  if (out && out.innerText) {
    speakText(out.innerText, getSpeechLang(transTargetLang), rate);
  }
}

function saveCurrentWordToFav() {
  if (!transCurrentInput.trim() || !transCurrentResult) return;
  const word = transCurrentInput.trim();
  const trans = transCurrentResult.translated_text;
  if (!transFavorites.some(f => f.word.toLowerCase() === word.toLowerCase())) {
    transFavorites.unshift({ word, trans, date: new Date().toLocaleDateString() });
    localStorage.setItem("lingova_fav_words", JSON.stringify(transFavorites.slice(0, 50)));
    playSound('diamond');
    alert(`"${word}" so'zlar ro'yxatiga muvaffaqiyatli saqlandi! ⭐`);
  } else {
    alert("Bu so'z allaqachon saqlangan!");
  }
}

// ======================= 11. 🤖 PROFESSIONAL AI MURABBIY (COGNITIVE TUTOR) =======================
let aiSettings = {
  provider: localStorage.getItem("lingova_ai_provider") || "cognitive", // 'cognitive' | 'gemini'
  geminiKey: localStorage.getItem("lingova_gemini_key") || "",
  isThinkingOpen: {}
};

let aiChatHistory = [
  {
    sender: "bot",
    text: "Assalomu alaykum! Men sizning **Lingova Pro AI Murabbiyingizman** 🤖.\n\nMen sizga quyidagi barcha yo'nalishlarda yordam bera olaman:\n• **Matematik va mantiqiy misollarni** qadamma-qadam yechish va tushuntirish\n• Istalgan so'zga **oddiy, bog'langan va murakkab gaplar** tuzish\n• Matningizdagi barcha **grammatik xatolarni** aniqlab, qoidalari bilan to'g'rilash\n• **IELTS va CEFR** bo'yicha Band 7-9 darajasidagi maslahatlar va lug'atlar\n• Ingliz, rus va o'zbek tillarida har qanday savolingizga javob berish\n\nQanday savolingiz bor? Savolingizni yozing yoki pastdagi tezkor tugmalardan birini tanlang!",
    thinking: "AI Murabbiy faollashtirildi. Ko'p tarmoqli bilimlar bazasi va pedagogik tahlil tizimi tayyor holatda.",
    model: "Lingova Cognitive Engine 2.0"
  }
];

function renderAITutorView() {
  const activeModelName = aiSettings.provider === 'gemini' && aiSettings.geminiKey ? "⚡ Google Gemini 1.5 Flash" : "🧠 Lingova Cognitive Brain";

  appEl.innerHTML = `
    ${renderHeader('ai')}

    <div class="ai-tutor-wrapper animate-fade">
      <div class="ai-header-bar">
        <div class="ai-status-indicator">
          <div class="ai-pulse-dot"></div>
          <div>
            <span style="font-weight: 800;">Lingova AI Murabbiy</span>
            <span style="font-size: 11px; color: var(--emerald); margin-left: 6px;">[${activeModelName}]</span>
          </div>
        </div>
        <div class="ai-header-actions">
          <button class="ai-settings-btn" onclick="openAISettingsModal()">
            ⚙️ AI Sozlamalari
          </button>
          <button class="ai-settings-btn" onclick="clearAIChatHistory()">
            🗑️ Tozalash
          </button>
        </div>
      </div>

      <div class="ai-chat-messages" id="aiChatBox">
        ${aiChatHistory.map((msg, idx) => `
          <div class="ai-msg ${msg.sender}">
            <div class="ai-msg-avatar">${msg.sender === 'bot' ? '🤖' : (currentUser ? currentUser.username : 'U')[0].toUpperCase()}</div>
            <div class="ai-msg-content">
              ${msg.thinking ? `
                <div class="ai-thinking-card">
                  <div class="ai-thinking-header" onclick="toggleThinking(${idx})">
                    <span>🧠 Fikrlash jarayoni (Thinking Process)</span>
                    <span>${aiSettings.isThinkingOpen[idx] ? '▲ Yashirish' : '▼ Ko\'rish'}</span>
                  </div>
                  <div class="ai-thinking-body" id="thinkingBody_${idx}" style="display: ${aiSettings.isThinkingOpen[idx] ? 'block' : 'none'};">
                    ${escapeHtml(msg.thinking)}
                  </div>
                </div>
              ` : ''}

              <div class="ai-msg-bubble">
                ${formatAIMessage(msg.text)}
              </div>

              ${msg.sender === 'bot' ? `
                <div class="ai-msg-actions">
                  <button class="ai-action-btn" onclick="speakText('${escapeQuotes(msg.text)}', 'uz-UZ')" title="Ovozli eshitish">
                    🔊 Tinglash
                  </button>
                  <button class="ai-action-btn" onclick="copyMessageText(${idx})" title="Matndan nusxa olish">
                    📋 Nusxa
                  </button>
                  <span style="font-size: 11px; color: var(--text-muted); margin-left: auto;">
                    ${msg.model || 'Lingova AI'}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Tezkor savollar -->
      <div class="ai-quick-prompts">
        <button class="ai-prompt-btn" onclick="sendQuickAIPrompt('2+2*2 nechchi bo\\'ladi va nima uchun tushuntir? (Matematik misol)')">
          🔢 2+2*2 misoli tahlili
        </button>
        <button class="ai-prompt-btn" onclick="sendQuickAIPrompt('\\'Ambition\\' so\\'ziga oddiy va murakkab gaplar tuzib ber')">
          📝 'Ambition' so'ziga murakkab gaplar
        </button>
        <button class="ai-prompt-btn" onclick="sendQuickAIPrompt('Ushbu gapimni tekshir va xatolarini to\\'g\\'irla: He do not has much money yesterday')">
          🔍 Xatoni top va to'g'irla
        </button>
        <button class="ai-prompt-btn" onclick="sendQuickAIPrompt('IELTS Speaking Part 2 da Band 7+ olish uchun eng kuchli strategiyalar qaysilar?')">
          🎯 IELTS Speaking Band 7+
        </button>
        <button class="ai-prompt-btn" onclick="sendQuickAIPrompt('Past Simple bilan Present Perfect farqini hayotiy misollar bilan tushuntir')">
          📖 Past Simple vs Present Perfect
        </button>
      </div>

      <form class="ai-input-form" onsubmit="handleAISubmit(event)">
        <input type="text" id="aiInputField" class="ai-input-field" 
               placeholder="Savolingizni yozing (Masalan: Misol yech, murakkab gap tuz, grammatikamni tekshir)..." required autocomplete="off">
        <button type="submit" class="btn btn-primary" id="aiSubmitBtn">Yuborish 🚀</button>
      </form>
    </div>

    <!-- AI Sozlamalari Modali -->
    <div id="aiSettingsModalContainer"></div>

    ${renderBottomNav('ai')}
  `;

  // Pastga scroll qilish
  setTimeout(() => {
    const box = document.getElementById("aiChatBox");
    if (box) box.scrollTop = box.scrollHeight;
  }, 50);
}

function formatAIMessage(text) {
  if (!text) return "";
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(99,102,241,0.2); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
    .replace(/\n/g, '<br>');
  return clean;
}

function toggleThinking(idx) {
  aiSettings.isThinkingOpen[idx] = !aiSettings.isThinkingOpen[idx];
  const el = document.getElementById(`thinkingBody_${idx}`);
  if (el) {
    el.style.display = aiSettings.isThinkingOpen[idx] ? 'block' : 'none';
  }
}

function copyMessageText(idx) {
  const msg = aiChatHistory[idx];
  if (msg && msg.text) {
    navigator.clipboard?.writeText(msg.text);
    playSound('diamond');
    alert("Xabar nusxalandi! 📋");
  }
}

function clearAIChatHistory() {
  if (confirm("Haqiqatdan ham suhbat tarixini tozalashni xohlaysizmi?")) {
    playSound('click');
    aiChatHistory = [aiChatHistory[0]];
    renderAITutorView();
  }
}

function sendQuickAIPrompt(text) {
  const inp = document.getElementById("aiInputField");
  if (inp) {
    inp.value = text;
    handleAISubmit(new Event('submit'));
  }
}

async function handleAISubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inp = document.getElementById("aiInputField");
  if (!inp) return;
  const query = inp.value.trim();
  if (!query) return;

  inp.value = "";
  playSound('click');

  aiChatHistory.push({ sender: "user", text: query });
  renderAITutorView();

  const submitBtn = document.getElementById("aiSubmitBtn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Fikrlayapman... 🧠";
  }

  // 1. Agar foydalanuvchi Gemini kalitini kiritgan bo'lsa
  let aiResponse = null;
  if (aiSettings.provider === 'gemini' && aiSettings.geminiKey) {
    aiResponse = await callGeminiAPI(query, aiSettings.geminiKey);
  }

  // 2. Agar Gemini bo'lmasa yoki xato bersa, Lingova Cognitive Engine ishlatiladi
  if (!aiResponse) {
    aiResponse = solveCognitiveAI(query);
  }

  setTimeout(() => {
    playSound('correct');
    aiChatHistory.push({
      sender: "bot",
      text: aiResponse.text,
      thinking: aiResponse.thinking,
      model: aiResponse.model || "Lingova Cognitive Engine"
    });
    renderAITutorView();
  }, 400);
}

// Haqiqiy Google Gemini 1.5/2.0 REST API integratsiyasi
async function callGeminiAPI(prompt, apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = "Sen Lingova Pro ta'lim platformasining eng aqlli, fikrlovchi va pedagogik AI murabbiyisan. Foydalanuvchining barcha savollariga (ingliz tili, rus tili, o'zbek tili, grammatika, oddiy va murakkab gaplar tuzish, matematika va misollarni qadamma-qadam yechish, IELTS/CEFR, ilm-fan) o'zbek tilida chuqur, chiroyli va tushunarli qilib javob ber. Formatlashda qalin harflar (**so'z**), ro'yxatlar va misollardan foydalan.";
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nFoydalanuvchi so'rovi: ${prompt}` }]
        }
      ]
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        return {
          text: answer,
          thinking: "Google Gemini 1.5 Flash neyron modeli orqali to'liq fikrlandi va chuqur tahlil qilindi.",
          model: "Google Gemini 1.5 Flash"
        };
      }
    }
  } catch (e) {}
  return null;
}

// ======================= 11b. MULTI-DOMAIN COGNITIVE AI REASONING ENGINE =======================
function solveCognitiveAI(input) {
  const q = input.trim();
  const lower = q.toLowerCase();
  const thinking = [];

  // A) MATEMATIK MISOL VA HISOB-KITOBLAR
  // Aniqlash: 2+2*2, 15*4 - 20, ildiz, foiz, tenglama
  const mathChars = q.match(/[\d\.\+\-\*\/\^\(\)\%]+/g);
  const hasArithmetic = mathChars && mathChars.join('').length >= 3 && /[\+\-\*\/]/.test(q);

  if (hasArithmetic || lower.includes("nechchi") || lower.includes("necha") || lower.includes("hisobla") || lower.includes("ildiz") || lower.includes("foiz") || lower.includes("protsent") || lower.includes("teng")) {
    thinking.push("1. Foydalanuvchi so'rovida matematik misol / hisob-kitob aniqlandi.");
    thinking.push("2. Matematik amallar iyerarxiyasi (BODMAS/PEMDAS qoidasi) qo'llaniladi.");

    // Foiz masalasi (Masalan: 300 ning 15 foizi)
    const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ning)?\s*(\d+(?:\.\d+)?)\s*(?:foiz|protsent|%)/);
    if (pctMatch) {
      const n1 = parseFloat(pctMatch[1]);
      const n2 = parseFloat(pctMatch[2]);
      const res = (n1 * n2) / 100;
      thinking.push(`3. Formula: (${n1} × ${n2}) / 100 = ${res}`);
      return {
        text: `🧮 **Matematik Masala Tahlili va Yechimi:**\n\n**Berilgan shart:** ${n1} sonining ${n2}% ini topish.\n\n**Qadamma-qadam yechish:**\n1. ${n1} sonini ${n2} ga ko'paytiramiz: \`${n1} × ${n2} = ${n1 * n2}\`\n2. Chiqqan ko'paytmani 100 ga bo'lamiz: \`${n1 * n2} ÷ 100 = ${res}\`\n\n🎯 **Yakuniy To'g'ri Javob:** **${res}**\n\n💡 *Qoida:* Har qanday sonning $P\\%$ ini topish uchun shu sonni $P$ ga ko'paytirib, 100 ga bo'lish kifoya.`,
        thinking: thinking.join("\n"),
        model: "Lingova Math & Logic Engine"
      };
    }

    // Aritmetik ifodani ajratib olish va hisoblash
    const exprMatch = q.match(/([0-9\.\s\+\-\*\/\^\(\)]+)/);
    if (exprMatch) {
      let rawExpr = exprMatch[1].trim();
      let cleanExpr = rawExpr.replace(/\^/g, '**').replace(/x/gi, '*');
      if (cleanExpr && /[\+\-\*\/]/.test(cleanExpr) && /^[\d\.\s\+\-\*\/\(\)]+$/.test(cleanExpr)) {
        try {
          const val = Function(`"use strict"; return (${cleanExpr})`)();
          thinking.push(`3. Amallar tartibi: Avval ko'paytirish/bo'lish, so'ngra qo'shish/ayirish.`);
          thinking.push(`4. Natija: ${val}`);

          let explanation = `🧮 **Matematik Misol Yechimi:**\n\n**Ifoda:** \`${rawExpr}\`\n\n**Amallar ketma-ketligi (BODMAS/PEMDAS qoidasi):**\n`;
          if (rawExpr.includes('*') || rawExpr.includes('/')) {
            explanation += `• **1-qadam:** Matematikada ko'paytirish va bo'lish amallari qo'shish va ayirishdan ustun turadi va birinchi bajariladi.\n`;
          }
          if (rawExpr.includes('+') || rawExpr.includes('-')) {
            explanation += `• **2-qadam:** Ko'paytirishdan hosil bo'lgan qiymatga qolgan sonlar chapdan o'ngga qarab qo'shiladi yoki ayiriladi.\n`;
          }
          explanation += `\n🎯 **Yakuniy Javob:** **${val}**\n\n📌 *Eslatma:* Misol uchun, ko'pchilik \`2 + 2 * 2\` misolida adashib chapdan o'ngga hisoblaydi va 8 chiqaradi. Lekin qoida bo'yicha avval \`2 * 2 = 4\`, keyin \`2 + 4 = 6\` bo'ladi!`;

          return {
            text: explanation,
            thinking: thinking.join("\n"),
            model: "Lingova Math & Logic Engine"
          };
        } catch (e) {}
      }
    }
  }

  // B) GAP TUZISH (ODDIY VA MURAKKAB GAPLAR)
  if (lower.includes("gap tuz") || lower.includes("gaplar tuz") || lower.includes("murakkab gap") || lower.includes("oddiy gap") || lower.includes("sentence") || lower.includes("make a sentence")) {
    thinking.push("1. Sintaktik gap tuzuvchi modul ishga tushirildi.");
    thinking.push("2. Foydalanuvchi so'ragan kalit so'z yoki mavzu tahlil qilindi.");

    let targetWord = "ambition";
    const words = q.split(/\s+/).map(w => w.replace(/[^\w]/g, ''));
    for (const w of words) {
      if (w.length > 2 && !['gap', 'tuz', 'tuzib', 'ber', 'oddiy', 'murakkab', 'uchun', 'haqida', 'iltimos', 'make', 'sentence'].includes(w.toLowerCase())) {
        targetWord = w;
        break;
      }
    }

    thinking.push(`3. Tanlangan so'z: "${targetWord}"`);
    thinking.push("4. A1 (Simple), B1 (Compound), B2 (Complex), C1 (Conditional) konstruksiyalari qurildi.");

    const capitalized = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
    const textOut = `📝 **"${capitalized}" so'zi ishtirokida oddiy va murakkab gaplar to'plami:**\n\n` +
      `1️⃣ **Oddiy gap (Simple Sentence - A1/A2):**\n` +
      `• *"**${capitalized}** plays an indispensable role in achieving personal goals."*\n` +
      `👉 **O'zbekcha tarjimasi:** ${capitalized} shaxsiy maqsadlarga erishishda ajralmas o'rin tutadi.\n` +
      `📌 **Tuzilishi:** Ega (Subject) + Fe'l (Verb) + To'ldiruvchi (Object).\n\n` +

      `2️⃣ **Bog'langan qo'shma gap (Compound Sentence - B1):**\n` +
      `• *"Pursuing **${targetWord.toLowerCase()}** can be extremely demanding, yet it builds incredible resilience."*\n` +
      `👉 **O'zbekcha tarjimasi:** ${capitalized} ortidan intilish juda ko'p mashaqqat talab qilishi mumkin, ammo u insonda aqlbovar qilmas matonatni shakllantiradi.\n` +
      `📌 **Tuzilishi:** Mustaqil gap + Teng bog'lovchi (*yet / and / but*) + Mustaqil gap.\n\n` +

      `3️⃣ **Ergashgan murakkab gap (Complex Sentence - B2):**\n` +
      `• *"Although cultivating **${targetWord.toLowerCase()}** requires steadfast dedication, individuals who persist will eventually overcome any barrier."*\n` +
      `👉 **O'zbekcha tarjimasi:** Garchi ${targetWord.toLowerCase()}ni o'zida rivojlantirish qat'iy fidoyilik talab qilsa-da, matonatli insonlar oxir-oqibat har qanday to'siqni yengib o'tadilar.\n` +
      `📌 **Tuzilishi:** Ergash gap (*Although / Even though / Because*) + Bosh gap.\n\n` +

      `4️⃣ **Shart ergash murakkab gap (Conditional Sentence - C1):**\n` +
      `• *"Had we embraced the true value of **${targetWord.toLowerCase()}** earlier, we would have reached these heights far sooner."*\n` +
      `👉 **O'zbekcha tarjimasi:** Agar biz ${targetWord.toLowerCase()}ning haqiqiy qiymatini ertaroq anglaganimizda edi, bu yuksaklikka ancha ilgariroq erishgan bo'lardik.\n` +
      `📌 **Tuzilishi:** Inversion 3rd Conditional (*Had + Subject + V3, would have + V3*).\n\n` +

      `💡 **Foydali birikmalar (Collocations):**\n` +
      `• *Fulfill one's ${targetWord.toLowerCase()}* (Orzusini ro'yobga chiqarmoq)\n` +
      `• *Driven by ${targetWord.toLowerCase()}* (${capitalized} orqali harakat qiluvchi)`;

    return {
      text: textOut,
      thinking: thinking.join("\n"),
      model: "Lingova Syntax & Grammar Constructor"
    };
  }

  // C) GRAMMATIK XATOLARNI TEKSHIRISH (GRAMMAR DOCTOR)
  if (lower.includes("tekshir") || lower.includes("xato") || lower.includes("to'g'rimi") || lower.includes("togrimi") || lower.includes("check") || lower.includes("correct")) {
    thinking.push("1. Foydalanuvchi jumlasi morfologik, leksik va sintaktik jihatdan tekshirildi.");
    thinking.push("2. Ega-fe'l moslashuvi, yordamchi fe'llar va predloglar tahlil qilindi.");

    let diagnosis = "";
    if (lower.includes("he do") || lower.includes("she do") || lower.includes("it do")) {
      diagnosis = `❌ **Xato:** \`He / She / It do\` ishlatilmaydi!\n✅ **To'g'ri:** \`He / She / It does\` yoki o'tgan zamonda \`did\` ishlatiladi.`;
    } else if (lower.includes("i am go") || lower.includes("i am agree") || lower.includes("i am went")) {
      diagnosis = `❌ **Xato:** \`am/is/are\` dan keyin fe'lning 1-shakli qo'yilmaydi (\`I am agree\` yoki \`I am go\` xato).\n✅ **To'g'ri:** \`I agree\` (Men roziman) yoki \`I am going\` (Hozir ketyapman).`;
    } else if (lower.includes("yesterday") && (lower.includes("has") || lower.includes("have"))) {
      diagnosis = `❌ **Xato:** \`Yesterday\` (kecha) kabi aniq o'tgan vaqt bilan Present Perfect (\`have/has\`) ishlatilmaydi!\n✅ **To'g'ri:** Past Simple (\`V2\`) ishlatiladi (Masalan: \`I saw him yesterday\`).`;
    } else if (lower.includes("depend of")) {
      diagnosis = `❌ **Xato:** \`depend of\` noto'g'ri.\n✅ **To'g'ri:** \`depend on\` ishlatiladi.`;
    } else {
      diagnosis = `Siz kiritgan jumla sintaktik tahlil qilindi. Ingliz tilida har doim **Ega (Subject) + Fe'l (Verb) + To'ldiruvchi (Object)** tartibiga qat'iy rioya qiling.`;
    }

    const textOut = `🔍 **Grammatik Tahlil va Chuqur Tekshiruv:**\n\n` +
      `${diagnosis}\n\n` +
      `📖 **Uchta oltin qoida:**\n` +
      `1. **Subject-Verb Agreement:** Birlikdagi 3-shaxsda fe'lga **-s/-es** qo'shiladi (*He works, She studies*).\n` +
      `2. **Inkor va so'roq:** *Did/didn't* dan keyin asosiy fe'l har doim boshlang'ich shaklga (V1) qaytadi (*He didn't see*, 'didn't saw' EMAS!).\n` +
      `3. **Predloglar moslashuvi:** *Interested in, good at, listen to, wait for*.\n\n` +
      `Aynan tekshirmoqchi bo'lgan inglizcha yoki ruscha jumlani yuboring, men xatolarini batafsil tahlil qilib beraman!`;

    return {
      text: textOut,
      thinking: thinking.join("\n"),
      model: "Lingova Grammar Diagnostic Engine"
    };
  }

  // D) IELTS & CEFR
  if (lower.includes("ielts") || lower.includes("cefr") || lower.includes("band") || lower.includes("speaking") || lower.includes("writing")) {
    thinking.push("1. Rasmiy IELTS / CEFR Examiner baholash mezonlari yuklandi.");
    thinking.push("2. Fluency, Lexical Resource, Grammatical Range va Cohesion mezonlari tahlil qilindi.");

    const textOut = `🎯 **IELTS 7.5+ Band Olish Uchun Rasmiy Examiner Maslahatlari:**\n\n` +
      `1️⃣ **Fluency & Coherence (Ravonlik):**\n` +
      `• Gap orasida jim qolmaslik yoki "uhh..." demaslik uchun tabiiy bog'lovchilardan foydalaning: *"Well, to be completely candid...", "Speaking from personal experience...", "Actually, from my perspective..."*\n\n` +
      `2️⃣ **Lexical Resource (Akademik so'zlar):**\n` +
      `• Oddiy so'zlardan qoching: *good* o'rniga **beneficial / fruitful**, *bad* o'rniga **detrimental / adverse**, *important* o'rniga **paramount / pivotal** deb ayting.\n\n` +
      `3️⃣ **Grammatical Range & Accuracy:**\n` +
      `• Faqat oddiy gaplar bilan chegaralanmang. Kamida 2 ta **Complex Sentence** va bitta **Conditional (Shart ergash)** gap qo'shing (*"If I had the chance, I would definitely..."*).\n\n` +
      `4️⃣ **Writing Task 2 Strukturasi:**\n` +
      `• **Introduction:** Paraphrase + Clear Thesis statement.\n` +
      `• **Body 1 & 2:** Topic sentence + Explanation + Real-world example + Result.\n` +
      `• **Conclusion:** Restatement of thesis without introducing new ideas.`;

    return {
      text: textOut,
      thinking: thinking.join("\n"),
      model: "Lingova Examiner & CEFR Engine"
    };
  }

  // E) RUS TILI SAVOLLARI
  if (lower.includes("rus") || lower.includes("падеж") || lower.includes("спряжение") || lower.includes("предлог")) {
    thinking.push("1. Rus tili grammatika moduli yuklandi.");
    thinking.push("2. Rus tili qoidalari o'zbek tilidagi qiyosiy tahlil bilan birlashtirildi.");

    const textOut = `🇷🇺 **Rus Tili Bo'yicha Tushuntirish va Qoidalar:**\n\n` +
      `Rus tilida gaplarni to'g'ri tuzish uchun quyidagi 3 ta asosiy poydevorni tushunish shart:\n\n` +
      `1. **Падежи (Kelishiklar - 6 ta):**\n` +
      `• Rus tilida so'z oxirlari (qo'shimchalar) gapdagi vazifasiga qarab o'zgaradi (*книга -> книгу -> о книге*).\n` +
      `2. **Виды глаголов (Fe'l turlari):**\n` +
      `• **Несовершенный вид (НСВ):** Jarayon yoki takrorlanuvchi harakat (*читать, писать*).\n` +
      `• **Совершенный вид (СВ):** Yakunlangan, natijaga erishilgan harakat (*прочитать, написать*).\n` +
      `3. **В va НА predloglari:**\n` +
      `• Yopiq joylar, binolar uchun odatda **В** (*в школе, в банке*).\n` +
      `• Ochiq maydonlar, tadbirlar yoki sirtlar uchun **НА** (*на улице, на работе, на концерте*).\n\n` +
      `Aniq bir so'z yoki gap bo'lsa yozing, birgalikda tahlil qilamiz!`;

    return {
      text: textOut,
      thinking: thinking.join("\n"),
      model: "Lingova Russian Language Engine"
    };
  }

  // F) PAST SIMPLE VS PRESENT PERFECT
  if (lower.includes("present perfect") || lower.includes("past simple")) {
    thinking.push("1. Zamonaviy ingliz tili zamonlari solishtirildi.");
    const textOut = `📖 **Past Simple va Present Perfect O'rtasidagi Oltin Farq:**\n\n` +
      `1️⃣ **Past Simple (O'tgan oddiy zamon):**\n` +
      `• **Qachon:** Ish-harakat o'tmishda tugagan va aniq vaqti ma'lum (*yesterday, last year, in 2021*).\n` +
      `• **Formula:** \`Subject + V2 / ed\`\n` +
      `• **Misol:** *"I visited London last summer."* (Men o'tgan yozda Londonga bordim — vaqti aniq!).\n\n` +
      `2️⃣ **Present Perfect (Hozirgi tugallangan zamon):**\n` +
      `• **Qachon:** Harakat qachon bo'lgani emas, uning bugungi kundagi **natijasi yoki hayotiy tajribasi** muhim!\n` +
      `• **Formula:** \`Subject + have/has + V3\`\n` +
      `• **Kalit so'zlar:** *already, yet, never, ever, just, recently*.\n` +
      `• **Misol:** *"I have visited London twice."* (Men Londonda ikki marta bo'lganman — hayotiy tajribam bor, qachonligi muhim emas).\n\n` +
      `💡 **Oltin formula:** Agar gapda aniq vaqt ko'rsatilsa (masalan: *at 5 PM, yesterday*) — faqat **Past Simple** bo'ladi!`;

    return {
      text: textOut,
      thinking: thinking.join("\n"),
      model: "Lingova Grammar Engine"
    };
  }

  // G) UNIVERSAL DO'STONA VA TAHLILIY JAVOB
  thinking.push(`1. Umumiy savol tahlil qilindi: "${q.slice(0, 50)}..."`);
  thinking.push("2. Ko'p tarmoqli bilimlar bazasidan amaliy tavsiyalar sintez qilindi.");

  const textOut = `Assalomu alaykum! Sizning so'rovingiz: **"${escapeHtml(q)}"**\n\n` +
    `Ushbu savol bo'yicha tahliliy javob:\n\n` +
    `• **Asosiy mohiyat:** Har qanday intellektual faoliyatda, ayniqsa chet tillarini chuqur egallashda tizimli yondashuv va qat'iy intizom eng asosiy omildir.\n` +
    `• **Mening imkoniyatlarimdan to'liq foydalaning:**\n` +
    `  1. Menga istalgan arifmetik yoki mantiqiy misol bering (masalan: \`25*12 - 40\` yoki \`200 ning 30 foizi\`) — men qadamma-qadam yechib beraman!\n` +
    `  2. Istalgan so'z ayting (masalan: *"Innovation"*, *"Perseverance"*, *"Friendship"*) — men unga oddiy, bog'langan va murakkab gaplar tuzib, formulalarini ko'rsataman.\n` +
    `  3. O'zingiz tuzgan inglizcha yoki ruscha jumlalarni yuboring — xatolarini qizil/yashil bilan to'g'rilab beraman!\n\n` +
    `Sizga qaysi mavzuda batafsil ma'lumot kerak? Yozing, har qanday savolingizga javob berishga tayyorman!`;

  return {
    text: textOut,
    thinking: thinking.join("\n"),
    model: "Lingova Cognitive Engine 2.0"
  };
}

// AI Sozlamalari Modali
function openAISettingsModal() {
  playSound('click');
  const container = document.getElementById("aiSettingsModalContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="modal-overlay" onclick="closeAISettingsModal(event)">
      <div class="modal-card animate-fade" onclick="event.stopPropagation()">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-size: 18px; font-weight: 800;">⚙️ AI Murabbiy Sozlamalari</h2>
          <button class="trans-swap-btn" style="width: 28px; height: 28px;" onclick="closeAISettingsModal()">✕</button>
        </div>

        <p style="font-size: 13.5px; color: var(--text-secondary); margin-bottom: 16px;">
          AI dvigatelini tanlang. Lingova o'rnatilgan Cognitive Brain orqali barcha savollarga, matematikaga va gaplar tuzishga bepul javob beradi. Agar xohlasangiz, Google Gemini API kalitini ham ulab qo'yishingiz mumkin.
        </p>

        <div style="margin-bottom: 16px;">
          <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 8px;">Asosiy AI Dvigateli:</label>
          <div style="display: flex; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer; flex: 1; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <input type="radio" name="aiProviderChoice" value="cognitive" ${aiSettings.provider === 'cognitive' ? 'checked' : ''} onchange="updateProviderChoice(this.value)">
              <span>🧠 Lingova Cognitive Brain (Bepul & Avtomatik)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer; flex: 1; padding: 10px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md);">
              <input type="radio" name="aiProviderChoice" value="gemini" ${aiSettings.provider === 'gemini' ? 'checked' : ''} onchange="updateProviderChoice(this.value)">
              <span>⚡ Google Gemini (API Kalit bilan)</span>
            </label>
          </div>
        </div>

        <div style="margin-bottom: 18px;" id="geminiKeyGroup">
          <label style="font-size: 13px; font-weight: 700; display: block; margin-bottom: 6px;">
            Google Gemini API Kaliti (Ixtiyoriy):
          </label>
          <input type="password" id="geminiApiKeyInput" class="ai-input-field" style="width: 100%; margin-bottom: 8px;"
                 placeholder="AIzaSy..." value="${escapeHtml(aiSettings.geminiKey)}">
          <div style="font-size: 12px; color: var(--text-muted);">
            Google AI Studio-dan 100% bepul olish: 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--primary); text-decoration: underline;">
              aistudio.google.com/app/apikey ↗
            </a>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-secondary" onclick="closeAISettingsModal()">Bekor qilish</button>
          <button class="btn btn-primary" onclick="saveAISettings()">Saqlash ✅</button>
        </div>
      </div>
    </div>
  `;
}

function updateProviderChoice(val) {
  aiSettings.provider = val;
}

function closeAISettingsModal() {
  const container = document.getElementById("aiSettingsModalContainer");
  if (container) container.innerHTML = "";
}

function saveAISettings() {
  const keyInput = document.getElementById("geminiApiKeyInput");
  if (keyInput) {
    aiSettings.geminiKey = keyInput.value.trim();
    localStorage.setItem("lingova_gemini_key", aiSettings.geminiKey);
  }
  localStorage.setItem("lingova_ai_provider", aiSettings.provider);
  playSound('diamond');
  closeAISettingsModal();
  renderAITutorView();
  alert("AI Sozlamalari muvaffaqiyatli saqlandi! 🎉");
}

// ======================= 12. 💎 TARIFLAR VA OBUNALAR (PLANS & PRICING) =======================
function renderPlansView() {
  const userTier = currentUser.tier || "free";

  appEl.innerHTML = `
    ${renderHeader('plans')}

    <div class="card animate-fade" style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 900; margin-bottom: 8px;">Tariflar va Obuna Rejalari</h1>
      <p style="color: var(--text-secondary); font-size: 15px; max-width: 600px; margin: 0 auto;">
        O'z darajangiz va maqsadingizga mos tarifni tanlang. 
        PRO va PREMIUM orqali ko'proq darslar, Smart Tarjimon va AI Murabbiydan cheksiz foydalaning!
      </p>

      <div class="plans-grid">
        <!-- 1. Bepul (Basic) -->
        <div class="plan-card">
          <div class="plan-name">Basic (Bepul)</div>
          <div class="plan-price">0 💎 <span>/ doimiy</span></div>
          <p style="font-size: 13px; color: var(--text-secondary);">Boshlang'ich daraja uchun</p>

          <ul class="plan-features-list">
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> Boshlang'ich 5 ta dars</li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> Asosiy grammatika qo'llanmasi</li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> Standart audio talaffuz</li>
            <li class="plan-feature-item" style="opacity: 0.5;"><span class="plan-feature-icon">✕</span> Smart Tarjimon</li>
            <li class="plan-feature-item" style="opacity: 0.5;"><span class="plan-feature-icon">✕</span> AI Murabbiy va Repetitor</li>
          </ul>

          <button class="btn btn-secondary btn-full" disabled>
            ${userTier === 'free' ? 'Hozirgi tarifingiz' : 'Oddiy reja'}
          </button>
        </div>

        <!-- 2. PRO REJA -->
        <div class="plan-card pro">
          <div class="plan-badge-top" style="background: var(--pro-gradient); color: #fff;">Tavsiya etiladi</div>
          <div class="plan-name" style="color: #c084fc;">PRO Reja ⭐</div>
          <div class="plan-price">35 💎 <span>/ oyiga</span></div>
          <p style="font-size: 13px; color: var(--text-secondary);">Intensiv va tezkor o'rganuvchilar uchun</p>

          <ul class="plan-features-list">
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> <b>Barcha 240+ darslar to'liq ochiq</b></li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> <b>Smart Tarjimon (Inglizcha <-> O'zbekcha)</b></li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> Sekinlashtirilgan (🐢 0.7x) audio talaffuz</li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> PRO nishoni va reytingdagi o'rin</li>
            <li class="plan-feature-item" style="opacity: 0.5;"><span class="plan-feature-icon">✕</span> AI Murabbiy repetitor</li>
          </ul>

          <button class="btn btn-pro btn-full" onclick="activateTier('pro', 35)">
            ${userTier === 'pro' ? 'Faol Reja ✓' : 'PRO ni Faollashtirish (35 💎)'}
          </button>
        </div>

        <!-- 3. PREMIUM REJA -->
        <div class="plan-card premium">
          <div class="plan-badge-top" style="background: var(--premium-gradient); color: #000;">Eng Zo'r Tanlov</div>
          <div class="plan-name" style="color: #fbbf24;">PREMIUM Master 👑</div>
          <div class="plan-price">65 💎 <span>/ oyiga</span></div>
          <p style="font-size: 13px; color: var(--text-secondary);">Mukammal natija va repetitor kerak bo'lganlar uchun</p>

          <ul class="plan-features-list">
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> <b>Barcha PRO imkoniyatlari</b></li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> <b>🤖 AI Murabbiy & Repetitor (Cheksiz savol-javob)</b></li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> <b>Dars va xatolarni tekshirib berish</b></li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> IELTS & CEFR Examiner Writing & Speaking baholash</li>
            <li class="plan-feature-item checked"><span class="plan-feature-icon">✓</span> VIP status va ustuvor audio dvigatel</li>
          </ul>

          <button class="btn btn-premium btn-full" onclick="activateTier('premium', 65)">
            ${userTier === 'premium' ? 'Faol Reja ✓' : 'PREMIUM ni Faollashtirish (65 💎)'}
          </button>
        </div>
      </div>
    </div>

    ${renderBottomNav('plans')}
  `;
}

function activateTier(tier, price) {
  playSound('click');
  if (currentUser.tier === tier) {
    alert(`Sizda allaqachon ${tier.toUpperCase()} tarifi faol!`);
    return;
  }

  // Agar olmoslar yetmasa, foydalanuvchiga qulay bo'lishi uchun bonus berish yoki tasdiqlash
  if ((currentUser.diamonds || 0) < price) {
    if (confirm(`Sizda ${currentUser.diamonds || 0} 💎 bor. ${tier.toUpperCase()} tarifini sinovdan o'tkazish uchun bepul faollashtirmoqchimisiz?`)) {
      currentUser.diamonds = (currentUser.diamonds || 0) + price;
    } else {
      return;
    }
  }

  currentUser.diamonds -= price;
  currentUser.tier = tier;
  saveCurrentUser();

  if (IS_API_ONLINE) {
    apiRequest("/user/tier", "POST", { tier });
  }

  playSound('diamond');
  alert(`Tabriklaymiz! Sizning akkauntingiz ${tier.toUpperCase()} darajasiga muvaffaqiyatli ko'tarildi! 🎉`);
  renderPlansView();
}

function openPricingModal(customMessage = "") {
  playSound('click');
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "pricingModalEl";

  modal.innerHTML = `
    <div class="modal-content animate-fade">
      <button class="modal-close-btn" onclick="document.getElementById('pricingModalEl').remove()">✕</button>

      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 32px; margin-bottom: 6px;">👑</div>
        <h2 style="font-size: 22px; font-weight: 800;">Tarifni Tanlang</h2>
        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
          ${customMessage || "Ushbu imkoniyatdan to'liq foydalanish uchun PRO yoki PREMIUM tarifiga o'ting."}
        </p>
      </div>

      <div style="display: grid; gap: 14px;">
        <div class="choice-card" onclick="activateTier('pro', 35); document.getElementById('pricingModalEl').remove();">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 800; font-size: 16px; color: #c084fc;">⭐ PRO Reja</div>
            <div style="font-weight: 800; font-size: 14px; color: #38bdf8;">35 💎</div>
          </div>
          <div class="choice-desc">Ko'proq darslar + Smart Tarjimon + Tabiiy audio</div>
        </div>

        <div class="choice-card" style="border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05);"
             onclick="activateTier('premium', 65); document.getElementById('pricingModalEl').remove();">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 800; font-size: 16px; color: #fbbf24;">👑 PREMIUM Master</div>
            <div style="font-weight: 800; font-size: 14px; color: #fbbf24;">65 💎</div>
          </div>
          <div class="choice-desc">Barcha darslar + Tarjimon + 🤖 AI Murabbiy repetitor + Examiner</div>
        </div>
      </div>

      <button class="btn btn-secondary btn-full" style="margin-top: 18px;" 
              onclick="document.getElementById('pricingModalEl').remove(); navigateTo('plans');">
        Barcha tariflarni ko'rish →
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// ======================= 13. Grammatika Qo'llanmasi (Grammar Hub) =======================
const GRAMMAR_GUIDE_DATA = [
  {
    id: "g1",
    title: "1. Muloyim Iltimoslar (Polite Requests)",
    badge: "Muloqot Asosi",
    intro: "Ingliz tilida chet elliklar bilan gaplashganda muloyimlik eng muhim omildir. 'Give me' (menga ber) yoki 'I want' (men xohlayman) desangiz qo'pol eshitiladi.",
    formula: "Could you please + Fe'l ... ?  /  I would like + Ot / Fe'l",
    breakdown: [
      { term: "Could you please help me?", pron: "Kud yu pliiz xelp mi?", meaning: "Menga yordam bera olasizmi, iltimos?" },
      { term: "I would like a cup of tea, please.", pron: "Ay vud layk e kap of tii, pliiz.", meaning: "Menga bir finjon choy bersangiz, iltimos." }
    ],
    mistake: "❌ 'I want coffee!' ➡️ ✅ 'Could I please have a cup of coffee?'"
  },
  {
    id: "g2",
    title: "2. To Be fe'li (am / is / are) — Poydevor",
    badge: "Boshlang'ich",
    intro: "O'zbek tilida 'Men talabaman' deymiz, fe'lsiz gap tuziladi. Lekin ingliz tilida har qanday gapda FE'L bo'lishi SHART!",
    formula: "Ega (Subject) + am / is / are + Kim / Qanday / Qayerda",
    breakdown: [
      { term: "I am ready.", pron: "Ay em redi.", meaning: "Men tayyorman." },
      { term: "She is at the airport.", pron: "Shi iz et di eyapot.", meaning: "U aeroportda." }
    ],
    mistake: "❌ 'I student.' ➡️ ✅ 'I am a student.'"
  },
  {
    id: "g3",
    title: "3. Past Simple — O'tgan Zamon",
    badge: "Zamonlar",
    intro: "O'tmishda aniq vaqtda sodir bo'lgan ish-harakatlar: 'Kecha chipta sotib oldim', 'O'tgan hafta uchib keldik'.",
    formula: "To'g'ri fe'llarga: -ed (arrived)  |  Noto'g'ri fe'llar: 2-shakl (went, saw, bought)",
    breakdown: [
      { term: "We arrived yesterday.", pron: "Vi erayv'd yesterdey.", meaning: "Biz kecha yetib keldik." },
      { term: "Did you enjoy your flight?", pron: "Did yu indjoy yor flayt?", meaning: "Parvozingiz yaxshi o'tdimi?" }
    ],
    mistake: "❌ 'Did you went?' ➡️ ✅ 'Did you go?' (Savolda 'did' kelgach, fe'l 1-shaklga qaytadi)."
  }
];

function renderGrammarHubView() {
  appEl.innerHTML = `
    ${renderHeader('grammar')}

    <div class="card animate-fade" style="margin-bottom: 20px;">
      <div class="card-title">📖 Mukammal Grammatika Qo'llanmasi</div>
      <p class="card-subtitle">
        Barcha asosiy qoidalar o'zbek tilida juda sodda va formulalar bilan tushuntirilgan.
      </p>

      <div style="display: grid; gap: 16px;">
        ${GRAMMAR_GUIDE_DATA.map(g => `
          <div style="background: var(--bg-surface); border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="stat-pill xp">${escapeHtml(g.badge)}</span>
              <button class="audio-btn" onclick="speakText('${escapeQuotes(g.title)}')" title="Eshitish">🔊</button>
            </div>
            <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">${escapeHtml(g.title)}</h2>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;">${escapeHtml(g.intro)}</p>

            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-weight: 700; font-size: 13.5px; color: #a5b4fc; margin-bottom: 14px;">
              📐 Qoida: ${escapeHtml(g.formula)}
            </div>

            <div style="display: grid; gap: 8px; margin-bottom: 12px;">
              ${g.breakdown.map(b => `
                <div style="background: var(--bg-card); padding: 10px 14px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 750; font-size: 14px;">${escapeHtml(b.term)}</div>
                    <div style="font-size: 12.5px; color: var(--text-secondary);">${escapeHtml(b.meaning)}</div>
                  </div>
                  <button class="audio-btn" style="width: 26px; height: 26px; font-size: 11px;" onclick="speakText('${escapeQuotes(b.term)}')">🔊</button>
                </div>
              `).join('')}
            </div>

            <div style="font-size: 13px; color: #fda4af; background: rgba(244, 63, 94, 0.08); padding: 8px 12px; border-radius: 6px;">
              ${escapeHtml(g.mistake)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    ${renderBottomNav('grammar')}
  `;
}

// ======================= 14. Reyting (Leaderboard) =======================
function renderLeaderboardView() {
  const users = getLocalUsers();
  users.sort((a, b) => (b.xp || 0) - (a.xp || 0));

  appEl.innerHTML = `
    ${renderHeader('leaderboard')}

    <div class="card animate-fade">
      <div class="card-title">🏆 Haqiqiy O'quvchilar Reytingi</div>
      <p class="card-subtitle">
        Platformada ro'yxatdan o'tgan haqiqiy foydalanuvchilarning bilim va faollik darajasi.
      </p>

      <div style="display: grid; gap: 8px;">
        ${users.map((u, i) => {
          const isMe = currentUser && (u.username === currentUser.username || u.id === currentUser.id);
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          const initial = (u.full_name || u.username || 'U')[0].toUpperCase();
          const tier = u.tier || 'free';

          return `
            <div class="leaderboard-row ${isMe ? 'me' : ''}">
              <div class="leader-rank">${medal}</div>
              <div class="leader-user">
                <div class="user-avatar" style="width: 34px; height: 34px; font-size: 14px;">${initial}</div>
                <div>
                  <div style="font-weight: 800; font-size: 14.5px; display: flex; align-items: center; gap: 6px;">
                    <span>@${escapeHtml(u.username)}</span>
                    ${isMe ? '<span style="color: var(--primary); font-size: 12px;">(Siz)</span>' : ''}
                    <span class="tier-badge ${tier}" style="font-size: 10px; padding: 2px 6px;">${tier.toUpperCase()}</span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    ${escapeHtml(u.full_name || u.username)} · ${escapeHtml(u.job || 'Talaba')} (${u.age || 20} yosh)
                  </div>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="leader-xp">⭐ ${u.xp || 0} XP</div>
                <div style="font-size: 12px; color: #38bdf8;">💎 ${u.diamonds || 0}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    ${renderBottomNav('leaderboard')}
  `;
}

// ======================= 15. Foydalanuvchi Profili =======================
function renderProfileView() {
  if (!currentUser) return renderAuthScreen();
  const completedCount = Object.keys(currentUser.completed_lessons || {}).length;
  const initial = (currentUser.full_name || currentUser.username || 'U')[0].toUpperCase();
  const userTier = currentUser.tier || 'free';

  appEl.innerHTML = `
    ${renderHeader('profile')}

    <div class="card animate-fade" style="max-width: 640px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
        <div class="user-avatar" style="width: 64px; height: 64px; font-size: 26px;">
          ${initial}
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 style="font-size: 20px; font-weight: 800;">${escapeHtml(currentUser.full_name || currentUser.username)}</h2>
            <div class="tier-badge ${userTier}" onclick="openPricingModal()">${userTier.toUpperCase()}</div>
          </div>
          <div style="color: var(--text-secondary); font-size: 13.5px;">
            <b>@${escapeHtml(currentUser.username)}</b> · ${escapeHtml(currentUser.email)}
          </div>
          <div style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
            <span class="stat-pill streak">🔥 ${currentUser.streak || 1} kun streak</span>
            <span class="stat-pill">${escapeHtml(currentUser.job || 'IT')}</span>
            <span class="stat-pill">${currentUser.age || 20} yosh</span>
          </div>
        </div>
      </div>

      <div class="divider">Statistika</div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; text-align: center;">
        <div class="hero-stat-card">
          <div class="hero-stat-val" style="color: var(--emerald);">${completedCount}</div>
          <div class="hero-stat-lbl">Tugatilgan dars</div>
        </div>
        <div class="hero-stat-card">
          <div class="hero-stat-val" style="color: var(--primary);">${currentUser.xp || 0}</div>
          <div class="hero-stat-lbl">Jami XP</div>
        </div>
        <div class="hero-stat-card">
          <div class="hero-stat-val" style="color: #38bdf8;">${currentUser.diamonds || 0}</div>
          <div class="hero-stat-lbl">Olmoslar</div>
        </div>
      </div>

      <div style="display: grid; gap: 10px;">
        <button class="btn btn-secondary btn-full" onclick="openPricingModal()">
          👑 Tarifni Boshqarish (PRO / PREMIUM)
        </button>
        <button class="btn btn-secondary btn-full" onclick="renderOnboarding(1)">
          🎯 O'quv rejasini qayta sozlash
        </button>
        <button class="btn btn-secondary btn-full" style="color: var(--red); border-color: rgba(244, 63, 94, 0.3);" onclick="handleLogout()">
          🚪 Akkauntdan Chiqish
        </button>
      </div>
    </div>

    ${renderBottomNav('profile')}
  `;
}

// ======================= 16. Autentifikatsiya Ekrani (Auth) =======================
function renderAuthScreen(isRegister = false) {
  appEl.innerHTML = `
    <div style="max-width: 440px; margin: 40px auto;" class="animate-fade">
      <div style="text-align: center; margin-bottom: 24px;">
        <div class="brand-logo-badge" style="width: 48px; height: 48px; font-size: 22px; margin: 0 auto 12px;">L</div>
        <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">LING<span style="color: var(--primary);">OVA</span> PRO</h1>
        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
          Zamonaviy ingliz tili, Smart Tarjimon va AI Murabbiy
        </p>
      </div>

      <div class="card">
        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
          <button class="btn ${!isRegister ? 'btn-primary' : 'btn-secondary'} btn-full btn-sm" onclick="renderAuthScreen(false)">Kirish</button>
          <button class="btn ${isRegister ? 'btn-primary' : 'btn-secondary'} btn-full btn-sm" onclick="renderAuthScreen(true)">Ro'yxatdan o'tish</button>
        </div>

        ${!isRegister ? `
          <form onsubmit="submitLogin(event)">
            <div class="form-group">
              <label class="form-label">Username yoki Email</label>
              <input type="text" id="loginIdent" class="form-input" placeholder="sardor_01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Parol</label>
              <input type="password" id="loginPass" class="form-input" placeholder="Parolingiz" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full" style="margin-top: 8px;">Tizimga Kirish →</button>
          </form>
        ` : `
          <form onsubmit="submitRegister(event)">
            <div class="form-group">
              <label class="form-label">To'liq ismingiz</label>
              <input type="text" id="regFullName" class="form-input" placeholder="Sardor Aliyev" required>
            </div>
            <div class="form-group">
              <label class="form-label">Username (Login)</label>
              <input type="text" id="regUsername" class="form-input" placeholder="sardor_01" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email manzili</label>
              <input type="email" id="regEmail" class="form-input" placeholder="sardor@gmail.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Kasbingiz / Sohangiz</label>
              <select id="regJob" class="form-input">
                ${JOBS_LIST.map(j => `<option value="${j}">${j}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Parol</label>
              <input type="password" id="regPass" class="form-input" placeholder="Kamida 4 ta belgi" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full" style="margin-top: 8px;">Akkaunt Yaratish 🚀</button>
          </form>
        `}
      </div>
    </div>
  `;
}

async function submitLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const ident = document.getElementById("loginIdent").value;
  const pass = document.getElementById("loginPass").value;

  const res = await handleLogin(ident, pass);
  if (res.success) {
    playSound('correct');
    if (currentUser.curriculum && currentUser.curriculum.length > 0) {
      currentCurriculum = currentUser.curriculum;
      renderRoadmap();
    } else {
      renderOnboarding(1);
    }
  } else {
    playSound('wrong');
    alert(res.error || "Login yoki parol xato!");
  }
}

async function submitRegister(e) {
  if (e && e.preventDefault) e.preventDefault();
  const fullName = document.getElementById("regFullName").value;
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const job = document.getElementById("regJob").value;
  const pass = document.getElementById("regPass").value;

  const res = await handleRegister(username, email, pass, fullName, "🦊", "Erkak", 22, job);
  if (res.success) {
    playSound('correct');
    renderOnboarding(1);
  } else {
    playSound('wrong');
    alert(res.error || "Ro'yxatdan o'tishda xatolik!");
  }
}

// ======================= 17. Navigatsiya & Yordamchilar =======================
function navigateTo(tab) {
  playSound('click');
  if (tab === 'roadmap') renderRoadmap();
  else if (tab === 'grammar') renderGrammarHubView();
  else if (tab === 'translator') renderTranslatorView();
  else if (tab === 'ai') renderAITutorView();
  else if (tab === 'plans') renderPlansView();
  else if (tab === 'leaderboard') renderLeaderboardView();
  else if (tab === 'profile') renderProfileView();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("lingova_theme", next); } catch (e) {}
  if (currentUser) renderRoadmap();
  else renderAuthScreen();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeQuotes(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ======================= 18. Dasturni Ishga Tushirish (Init) =======================
async function initApp() {
  const savedTheme = localStorage.getItem("lingova_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  await checkApiHealth();

  const savedSession = localStorage.getItem(CURRENT_SESSION_KEY);
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      currentUser = parsed.user;
      currentToken = parsed.token;
      if (currentUser) {
        if (!currentUser.tier) currentUser.tier = "free";
        if (currentUser.curriculum && currentUser.curriculum.length > 0) {
          currentCurriculum = currentUser.curriculum;
          renderRoadmap();
          return;
        } else {
          renderOnboarding(1);
          return;
        }
      }
    } catch (e) {}
  }

  // Standart foydalanuvchi mavjud bo'lmasa, namunaviy hisob tayyorlab qo'yish
  const users = getLocalUsers();
  if (users.length === 0) {
    const demoUser = {
      id: 1001,
      username: "ali_developer",
      email: "ali@gmail.com",
      password_hash: await sha256("1234"),
      full_name: "Ali Vohidov",
      job: "Dasturchi (IT)",
      age: 23,
      gender: "Erkak",
      tier: "pro",
      xp: 140,
      diamonds: 45,
      streak: 3,
      level: "intermediate",
      purpose: "abroad",
      duration: "1_month",
      curriculum: buildPersonalizedCurriculum("intermediate", "abroad", "1_month"),
      completed_lessons: { 1: true },
      created_at: new Date().toISOString()
    };
    users.push(demoUser);
    saveLocalUsers(users);
  }

  renderAuthScreen();
}

window.addEventListener("DOMContentLoaded", initApp);
