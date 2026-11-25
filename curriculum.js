/**
 * curriculum.js — Lingova Pro shaxsiy darslar banki
 * ------------------------------------------------------------------
 * 4 maqsad × 3 daraja × 4 o'qish fokusi = 48 tayyor variant.
 * Har variant uchun 120 tagacha dars oldindan rejalashtiriladi (blueprint),
 * so'ngra foydalanuvchi tanlagan muddatga qarab darhol materiallashtiriladi.
 * Tarmoq so'rovi yo'q — hamma narsa mahalliy, tez va ishonchli.
 *
 * app.js dan KEYIN yuklanadi. U quyidagi funksiyalarni taqdim etadi:
 *   cvGetLessonCount(duration)
 *   cvBuildCurriculum(level, purpose, duration, focus)
 *   cvVariantSummary(purpose, level, focus, duration)
 */

const CV_DURATION_COUNTS = {
  "1_month": 20,
  "2_months": 40,
  "3_months": 60,
  "4_months": 80,
  "5_months": 100,
  "6_months": 120,
  "1_year": 240
};

const CV_LEVELS = ["beginner", "intermediate", "advanced"];
const CV_FOCUSES = ["speaking", "grammar", "vocabulary", "exam"];
const CV_FOCUS_LABELS = {
  speaking: "Ravon muloqot",
  grammar: "Grammatika asosi",
  vocabulary: "Boy lug'at",
  exam: "Imtihon tayyorgarligi"
};

/* Oddiy, lekin yetarlicha aniq talaffuz qoidasi (IPA emas, o'qilishi) */
const CV_PRON_WORDS = {
  could:"kud", i:"ay", please:"pliiz", have:"hev", a:"e", window:"vindou", seat:"siit",
  here:"xiyer", you:"yu", are:"aar", good:"gud", morning:"morning", can:"ken", see:"sii",
  your:"yor", passport:"pasport", ticket:"tiket", thank:"senk", very:"veri", much:"mach",
  how:"xau", is:"iz", the:"de", to:"tu", for:"for", and:"end", we:"vi", my:"may", name:"neym",
  what:"vot", do:"du", from:"from", where:"veer", work:"vork", experience:"ekspiriens",
  strength:"strengths", team:"tiim", project:"projekt", deadline:"dedlayn", please2:"pliiz",
  hello:"xellou", yes:"yes", no:"nou", sorry:"sori", problem:"problem", need:"niid", help:"help",
  today:"tudey", tomorrow:"tomorou", yesterday:"yesturdey", have2:"hev", has:"hez", been:"biin",
  will:"vil", would:"vud", should:"shud", can2:"ken", because:"bikoz", although:"olzou",
  however:"xavever", therefore:"zerefor", if:"if", then:"den", when:"ven", while:"vayl",
  opportunity:"oportyunity", challenge:"challenge", improve:"impruv", learn:"lorn", speak:"spiik",
  write:"rayt", read:"riid", listen:"lisn", word:"vord", sentence:"sentens", example:"egzempl",
  thank2:"senk", airport:"eport", hotel:"xotel", taxi:"teksi", bill:"bil", water:"voter",
  reservation:"rezervleyshn", gate:"geyt", flight:"flayt", luggage:"lagidj", bank:"benk",
  code:"koud", bug:"bag", server:"server", deploy:"dep loy", test:"test", meeting:"miitin",
  idea:"aydiya", result:"rezult", essay:"ese", band:"bend", IELTS:"ayelts", speaking:"spiikin",
  writing:"raytin", question:"kveshn", answer:"anser", topic:"topik", plan:"plen", focus:"fokus"
};

function cvPron(text) {
  return String(text || "")
    .replace(/[.,!?;:]/g, "")
    .split(/\s+/)
    .map(w => {
      const clean = w.replace(/[^A-Za-z']/g, "");
      const low = clean.toLowerCase();
      if (CV_PRON_WORDS[low]) return CV_PRON_WORDS[low];
      if (CV_PRON_WORDS[w]) return CV_PRON_WORDS[w];
      return w;
    })
    .join(" ")
    .trim();
}

function cvClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cvClone);
  const out = {};
  for (const k in obj) out[k] = cvClone(obj[k]);
  return out;
}

/* ======================= GRAMMATIKA BANKI (Daraja bo'yicha) =======================
 * Har bir qoida: [sarlavha, nima uchun, formula, oddiy tushuntirish,
 *                  [en, uz] misollar, keng tarqalgan xato, [savol, to'g'ri, xato1, xato2, sabab]]
 */
const CV_GRAMMAR_BANK = {
  beginner: [
    ["To be: am / is / are", "O'zingizni, holatingizni va narsalarning qayerdaligini tanishtirish uchun eng birinchi qoida.", "Subject + am / is / are + ot / sifat", "'Men...' degan gap inglizchadoim to be bilan boshlanadi: I am, you are, he/she/it is. O'zbekchada 'men tayyorman' deyish mumkin, lekin inglizcha 'I ready' deyish xato.", [["I am ready for the interview.", "Men intervyuga tayyorman."], ["She is from London.", "U Londondan."]], "❌ 'I ready' ➡️ ✅ 'I am ready'", ["'I ___ ready' gapida qaysi so'z kerak?", "am", "is", "are", "I bilan doim am ishlatiladi."]],
    ["Oddiy hozirgi zamon (Present Simple)", "Kundalik odatlar, faktlar va doimiy holatlarni aytish uchun kerak.", "Subject + V1 (he/she/it + V1-s/-es)", "He/she/it bilan fe'l oxiriga s yoki es qo'shiladi: He works, She studies. But 'I work', 'You work'.", [["I work in a bank.", "Men bankda ishlayman."], ["He checks his email every morning.", "U har kuni ertalab emailini tekshiradi."]], "❌ 'He work' ➡️ ✅ 'He works'", ["'He ___ in an office' to'g'ri variant?", "works", "work", "working", "He/She/It bilan fe'lga -s qo'shiladi."]],
    ["Artikllar: a / an / the", "Narsani yangi yoki oldindan ma'lum ekanligini ko'rsatish uchun ishlatiladi.", "a/an + yangi narsa · the + ma'lum narsa", "'A' va 'an' yangi narsa uchun, 'the' esa oldin tilga olingan yoki noyob narsa uchun. 'An' unli tovush oldida keladi.", [["I need a ticket.", "Menga chipta kerak."], ["The ticket is on the desk.", "Chipta stolda."]], "❌ 'I need ticket' ➡️ ✅ 'I need a ticket'", ["Qaysi gap to'g'ri?", "I need a ticket.", "I need ticket.", "I need an ticket.", "Birlikdagi oddiy ot oldida artikl kerak."]],
    ["Muloyim iltimos: Can / Could you...?", "Xizmat so'rash, yordam taklif qilish va hurmat ko'rsatish uchun eng foydali qoida.", "Could you + V1 ...? / Can you + V1 ...?", "'Could' 'can'dan muloyimroq. Doim 'Could you please...' deyish eng xavfsiz variant.", [["Could you help me, please?", "Menga yordam bera olasizmi, iltimos?"], ["Can I sit here?", "Bu yerda o'tirsam bo'ladimi?"],], "❌ 'Give me help' ➡️ ✅ 'Could you help me?'", ["Eng muloyim variant qaysi?", "Could you please help me?", "Help me!", "You help me", "Could you please iborasi eng muloyim."]],
    ["Inkor: don't / doesn't", "Nimadir qilmasligingizni yoki boshqa odamning harakatini inkor etish uchun.", "I/You/We/They + don't + V1 · He/She/It + doesn't + V1", "'Doesn't' dan keyin fe'l yana boshlang'ich shaklda bo'ladi: doesn't works emas, doesn't work.", [["I don't know the answer.", "Men javobni bilmayman."], ["He doesn't like coffee.", "U qahvani yoqtirmaydi."]], "❌ 'He doesn't works' ➡️ ✅ 'He doesn't work'", ["'She ___ like tea' to'g'rimi?", "doesn't", "don't", "isn't", "She uchun doesn't ishlatiladi."]],
    ["To'g'ri so'roq: Wh- savollar", "Kim, nima, qayer, qachon va nima uchun deb so'rash uchun.", "Wh-word + do/does + Subject + V1?", "Inglizcha so'roqda do/does kerak. O'zbekchada 'Sen qayerdan?' deyish mumkin, lekin inglizcha 'You from where?' emas.", [["Where do you work?", "Qayerda ishlaysiz?"], ["What does he do?", "U nima qiladi?"],], "❌ 'You work where?' ➡️ ✅ 'Where do you work?'", ["To'g'ri so'roqni tanlang:", "Where do you live?", "Where you live?", "Where live you?", "Wh- savoldan keyin do/does kerak."]]
  ],
  intermediate: [
    ["Present Perfect: have/has + V3", "Tajriba, natija va 'hali qilingan/qilinmagan' holatlarni ifodalash uchun.", "Subject + have/has + V3 (past participle)", "'Yesterday' kabi aniq o'tgan vaqt bilan Present Perfect ishlatilmaydi. Tajriba muhim bo'lsa: I have visited London.", [["I have already sent the email.", "Men allaqachon emailni yubordim."], ["She has worked here for three years.", "U bu yerda uch yildan beri ishlaydi."]], "❌ 'I have sent it yesterday' ➡️ ✅ 'I sent it yesterday'", ["Qaysi gap to'g'ri?", "I have finished the task.", "I have finish the task.", "I am finished the task.", "have/has dan keyin V3 shakli kerak."]],
    ["First Conditional: If + Present, will + V1", "Reja, kelajakdagi shart va mumkin bo'lgan natijalarni aytish uchun.", "If + Present Simple, will + V1", "'If' bilan kelgan qismda will ishlatilmaydi: If it rains, we will stay home. Not 'If it will rain'.", [["If I have time, I will join the meeting.", "Agar vaqtim bo'lsa, yig'ilishga qo'shilaman."], ["If you study daily, you will improve.", "Agar har kuni o'qisangiz, yaxshilanasiz."]], "❌ 'If it will rain' ➡️ ✅ 'If it rains'", ["To'g'ri shart gapni tanlang:", "If you call me, I will help.", "If you will call me, I help.", "If you called me, I will help.", "If qismida hozirgi zamon, natijada will."]],
    ["Modallar: should / must / might", "Maslahat, majburiyat va ehtimollikni ifodalash uchun.", "should + V1 · must + V1 · might + V1", "'Should' maslahat, 'must' qat'iy majburiyat, 'might' ehtimol. Hammasidan keyin fe'l boshlang'ich shaklda.", [["You should check your passport.", "Pasportingizni tekshirishingiz kerak."], ["It might rain tomorrow.", "Ertaga yomg'ir yog'ishi mumkin."]], "❌ 'You should to go' ➡️ ✅ 'You should go'", ["Qaysi gap to'g'ri?", "You should check it.", "You should to check it.", "You should checking it.", "Modal dan keyin to'siz V1."]],
    ["Gerund va infinitive: enjoy doing / want to do", "Ba'zi fe'llardan keyin qaysi shakl kelishini bilish uchun.", "enjoy/mind/avoid + V-ing · want/decide/hope + to V", "Consider, enjoy, mind, avoid kabi fe'llar V-ing oladi. Want, decide, plan, hope esa to V oladi.", [["I enjoy speaking English.", "Men inglizcha gapirishdan zavq olaman."], ["I want to improve my grammar.", "Men grammatikamni yaxshilamoqchiman."]], "❌ 'I enjoy to speak' ➡️ ✅ 'I enjoy speaking'", ["To'g'ri shaklni tanlang:", "I avoid making mistakes.", "I avoid to make mistakes.", "I avoid make mistakes.", "avoid dan keyin V-ing keladi."]],
    ["Reported speech: say / tell", "Birovning gapini o'zgartirib yetkazish uchun.", "He said (that) + gap · He told me (that) + gap", "'Tell' dan keyin odam keladi: told me. 'Say' dan keyin to'g'ridan-to'g'ri gap keladi.", [["She said she was busy.", "U band ekanligini aytdi."], ["He told me to wait.", "U menga kutishni aytdi."]], "❌ 'He said me' ➡️ ✅ 'He told me'", ["Qaysi gap to'g'ri?", "He told me the truth.", "He said me the truth.", "He told to me the truth.", "tell + odam + gap."]],
    ["Passive voice: be + V3", "Kim qilgani emas, nima qilingani muhim bo'lganda.", "am/is/are/was/were + V3 (by + kim)", "Inglizcha rasmiy yozuvda passive ko'p uchraydi: The email was sent. O'zbekchada ko'pincha 'yuborildi' deb tarjima qilinadi.", [["The ticket was booked online.", "Chipta onlayn band qilindi."], ["The report is checked every day.", "Hisobot har kuni tekshiriladi."]], "❌ 'The email was send' ➡️ ✅ 'The email was sent'", ["To'g'ri passiv shakl:", "The work was done.", "The work was do.", "The work is do.", "was + V3 (done) kerak."]]
  ],
  advanced: [
    ["Third Conditional: If + Past Perfect, would have + V3", "O'tmishda boshqacha qilinganida nima bo'lishi haqida gapirish uchun.", "If + had + V3, would have + V3", "Bu qoida o'tmishdagi xayoliy vaziyat uchun. 'If I had known, I would have come.'", [["If I had known, I would have prepared better.", "Agar bilganimda edi, yaxshiroq tayyorlangan bo'lardim."], ["If she had asked, we would have helped.", "Agar u so'raganida edi, biz yordam bergan bo'lardik."]], "❌ 'If I would have known' ➡️ ✅ 'If I had known'", ["To'g'ri 3-shart gap:", "If I had left earlier, I would have arrived.", "If I would leave earlier, I would arrive.", "If I leave earlier, I would have arrived.", "If qismida had + V3."]],
    ["Inversion: Had / Were / Should", "Rasmiy va akademik nutqda shart gapni boshqacha tartibda boshlash uchun.", "Had + Subject + V3 ... · Were + Subject ... · Should + Subject + V1", "'If I had known' ni 'Had I known' deb ham aytsa bo'ladi. Bu yuqori daraja belgisidir.", [["Had I known about the delay, I would have left earlier.", "Kechikishni bilganimda edi, ertaroq chiqqan bo'lardim."], ["Were I in your position, I would accept.", "Sizning o'rningizda bo'lsam, qabul qilardim."]], "❌ 'Had I know' ➡️ ✅ 'Had I known'", ["Inversion to'g'ri shakli:", "Had I known, I would have come.", "Had I know, I would have come.", "If had I known, I would have come.", "Had + subject + V3."]],
    ["Nominalisation (Akademik yozuv)", "IELTS Writing va professional hisobotlarda gaplarni ixcham va rasmiy qilish uchun.", "Verb → Noun: decide → decision, increase → increase", "Akademik yozuvda fe'l o'rniga ot ishlatish ko'p: 'The company increased' o'rniga 'The company's increase'.", [["The growth of the industry was rapid.", "Sanoat o'sishi tez bo'ldi."], ["The decision was made collectively.", "Qaror jamoaviy qabul qilindi."]], "❌ 'We decided the improvement' ➡️ ✅ 'We improved the process'", ["Eng akademik variant:", "The improvement of the process was significant.", "We improved the process very good.", "The process improved much.", "Nominalisation rasmiy uslub beradi."]],
    ["Cohesive devices va linking words", "Uzun insho yoki nutqda fikrlarni bog'lash, Band 7+ olish uchun.", "Moreover / Nevertheless / Consequently / In addition", "Faqat 'and/but' ishlatish past band belgisi. 'Nevertheless', 'consequently', 'in contrast' kabi bog'lovchilar yuqori baho oladi.", [["Moreover, the policy reduced costs.", "Bundan tashqari, siyosat xarajatlarni kamaytirdi."], ["Nevertheless, the results were inconsistent.", "Shunga qaramay, natijalar barqaror emas edi."]], "❌ 'Besides that also' ➡️ ✅ 'Moreover,'", ["Qaysi bog'lovchi qarama-qarshilik bildiradi?", "Nevertheless", "Moreover", "Consequently", "Nevertheless = shunga qaramay."]],
    ["Hedging: might / tends to / appears to", "Ilmiy va akademik fikrda qat'iy bo'lmagan, ehtiyotli xulosa chiqarish uchun.", "tend to V · appear to V · may/might V", "'This proves' deyish juda qat'iy. 'This suggests / appears to suggest' deyish akademik me'yor.", [["This may suggest a deeper issue.", "Bu chuqurroq muammoni ko'rsatishi mumkin."], ["People tend to overestimate speed.", "Odamlar tezlikni ko'pincha ortiqcha baholaydilar."]], "❌ 'This proves 100%' ➡️ ✅ 'This suggests...'", ["Eng akademik ibora:", "This appears to suggest a trend.", "This is 100% true always.", "This proves everything.", "Hedging ehtiyotlikni ko'rsatadi."]],
    ["Advanced collocations: take part / play a role", "Tabiiy ingliz tilida so'zlash uchun so'z birikmalarini to'g'ri tanlash.", "take part in · play a role in · have an impact on", "So'zma-so'z tarjima qilish o'rniga tayyor collocation ishlating: 'have an impact' (ta'sir qilish).", [["Education plays a vital role in development.", "Ta'lim rivojlanishda muhim rol o'ynaydi."], ["The policy had a positive impact.", "Siyosat ijobiy ta'sir ko'rsatdi."]], "❌ 'make an impact' (ko'pincha noto'g'ri) ➡️ ✅ 'have an impact'", ["To'g'ri birikma:", "take part in the discussion", "do part in the discussion", "make part in the discussion", "take part in — qatnashmoq."]]
  ]
};

/* ======================= MAVSUZLAR BANKI =======================
 * t = mavzu, ic = ikonka, c = kategoriya
 * key = [ [en, uz], ... ]  -> dars va grammatika misollari
 * w   = [ [so'z, o'qilishi, tarjima, misol], ... ]
 * d   = [ [kim, en, uz], ... ]
 * q   = [ savol, to'g'ri, xato1, xato2 ]
 */
const CV_TOPIC_BANK = {
  abroad: [
    {t:"Aeroportda ro'yxatdan o'tish",ic:"✈️",c:"Sayohat · Aeroport",key:[["Could I please have a window seat?","Menga deraza yonidagi o'rindiqni bera olasizmi, iltimos?"],["I would like to check in these two bags.","Bu ikkita sumkamni topshirmoqchi edim."]],w:[["boarding pass","bording pas","parvozga chiqish taloni","Here is your boarding pass."],["departure gate","diparcha geyt","uchib ketish darvozasi","Gate 14 is now boarding."],["carry-on luggage","keri-on lagidj","qo'l yuki","My carry-on bag is small."]],d:[["Agent","Good morning! Can I see your passport, please?","Xayrli tong! Pasportingizni ko'rsata olasizmi, iltimos?"],["Siz","Here you are. Could I have a window seat?","Mana marhamat. Deraza yonidagi joy bormi?"],["Agent","Certainly. Gate 14 is boarding at 10:30.","Albatta. 14-darvoza 10:30 da ochiladi."]],q:["Deraza yonidagi o'rindiqni muloyim qanday so'raysiz?","Could I please have a window seat?","Give me window seat!","I take window seat"]},
    {t:"Bojxona va pasport nazorati",ic:"🛂",c:"Rasmiy muloqot",key:[["I am here for tourism for two weeks.","Men ikki haftaga sayyohlik uchun keldim."],["I have nothing to declare.","Deklaratsiya qiladigan narsam yo'q."]],w:[["purpose of visit","porpos of vizit","tashrif maqsadi","What is the purpose of your visit?"],["declare","dikleyer","ma'lum qilmoq","I have nothing to declare."],["duration of stay","dyureyshn of stey","qolish muddati","My duration of stay is ten days."]],d:[["Officer","What is the purpose of your visit?","Tashrifingizdan maqsad nima?"],["Siz","I am here for tourism for two weeks.","Ikki haftaga sayohat uchun keldim."],["Officer","Do you have anything to declare?","Bojga olinadigan narsangiz bormi?"]],q:["'I have nothing to declare' nimani anglatadi?","Deklaratsiya qiladigan narsam yo'q","Pasportim yo'q","Men ishlayman"]},
    {t:"Taksida manzil aytish",ic:"🚕",c:"Shahar transporti",key:[["Could you please take me to the Grand Hotel?","Meni Grand mehmonxonasiga olib bora olasizmi, iltimos?"],["Please drop me off near the metro station.","Meni metro bekati yonida tushirib keting, iltimos."]],w:[["fare","feyer","yo'l kira haqi","How much is the fare?"],["drop off","drop of","tushirib ketmoq","Drop me off here, please."],["keep the change","kiip de cheyndj","qaytim sizda qolsin","Thank you, keep the change."]],d:[["Siz","Hello! Could you take me to the city centre?","Salom! Meni shahar markaziga olib borolasizmi?"],["Driver","Sure. Please put your luggage in the trunk.","Albatta. Yukingizni bagajga qo'ying."],["Siz","How much will the fare be?","Yo'l kira haqi qancha bo'ladi?"]],q:["Haydovchiga qaytimni qoldirishni qanday aytasiz?","Keep the change, please.","Give money back.","No change for you."]},
    {t:"Mehmonxonaga joylashish",ic:"🏨",c:"Turar joy",key:[["I have a reservation under my name.","Mening nomimga bron bor."],["Is breakfast included in the room price?","Nonushta xona narxiga kiritilganmi?"]],w:[["reservation","rezervleyshn","bron","I made a reservation online."],["key card","kii kaad","xona kartasi","Here is your key card."],["complimentary","komplimentri","bepul (sovg'a)","Wi-Fi is complimentary."]],d:[["Receptionist","Welcome! How may I assist you?","Xush kelibsiz! Qanday yordam bera olaman?"],["Siz","I have a reservation under Aliyev.","Aliyev nomiga bronim bor."],["Receptionist","Is breakfast included?","Nonushta kiritilganmi?"]],q:["'Complimentary Wi-Fi' nima degani?","Bepul Wi-Fi","Faqat pullik Wi-Fi","Wi-Fi yo'q"]},
    {t:"Restoranda buyurtma berish",ic:"🍽️",c:"Taom va xizmat",key:[["I'll have the grilled chicken, please.","Menga qovurilgan tovuq bering, iltimos."],["Could we have the bill, please?","Hisobni olib kelsangiz, iltimos."]],w:[["bill","bil","hisob (chek)","Could we have the bill?"],["still water","still voter","gazsiz suv","Still water, please."],["delicious","delishes","juda mazali","The soup was delicious."]],d:[["Waiter","Are you ready to order?","Buyurtma berishga tayyormisiz?"],["Siz","Yes, I'll have the pasta and still water.","Ha, manga pasta va gazsiz suv."],["Waiter","Anything else?","Yana nimadir kerakmi?"]],q:["Restoranda eng tabiiy buyurtma iborasi?","I'll have the pasta, please.","Give me food now.","Food, fast!"]},
    {t:"Yo'l so'rash va xarita",ic:"🗺️",c:"Yo'nalish",key:[["Excuse me, how can I get to the museum?","Kechirasiz, muzeyga qanday boraman?"],["It's two blocks away, on your left.","Ikki kvartal uzoqlikda, chap tomonda."]],w:[["block","blok","kvartal","Walk two blocks."],["turn right","torn rayt","o'ngga burilmoq","Turn right at the corner."],["straight ahead","streyt ehed","to'g'ri oldinga","Go straight ahead."]],d:[["Siz","Excuse me, where is the nearest station?","Kechirasiz, eng yaqin bekat qayerda?"],["Mahalliy","Go straight and turn left.","To'g'ri boring va chapga buriling."],["Siz","Thank you very much!","Katta rahmat!"]],q:["'Turn right' nimani anglatadi?","O'ngga burilmoq","Chapga burilmoq","To'xtamoq"]},
    {t:"Bank va valyuta almashtirish",ic:"💱",c:"Moliya",key:[["I'd like to exchange some dollars.","Bir necha dollar almashtirmoqchi edim."],["What is the exchange rate today?","Bugungi kurs qancha?"]],w:[["exchange rate","ekscheynj reyt","valyuta kursi","What is the exchange rate?"],["cash","kesh","naqd pul","I need some cash."],["receipt","risiit","kvitansiya","Keep the receipt."]],d:[["Siz","I'd like to exchange 200 dollars.","200 dollar almashtirmoqchi edim."],["Kassir","Please show your passport.","Pasportingizni ko'rsating."],["Siz","Here you are. Thank you.","Mana, rahmat."]],q:["Kursni qanday so'raysiz?","What is the exchange rate?","How much money you?","Rate give me."]},
    {t:"Dorixonada yordam so'rash",ic:"💊",c:"Salomatlik",key:[["I have a headache and a sore throat.","Boshim og'riyapti, tomoq ham og'riyapti."],["Do I need a prescription?","Retsept kerakmi?"]],w:[["symptom","simptom","alomat","Describe your symptoms."],["prescription","preskripshn","retsept","Do you have a prescription?"],["tablet","teblet","tabletka","Take one tablet daily."]],d:[["Siz","I feel sick. I have a headache.","Men o'zimni yomon his qilyapman, boshim og'riyapti."],["Farmasevt","How long have you had it?","Qancha vaqtdan beri?"],["Siz","Since yesterday morning.","Kecha ertalabdan beri."]],q:["Bosh og'rig'ini qanday aytasiz?","I have a headache.","My head is do pain.","Head pain me."]},
    {t:"SIM-karta va internet",ic:"📶",c:"Aloqa",key:[["I'd like a prepaid SIM card with data.","Internetli oldindan to'langan SIM kerak edi."],["How much data is included?","Necha GB internet bor?"]],w:[["data plan","deyta plen","internet paketi","This plan includes 10 GB."],["top up","top ap","hisobni to'ldirmoq","I need to top up."],["coverage","kaverij","qamrov","The coverage is good here."]],d:[["Siz","Do you sell tourist SIM cards?","Turist SIM kartalari bormi?"],["Xodim","Yes, with 10 GB of data.","Ha, 10 GB internet bilan."],["Siz","Great, I'll take one.","Ajoyib, bittasini olaman."]],q:["Internet paketini qanday so'raysiz?","How much data is included?","Give data to me.","Data how much?"]},
    {t:"Kichik suhbat (Small Talk)",ic:"🤝",c:"Jonli muloqot",key:[["Nice to meet you! Where are you from?","Tanishganimdan xursandman! Qayerdansiz?"],["I'm from Uzbekistan. And you?","Men O'zbekistonlikman. Siz-chi?"]],w:[["hobby","xobbi","sevimli mashg'ulot","What is your hobby?"],["weather","vezer","ob-havo","The weather is lovely today."],["actually","ektually","aslint","Actually, I agree with you."]],d:[["Siz","Hi! I'm Sardor. Nice to meet you.","Salom! Men Sardor. Tanishganimdan xursandman."],["Hamroh","Nice to meet you too. I'm Emma.","Men ham xursandman. Men Emma."],["Siz","Where do you work, Emma?","Qayerda ishlaysiz, Emma?"]],q:["Tanishuvda eng tabiiy ibora?","Nice to meet you!","I know you now!","Hello, who are you?"]},
    {t:"Kiyim do'konida xarid",ic:"🛍️",c:"Xarid",key:[["Can I try this on?","Buni kiyib ko'rsam bo'ladimi?"],["Do you have a bigger size?","Kattaroq o'lcham bormi?"]],w:[["size","sayz","o'lcham","What size do you need?"],["fitting room","fitting ruum","kiyinish xonasi","The fitting room is there."],["discount","diskaunt","chegirma","Is there a discount?"]],d:[["Siz","Excuse me, can I try this jacket on?","Kechirasiz, bu ko'ylagini kiyib ko'rsam bo'ladimi?"],["Sotuvchi","Of course. What size?","Albatta. Qaysi o'lcham?"],["Siz","Medium, please.","O'rta, iltimos."]],q:["Kiyimni kiyib ko'rish uchun?","Can I try this on?","Can I wear this now?","I try this."]},
    {t:"Metro va poyezd",ic:"🚇",c:"Transport",key:[["Which line goes to the city centre?","Qaysi liniya shahar markaziga boradi?"],["You need to change at the next station.","Keyingi bektda almashishingiz kerak."]],w:[["platform","platform","perron","The train is at platform 3."],["transfer","transfer","almashish","Transfer to line 2."],["timetable","taymteybl","jadval","Check the timetable."]],d:[["Siz","Which line goes to the airport?","Qaysi liniya aeroportga boradi?"],["Xodim","Take line 5 and transfer at Central.","5-liniyani oling, Markaziy bektda almashing."],["Siz","How long does it take?","Qancha vaqt ketadi?"]],q:["Poyezd almashish uchun ibora?","You need to change trains.","You need to leave train.","Train change you."]}
  ],
  career: [
    {t:"Ish intervyusiga kirish",ic:"💼",c:"Karyera",key:[["I am here for the interview at 10 AM.","Men soat 10 dagi intervyuga keldim."],["Thank you for having me.","Meni qabul qilganingizga rahmat."]],w:[["interview","intervyu","intervyu","I have an interview today."],["position","pozishn","lavozim","I am applying for the position."],["candidate","kendideyt","nomzod","She is a strong candidate."]],d:[["Intervyuer","Tell me about yourself.","O'zingiz haqingizda gapiring."],["Siz","I am a developer with three years of experience.","Men uch yillik tajribali dasturchiman."],["Intervyuer","Why do you want this role?","Nima uchun bu lavozimni xohlaysiz?"]],q:["Intervyuda o'zingizni qanday tanishtirasiz?","I am a developer with three years of experience.","I am a man from Uzbekistan.","I want money."]},
    {t:"Tajriba va ko'nikmalar",ic:"🧩",c:"Rezyume",key:[["I have experience in project management.","Menda loyiha boshqarish tajribasi bor."],["My strongest skill is problem-solving.","Eng kuchli tomonim muammo hal qilish."]],w:[["skill","skil","ko'nikma","Communication is a key skill."],["experience","ekspiriens","tajriba","I have relevant experience."],["achievement","echiivment","yutuq","My biggest achievement was..."]],d:[["Intervyuer","What are your strengths?","Kuchli tomonlaringiz nimalar?"],["Siz","I am analytical and work well in a team.","Men tahliliy va jamoada yaxshi ishlayman."],["Intervyuer","Give me an example.","Misol keltiring."]],q:["'Tajribam bor' qanday deyiladi?","I have experience in...","I have experienced...","I am experience..."]},
    {t:"Nima uchun bu kompaniya?",ic:"🎯",c:"Motivatsiya",key:[["I admire your company's approach to innovation.","Men kompaniyangizning innovatsiyaga yondashuvini qadrlayman."],["This role matches my career goals.","Bu lavozim karyera maqsadlarimga mos."]],w:[["motivation","motiveyshn","motivatsiya","What is your motivation?"],["goal","goul","maqsad","My career goal is..."],["growth","grouz","o'sish","I want professional growth."]],d:[["Intervyuer","Why our company?","Nima uchun bizning kompaniya?"],["Siz","Because of your innovative culture and growth.","Innovatsion madaniyatingiz va o'sish uchun."],["Intervyuer","What do you know about us?","Biz haqimizda nimani bilasiz?"]],q:["Kompaniyaga qiziqishni qanday ifodalaysiz?","I admire your approach to innovation.","You are big company.","I need job now."]},
    {t:"Muvaffaqiyat hikoyasi (STAR)",ic:"⭐",c:"Xulqa",key:[["The situation was challenging, but I led the team.","Vaziyat qiyin edi, lekin men jamoani boshqardim."],["As a result, we reduced costs by 20%.","Natijada xarajatlarni 20% qisqartirdik."]],w:[["situation","situeyshn","vaziyat","Describe the situation."],["action","ekshn","harakat","What action did you take?"],["result","rezult","natija","The result was positive."]],d:[["Intervyuer","Tell me about a difficult task.","Qiyin vazifa haqida gapiring."],["Siz","I led a team of five under a tight deadline.","Men besh kishilik jamoani qisqa muddatda boshqardim."],["Intervyuer","What was the outcome?","Natija qanday bo'ldi?"]],q:["STAR usulida 'R' nimani anglatadi?","Result — natija","Reason — sabab","Role — rol"]},
    {t:"Ish haqi va taklif muhokamasi",ic:"💰",c:"Muzokara",key:[["I would like to discuss the compensation package.","Maosh va imtiyozlarni muhokama qilmoqchi edim."],["Is there room for negotiation?","Muhokama qilish imkoni bormi?"]],w:[["salary","seleri","maosh","What is the salary range?"],["benefits","benefits","imtiyozlar","Benefits include health insurance."],["offer","ofyer","taklif","I received an offer."]],d:[["Siz","Thank you for the offer. Could we discuss the salary?","Taklif uchun rahmat. Maoshni muhokama qilsak bo'ladimi?"],["HR","What are your expectations?","Kutishlaringiz qanday?"],["Siz","I am looking for a competitive package.","Men raqobatbardosh shart izlayapman."]],q:["Maoshni muloyim qanday so'raysiz?","Could we discuss the compensation?","Give me more money!","Salary how much?"]},
    {t:"Professional email yozish",ic:"✉️",c:"Biznes yozuv",key:[["I am writing to follow up on my application.","Arizam bo'yicha xabar olish uchun yozayapman."],["Could you please confirm the meeting time?","Yig'ilish vaqtini tasdiqlab bera olasizmi?"]],w:[["subject line","sabjekt layn","mavzu satri","Write a clear subject line."],["follow up","folou ap","keyin xabar","I am following up."],["regards","rigards","hurmat bilan","Kind regards,"]],d:[["Siz","Dear Ms. Smith, I am writing to follow up...","Hurmatli	xonim Smit, arizam bo'yicha yozayapman..."],["Hamkor","Thank you for your email.","Email uchun rahmat."],["Siz","Kind regards, Sardor","Hurmat bilan, Sardor"]],q:["Emailni hurmat bilan yakunlash uchun?","Kind regards,","Bye-bye!","Good night."]},
    {t:"Jamoada fikr bildirish",ic:"🗣️",c:"Uchrashuv",key:[["In my opinion, this approach is more effective.","Mening fikrimcha, bu yondashuv samararoq."],["Could we consider an alternative?","Boshqa variantni ko'rib chiqsak bo'ladimi?"]],w:[["opinion","opinyon","fikr","In my opinion..."],["suggest","sajest","taklif qilmoq","I suggest a pilot test."],["agree","agriy","rozilanmoq","I agree with you."]],d:[["Hamkor","What do you think about the plan?","Reja haqida nima o'ylaysiz?"],["Siz","In my opinion, we should test it first.","Meningcha, avval sinab ko'rishimiz kerak."],["Hamkor","That sounds reasonable.","Bu oqilona tuyuladi."]],q:["Fikringizni boshlash uchun eng yaxshi ibora?","In my opinion,","I think maybe maybe","Me say this"]},
    {t:"Loyiha holatini hisobot qilish",ic:"📊",c:"Boshqaruv",key:[["The project is on track.","Loyiha reja bo'yicha ketayapti."],["We are facing a small delay in testing.","Testlashda kichik kechikish bor."]],w:[["deadline","dedlayn","muddat","The deadline is Friday."],["progress","progres","jarayon","We made good progress."],["blocker","bloker","to'siq","Is there any blocker?"]],d:[["Meneger","What is the status of the project?","Loyiha holati qanday?"],["Siz","It is on track, but we have one blocker.","Reja bo'yicha, lekin bitta to'siq bor."],["Meneger","How can I help?","Qanday yordam bera olaman?"]],q:["'Loyiha reja bo'yicha' qanday deyiladi?","The project is on track.","The project is good road.","Project going fine yes."]},
    {t:"Mijoz bilan muloqot",ic:"🤝",c:"Mijoz",key:[["Could you clarify your requirements?","Talablaringizni aniqlab bera olasizmi?"],["We will get back to you by Friday.","Juma kunigacha javob beramiz."]],w:[["requirement","rikwayerment","talab","What are your requirements?"],["deadline","dedlayn","muddat","Can we extend the deadline?"],["update","apdeyt","yangilanish","I will send an update."]],d:[["Mijoz","We need this by Tuesday.","Buni seshanbagacha kerak."],["Siz","Could you clarify the scope first?","Avval hajmni aniqlab bera olasizmi?"],["Mijoz","Yes, it is a small change.","Ha, kichik o'zgartirish."]],q:["Talabni aniqlashtirish uchun?","Could you clarify your requirements?","Say clearly please.","What you want?"]},
    {t:"Kasbiy tanaffus va Small Talk",ic:"☕",c:"Ofis madaniyati",key:[["How was your weekend?","Dam olish kunlaringiz qanday o'tdi?"],["I went hiking with my family.","Oila bilan tog'ga chiqdim."]],w:[["weekend","wikend","dam olish kuni","Enjoy your weekend!"],["colleague","koleg","hamkasb","My colleague is from Canada."],["break","breyk","tanaffus","Let's take a short break."]],d:[["Hamkasb","How was your weekend?","Dam olishing qanday bo'ldi?"],["Siz","Great! I went hiking.","Ajoyib! Tog'ga chiqdim."],["Hamkasb","That sounds nice!","Bu juda yaxshi!"]],q:["Dam olish kunini qanday so'raysiz?","How was your weekend?","Where is weekend?","Weekend good?"]},
    {t:"Ishdan ketish va tavsiya",ic:"📄",c:"Karyera o'zgarishi",key:[["I am leaving for a new opportunity.","Yangi imkoniyat uchun ketayapman."],["Could you write me a reference letter?","Menga tavsiya xati yozib bera olasizmi?"]],w:[["resignation","rezignleyshn","ishdan ketish arizasi","I submitted my resignation."],["reference","referens","tavsiya","Can I use you as a reference?"],["transition","tranzishn","o'tish","My transition was smooth."]],d:[["Meneger","We are sorry to hear that.","Buni eshitib afsuslandik."],["Siz","Could you write me a reference letter?","Tavsiya xati yozib bera olasizmi?"],["Meneger","Of course. Good luck!","Albatta. Omad!"]],q:["Tavsiya xatini qanday so'raysiz?","Could you write me a reference letter?","Write me letter now.","Give reference please."]}
  ],
  it: [
    {t:"Daily Standup va vazifalar",ic:"💻",c:"IT · Agile",key:[["What did you work on yesterday?","Kecha nima ustida ishladingiz?"],["I am blocked by the API response.","API javobi tufayli to'silganman."]],w:[["standup","stendap","kunlik yig'ilish","Our standup is at 9:30."],["blocker","bloker","to'siq","Do you have any blockers?"],["sprint","sprint","sprint (ish davri)","The sprint ends on Friday."]],d:[["Scrum Master","What did you do yesterday?","Kecha nima qildingiz?"],["Siz","I finished the login form and tested it.","Login shaklini tugatib, sinab ko'rdim."],["Scrum Master","Any blockers today?","Bugun to'siqlar bormi?"]],q:["'To'silganman' qanday deyiladi?","I am blocked.","I am block.","I blocking now."]},
    {t:"Bug haqida hisobot",ic:"🐞",c:"IT · Debug",key:[["I reproduced the bug on Chrome.","Xatoni Chrome da takrorladim."],["The issue happens only after login.","Muammo faqat login dan keyin yuz beradi."]],w:[["reproduce","riprodyus","takrorlamoq","Can you reproduce the bug?"],["issue","ishyu","muammo","The issue is fixed."],["workaround","vork erraund","vaqtinchalik yechim","We need a workaround."]],d:[["Hamkor","Is the bug still there?","Xato hali ham bormi?"],["Siz","Yes, but only on mobile.","Ha, lekin faqat mobilda."],["Hamkor","Let's check the logs.","Loglarni tekshiraylik."]],q:["Xatoni takrorlash uchun ibora?","I reproduced the bug.","I made the bug again.","I see bug now."]},
    {t:"Kod review va fikr",ic:"🔍",c:"IT · Review",key:[["Could you review my pull request?","Mening PR imni ko'rib chiqib bera olasizmi?"],["I left a comment on line 42.","42-qatorga izoh qoldirdim."]],w:[["pull request","pul rikvest","o'zgartirish taklifi","Please review my PR."],["comment","koment","izoh","I left a comment."],["approve","apruv","tasdiqlamoq","The PR was approved."]],d:[["Siz","Could you review my PR when you have time?","Vaqtingiz bo'lganda PR imni ko'rib chiqasizmi?"],["Hamkor","Sure. I will check it after lunch.","Albatta. Tushdan keyin tekshiraman."],["Siz","Thanks, I addressed your comments.","Rahmat, izohlaringizni bajardim."]],q:["PR ni tasdiqlash uchun?","The PR was approved.","The PR was yes.","Approve the PR done."]},
    {t:"Texnik atamalar va IPA",ic:"🔤",c:"IT · Terms",key:[["The server returns a 500 error.","Server 500 xatosini qaytarayapti."],["We need to deploy the fix today.","Tuzatishni bugun deploy qilishimiz kerak."]],w:[["deploy","diploy","joylashtirmoq","We deploy on Fridays."],["endpoint","endpoynt","API manzili","Call the /users endpoint."],["cache","kesh","kesh","Clear the cache."]],d:[["Siz","The endpoint is slow in production.","Ishlab chiqarishda endpoint sekin."],["Hamkor","Check the cache first.","Avval keshni tekshir."],["Siz","Good idea, I will add logging.","Yaxshi fikr, log qo'shaman."]],q:["'Server qaytarayapti' qanday?","The server returns...","The server give back...","Server return it."]},
    {t:"Uchrashuvda texnik tushuntirish",ic:"📊",c:"IT · Meeting",key:[["The main bottleneck is the database query.","Asosiy to'siq ma'lumotlar bazasi so'rovi."],["I suggest adding an index.","Index qo'shishni taklif qilaman."]],w:[["bottleneck","botlnek","asosiy to'siq","Find the bottleneck."],["query","kveri","so'rov","Optimize the query."],["index","indeks","indeks","Add an index."]],d:[["Meneger","Why is the page slow?","Sahifa nima uchun sekin?"],["Siz","The bottleneck is a heavy query.","To'siq — og'ir so'rov."],["Meneger","What is your suggestion?","Taklifingiz nima?"]],q:["Taklif qilish uchun eng yaxshi ibora?","I suggest adding an index.","I add index maybe.","Index do it."]},
    {t:"Hujjatlar va README",ic:"📚",c:"IT · Docs",key:[["Could you document this endpoint?","Bu endpoint ni hujjatlashtirasizmi?"],["The README needs an update.","README yangilanishga muhtoj."]],w:[["documentation","dokyumenteyshn","hujjatlar","Read the documentation."],["update","apdeyt","yangilash","I will update the docs."],["example","egzempl","misol","Add a usage example."]],d:[["Siz","The documentation is outdated.","Hujjatlar eskirgan."],["Hamkor","Let's update it together.","Birga yangilaylik."],["Siz","I will add examples and notes.","Misollar va izohlar qo'shaman."]],q:["'Hujjatlar eskirgan' qanday?","The documentation is outdated.","Docs are old very much.","Documentation no good."]},
    {t:"Git va branch nomlari",ic:"🌿",c:"IT · Git",key:[["I created a feature branch.","Men feature branch yaratdim."],["Please merge it after review.","Ko'rib chiqilgandan keyin birlashtiring."]],w:[["branch","brench","tarmoq","Switch to the new branch."],["commit","komit","o'zgarish yozuvi","Make a clear commit message."],["merge","merj","birlashtirmoq","Merge the branch."]],d:[["Siz","I pushed the branch to remote.","Branch ni masofaga yubordim."],["Hamkor","Did you open a pull request?","PR ochdingizmi?"],["Siz","Yes, it is ready for review.","Ha, ko'rib chiqishga tayyor."]],q:["O'zgarish yozuvi nima?","commit","commits","commiting"]},
    {t:"Texnik qo'llab-quvvatlash",ic:"🛠️",c:"IT · Support",key:[["Could you describe the error message?","Xato xabarini tasvirlab bera olasizmi?"],["I will look into it right away.","Men darhol tekshiraman."]],w:[["error message","eror mesij","xato xabari","Copy the error message."],["investigate","investigeyt","tekshirmoq","We will investigate."],["resolve","rezolv","hal qilmoq","The issue was resolved."]],d:[["Foydalanuvchi","The app crashes on login.","Ilova login da o'chib qoladi."],["Siz","Could you send a screenshot?","Skrinshot yubora olasizmi?"],["Foydalanuvchi","Sure, just sent it.","Albatta, yubordim."]],q:["Muammoni hal qilmoq qanday?","resolve the issue","resolve issue the","do issue resolve"]},
    {t:"Loyiha muddati va reja",ic:"📅",c:"IT · Planning",key:[["We need to finish this by Friday.","Buni juma kunigacha tugatishimiz kerak."],["Let's prioritize the core features.","Asosiy funksiyalarga ustunlik beraylik."]],w:[["estimate","estimeyt","baholash","Give a rough estimate."],["milestone","maylston","bosqich","The first milestone is done."],["scope","skoup","ish hajmi","The scope changed."]],d:[["Meneger","Can we release next week?","Keyingi hafta chiqara olamizmi?"],["Siz","If the tests pass, yes.","Agar testlar o'tsa, ha."],["Meneger","Great, keep me updated.","Yaxshi, xabardor qilib turing."]],q:["Ish hajmi o'zgardi qanday?","The scope changed.","Scope is change.","The scope change it."]},
    {t:"AI bilan hamkorlik",ic:"🤖",c:"IT · AI",key:[["Could you explain this code step by step?","Bu kodni bosqichma-bosqich tushuntirib bera olasizmi?"],["Simplify the answer for a beginner.","Javobni boshlang'ich uchun soddalashtiring."]],w:[["explain","ikspleyn","tushuntirmoq","Explain the logic."],["simplify","simplifay","soddalashtirmoq","Simplify this function."],["example","egzempl","namuna","Show me an example."]],d:[["Siz","Could you explain this regex?","Bu regexni tushuntirasizmi?"],["AI","Sure! It matches an email pattern.","Albatta! U email naqshini topadi."],["Siz","Great, can you simplify it?","Ajoyib, soddalashtirasizmi?"]],q:["Kodni tushuntirishni so'rash?","Could you explain this code?","Explain code you now.","Code explain me."]},
    {t:"Xalqaro jamoada muloqot",ic:"🌍",c:"IT · Team",key:[["Let's sync on this tomorrow.","Buni ertaga muhokama qilaylik."],["I will share the update in the channel.","Yangilanishni kanalga ulashaman."]],w:[["sync","sink","muvofiqlashtirmoq","Let's sync quickly."],["channel","chenel","kanal","Post it in the channel."],["update","apdeyt","yangilanish","Any updates?"]],d:[["Hamkor","Do you have time for a quick call?","Qisqa qo'ng'iroqqa vaqtingiz bormi?"],["Siz","Yes, after the standup.","Ha, standup dan keyin."],["Hamkor","Perfect, thanks!","Ajoyib, rahmat!"]],q:["'Buni muhokama qilaylik' qanday?","Let's sync on this.","Let's talk this.","We sync now."]},
    {t:"Texnik intervyu savollari",ic:"🎯",c:"IT · Interview",key:[["Tell me how you would design this system.","Bu tizimni qanday loyihalashinizni ayting."],["I would start with the data model.","Men ma'lumotlar modelidan boshlardim."]],w:[["design","dizayn","loyihalamoq","Design the architecture."],["trade-off","treyd of","kelishuv (afzallik-kamchilik)","What is the trade-off?"],["scalability","skeyelebility","kengaytiruvchanlik","Think about scalability."]],d:[["Intervyuer","How would you scale this service?","Bu xizmatni qanday kengaytirasiz?"],["Siz","I would add caching and a queue.","Kesh va navbat qo'shdim."],["Intervyuer","Why a queue?","Nega navbat?"]],q:["'Kengaytiruvchanlik' qanday?","scalability","scale-ability","scalingness"]}
  ],
  study: [
    {t:"IELTS Speaking: o'zingizni tanishtirish",ic:"🎤",c:"IELTS · Speaking",key:[["Could you tell us a little about yourself?","O'zingiz haqingizda qisqa gapirib bera olasizmi?"],["I currently work as a developer and study English daily.","Hozir dasturchi bo'lib ishlayman va har kuni inglizcha o'qiman."]],w:[["currently","karentli","hozirda","I currently live in Tashkent."],["hobbies","xobiz","sevimli mashg'ulotlar","My hobbies include reading."],["future plans","fyucher plenz","kelajak rejalari","My future plan is to study abroad."]],d:[["Examiner","Could you tell us your name?","Ismingizni ayting, iltimos."],["Siz","My name is Sardor. I am from Uzbekistan.","Mening ismim Sardor. Men O'zbekistonlikman."],["Examiner","What do you do?","Nima qilasiz?"]],q:["Speaking Part 1 da javob qanday bo'lishi kerak?","Qisqa, lekin to'liq va tabiiy","Faqat bir so'z","Uzun monolog"]},
    {t:"IELTS Speaking Part 2: Cue Card",ic:"🗣️",c:"IELTS · Speaking",key:[["Describe a place you would like to visit.","Bormoqchi bo'lgan joyingizni tasvirlang."],["I would like to talk about Japan, which I visited last year.","Men o'tgan yili borgan Yaponiya haqida gapirmoqchiman."]],w:[["describe","diskrayb","tasvirlamoq","Describe the place in detail."],["memory","memori","xotira","It is a happy memory."],["impression","impreshn","taassurot","It left a strong impression."]],d:[["Examiner","You have one minute to prepare.","Tayyorgarlik uchun bir daqiqa bor."],["Siz","I'd like to describe a small town near my home.","Uyim yaqinidagi kichik shahar haqida gapirmoqchiman."],["Examiner","Please start whenever you are ready.","Tayyor bo'lganingizda boshlang."]],q:["Cue Card da eng muhim narsa?","Tuzilma: joy, sabab, misol, xulosa","Faqat grammatika","Faqat lug'at"]},
    {t:"IELTS Writing Task 1: grafik",ic:"📈",c:"IELTS · Writing",key:[["The chart shows a steady increase in sales.","Grafik sotuvlarning barqaror o'sishini ko'rsatadi."],["Overall, the trend was upward.","Umuman olganda, tendentsiya yuqoriga qarab bo'ldi."]],w:[["overall","overol","umuman","Overall, the trend changed."],["fluctuate","floktyueyt","o'zgarib turmoq","Prices fluctuated slightly."],["significant","signifikent","muhim","There was a significant rise."]],d:[["Siz","The graph illustrates the number of visitors.","Grafik tashrif buyuruvchilar sonini ko'rsatadi."],["O'qituvchi","Good. Now add an overview.","Yaxshi. Endi umumiy xulosa qo'shing."],["Siz","Overall, the figure doubled by 2020.","Umuman, ko'rsatkich 2020 yilga kelib ikki baravar oshdi."]],q:["Task 1 da 'umuman olganda' qanday deyiladi?","Overall,","In my opinion,","Firstly,"]},
    {t:"IELTS Writing Task 2: insho",ic:"✍️",c:"IELTS · Writing",key:[["This essay will discuss both views.","Bu inshoda har ikki nuqtai nazar muhokama qilinadi."],["I firmly believe that education is the key.","Men ta'lim asosiy ekanligiga qat'iy ishonaman."]],w:[["thesis statement","tisis steytment","asosiy fikr","Write a clear thesis."],["argument","argyument","dalil","Support your argument."],["conclusion","konklyujn","xulosa","In conclusion,"]],d:[["O'qituvchi","What is your thesis statement?","Asosiy fikringiz nima?"],["Siz","This essay argues that technology improves learning.","Bu insho texnologiya o'qishni yaxshilaydi deb hisoblaydi."],["O'qituvchi","Add a real-world example.","Hayotiy misol qo'shing."]],q:["Inshoni qanday boshlash yaxshi?","Paraphrase the question + thesis","Faqat 'I think'","To'g'ridan-to'g'ri xulosa"]},
    {t:"CEFR darajalari va o'z bahosi",ic:"📊",c:"CEFR",key:[["My current level is around B1.","Mening hozirgi darajam taxminan B1."],["I can handle everyday conversations but need more fluency.","Kundalik suhbatlarni qila olaman, lekin ravonlik yetishmaydi."]],w:[["level","levl","daraja","What is your CEFR level?"],["fluency","fluensi","ravonlik","Improve your fluency."],["accuracy","akyurasi","aniqlik","Focus on accuracy."]],d:[["O'qituvchi","Where would you place yourself?","O'zingizni qayerda deb baholaysiz?"],["Siz","I would say B1, close to B2 in speaking.","B1 deb aytardim, gapirishda B2 ga yaqin."],["O'qituvchi","What is your main challenge?","Asosiy qiyinchilikingiz nima?"]],q:["'Ravonlik' inglizchasi?","fluency","fluentness","flowing"]},
    {t:"IELTS Listening: yo'nalish va raqamlar",ic:"🎧",c:"IELTS · Listening",key:[["The library is opposite the station.","Kutubxona bekat qarshisida."],["Please write the number clearly.","Raqamni aniq yozing, iltimos."]],w:[["opposite","opozit","qarshisida","It is opposite the park."],["quarter","kworter","chorak (15 daqiqa)","At quarter past three."],["booking reference","bukin referens","band raqami","Write the booking reference."]],d:[["Audio","The bus leaves at half past eight.","Avtobus soat sakkiz yarimda ketadi."],["Siz","Eight thirty, thank you.","Sakkiz o'ttiz, rahmat."],["Audio","Your booking reference is A14.","Band raqamingiz A14."]],q:["'half past eight' necha?","8:30","8:15","7:30"]},
    {t:"Akademik lug'at va collocations",ic:"📚",c:"Academic",key:[["This phenomenon has a significant impact.","Bu hodisa muhim ta'sir ko'rsatadi."],["The results suggest a clear correlation.","Natijalar aniq bog'liqlikni ko'rsatadi."]],w:[["phenomenon","fenomenon","hodisa","A common phenomenon."],["impact","impakt","ta'sir","Have a positive impact."],["correlation","koreleyshn","bog'liqlik","There is a correlation."]],d:[["O'qituvchi","Use a stronger word than 'good'.","'Good' dan kuchliroq so'z ishlating."],["Siz","The policy was beneficial.","Siyosat foydali bo'ldi."],["O'qituvchi","Excellent collocation!","Ajoyib birikma!"]],q:["'Ta'sir qilish' eng tabiiy ibora?","have an impact on","do impact to","make impact on"]},
    {t:"Grammatika xatolarini tahlil qilish",ic:"🔍",c:"Grammar",key:[["I didn't go to class yesterday.","Men kecha darsga bormadim."],["If I had studied harder, I would have passed.","Agar ko'proq o'qiganimda edi, o'tgan bo'lardim."]],w:[["mistake","misteyk","xato","Correct the mistake."],["tense","tens","zamon","Check the tense."],["agreement","agriyment","moslashuv","Subject-verb agreement."]],d:[["O'qituvchi","Find the error: 'He don't like it.'","Xatoni toping: 'He don't like it.'"],["Siz","It should be 'He doesn't like it.'","'He doesn't like it.' bo'lishi kerak."],["O'qituvchi","Correct! Why?","To'g'ri! Nega?"]],q:["'He don't like' nega xato?","He bilan doesn't ishlatiladi","Don't doim to'g'ri","Fe'l oxiriga s qo'shiladi"]},
    {t:"Talaffuz va intonatsiya",ic:"🗣️",c:"Pronunciation",key:[["Could you repeat that more slowly, please?","Buni sekinroq takrorlab bera olasizmi, iltimos?"],["I need to work on my pronunciation.","Talaffuzim ustida ishlashim kerak."]],w:[["pronunciation","pronansieyshn","talaffuz","Improve pronunciation."],["stress","stres","urg'u","Word stress matters."],["repeat","ripiit","takrorlamoq","Repeat after me."]],d:[["O'qituvchi","Stress the second syllable: de-VEL-opment.","Ikkinchi bo'g'inga urg'u: de-VEL-opment."],["Siz","de-VEL-opment. Did I get it right?","de-VEL-opment. To'g'ri qildimmi?"],["O'qituvchi","Perfect!","Ajoyib!"]],q:["Sekin takrorlashni qanday so'raysiz?","Could you repeat that more slowly?","Repeat slow you.","Say again slowly please you."]},
    {t:"Time management va o'qish rejasi",ic:"⏳",c:"Study skills",key:[["I study English for thirty minutes every day.","Men har kuni ingliz tilini 30 daqiqa o'qiman."],["I review my mistakes once a week.","Xatolarimni haftada bir marta takrorlayman."]],w:[["routine","rutin","kundalik tartib","Build a daily routine."],["review","rivyu","takrorlash","Review your notes."],["consistent","konsistent","izchil","Be consistent."]],d:[["O'qituvchi","How do you practise?","Qanday mashq qilasiz?"],["Siz","I practise speaking with AI every evening.","Har oqshom AI bilan gapirishni mashq qilaman."],["O'qituvchi","That is very consistent.","Bu juda izchil ekan."]],q:["Izchil bo'lish qanday deyiladi?","be consistent","be consistence","make consistent"]},
    {t:"Motivatsiya va maqsad",ic:"🔥",c:"Mindset",key:[["My goal is to pass IELTS with Band 7.5.","Maqsadim IELTS ni 7.5 band bilan topshirish."],["I am confident because I practise daily.","Har kuni mashq qilganim uchun ishonchim bor."]],w:[["goal","goul","maqsad","Set a clear goal."],["confident","konfident","ishonchli","Feel confident."],["progress","progres","taraqqiyot","Track your progress."]],d:[["Hamroh","Why are you learning English?","Nega inglizcha o'qiyapsiz?"],["Siz","To study abroad and build a better career.","Chet elda o'qish va yaxshi karyera uchun."],["Hamroh","That is a strong motivation.","Bu kuchli motivatsiya."]],q:["Maqsad qanday deyiladi?","goal","goall","purpose goal"]},
    {t:"Final mock test strategiyasi",ic:"🏁",c:"Exam strategy",key:[["I manage my time carefully in the writing test.","Yozma testda vaqtimni ehtiyot bilan boshqaraman."],["I answer the easy questions first.","Avval oson savollarga javob beraman."]],w:[["strategy","streteji","strategiya","Use a clear strategy."],["time management","taym men ejment","vaqt boshqaruvi","Practise time management."],["mock test","mok test","sinov testi","Take a mock test."]],d:[["O'qituvchi","What is your exam strategy?","Imtihon strategiyangiz nima?"],["Siz","I skim the questions and start with the easiest.","Savollarni ko'zdan kechirib, eng osonidan boshlayman."],["O'qituvchi","Excellent approach.","Ajoyib yondashuv."]],q:["Vaqtni boshqarish qanday deyiladi?","time management","time manager","manage time self"]}
  ]
};

/* ======================= HARVARD USLUBIDAGI CASE BANKI =======================
 * Metodologiya: case-method + Socratic seminar.
 * Bu mustaqil o'quv materiali bo'lib, Harvard University rasmiy darslari emas.
 * Har bir case: vaziyat → manfaatdorlar → dilemma → savollar → qaror → xulosa.
 */
const CV_METHOD_LABEL = "Harvard uslubi · Case Method";
const CV_METHOD_NOTE = "Sokratik savol-javob va qaror asoslash orqali o'rganish";

const CV_CASE_BANK = {
  abroad: [
    {
      title: "Deraza yonidagi o‘rin: navbat va muloyimlik",
      context: "Siz xalqaro parvozga ro‘yxatdan o‘tyapsiz. Parvoz 15 daqiqadan keyin boshlanadi, navbat uzoq. Deraza yonidagi oxirgi o‘rin faqat muloyim va aniq iltimos bilan berilishi mumkin.",
      stakeholders: ["Siz", "Registrator", "Orqadagi yo‘lovchi"],
      dilemma: "O‘rinni talab qilish kerakmi yoki vaziyatni tushuntirib, muloyim so‘rash kerakmi?",
      objective: "Muloyim iltimos va qisqa asos bilan o‘rinni so‘rab, qaroringizni inglizcha tushuntirish.",
      framework: ["Vaziyatni o‘qing", "Kimga ta’siri borligini aniqlang", "Muloyim iborani tanlang", "Qarorni bir jumla bilan asoslang"],
      socratic: [
        { q: "Registratorning vazifasi nima va sizning maqsadingiz nima?", hint: "U navbatni tez boshqarishga mas’ul; sizga esa aniq va qisqa iltimos kerak." },
        { q: "Nima uchun 'Give me a window seat' ishlamasligi mumkin?", hint: "Bu buyruq ohangida. Muloyimlik hamkasblik munosabatini saqlaydi." },
        { q: "Qaysi ibora eng qisqa, lekin eng professional?", hint: "Could I please...? + if one is available." }
      ],
      decision: "Registratorga qanday murojaat qilasiz?",
      answer: "Could I please have a window seat, if one is available?",
      decoys: ["Give me a window seat now!", "I want window seat please yes."],
      reflection: ["Muloyim ibora qarshingizdagi odamning munosabatini qanday o‘zgartirdi?", "Qaysi so‘z sizning iltimosingizni professional qildi?", "Keyingi safar qaysi iborani ishlatasiz?"],
      takeaway: "Could I please...? iborasi maqsadni aniq saqlagan holda hurmat ko‘rsatadi."
    },
    {
      title: "Bojxonada ikki haftalik maqsad",
      context: "Bojxona xodimi tashrif maqsadini so‘rayapti. Sizda taklifnoma bor, ammo chipta va mehmonxona broningiz ham bor. Suhbat 20 soniya davom etishi kerak.",
      stakeholders: ["Siz", "Bojxona xodimi", "Kelish joyidagi hamkor"],
      dilemma: "Qisqa javob berish kerakmi yoki barcha hujjatlarni sanab o‘tish kerakmi?",
      objective: "Tashrif maqsadi va muddatini bitta aniq, ishonchli gapda ifodalash.",
      framework: ["Maqsadni nomlang", "Muddatni qo‘shing", "Dalilni qisqa qo‘shing", "Javobni yakunlang"],
      socratic: [
        { q: "Xodimga birinchi navbatda nima kerak: hujjatlar ro‘yxati yoki maqsad?", hint: "Maqsad va muddat — eng tez tekshiriladigan ma’lumot." },
        { q: "'I go there' nega etarli emas?", hint: "Maqsad va muddat yo‘q, shuning uchun xodim yana savol beradi." },
        { q: "Dalilni qanday qisqa qo‘shish mumkin?", hint: "and I have the invitation letter." }
      ],
      decision: "Xodimga eng yaxshi javobingiz nima?",
      answer: "I am here for a two-week study visit, and I have the invitation letter.",
      decoys: ["I go there for some days.", "Tourist maybe, I don't know."],
      reflection: ["Qisqa javob nima uchun ishonchliroq tuyuldi?", "Maqsad va muddatni alohida qanday aytib berasiz?", "Boshqa rasmiy suhbatda qanday foydalanasiz?"],
      takeaway: "Rasmiy muloqotda maqsad + muddat + dalil eng kuchli qisqa formula."
    },
    {
      title: "Bron xatosi: xona turi noto‘g‘ri",
      context: "Mehmonxonada broningiz bor, lekin tizimda twin o‘rniga double xona ko‘rsatilgan. Siz erta keldingiz, faqat bir xona bo‘sh.",
      stakeholders: ["Siz", "Resepshionist", "Mehmonxona menejeri"],
      dilemma: "Xatoni qanday bildirasizki, ham qo‘pollik qilmay, ham muammo hal bo‘lsin?",
      objective: "Muammoni xolislik bilan bildirib, muqobil yechim so‘rash.",
      framework: ["Bronni tasdiqlang", "Farqni ko‘rsating", "Iltimos qo‘shing", "Yechim taklif qiling"],
      socratic: [
        { q: "Nima uchun 'Your booking is wrong' deyish xavfli?", hint: "Bu ayblov ohangi; resepsionist himoyalanishi mumkin." },
        { q: "Muammoni qanday neytral tasvirlaysiz?", hint: "'it appears to be...' deyish xatoni sizga bog‘lamaydi." },
        { q: "Qanday yechim so‘rash mumkin?", hint: "'could you check if a double room is available?' deyish mumkin." }
      ],
      decision: "Resepsionistga nima deysiz?",
      answer: "I have a reservation under Aliyev, but it appears to be for a twin room; could you check if a double room is available?",
      decoys: ["Your booking is completely wrong!", "I don't like this room, change it."],
      reflection: ["Neytral til qaror qabul qilishni qanday osonlashtirdi?", "Qaysi so‘z ayblovni oldi?", "Xatolikni boshqa vaziyatda qanday tasvirlaysiz?"],
      takeaway: "Muammoni 'it appears...' bilan tasvirlash xatoni ayblovga aylantirmaydi."
    }
  ],
  career: [
    {
      title: "Intervyuda qiyin vazifa haqida so‘rov",
      context: "Intervyuer: 'Qiyin vazifa haqida gapiring,' deydi. Sizning javobingiz 45 soniya davom etishi va aniq natija bilan tugashi kerak.",
      stakeholders: ["Siz", "Intervyuer", "Kelajakdagi jamoa"],
      dilemma: "Umumiy maqtov gapirish kerakmi yoki aniq hodisa bilan isbotlash kerakmi?",
      objective: "STAR tuzilmasi bilan vaziyat, harakat va natijani qisqa bayon qilish.",
      framework: ["Situation", "Task", "Action", "Result"],
      socratic: [
        { q: "Nega 'I am a hard worker' dalil hisoblanmaydi?", hint: "Bu da’vo; intervyuer misol kutadi." },
        { q: "Qaysi qism sizning shaxsiy hissangizni ko‘rsatadi?", hint: "Action — siz qilgan ish." },
        { q: "Natijani qanday o‘lchash mumkin?", hint: "20% qisqartirish, 3 kishilik jamoa, 1 hafta tejash." }
      ],
      decision: "Qaysi javob tuzilmasi eng ishonchli?",
      answer: "I would use STAR: the situation, my task, the action I took, and the measurable result.",
      decoys: ["I am a very hard worker and I like teams.", "It was not my fault, the team was late."],
      reflection: ["O‘zingizning 'Action' qismingizni qanday ajratib ko‘rsatasiz?", "Natijani raqam bilan qanday ifodalaysiz?", "Bu tuzilmani qaysi savolga qo‘llaysiz?"],
      takeaway: "STAR javobi da’vo o‘rniga isbot beradi: vaziyat → vazifa → harakat → natija."
    },
    {
      title: "Muddat qisqardi: nimani birinchi qilamiz?",
      context: "Mijoz relizni 3 kun oldinga surdi. Jamoada 5 kishi bor, lekin barcha funksiyalarni tugatib bo‘lmaydi.",
      stakeholders: ["Siz", "Mijoz", "Jamoa", "Meneger"],
      dilemma: "Hamma narsani va’da qilish kerakmi yoki ustuvorlik taklif qilish kerakmi?",
      objective: "Cheklovni tan olib, asosli ustuvorlik taklif qilish.",
      framework: ["Cheklovni aniqlang", "Asosiy maqsadni saqlang", "Kechiktirishni taklif qiling", "Sababini tushuntiring"],
      socratic: [
        { q: "'Hammasini qilamiz' degan va’da qanday xavf tug‘diradi?", hint: "Sifat va ishonch pasayadi." },
        { q: "Mijoz uchun eng muhim natija nima?", hint: "Asosiy funksiyaning ishlashi." },
        { q: "Kechiktirishni qanday professional aytasiz?", hint: "move the rest to the next sprint." }
      ],
      decision: "Jamoa nomidan qanday qaror taklif qilasiz?",
      answer: "I suggest we prioritize the core feature and move the rest to the next sprint.",
      decoys: ["We can do everything, no problem at all.", "It is impossible, sorry."],
      reflection: ["Ustuvorlik qarori kimga foyda keltirdi?", "Qaysi ibora cheklovni hurmat bilan bildirdi?", "O‘xshash vaziyatda qanday savol berasiz?"],
      takeaway: "Professional qaror cheklovni yashirmay, asosiy maqsadni saqlaydi."
    },
    {
      title: "Taklifni muhokama qilish",
      context: "Sizga ish taklifi keldi. Maosh siz kutgandan past, lekin kompaniya va rol sizga mos. HR javob kutayapti.",
      stakeholders: ["Siz", "HR", "Boshqaruvchi"],
      dilemma: "Darhol rad etish kerakmi yoki shartlarni muhokama qilish kerakmi?",
      objective: "Minnetdorlik va muloyimlik bilan muhokama boshlash.",
      framework: ["Rahmat bildiring", "Qiziqishni tasdiqlang", "Muhokama so‘rang", "Mezonni qo‘shing"],
      socratic: [
        { q: "Nima uchun avval 'thank you' muhim?", hint: "U munosabatni himoya qiladi." },
        { q: "Qanday so‘z qat’iy talabni muloyim so‘rovga aylantiradi?", hint: "could we discuss..." },
        { q: "Nima uchun 'review timeline' qo‘shish foydali?", hint: "U kelajakdagi o‘sish imkoniyatini ko‘rsatadi." }
      ],
      decision: "HR ga qanday javob berasiz?",
      answer: "Thank you for the offer. Could we discuss the compensation package and the review timeline?",
      decoys: ["Give me more money or I will not come.", "I don't care, anything is fine."],
      reflection: ["Muloyim so‘rov qaror qabul qilishni qanday osonlashtirdi?", "Qaysi so‘z sizning pozitsiyangizni kuchaytirdi?", "Keyingi muzokarada nima qo‘shasiz?"],
      takeaway: "Muhokama hurmat bilan boshlansa, mazmun ham hurmat bilan eshitiladi."
    }
  ],
  it: [
    {
      title: "Production xatosi: qayerdan boshlaysiz?",
      context: "Foydalanuvchilar login dan keyin sahifa sekin yuklanayotganini ayttyapti. Xato faqat Chrome da, lokal muhitda takrorlanmaydi.",
      stakeholders: ["Siz", "Foydalanuvchilar", "QA", "Meneger"],
      dilemma: "Tasdiqlanmagan sababni aytish kerakmi yoki dalil bilan boshlash kerakmi?",
      objective: "Kuzatish, dalil va taklifni bitta texnik hisobotda birlashtirish.",
      framework: ["Takrorlash", "Dalil to‘plash", "Sababni toraytirish", "Kichik taklif"],
      socratic: [
        { q: "'It works on my machine' nima uchun yetarli emas?", hint: "Muammo production muhitida." },
        { q: "Qaysi ma’lumot sababni toraytiradi?", hint: "browser, login keyingi holat, loglar." },
        { q: "Taklifni qanday kichik qilasiz?", hint: "Bitta o‘lchov va bitta indeks." }
      ],
      decision: "Menegernga birinchi hisobotingiz nima?",
      answer: "I reproduced it on Chrome after login; the logs point to a slow query, and I suggest adding an index.",
      decoys: ["It works on my machine, probably fine.", "The server is just bad, I don't know."],
      reflection: ["Dalilni qanday ajratdingiz?", "Qaysi qism taxmin, qaysi qism kuzatish?", "Keyingi qadamni qanday o‘lchaysiz?"],
      takeaway: "Yaxshi texnik hisobot kuzatish → sabab → taklif tartibida bo‘ladi."
    },
    {
      title: "Code review izohlari",
      context: "Hamkoringiz PR ga 3 ta izoh qoldirdi. Ulardan birini siz noto‘g‘ri deb o‘ylaysiz, lekin jamoa standarti bor.",
      stakeholders: ["Siz", "Hamkor", "Jamoa", "Kelajakdagi o‘quvchilar"],
      dilemma: "Izohni rad etish kerakmi yoki tushunib, javob berish kerakmi?",
      objective: "Fikrni qabul qilib, bajarilgan ishni aniq hisobot qilish.",
      framework: ["Izohni o‘qing", "Sababni so‘rang yoki qabul qiling", "O‘zgartirish kiriting", "Test qo‘shing"],
      socratic: [
        { q: "Nega 'I ignored the comments' xavfli?", hint: "Hamkorlik va sifat buziladi." },
        { q: "Qaysi so‘z ish bajarilganini ko‘rsatadi?", hint: "addressed." },
        { q: "Nima uchun test qo‘shish muhim?", hint: "U qarorni mustahkamlaydi." }
      ],
      decision: "PR izohiga qanday javob yozasiz?",
      answer: "Thanks, I addressed your comments and added a test for the edge case.",
      decoys: ["I ignored your comments, it was fine.", "It was already correct from the start."],
      reflection: ["Qaysi izoh sizga yangi narsa o‘rgatdi?", "O‘zgartirishni qanday qisqa tasdiqlaysiz?", "Keyingi PR da nima qilasiz?"],
      takeaway: "Review izohiga konstruktiv javob — hamkorlik va sifat belgisi."
    },
    {
      title: "Tizimni kengaytirish savoli",
      context: "Texnik intervyuda: 'Foydalanuvchilar 10 barobar ko‘paydi, xizmatni qanday kengaytirasiz?' deyishadi. Aniq javob 30 soniya bo‘lishi kerak.",
      stakeholders: ["Siz", "Intervyuer", "Foydalanuvchilar"],
      dilemma: "Umumiy so‘zlar bilan javob berish kerakmi yoki o‘lchov va qadam taklif qilish kerakmi?",
      objective: "Kengaytirish qarorini bosqichma-bosqich va asosli tushuntirish.",
      framework: ["O‘lchang", "Eng katta to‘siqni toping", "Kesh va navbat", "Natijani tekshiring"],
      socratic: [
        { q: "Nega faqat 'add more servers' etarli emas?", hint: "Avval to‘siqni o‘lchash kerak." },
        { q: "Kesh qaysi muammoni hal qiladi?", hint: "Takroriy og‘ir so‘rovlarni kamaytiradi." },
        { q: "Navbat nima uchun kerak?", hint: "Yukni vaqtga taqsimlaydi." }
      ],
      decision: "Intervyuernga qisqa javobingiz?",
      answer: "I would start with caching, then add a queue and measure the bottleneck before adding servers.",
      decoys: ["Just add more servers, that's all.", "I don't know, maybe it will work."],
      reflection: ["Avval nima o‘lchardingiz?", "Qaysi qadam eng katta ta’sir qildi?", "Bu javobni qanday qisqartirasiz?"],
      takeaway: "Kengaytirish — taxmin emas, o‘lchov va ketma-ket qarorlar."
    }
  ],
  study: [
    {
      title: "IELTS Writing: vaqt tanqisligi",
      context: "Task 2 ga 22 daqiqa qoldi. Sizda kuchli fikr bor, lekin insho hali boshlanmadi. Examiner tuzilma va misol qidiradi.",
      stakeholders: ["Siz", "Examiner", "Baholash mezonlari"],
      dilemma: "Darhol yozishni boshlash kerakmi yoki 2 daqiqa reja tuzish kerakmi?",
      objective: "Tez reja, aniq tezis va konkret misol bilan insho boshlash.",
      framework: ["2 daqiqa reja", "Tezis", "Asosiy dalil", "Misol va xulosa"],
      socratic: [
        { q: "Rejasiz yozish qayerda vaqt yo‘qotadi?", hint: "O‘rtada fikr o‘zgaradi." },
        { q: "Tezis nima vazifasini bajaradi?", hint: "Yo‘nalish va baholash uchun asos." },
        { q: "Qaysi misol bandni ko‘taradi?", hint: "Aniq, hayotiy va mavzuga bog‘liq." }
      ],
      decision: "Birinchi 60 soniyada nima qilasiz?",
      answer: "I would plan for two minutes, write a clear thesis, and keep one paragraph for a concrete example.",
      decoys: ["I write as much as possible without planning.", "I skip the thesis and start examples."],
      reflection: ["Reja qanday vaqt tejadi?", "Tezisingiz qanday aniq bo‘ldi?", "Qaysi misol eng kuchli edi?"],
      takeaway: "Band 7+ yo‘li — tuzilma, tezis va konkret dalil."
    },
    {
      title: "Speaking Cue Card: bitta hikoya",
      context: "Examiner 'Bormoqchi bo‘lgan joyingizni tasvirlang' deydi. Bir daqiqa tayyorgarlik, keyin 1-2 daqiqa gapirish kerak.",
      stakeholders: ["Siz", "Examiner", "Baholovchi"],
      dilemma: "Yodlangan matn aytish kerakmi yoki tuzilma asosida gapirish kerakmi?",
      objective: "Joy, sabab, misol va xulosa tuzilmasi bilan tabiiy monolog qurish.",
      framework: ["Joy", "Sabab", "Misol", "Xulosa"],
      socratic: [
        { q: "Yodlangan matn nima uchun xavfli?", hint: "Tabiiylik va moslashuvchanlik yo‘qoladi." },
        { q: "Qaysi qism hikoyaga hayot kiritadi?", hint: "Mis ol." },
        { q: "Qanday tugatish kerak?", hint: "Qisqa xulosa va his." }
      ],
      decision: "Cue Card ga qanday javob tuzasiz?",
      answer: "I would structure it as place, reason, example, and reflection, with one clear story.",
      decoys: ["I memorize a long text and recite it.", "I only say one sentence and stop."],
      reflection: ["Tuzilma sizni qanday erkin qildi?", "Qaysi misol eng tabiiy chiqdi?", "Keyingi Cue Card da nima o‘zgartirasiz?"],
      takeaway: "Cue Card da tuzilma yodlashdan ko‘ra ishonchliroq."
    },
    {
      title: "Grammatika xatosini tahlil qilish",
      context: "Yozgan gapingiz: 'He don't like it.' O‘qituvchi xatoni topishni so‘raydi, lekin faqat tuzatish emas, sababini ham aytish kerak.",
      stakeholders: ["Siz", "O‘qituvchi", "Baholovchi"],
      dilemma: "Faqat to‘g‘ri variantni yozish kerakmi yoki qoidani asoslash kerakmi?",
      objective: "Xatoni tuzatib, qoidani qisqa va aniq asoslash.",
      framework: ["Xatoni ko‘rsat", "To‘g‘ri shaklni yoz", "Qoidani nomla", "Mis ol qo‘sh"],
      socratic: [
        { q: "Qaysi so‘z xatoni keltirib chiqardi?", hint: "don't + he uchun mos emas." },
        { q: "To‘g‘ri shaklda fe'l nima uchun boshlang‘ich qoladi?", hint: "doesn't dan keyin V1." },
        { q: "Qoidani bir jumlada qanday aytasiz?", hint: "Third-person singular uses doesn't + base verb." }
      ],
      decision: "O‘qituvchiga to‘liq javobingiz?",
      answer: "It should be 'He doesn't like it' because third-person singular uses doesn't + base verb.",
      decoys: ["'He don't like it' is actually fine.", "You must add -s to the verb 'like'."],
      reflection: ["Xatoni topish qanday osonlashdi?", "Qoidani o‘z so‘zingiz bilan ayting", "Bu qoidani qaysi gapda ishlatasiz?"],
      takeaway: "Xatoni tuzatishdan ko‘ra, qoidani asoslash uzoqroq natija beradi."
    }
  ]
};

const CV_OBJECTIVES_BY_FOCUS = {
  speaking: [
    "Vaziyatni og‘zaki tahlil qilib, qarorini inglizcha asoslash",
    "Tabiiy iboralar bilan qisqa, ravon javob qurish",
    "Ohang va muloyimlikni kontekstga mos tanlash"
  ],
  grammar: [
    "Qoidaning formulasini va ishlatilish sababini tushuntirish",
    "Xatoni topib, to‘g‘ri shaklni asoslash",
    "Qoidani yangi kontekstda qo‘llash"
  ],
  vocabulary: [
    "Mavzuga oid 3 ta iborani kontekstda tanlash",
    "So‘zning ma’nosini misol bilan izohlash",
    "Collocation va talaffuzni birgalikda ishlatish"
  ],
  exam: [
    "Vaqt va tuzilma bo‘yicha strategik qaror qabul qilish",
    "Baholash mezonlariga mos javob yaratish",
    "Javobni qisqa, dalil bilan yakunlash"
  ]
};

/* ======================= OLDINDAN TAYYORLASH DVIGATELI ======================= */

const CV_STAGES = ["Asosiy mashq", "Amaliyot", "Chuqurlashtirish", "Master daraja"];
const CV_FOCUS_OFFSET = { speaking: 0, grammar: 2, vocabulary: 5, exam: 8 };
const CV_PREBUILT_PLANS = Object.create(null);

function cvGetLessonCount(duration) {
  const d = String(duration || "1_month").toLowerCase().trim().replace(/\s+/g, "_");
  if (CV_DURATION_COUNTS[d]) return CV_DURATION_COUNTS[d];

  const m = d.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (/oy|month/.test(d)) return n * 20;
    if (/yil|year/.test(d)) return n * 240;
  }
  return 20;
}

function cvBuildPlan(purpose, level, focus) {
  const topics = CV_TOPIC_BANK[purpose] || CV_TOPIC_BANK.abroad;
  const grammarBank = CV_GRAMMAR_BANK[level] || CV_GRAMMAR_BANK.intermediate;
  const offset = CV_FOCUS_OFFSET[focus] || 0;
  const plan = [];

  for (let i = 0; i < 240; i++) {
    const pos = i + offset;
    const stage = Math.floor(pos / topics.length);
    plan.push({
      t: topics[pos % topics.length],
      g: grammarBank[(i + stage) % grammarBank.length],
      stage,
      level,
      purpose,
      focus
    });
  }
  return plan;
}

/* Barcha 48 variant dastur yuklanayotganda oldindan rejalashtiriladi. */
(function cvPrebuildAllVariants() {
  for (const purpose of Object.keys(CV_TOPIC_BANK)) {
    for (const level of CV_LEVELS) {
      for (const focus of CV_FOCUSES) {
        CV_PREBUILT_PLANS[`${purpose}|${level}|${focus}`] = cvBuildPlan(purpose, level, focus);
      }
    }
  }
})();

function cvRotated(list, seed) {
  const arr = list.slice();
  const k = seed % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}

function cvMakeExercises(topic, grammar, caseData, seed, desc) {
  const topicAnswer = topic.q[1];
  const grammarQuiz = grammar[6];
  const gAnswer = grammarQuiz[1];
  const diamonds = desc.level === "advanced" ? 4 : desc.level === "beginner" ? 2 : 3;

  return [
    {
      type: "mc",
      question: `${topic.q[0]} (Mavzu: ${topic.t})`,
      options: cvRotated([topicAnswer, topic.q[2], topic.q[3]], seed),
      answer: topicAnswer,
      diamonds,
      why: `${topic.t} mavzusidagi tabiiy ibora: "${topicAnswer}".`
    },
    {
      type: "mc",
      question: grammarQuiz[0],
      options: cvRotated([gAnswer, grammarQuiz[2], grammarQuiz[3]], seed + 1),
      answer: gAnswer,
      diamonds,
      why: grammarQuiz[4]
    },
    {
      type: "mc",
      question: `Quyidagi qoidaning formulasi qaysi? "${grammar[0]}"`,
      options: cvRotated([grammar[2], grammar[5], grammar[3].split(".")[0]], seed + 2),
      answer: grammar[2],
      diamonds,
      why: grammar[3]
    },
    {
      type: "case",
      question: `CASE TEST: ${caseData.decision}`,
      options: cvRotated([caseData.answer, caseData.decoys[0], caseData.decoys[1]], seed + 3),
      answer: caseData.answer,
      diamonds: diamonds + 1,
      why: caseData.takeaway
    }
  ];
}

function cvMaterializeLesson(desc, id) {
  const topic = desc.t;
  const grammar = desc.g;
  const stageLabel = desc.stage > 0 ? ` · ${CV_STAGES[desc.stage % CV_STAGES.length]}` : "";
  const diffBase = { beginner: "easy", intermediate: "medium", advanced: "hard" }[desc.level] || "medium";
  const difficulty = desc.stage > 1 ? "hard" : diffBase;
  const examplePairs = [topic.key[0], topic.key[1], grammar[4][0]];
  const seen = new Set();
  const examples = examplePairs
    .filter(pair => {
      const k = pair[0].toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map(pair => ({ en: pair[0], uz: pair[1], pron: cvPron(pair[0]) }));

  const caseBank = CV_CASE_BANK[desc.purpose] || CV_CASE_BANK.abroad;
  const caseData = cvClone(caseBank[(id - 1) % caseBank.length]);
  caseData.lesson_topic = topic.t;
  caseData.rule_link = grammar[0];
  caseData.context = `${caseData.context} Ushbu darsda "${topic.t}" mavzusiga oid iboralar va "${grammar[0]}" qoidasi ham qo‘llanadi.`;
  const focusObjectives = CV_OBJECTIVES_BY_FOCUS[desc.focus] || CV_OBJECTIVES_BY_FOCUS.speaking;
  const levelTarget = {
    beginner: "Oddiy gaplar va asosiy iboralar bilan chiqish",
    intermediate: "Tabiiy iboralar va mustaqil asoslash",
    advanced: "Murakkab tuzilma va akademik/professional uslub"
  }[desc.level] || "Tabiiy iboralar va mustaqil asoslash";

  return {
    id,
    title: `${id}-dars: ${topic.t}${stageLabel}`,
    topic: topic.t,
    icon: topic.ic,
    category: topic.c,
    difficulty,
    tier_required: id <= 5 ? "free" : id <= 15 ? "pro" : "premium",
    focus: desc.focus,
    focus_label: CV_FOCUS_LABELS[desc.focus] || "",
    stage: desc.stage,
    purpose: desc.purpose,
    level: desc.level,
    method: CV_METHOD_LABEL,
    method_note: CV_METHOD_NOTE,
    objectives: [
      caseData.objective,
      ...focusObjectives,
      levelTarget
    ],
    prep: {
      read: `Vaziyatni o‘qing: ${caseData.title}`,
      note: `Ikki muhim ma’lumotni yozib oling: ${caseData.stakeholders.slice(0, 2).join(" va ")}`,
      think: caseData.socratic[0].q
    },
    case: caseData,
    board_plan: [
      `${topic.t} — asosiy kontekst`,
      `${grammar[0]} — qoida`,
      `${caseData.framework[2]} — qaror bosqichi`
    ],
    grammar: {
      title: grammar[0],
      why_use: grammar[1],
      formula: grammar[2],
      simple_explanation: grammar[3],
      phonetic_trans: `🗣️ ${cvPron(examples[0].en)}`,
      examples,
      common_mistake: grammar[5],
      drill: grammar[6][0]
    },
    vocab: topic.w.map(w => ({
      word: w[0],
      ipa: `[${w[1]}]`,
      pron_uz: w[1],
      trans: w[2],
      ex: w[3],
      tip: `${topic.c} · ${topic.t}`
    })),
    dialogue: topic.d.map(line => ({
      speaker: line[0],
      text: line[1],
      uz: line[2],
      pron: cvPron(line[1])
    })),
    exercises: cvMakeExercises(topic, grammar, caseData, id, desc),
    reflection: [
      `Qarorimni qanday asosladim? ${caseData.takeaway}`,
      ...caseData.reflection,
      `Bugungi ${grammar[0]} qoidasini yangi gapda qo‘llab ko‘ring.`
    ],
    xp_reward: 30 + ((id % 10) * 3) + desc.stage * 5,
    diamonds_reward: difficulty === "hard" ? 4 : 3,
    is_completed: false
  };
}

function cvBuildCurriculum(level = "intermediate", purpose = "abroad", duration = "1_month", focus = "speaking") {
  const safeLevel = CV_LEVELS.includes(level) ? level : "intermediate";
  const safePurpose = CV_TOPIC_BANK[purpose] ? purpose : "abroad";
  const safeFocus = CV_FOCUSES.includes(focus) ? focus : "speaking";
  const plan = CV_PREBUILT_PLANS[`${safePurpose}|${safeLevel}|${safeFocus}`] || cvBuildPlan(safePurpose, safeLevel, safeFocus);
  const count = cvGetLessonCount(duration);

  return plan.slice(0, count).map((desc, idx) => cvMaterializeLesson(desc, idx + 1));
}

function cvVariantSummary(purpose, level, focus, duration) {
  const safeLevel = CV_LEVELS.includes(level) ? level : "intermediate";
  const safeFocus = CV_FOCUSES.includes(focus) ? focus : "speaking";
  const grammarCount = (CV_GRAMMAR_BANK[safeLevel] || []).length;
  const topicCount = (CV_TOPIC_BANK[purpose] || CV_TOPIC_BANK.abroad).length;
  return {
    lesson_count: cvGetLessonCount(duration),
    topic_count: topicCount,
    grammar_count: grammarCount,
    focus_label: CV_FOCUS_LABELS[safeFocus] || "",
    variant_id: `${purpose || "abroad"}|${safeLevel}|${safeFocus}`
  };
}

/* Eski/backend darslariga ham case qo'shib berish (moslik uchun). */
function cvBuildCase(lesson) {
  const id = Math.max(1, parseInt(lesson && lesson.id, 10) || 1);
  let purpose = lesson && lesson.purpose;
  if (!purpose || !CV_TOPIC_BANK[purpose]) {
    const text = String((lesson && lesson.category) || (lesson && lesson.topic) || "").toLowerCase();
    if (/it|texnik|code|bug|server/.test(text)) purpose = "it";
    else if (/ielts|cefr|exam|writing|speaking|imtihon/.test(text)) purpose = "study";
    else if (/ish|karyera|intervyu|mijoz|office/.test(text)) purpose = "career";
    else purpose = "abroad";
  }
  const bank = CV_CASE_BANK[purpose] || CV_CASE_BANK.abroad;
  return cvClone(bank[(id - 1) % bank.length]);
}

if (typeof window !== "undefined") {
  window.CVGetLessonCount = cvGetLessonCount;
  window.CVBuildCurriculum = cvBuildCurriculum;
  window.CVVariantSummary = cvVariantSummary;
  window.CVBuildCase = cvBuildCase;
  window.CVMethodLabel = CV_METHOD_LABEL;
}
