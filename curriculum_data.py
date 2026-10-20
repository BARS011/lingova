# -*- coding: utf-8 -*-
"""
curriculum_data.py - Lingova Shaxsiy Darslar va Mukammal Grammatika Dvigateli
- Barcha qoidalar sodda, batafsil o'zbek tilida tushuntirilgan
- Har bir so'z va ibora uchun xalqaro transkripsiya (IPA) va o'zbekcha o'qilishi
- Har bir grammatik qoida uchun formula, qachon ishlatilishi, xatolar tahlili va amaliy namunalar
- 1 oydan 1 yilgacha moslashtirilgan darslar
- IELTS va CEFR Mock, Writing va Speaking rasmiy baholash standartlari
"""

# ======================= MAXSUS ALOHIDA GRAMMATIKA DARSLIGI (GRAMMAR HUB) =======================
GRAMMAR_GUIDE = [
    {
        "id": "g1",
        "title": "1. Muloyim Iltimoslar (Polite Requests)",
        "badge": "Muloqot asosi",
        "intro": "Ingliz tilida chet elliklar bilan gaplashganda eng muhim narsa — bu muloyimlik. O'zbek tilida 'bering', 'qiling' deb buyruq fe'li bilan muloyim aytsak bo'ladi, lekin ingliz tilida 'Give me' yoki 'I want' desangiz, juda qo'pol va tarbiyasizdek eshitiladi!",
        "formula": "Could you please + Fe'l (harakat) ... ?  yoki  I would like + Ot / Fe'l",
        "breakdown": [
            {
                "term": "Could you please ... ?",
                "pron": "[kʊd juː pliːz] (Kud yu pliiz)",
                "meaning": "... qilib bera olasizmi, iltimos?",
                "example": "Could you please help me? (Menga yordam bera olasizmi, iltimos?)"
            },
            {
                "term": "I would like ... (I'd like)",
                "pron": "[aɪ wʊd laɪk] (Ay vud layk)",
                "meaning": "Men ... xohlardim / ... olmoqchi edim",
                "example": "I would like a cup of tea, please. (Menga bir finjon choy bersangiz, iltimos.)"
            },
            {
                "term": "Would you mind + Fe'l-ing ... ?",
                "pron": "[wʊd juː maɪnd] (Vud yu maynd)",
                "meaning": "... qilishga qarshi emasmisiz? (Juda yuksak muloyimlik)",
                "example": "Would you mind opening the window? (Derazani ochib yuborishga qarshi emasmisiz?)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ I want a ticket now! (Qo'pol va buyruq ohangida)",
                "right": "✅ Could I please have a ticket? yoki I would like a ticket, please.",
                "why": "'I want' - bu bolalarning injiqligidek eshitiladi. Kattalar doim 'I would like' yoki 'Could I have' deyishadi."
            },
            {
                "wrong": "❌ Give me water. (Menga suv ber)",
                "right": "✅ Could you give me some water, please? (Suv bera olasizmi, iltimos?)",
                "why": "Har doim gap oxiriga 'please' (iltimos) so'zini qo'shish shart."
            }
        ],
        "tips": "💡 Oltin qoida: Restoranda, aeroportda, mehmonxonada hech qachon 'I want' demang. Doim 'Could I have...' yoki 'I'd like...' deb boshlang!",
        "practice": [
            {
                "q": "Restoranda ofitsiantdan menyuni muloyim so'rash uchun qaysi gap to'g'ri?",
                "opts": ["Give me menu!", "Could I please see the menu?", "I want menu fast", "Menu here!"],
                "a": "Could I please see the menu?"
            }
        ]
    },
    {
        "id": "g2",
        "title": "2. To Be fe'li (am / is / are) — Ingliz tilining poydevori",
        "badge": "Eng asosiy qoida",
        "intro": "O'zbek tilida 'Men talabaman' deymiz, o'rtada hech qanday fe'l yo'q. Lekin ingliz tilida har qanday gapda FE'L (harakat yoki bog'lovchi) bo'lishi SHART! Agar gapda 'yugurmoq', 'yemoq' kabi asosiy fe'l bo'lmasa, 'to be' (bo'lmoq) fe'li yordamga keladi.",
        "formula": "Ega (Subject) + am / is / are + Kim / Qanday / Qayerda",
        "breakdown": [
            {
                "term": "I am (I'm)",
                "pron": "[aɪ æm] (Ay em)",
                "meaning": "Men ... man",
                "example": "I am a student. (Men talabaman.) / I am happy. (Men xursandman.)"
            },
            {
                "term": "He / She / It is (He's / She's)",
                "pron": "[ɪz] (Iz)",
                "meaning": "U ... dir",
                "example": "He is a doctor. (U shifokor.) / The hotel is near. (Mehmonxona yaqin.)"
            },
            {
                "term": "We / You / They are (We're / They're)",
                "pron": "[ɑːr] (Aar)",
                "meaning": "Biz / Siz / Ular ... dir",
                "example": "We are ready. (Biz tayyormiz.) / You are welcome. (Arzimaydi.)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ I student. (Fe'lsiz gap bo'lmaydi)",
                "right": "✅ I am a student.",
                "why": "'Am' fe'lini tushirib qoldirish xato."
            },
            {
                "wrong": "❌ She are beautiful.",
                "right": "✅ She is beautiful.",
                "why": "Birlikdagi 3-shaxs (He, She, It) uchun faqat 'is' ishlatiladi."
            }
        ],
        "tips": "💡 Eslab qoling: Inkor gapda 'not' qo'shiladi: 'I am not tired' (Charchaganim yo'q). Savol berishda esa 'am/is/are' oldinga chiqadi: 'Are you ready?' (Tayyormisiz?)",
        "practice": [
            {
                "q": "'Ular aeroportda' gapining to'g'ri inglizcha tarjimasi qaysi?",
                "opts": ["They at airport.", "They are at the airport.", "They is at airport.", "They am airport."],
                "a": "They are at the airport."
            }
        ]
    },
    {
        "id": "g3",
        "title": "3. Present Simple — Doimiy odatlar va haqiqatlar",
        "badge": "Zamonlar",
        "intro": "Har kuni, odatda yoki umuman sodir bo'ladigan ish-harakatlar uchun ishlatiladi. Masalan: 'Men Toshkentda yashayman', 'U inglizcha gapiradi', 'Poyezd soat 8 da jo'naydi'.",
        "formula": "I / You / We / They + Fe'l  |  He / She / It + Fe'l-(s / es)",
        "breakdown": [
            {
                "term": "Tasdiq gap",
                "pron": "I live in Uzbekistan / He works in a bank",
                "meaning": "Men yashayman / U ishlaydi",
                "example": "He speaks English fluently. (U inglizcha ravon gapiradi.)"
            },
            {
                "term": "Savol (Do / Does)",
                "pron": "Do you ... ? / Does he ... ?",
                "meaning": "... qilasizmi?",
                "example": "Do you speak English? (Inglizcha gapirasizmi?)"
            },
            {
                "term": "Inkor (don't / doesn't)",
                "pron": "I don't know / He doesn't understand",
                "meaning": "Men bilmayman / U tushunmaydi",
                "example": "I don't understand this word. (Men bu so'zni tushunmayapman.)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ He speak English.",
                "right": "✅ He speaks English.",
                "why": "He, She, It bilan kelgan fe'lga albatta '-s' qo'shimchasi qo'shiladi."
            },
            {
                "wrong": "❌ Does he speaks English?",
                "right": "✅ Does he speak English?",
                "why": "Savolda 'Does' kelganda, asosiy fe'ldagi '-s' tushib qoladi!"
            }
        ],
        "tips": "💡 Kalit so'zlar: always (doim), usually (odatda), often (tez-tez), sometimes (ba'zan), every day (har kuni).",
        "practice": [
            {
                "q": "'Do you _____ English?' bo'sh joyga to'g'ri fe'lni qo'ying:",
                "opts": ["speak", "speaks", "speaking", "spoke"],
                "a": "speak"
            }
        ]
    },
    {
        "id": "g4",
        "title": "4. Present Continuous — Ayni paytda sodir bo'layotgan ishlar",
        "badge": "Zamonlar",
        "intro": "Aynan hozir, siz gapirayotgan daqiqada nima bo'lyapti? 'Men hozir dars o'qiyapman', 'Samolyot hozir qo'nyapti'. Shuningdek, 100% rejalashtirilgan yaqin kelajak uchun ham ishlatiladi: 'I am leaving tomorrow' (Ertaga jo'nab ketyapman).",
        "formula": "Ega + am / is / are + Fe'l-ing",
        "breakdown": [
            {
                "term": "Hozirgi davomli harakat",
                "pron": "I am studying right now",
                "meaning": "Men ayni paytda dars qilyapman",
                "example": "She is talking on the phone. (U telefonda gaplashyapti.)"
            },
            {
                "term": "Yaqin kelajak rejasi",
                "pron": "I am flying tomorrow",
                "meaning": "Ertaga uchib ketyapman (chiptam bor)",
                "example": "We are arriving at 6 PM. (Biz soat 6 da yetib boramiz.)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ I looking for my passport. (am tushib qolgan)",
                "right": "✅ I am looking for my passport.",
                "why": "'-ing' qo'shimchasi hech qachon 'am/is/are'siz yolg'iz kelmaydi."
            }
        ],
        "tips": "💡 Kalit so'zlar: now (hozir), right now (ayni damda), at the moment (shu lahzada), today (bugun).",
        "practice": [
            {
                "q": "'U hozir uxlayapti' qanday aytiladi?",
                "opts": ["He is sleeping right now.", "He sleep now.", "He sleeping.", "He is sleep."],
                "a": "He is sleeping right now."
            }
        ]
    },
    {
        "id": "g5",
        "title": "5. Past Simple — O'tgan zamon (Safar xotiralari)",
        "badge": "Zamonlar",
        "intro": "O'tmishda boshlanib, o'tmishda tugagan ishlar. Safardan qaytganingizda: 'Biz mehmonxonaga bordik', 'Men chipta sotib oldim' deb gapirib berish uchun zarur zamon.",
        "formula": "To'g'ri fe'llarga: Fe'l + ed (booked, arrived) | Noto'g'ri fe'llar: 2-shakl (went, bought, saw)",
        "breakdown": [
            {
                "term": "To'g'ri fe'llar (-ed)",
                "pron": "I booked / I arrived / I visited",
                "meaning": "Band qildim / Yetib keldim / Ziyorat qildim",
                "example": "I visited Paris last year. (O'tgan yili Parijga bordim.)"
            },
            {
                "term": "Noto'g'ri fe'llar (Irregular)",
                "pron": "go -> went, buy -> bought, see -> saw",
                "meaning": "bordim, sotib oldim, ko'rdim",
                "example": "We went to a traditional restaurant yesterday. (Kecha milliy restoranga bordik.)"
            },
            {
                "term": "Savol va inkor (Did / didn't)",
                "pron": "Did you see? / I didn't see",
                "meaning": "Ko'rdingizmi? / Ko'rmadim",
                "example": "Did you enjoy your flight? (Parvozingiz yaxshi o'tdimi?)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ Did you went to the hotel?",
                "right": "✅ Did you go to the hotel?",
                "why": "Savolda 'Did' kelgandan keyin asosiy fe'l o'zining oddiy 1-shakliga qaytadi ('went' emas, 'go' bo'ladi)."
            }
        ],
        "tips": "💡 O'tmish ko'rsatkichlari: yesterday (kecha), last week (o'tgan hafta), in 2024 (2024-yilda), two days ago (ikki kun oldin).",
        "practice": [
            {
                "q": "'I _____ my passport yesterday' (Kecha pasportimni yo'qotdim):",
                "opts": ["lost", "lose", "losing", "losed"],
                "a": "lost"
            }
        ]
    },
    {
        "id": "g6",
        "title": "6. Present Perfect — Hayotiy Tajriba (Have you ever...?)",
        "badge": "Suhbat siri",
        "intro": "Bu zamon o'zbek tilida so'zlashuvchilarni eng ko'p chalg'itadigan zamondir. Lekin uning siri oddiy: u ANIQ VAQTNI EMAS, sizning HAYOTINGIZDAGI TAJRIBANGIZNI ifodalaydi. Masalan: 'Hech chet elda bo'lganmisiz?', 'Men hech qachon sushi yemaganman'.",
        "formula": "have / has + Fe'lning 3-shakli (V3)",
        "breakdown": [
            {
                "term": "Have you ever ... ?",
                "pron": "[hæv juː ˈev.ər] (Hev yu ever)",
                "meaning": "Hech hayotingizda ... qilganmisiz?",
                "example": "Have you ever been to the UK? (Hech Buyuk Britaniyada bo'lganmisiz?)"
            },
            {
                "term": "I have already ...",
                "pron": "[aɪ hæv ɔːlˈred.i] (Ay hev olredi)",
                "meaning": "Men allaqachon ... qilib bo'ldim",
                "example": "I have already checked in online. (Men allaqachon onlayn ro'yxatdan o'tdim.)"
            },
            {
                "term": "I have never ...",
                "pron": "[aɪ hæv ˈnev.ər] (Ay hev never)",
                "meaning": "Men hech qachon ... qilmaganman",
                "example": "I have never lost my luggage. (Men hech qachon yukimni yo'qotmaganman.)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ I have visited London yesterday. (Aniq vaqt bo'lsa Present Perfect ishlatilmaydi)",
                "right": "✅ I visited London yesterday. (Past Simple)",
                "why": "'Yesterday', 'last year' kabi aniq o'tgan vaqt bo'lsa Past Simple bo'ladi. Agar umumiy tajriba bo'lsa Present Perfect bo'ladi."
            }
        ],
        "tips": "💡 Chet elda suhbatlashganda eng zo'r savol: 'Have you ever tried traditional Uzbek plov?' (Hech o'zbekcha palov yeb ko'rganmisiz?)",
        "practice": [
            {
                "q": "'Have you ever _____ to London?'",
                "opts": ["been", "went", "go", "was"],
                "a": "been"
            }
        ]
    },
    {
        "id": "g7",
        "title": "7. Modal Fe'llar (Can, Should, Must, Have to)",
        "badge": "Qoidalar & Ruxsat",
        "intro": "Modal fe'llar harakatning majburiyligi, mumkinligi yoki maslahatini bildiradi. Safar davomida qonun-qoidalar, maslahatlar va ruxsat olishda juda muhim.",
        "formula": "Ega + Modal fe'l + Asosiy fe'l (o'zgarishsiz)",
        "breakdown": [
            {
                "term": "Can / May",
                "pron": "[kæn / meɪ] (Ken / Mey)",
                "meaning": "Qila olmoq / Ruxsat so'ramoq",
                "example": "May I sit here? (Bu yerga o'tirsam bo'ladimi?) / Can you speak slower? (Sekinroq gapira olasizmi?)"
            },
            {
                "term": "Should",
                "pron": "[ʃʊd] (Shud - 'l' harfi o'qilmaydi!)",
                "meaning": "... qilishingiz kerak (Do'stona maslahat)",
                "example": "You should drink plenty of water. (Ko'proq suv ichishingiz kerak.)"
            },
            {
                "term": "Must / Have to",
                "pron": "[mʌst / hæv tuː] (Mast / Hev tu)",
                "meaning": "... qilish shart va majbur (Qonun/qoida)",
                "example": "You must show your passport. (Pasportingizni ko'rsatishingiz shart.)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ You must to go. ('to' ortiqcha)",
                "right": "✅ You must go.",
                "why": "Must, should, can fe'llaridan keyin hech qachon 'to' ishlatilmaydi."
            }
        ],
        "tips": "💡 Talaffuz siri: 'Should' va 'Could' so'zlaridagi 'L' harfi hech qachon o'qilmaydi! 'Shud' va 'Kud' deb o'qiladi.",
        "practice": [
            {
                "q": "'You _____ show your boarding pass at the gate' (Darvoza oldida chiptangizni ko'rsatishingiz shart):",
                "opts": ["must", "can to", "should to", "is"],
                "a": "must"
            }
        ]
    },
    {
        "id": "g8",
        "title": "8. Maxsus Savollar Tuzish Qoidasi (Wh- Questions)",
        "badge": "Savol berish",
        "intro": "Chet elda biror narsa so'rash uchun savol tuzishni bilish hayotiy zaruratdir. Ingliz tilida savol tuzishning 'Oltin zanjir' formulasi mavjud.",
        "formula": "1. So'roq so'z (Where/What) + 2. Yordamchi fe'l (is/do/did) + 3. Ega (Subject) + 4. Asosiy fe'l ?",
        "breakdown": [
            {
                "term": "Where (Qayerda)",
                "pron": "[weər] (Veer)",
                "example": "Where is the baggage claim? (Yuk topshirish joyi qayerda?)"
            },
            {
                "term": "How much (Qancha narxi)",
                "pron": "[haʊ mʌtʃ] (Xau mach)",
                "example": "How much does a taxi cost? (Taksi qancha turadi?)"
            },
            {
                "term": "What time (Qaysi vaqtda)",
                "pron": "[wɒt taɪm] (Vot taym)",
                "example": "What time does the plane take off? (Samolyot soat nechada uchadi?)"
            },
            {
                "term": "How long (Qancha vaqt)",
                "pron": "[haʊ lɒŋ] (Xau long)",
                "example": "How long does it take? (Bu qancha vaqt oladi?)"
            }
        ],
        "mistakes": [
            {
                "wrong": "❌ Where the hotel is? (Noto'g'ri so'z tartibi)",
                "right": "✅ Where is the hotel?",
                "why": "Savolda yordamchi fe'l (is) egadan (hotel) oldinga o'tishi kerak."
            }
        ],
        "tips": "💡 Har doim savol berishdan oldin: 'Excuse me...' (Kechirasiz...) deb boshlang. Bu odamlarni sizga yordam berishga yanada moyil qiladi.",
        "practice": [
            {
                "q": "'Eng yaqin bekat qayerda?' to'g'ri savol qaysi?",
                "opts": ["Where is the nearest station?", "Where the nearest station is?", "Nearest station where?", "Where station goes?"],
                "a": "Where is the nearest station?"
            }
        ]
    }
]

# ======================= ASOSIY 20 TA DARSLIK RO'YXATI (TALAFUZ VA O'ZBEKCHA O'QILISHI BILAN) =======================
ABROAD_LESSONS = [
    {
        "topic": "Aeroportda ro'yxatdan o'tish (Airport Check-in)",
        "icon": "✈️",
        "category": "Muloqot & Aeroport",
        "difficulty": "easy",
        "diamonds_reward": 2,
        "grammar_detailed": {
            "title": "Spoken English: Muloyim iltimoslar (Could I please have...)",
            "why_use": "Aeroport xodimlari juda band bo'lishadi. Muloyim va aniq gapirsangiz, sizga eng yaxshi deraza yonidagi o'rindiqlarni berishadi.",
            "formula": "Could I please have + [narsa] ... ?  yoki  I would like + [narsa]",
            "simple_explanation": "O'zbek tilida 'Menga chipta ber' desangiz qo'pol bo'ladi-ku, to'g'rimi? Ingliz tilida ham 'I want' (xohlayman) demasdan, 'Could I please have...' (olsam bo'ladimi, iltimos) deyiladi.",
            "phonetic_trans": "[kʊd aɪ pliːz hæv] - Kud ay pliiz hev",
            "examples": [
                {
                    "en": "Could I please have a window seat?",
                    "uz": "Menga deraza yonidagi o'rindiqni bersangiz, iltimos?",
                    "pron": "[kʊd aɪ pliːz hæv ə ˈwɪn.dəʊ siːt] (Kud ay pliiz hev e vindou siit)"
                },
                {
                    "en": "I would like to check in these two bags.",
                    "uz": "Bu ikkita sumkamni topshirmoqchi edim.",
                    "pron": "[aɪ wʊd laɪk tuː tʃek ɪn ðiːz tuː bæɡz] (Ay vud layk tu chek in diiz tu begz)"
                }
            ],
            "common_mistake": "❌ Noto'g'ri: 'Give me window seat!' ➡️ ✅ To'g'ri: 'Could I please have a window seat?'"
        },
        "vocab": [
            {
                "word": "boarding pass",
                "ipa": "[ˈbɔː.dɪŋ pɑːs]",
                "pron_uz": "bording pas",
                "trans": "parvozga chiqish taloni (bilet)",
                "ex": "Here is your boarding pass and passport.",
                "tip": "Bu samolyotga chiqish uchun eng asosiy qog'oz."
            },
            {
                "word": "carry-on luggage",
                "ipa": "[ˈkæri ɒn ˈlʌɡɪdʒ]",
                "pron_uz": "keri-on lagidj",
                "trans": "qo'l yuki (samolyot ichiga olinadigan kichik sumka)",
                "ex": "Is my carry-on bag too heavy?",
                "tip": "'Carry' - ko'tarmoq, 'on' - o'zi bilan olib yurmoq."
            },
            {
                "word": "departure gate",
                "ipa": "[dɪˈpɑːtʃə ɡeɪt]",
                "pron_uz": "diparcha geyt",
                "trans": "uchib ketish darvozasi / eshigi",
                "ex": "Which gate is flight TK405 departing from?",
                "tip": "Ekranda samolyotingiz qaysi raqamli eshikdan (Gate 12, Gate 15) chiqishini ko'rasiz."
            },
            {
                "word": "window seat",
                "ipa": "[ˈwɪndəʊ siːt]",
                "pron_uz": "vindou siit",
                "trans": "deraza yonidagi o'rindiq",
                "ex": "I prefer a window seat to enjoy the view.",
                "tip": "Bulutlarni tomosha qilib ketish uchun eng yaxshi joy."
            },
            {
                "word": "aisle seat",
                "ipa": "[aɪl siːt]",
                "pron_uz": "ayl siit ('s' harfi o'qilmaydi!)",
                "trans": "yo'lak bo'yidagi o'rindiq (o'rtadagi yo'l)",
                "ex": "Would you mind switching to an aisle seat?",
                "tip": "Diqqat: 'Aisle' so'zida 's' harfi mutlaqo o'qilmaydi! 'Ayl' deb aytiladi."
            },
            {
                "word": "delayed",
                "ipa": "[dɪˈleɪd]",
                "pron_uz": "dileyd",
                "trans": "kechiktirilgan (reys vaqti surilgan)",
                "ex": "The flight is delayed by thirty minutes.",
                "tip": "Agar reys kechiksa, ekranda qizil yozuvda 'Delayed' chiqadi."
            }
        ],
        "dialogue": [
            {
                "speaker": "Agent",
                "text": "Good morning! Can I see your passport and ticket, please?",
                "uz": "Xayrli tong! Pasport va chiptangizni ko'rsata olasizmi, iltimos?",
                "pron": "Gud morning! Ken ay sii yor pasport end tiket, pliiz?"
            },
            {
                "speaker": "Siz",
                "text": "Good morning! Here you are. Could I have an aisle seat, please?",
                "uz": "Xayrli tong! Mana, marhamat. Menga yo'lak bo'yidagi o'rindiqni bersangiz, iltimos?",
                "pron": "Gud morning! Xiyer yu aar. Kud ay hev en ayl siit, pliiz?"
            },
            {
                "speaker": "Agent",
                "text": "Certainly! Gate 14 is boarding at 10:30 AM. Have a great flight!",
                "uz": "Albatta! 14-darvoza soat 10:30 da ochiladi. Parvozingiz yaxshi o'tsin!",
                "pron": "Sertenli! Geyt footiin iz bording et ten terti ey-em. Hev e greyt flayt!"
            }
        ],
        "exercises": [
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "Aeroportda deraza yonidagi o'rindiq so'rash uchun qaysi muloyim ibora to'g'ri?",
                "options": ["Give me window seat now!", "Could I please have a window seat?", "I want window!", "Window seat is mine."],
                "answer": "Could I please have a window seat?"
            },
            {
                "type": "mc",
                "difficulty": "medium",
                "diamonds": 2,
                "question": "'Aisle seat' (yo'lak bo'yidagi o'rindiq) so'zidagi 'Aisle' qanday to'g'ri o'qiladi?",
                "options": ["Ayl (s harfi o'qilmaydi)", "Aysl", "Eyzl", "Asli"],
                "answer": "Ayl (s harfi o'qilmaydi)"
            },
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "'Qo'l yuki' ingliz tilida qanday ataladi?",
                "options": ["carry-on luggage", "heavy box", "pocket paper", "flight food"],
                "answer": "carry-on luggage"
            }
        ]
    },
    {
        "topic": "Bojxona va Pasport nazorati (Passport Control & Customs)",
        "icon": "🛂",
        "category": "Rasmiy muloqot",
        "difficulty": "medium",
        "diamonds_reward": 3,
        "grammar_detailed": {
            "title": "Spoken Grammar: Safar maqsadini aytish (Purpose of Visit)",
            "why_use": "Bojxona xodimi (Customs officer) har bir kelgan chet ellikdan nima maqsadda kelganini qat'iy so'raydi. Xavotir olmasdan, bitta to'g'ri jumla bilan javob bersangiz, darhol muhr bosib o'tkazib yuboradi.",
            "formula": "I am here for + [sabab] ...  yoki  I am here to + [fe'l] ...",
            "simple_explanation": "Agar sayohat uchun bo'lsa: 'I am here for tourism' (sayyohlik uchun keldim). Agar o'qish uchun bo'lsa: 'I am here to study'. Agar ish bo'lsa: 'I am here on business'.",
            "phonetic_trans": "[aɪ æm hɪər fɔː ˈtʊə.rɪ.zəm] - Ay em xiyer for turizm",
            "examples": [
                {
                    "en": "What is the purpose of your visit? - I am here for tourism.",
                    "uz": "Tashrifingizdan maqsad nima? - Men sayyohlik uchun keldim.",
                    "pron": "Vot iz de porpos of yor vizit? - Ay em xiyer for turizm."
                },
                {
                    "en": "How long do you plan to stay? - I plan to stay for two weeks.",
                    "uz": "Qancha vaqt qolishni rejalashtiryapsiz? - Ikki hafta qolishni rejalashtiryapman.",
                    "pron": "Xau long du yu plen tu stey? - Ay plen tu stey for tu viiks."
                }
            ],
            "common_mistake": "❌ Noto'g'ri: 'I want travel long time' ➡️ ✅ To'g'ri: 'I am here for tourism for two weeks.'"
        },
        "vocab": [
            {
                "word": "purpose of visit",
                "ipa": "[ˈpɜː.pəs əv ˈvɪz.ɪt]",
                "pron_uz": "porpos of vizit",
                "trans": "tashrif maqsadi (nega kelganingiz)",
                "ex": "The purpose of my visit is business.",
                "tip": "Bojxonachining 1-raqamli savoli."
            },
            {
                "word": "declare",
                "ipa": "[dɪˈkleər]",
                "pron_uz": "dikleyer",
                "trans": "deklaratsiya qilmoq (taqiqlangan yoki soliq to'lanadigan narsani bildirish)",
                "ex": "Do you have anything to declare?",
                "tip": "Agar noqonuniy narsa bo'lmasa, 'No, I have nothing to declare' deyiladi."
            },
            {
                "word": "duration of stay",
                "ipa": "[djʊəˈreɪ.ʃən əv steɪ]",
                "pron_uz": "dyureyshn of stey",
                "trans": "qolish muddati (necha kun turishingiz)",
                "ex": "My duration of stay is fourteen days.",
                "tip": "Mehmonxonada yoki mamlakatda necha kun bo'lishingiz."
            },
            {
                "word": "return ticket",
                "ipa": "[rɪˈtɜːn ˈtɪk.ɪt]",
                "pron_uz": "ritorn tiket",
                "trans": "qaytish chiptasi",
                "ex": "Here is my return ticket to Tashkent.",
                "tip": "Bojxonachi viza berganda qaytish chiptangizni ko'rsatishni so'rashi mumkin."
            }
        ],
        "dialogue": [
            {
                "speaker": "Officer",
                "text": "Passport please. What is the purpose of your visit?",
                "uz": "Pasportingizni bering. Tashrifingiz maqsadi nima?",
                "pron": "Pasport pliiz. Vot iz de porpos of yor vizit?"
            },
            {
                "speaker": "Siz",
                "text": "Good day! I am here for tourism and sightseeing for ten days.",
                "uz": "Xayrli kun! Men 10 kunga sayohat va shaharni tomosha qilish uchun keldim.",
                "pron": "Gud dey! Ay em xiyer for turizm end saytsiing for ten deyz."
            },
            {
                "speaker": "Officer",
                "text": "Where will you be staying?",
                "uz": "Qayerda istiqomat qilasiz?",
                "pron": "Veer vil yu bi steying?"
            },
            {
                "speaker": "Siz",
                "text": "At the Grand Central Hotel. Here is my booking confirmation.",
                "uz": "Grand Central mehmonxonasida. Mana mening bron qilingan qog'ozim.",
                "pron": "Et de Grend Sentral Xotel. Xiyer iz may buking konfirmeyshn."
            }
        ],
        "exercises": [
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "Bojxonachi 'Do you have anything to declare?' desa, taqiqlangan buyum bo'lmasa nima deyiladi?",
                "options": ["No, I have nothing to declare.", "Yes, give me food.", "I declare everything.", "I am sleeping."],
                "answer": "No, I have nothing to declare."
            },
            {
                "type": "mc",
                "difficulty": "medium",
                "diamonds": 2,
                "question": "'Tashrif maqsadi' ingliz tilida qanday ataladi?",
                "options": ["purpose of visit", "passport number", "airport taxi", "money exchange"],
                "answer": "purpose of visit"
            }
        ]
    },
    {
        "topic": "Taksiga chiqish va manzilni aytish (Taking a Taxi)",
        "icon": "🚕",
        "category": "Shahar transporti",
        "difficulty": "easy",
        "diamonds_reward": 2,
        "grammar_detailed": {
            "title": "Spoken English: Yo'l ko'rsatish va Narxni bilish",
            "why_use": "Chet elga qo'nganingizda aeroportdan mehmonxonagacha taksiga chiqasiz. Taksist aldamasligi uchun hisoblagichni yoqtirish va manzilni aniq aytish kerak.",
            "formula": "Could you please take me to [manzil]?  yoki  Please drop me off at [joy].",
            "simple_explanation": "'Drop off' fe'li - bu 'meni mashinadan tushirib qo'ying' degan ma'noni beradi. 'Keep the change' esa 'qaytimi kerak emas, o'zingizda qolsin' degani.",
            "phonetic_trans": "[kʊd juː pliːz teɪk miː tuː ...] - Kud yu pliiz teyk mi tu ...",
            "examples": [
                {
                    "en": "Could you please take me to the Hilton Hotel?",
                    "uz": "Meni Hilton mehmonxonasiga olib bora olasizmi, iltimos?",
                    "pron": "Kud yu pliiz teyk mi tu de Xilton Xotel?"
                },
                {
                    "en": "How much will the fare be?",
                    "uz": "Yo'l kira haqi qancha bo'ladi?",
                    "pron": "Xau mach vil de feyer bii?"
                }
            ],
            "common_mistake": "❌ Noto'g'ri: 'Drive me hotel now' ➡️ ✅ To'g'ri: 'Could you take me to the hotel, please?'"
        },
        "vocab": [
            {
                "word": "fare",
                "ipa": "[feər]",
                "pron_uz": "feyer",
                "trans": "yo'l kira haqi (taksi yoki avtobus narxi)",
                "ex": "How much is the estimated taxi fare?",
                "tip": "Taksida 'price' o'rniga doim 'fare' ishlatiladi."
            },
            {
                "word": "meter",
                "ipa": "[ˈmiː.tər]",
                "pron_uz": "miiter",
                "trans": "taksometr (masofani hisoblovchi hisoblagich)",
                "ex": "Could you please turn on the meter?",
                "tip": "Chet elda taksist hisoblagichni yoqmasa, ortiqcha pul talab qilishi mumkin."
            },
            {
                "word": "drop off",
                "ipa": "[drɒp ɒf]",
                "pron_uz": "drop of",
                "trans": "mashinadan tushirib ketmoq",
                "ex": "Please drop me off near the subway station.",
                "tip": "Meni shu yerda tushiring demoqchi bo'lsangiz: 'Drop me off here'."
            },
            {
                "word": "keep the change",
                "ipa": "[kiːp ðə tʃeɪndʒ]",
                "pron_uz": "kiip de cheyndj",
                "trans": "qaytimi o'zingizda qolsin (kerak emas)",
                "ex": "Thank you, keep the change!",
                "tip": "Haydovchiga minnatdorchilik va choypuli bildirish iborasi."
            }
        ],
        "dialogue": [
            {
                "speaker": "Siz",
                "text": "Hello! Could you take me to the Marriott Hotel on 5th Avenue, please?",
                "uz": "Salom! Meni 5-avenyudagi Marriott mehmonxonasiga olib borolasizmi, iltimos?",
                "pron": "Xellou! Kud yu teyk mi tu de Merriott Xotel on fift evenyu, pliiz?"
            },
            {
                "speaker": "Driver",
                "text": "Sure thing! Put your bags in the trunk. It will take about 20 minutes.",
                "uz": "Albatta! Yuklaringizni bagajga qo'ying. Taxminan 20 daqiqa vaqt ketadi.",
                "pron": "Shur sing! Put yor begz in de trank. It vil teyk ebaut tventi minits."
            }
        ],
        "exercises": [
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "Haydovchiga 'Qaytimi o'zingizda qolsin' deyish uchun qaysi ibora qo'llaniladi?",
                "options": ["Keep the change", "Give me money back", "Take no coins", "No cash for me"],
                "answer": "Keep the change"
            }
        ]
    },
    {
        "topic": "Mehmonxonaga joylashish (Hotel Check-in & Requests)",
        "icon": "🏨",
        "category": "Turar joy & Xizmat",
        "difficulty": "medium",
        "diamonds_reward": 3,
        "grammar_detailed": {
            "title": "Spoken English: Bronni aytish va xizmatlarni aniqlash",
            "why_use": "Mehmonxonaga borganingizda reception xodimi sizning nomingizni va broningizni tekshiradi. To'g'ri iborani bilsangiz, kalitni 1 daqiqada olasiz.",
            "formula": "I have a reservation under the name of [Ismingiz].",
            "simple_explanation": "'Reservation' - oldindan band qilingan xona. 'Under the name of...' - 'falonchi nomiga olingan bron' degani.",
            "phonetic_trans": "[aɪ hæv ə ˌrez.əˈveɪ.ʃən ˈʌn.dər ðə neɪm əv ...] - Ay hev e rezervleyshn ander de neym of ...",
            "examples": [
                {
                    "en": "I have a reservation under John Smith for three nights.",
                    "uz": "Menda John Smith nomiga uch kechaga olingan bron bor.",
                    "pron": "Ay hev e rezervleyshn ander Jon Smis for srii nayts."
                },
                {
                    "en": "Is breakfast included in the room price?",
                    "uz": "Nonushta xona narxiga kiritilganmi?",
                    "pron": "Iz brekfest inkluudid in de ruum prays?"
                }
            ],
            "common_mistake": "❌ Noto'g'ri: 'My room is here give key' ➡️ ✅ To'g'ri: 'I have a reservation under my name.'"
        },
        "vocab": [
            {
                "word": "reservation",
                "ipa": "[ˌrez.əˈveɪ.ʃən]",
                "pron_uz": "rezervleyshn",
                "trans": "bron / oldindan band qilish",
                "ex": "I booked a double room reservation.",
                "tip": "Xonani internetdan band qilganingiz."
            },
            {
                "word": "key card",
                "ipa": "[kiː kɑːd]",
                "pron_uz": "kii kaad",
                "trans": "elektron xona ochqichi (plastik karta)",
                "ex": "Here is your key card for room 302.",
                "tip": "Zamonaviy mehmonxonalarda kalit o'rniga plastik karta beriladi."
            },
            {
                "word": "complimentary",
                "ipa": "[ˌkɒm.plɪˈmen.tər.i]",
                "pron_uz": "komplimentri",
                "trans": "bepul (mehmonxona sovg'asi sifatida taqdim etiladigan)",
                "ex": "Wi-Fi and water are complimentary.",
                "tip": "Bu so'zni ko'rsangiz bilingki, xizmat bepul!"
            },
            {
                "word": "check-out time",
                "ipa": "[tʃek aʊt taɪm]",
                "pron_uz": "chek-aut taym",
                "trans": "mehmonxonadan chiqib ketish vaqti",
                "ex": "What time is check-out tomorrow?",
                "tip": "Odatda xonani kunduzi soat 11:00 yoki 12:00 gacha bo'shatish kerak bo'ladi."
            }
        ],
        "dialogue": [
            {
                "speaker": "Receptionist",
                "text": "Welcome to Hilton! How may I assist you today?",
                "uz": "Hilton mehmonxonasiga xush kelibsiz! Sizga qanday yordam bera olaman?",
                "pron": "Velkam tu Xilton! Xau mey ay essist yu tudey?"
            },
            {
                "speaker": "Siz",
                "text": "Hello! I have a reservation under Sardor Aliyev for three nights.",
                "uz": "Salom! Menda Sardor Aliyev nomiga 3 kechaga olingan bron bor.",
                "pron": "Xellou! Ay hev e rezervleyshn ander Sardor Aliyev for srii nayts."
            },
            {
                "speaker": "Receptionist",
                "text": "Welcome! Here is your key card, room 405. Breakfast is from 7 to 10 AM.",
                "uz": "Xush kelibsiz! Mana 405-xona kartangiz. Nonushta ertalab 7 dan 10 gacha.",
                "pron": "Velkam! Xiyer iz yor kii kaad, ruum foo-ou-fayv. Brekfest iz from seven tu ten ey-em."
            }
        ],
        "exercises": [
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "Ertalabki nonushta xona narxi ichidami yoki yo'qligini qanday muloyim so'raysiz?",
                "options": ["Is breakfast included?", "Where is breakfast free?", "Breakfast gives me food?", "Price eat breakfast?"],
                "answer": "Is breakfast included?"
            }
        ]
    },
    {
        "topic": "Restoranda ovqat buyurtma qilish (Dining Out & Food)",
        "icon": "🍽️",
        "category": "Oziq-ovqat & Taomlar",
        "difficulty": "easy",
        "diamonds_reward": 2,
        "grammar_detailed": {
            "title": "Spoken English: Buyurtma berish (I'll have the...)",
            "why_use": "Restoranda ofitsiant kelib: 'Are you ready to order?' (Buyurtma berishga tayyormisiz?) deb so'raganda to'g'ri javob bera olish kerak.",
            "formula": "I will have the [taom nomi]  (qisqartmasi: I'll have the ...)",
            "simple_explanation": "Ingliz tilida 'Men shuni yeyman / olaman' deyishda 'I will have the salmon' (Men losos balig'ini olaman) iborasi ishlatiladi. Hisob so'rashda esa 'Could we get the bill, please?' deyiladi.",
            "phonetic_trans": "[aɪl hæv ðə ...] - Ayl hev de ...",
            "examples": [
                {
                    "en": "I'll have the grilled chicken with salad, please.",
                    "uz": "Menga qovurilgan tovuq bilan salat bering, iltimos.",
                    "pron": "Ayl hev de grilld chiken viz seled, pliiz."
                },
                {
                    "en": "Could we have the bill, please?",
                    "uz": "Hisobni olib kelsangiz, iltimos?",
                    "pron": "Kud vi hev de bill, pliiz?"
                }
            ],
            "common_mistake": "❌ Noto'g'ri: 'Give bill now' ➡️ ✅ To'g'ri: 'Could we get the bill, please?'"
        },
        "vocab": [
            {
                "word": "appetizer / starter",
                "ipa": "[ˈæp.ɪ.taɪ.zər]",
                "pron_uz": "epetayzer",
                "trans": "tamaddi (asosiy ovqatdan oldingi yengil gazak)",
                "ex": "Would you like an appetizer first?",
                "tip": "Sho'rva, salat yoki yengil nonushta."
            },
            {
                "word": "main course",
                "ipa": "[meɪn kɔːs]",
                "pron_uz": "meyn koos",
                "trans": "asosiy taom (kabob, go'sht, baliq va h.k.)",
                "ex": "For the main course, I'd like the steak.",
                "tip": "Dasturxondagi eng asosiy issiq ovqat."
            },
            {
                "word": "the bill / the check",
                "ipa": "[ðə bɪl]",
                "pron_uz": "de bill (Britaniyada) / de chek (AQShda)",
                "trans": "hisob qog'ozi (chek)",
                "ex": "Could we get the bill, please?",
                "tip": "Britaniyada 'bill', Amerikada 'check' deb aytiladi."
            },
            {
                "word": "recommendation",
                "ipa": "[ˌrek.ə.menˈdeɪ.ʃən]",
                "pron_uz": "rekomendeyshn",
                "trans": "tavsiya",
                "ex": "What do you recommend tonight?",
                "tip": "Ofitsiantdan qaysi ovqat eng mazali ekanini so'rash uchun."
            }
        ],
        "dialogue": [
            {
                "speaker": "Waiter",
                "text": "Good evening! Are you ready to order, or do you need a few minutes?",
                "uz": "Xayrli kech! Buyurtma berishga tayyormisiz yoki yana bir necha daqiqa kerakmi?",
                "pron": "Gud iivning! Aar yu redi tu oorder, or du yu niid e fyu minits?"
            },
            {
                "speaker": "Siz",
                "text": "We are ready! What do you recommend from today's specials?",
                "uz": "Biz tayyormiz! Bugungi maxsus taomlardan nimani tavsiya qilasiz?",
                "pron": "Vii aar redi! Vot du yu rekomend from tudeys speshls?"
            },
            {
                "speaker": "Waiter",
                "text": "Our grilled salmon with lemon butter is excellent.",
                "uz": "Limonli sariyog' bilan pishirilgan losos balig'imiz juda ajoyib.",
                "pron": "Aur grilld semon viz lemon batter iz ekselent."
            },
            {
                "speaker": "Siz",
                "text": "Sounds delicious! I'll have that, and still water, please.",
                "uz": "Juda mazali eshitilyapti! Menga o'shandan bering va gazsiz suv, iltimos.",
                "pron": "Saunds delishes! Ayl hev det, end still voter, pliiz."
            }
        ],
        "exercises": [
            {
                "type": "mc",
                "difficulty": "easy",
                "diamonds": 1,
                "question": "Restoranda ofitsiantga buyurtma berishda eng tabiiy inglizcha ibora qaysi?",
                "options": ["I'll have the...", "Give me now...", "I eat...", "Bring food..."],
                "answer": "I'll have the..."
            }
        ]
    }
]

# Kengaytirilgan boshqa barcha darslar bazasi
EXTENDED_POOL = [
    ("Shaharda yo'l so'rash", "🗺️", "Shahar & Yo'nalish", "Asking directions politely"),
    ("Do'konda xarid va o'lcham tanlash", "🛍️", "Xarid", "Trying clothes on and sizes"),
    ("Dorixona va sog'liq muammolari", "💊", "Salomatlik", "Explaining symptoms and pain"),
    ("Favqulodda vaziyatlar va politsiya", "🚨", "Xavfsizlik", "Emergency calls and lost items"),
    ("Bank va valyuta almashtirish", "💱", "Moliya", "Exchanging currency and ATM"),
    ("SIM-karta va cheklovsiz internet", "📶", "Aloqa", "Prepaid data plans and eSIM"),
    ("Mahalliy odamlar bilan 'Small Talk'", "🤝", "Muloqot", "Friendly conversations and hobbies"),
    ("Viza va konsullik suhbati", "🏛️", "Hujjatlar", "Stating travel intentions"),
    ("Kvartira yoki xona ijarasi", "🏠", "Uy-joy", "Rent, utilities and deposit"),
    ("Metro va tezyurar poyezdlar", "🚇", "Transport", "Platforms and changing lines"),
    ("Avtomobil ijaraga olish", "🚗", "Haydash", "Rental contracts and insurance"),
    ("Madaniy odob va choypuli (Tipping)", "🌍", "Madaniyat", "Tipping customs and respect"),
    ("Ish intervyusi va rezyume taqdimoti", "💼", "Karyera", "Work experience and strengths"),
    ("Diplomatik yordam va elchixona", "⚖️", "Huquq", "Emergency consular aid"),
    ("1 oylik Katta Yakuniy Imtihon", "🎓", "Imtihon", "Comprehensive review and test"),
    ("Kovorking va masofaviy ishlash", "💻", "Masofaviy ish", "High speed wifi and booths"),
    ("Fitnes zal va sport klubi", "🏋️", "Sport", "Gym membership and routine"),
    ("Sartaroshxona va go'zallik saloni", "💇", "Xizmatlar", "Haircut and styling"),
    ("Pochta va posilka jo'natish", "📦", "Pochta", "Express shipping and parcel"),
    ("Festivallar va milliy bayramlar", "🎉", "Bayram", "Local carnivals and traditions"),
    ("Muzeylar va audio-gidlar", "🏛️", "San'at", "Exhibitions and artifacts"),
    ("Teatr va kinoga chipta olish", "🎭", "Ko'ngilochar", "Stage seats and box office"),
    ("Tabiat qo'ynida dam olish (Camping)", "⛺", "Tabiat", "Hiking trails and tents"),
    ("Milliy taomlar va kafelar", "☕", "Oshpazlik", "Specialty espresso and pastries"),
    ("Velosiped va skuter ijarasi", "🚲", "Shahar", "Bike lanes and hourly rent"),
    ("Plyaj va dengiz bo'yi dam olish", "🏖️", "Dam olish", "Sunbeds and lifeguards"),
    ("Elektronika do'koni va gadjetlar", "📱", "Texnologiya", "Adapters and warranty"),
    ("Ob-havo prognozi va kutilmalar", "🌦️", "Ob-havo", "Forecast and temperature"),
    ("Do'stlarga suvenirlar tanlash", "🎁", "Xarid", "Handcrafted gifts and wrappers"),
    ("Mijoz shikoyatini hal qilish", "📝", "Huquq", "Polite customer complaints"),
    ("Uber / Bolt taksi muloqoti", "📲", "Texnologiya", "Pin location and driver chat"),
    ("Xalqaro talabalar jamiyati", "🎓", "Talabalik", "Student unions and orientation"),
    ("Residensiya ro'yxatidan o'tish", "🏢", "Davlat", "Official city registration"),
    ("Sug'urta kompensatsiyasini olish", "🛡️", "Sug'urta", "Claiming policy payouts"),
    ("Supermarket bonus kartalari", "💳", "Xarid", "Loyalty points and vouchers"),
    ("Ko'ngillilar jamiyatida ishlash", "🤝", "Yordam", "Charity and voluntary impact"),
    ("Uy ta'miri va usta chaqirish", "🔧", "Uy xizmati", "Plumber and fixing leaks"),
    ("Avto servis va yoqilg'i quyish", "⛽", "Avto", "Gas stations and maintenance"),
    ("Xalqaro pul o'tkazmalari (SWIFT)", "💸", "Bank", "Wire transfer and IBAN"),
    ("Kundalik jonli sleng va idiomalar", "🔥", "Slang", "Piece of cake, hit the road"),
    ("Fe'lli birikmalar (Phrasal Verbs)", "📖", "Grammatika", "Give up, figure out, check out"),
    ("Muzokaralar va murosaga kelish", "🤝", "Muzokara", "Win-win solutions"),
    ("2 oylik Katta O'rtacha Imtihon", "🏆", "Imtihon", "Midterm checkpoint test")
]

def get_target_lesson_count(duration: str) -> int:
    d = str(duration).lower().strip()
    if "2_month" in d or "2 oy" in d: return 40
    elif "3_month" in d or "3 oy" in d: return 60
    elif "4_month" in d or "4 oy" in d: return 80
    elif "5_month" in d or "5 oy" in d: return 100
    elif "6_month" in d or "6 oy" in d: return 120
    elif "1_year" in d or "1 yil" in d: return 240
    return 20

def generate_curriculum(level="intermediate", purpose="abroad", duration="1_month"):
    count = get_target_lesson_count(duration)
    lessons = []
    base_pool = list(ABROAD_LESSONS)

    for idx, item in enumerate(base_pool[:min(count, len(base_pool))]):
        lesson_data = dict(item)
        lesson_data["id"] = idx + 1
        lesson_data["title"] = f"{idx + 1}-dars: {item['topic']}"
        lesson_data["xp_reward"] = 25 + (idx * 2)
        lessons.append(lesson_data)

    if count > len(lessons):
        ext_idx = 0
        for i in range(len(lessons), count):
            ext_topic_info = EXTENDED_POOL[ext_idx % len(EXTENDED_POOL)]
            ext_idx += 1
            
            topic_name, icon, cat, gram_desc = ext_topic_info
            diff = "medium" if i % 2 == 0 else "hard" if i % 5 == 0 else "easy"
            diamonds_count = 2 if diff == "easy" else 3 if diff == "medium" else 5

            new_lesson = {
                "id": i + 1,
                "title": f"{i + 1}-dars: {topic_name}",
                "topic": topic_name,
                "icon": icon,
                "category": cat,
                "difficulty": diff,
                "diamonds_reward": diamonds_count,
                "grammar_detailed": {
                    "title": f"Spoken Grammar: {gram_desc}",
                    "why_use": f"{topic_name} vaziyatida to'g'ri va ishonchli gapirish uchun muhim qoida.",
                    "formula": "Spoken Pattern: Ega + Fe'l + Aniq maqsad",
                    "simple_explanation": f"{topic_name} bo'yicha chet elliklar bilan muloqot qilganda o'z fikringizni aniq va xatosiz yetkazish usuli.",
                    "phonetic_trans": "[ˈfluː.ənt ˈspiːtʃ] - Flyuent spiich",
                    "examples": [
                        {
                            "en": f"Could you please assist me with {topic_name.lower()}?",
                            "uz": f"{topic_name} bo'yicha menga yordam bera olasizmi, iltimos?",
                            "pron": "Kud yu pliiz essist mi viz..."
                        }
                    ],
                    "common_mistake": "❌ Noaniq gapirish ➡️ ✅ To'g'ri muloyim iboradan foydalanish"
                },
                "vocab": [
                    {
                        "word": "fluent speech",
                        "ipa": "[ˈfluː.ənt spiːtʃ]",
                        "pron_uz": "flyuent spiich",
                        "trans": "ravon va to'g'ri so'zlashuv",
                        "ex": "Practice daily to achieve fluent speech.",
                        "tip": "Har kuni 15 daqiqa takrorlang."
                    },
                    {
                        "word": "confidence",
                        "ipa": "[ˈkɒn.fɪ.dəns]",
                        "pron_uz": "konfidens",
                        "trans": "o'ziga ishonch",
                        "ex": "Speak with confidence, mistakes help you learn!",
                        "tip": "Xato qilishdan qo'rqmang."
                    }
                ],
                "dialogue": [
                    {
                        "speaker": "Hamroh",
                        "text": f"Hello! Let's practice {topic_name} together.",
                        "uz": f"Salom! Keling, birgalikda {topic_name} mavzusini mashq qilamiz.",
                        "pron": "Xellou! Lets praktis tugeder."
                    },
                    {
                        "speaker": "Siz",
                        "text": "Great! I am ready to learn and speak fluently.",
                        "uz": "Ajoyib! Men o'rganishga va ravon gapirishga tayyorman.",
                        "pron": "Greyt! Ay em redi tu lorn end spiik flyuentli."
                    }
                ],
                "exercises": [
                    {
                        "type": "mc",
                        "difficulty": diff,
                        "diamonds": 2 if diff == "easy" else 3 if diff == "medium" else 4,
                        "question": f"'{topic_name}' muloqotida nima eng muhim?",
                        "options": ["Muloyim va to'g'ri qoidalar bilan gapirish", "Baqirish", "Gapirmasdan jim turish", "Qo'pol so'zlashish"],
                        "answer": "Muloyim va to'g'ri qoidalar bilan gapirish"
                    }
                ],
                "xp_reward": 30 + ((i % 10) * 2)
            }
            lessons.append(new_lesson)

    return lessons

# ======================= IELTS & CEFR Kurslari va Baholash Standartlari =======================
SHOP_COURSES = {
    "ielts": {
        "title": "IELTS Academic & General Prep",
        "icon": "🎯",
        "description": "Mock testlar, Writing (Task 1 & 2) va Speaking examiner baholash tizimi bilan to'liq tayyorgarlik kursi.",
        "plans": [
            {"months": 1, "diamonds": 50, "label": "1 oylik tezkor tayyorgarlik"},
            {"months": 2, "diamonds": 90, "label": "2 oylik intensiv tayyorgarlik"},
            {"months": 3, "diamonds": 130, "label": "3 oylik to'liq tayyorgarlik"},
            {"months": 6, "diamonds": 220, "label": "6 oylik professional master-klass"}
        ]
    },
    "cefr": {
        "title": "CEFR B1 / B2 / C1 Milliy Sertifikat",
        "icon": "📜",
        "description": "CEFR mock imtihonlari, leksik-grammatik testlar, Writing va Speaking rasmiy mezonlari bo'yicha baholash.",
        "plans": [
            {"months": 1, "diamonds": 45, "label": "1 oylik tezkor CEFR kursi"},
            {"months": 2, "diamonds": 80, "label": "2 oylik intensiv CEFR kursi"},
            {"months": 3, "diamonds": 120, "label": "3 oylik to'liq CEFR kursi"},
            {"months": 6, "diamonds": 200, "label": "6 oylik C1 daraja kafolati"}
        ]
    }
}

def evaluate_writing(text: str, task_type: str = "ielts_task2"):
    words = [w for w in text.strip().split() if w]
    word_count = len(words)
    
    if word_count < 20:
        return {
            "band": 3.0,
            "word_count": word_count,
            "task_achievement": 3.0,
            "coherence": 3.0,
            "lexical_resource": 3.0,
            "grammar": 3.0,
            "feedback": "Matn juda qisqa. IELTS Task 2 uchun kamida 250 so'z, Task 1 uchun kamida 150 so'z yozish talab etiladi.",
            "strengths": ["Yozishga urinish qilindi"],
            "improvements": ["So'zlar sonini 150-250 tadan oshiring", "Paragraflarga bo'ling", "Akademik bog'lovchilarni qo'llang"]
        }
    
    academic_words = ["furthermore", "however", "consequently", "moreover", "therefore", 
                      "nevertheless", "significantly", "illustrate", "demonstrate", "perspective",
                      "crucial", "substantial", "inevitable", "comprehensive", "advantageous"]
    found_academic = [w for w in academic_words if w in text.lower()]
    unique_words = len(set([w.lower() for w in words]))
    lexical_ratio = unique_words / max(word_count, 1)

    sentences = [s for s in text.split('.') if s.strip()]
    sentence_count = len(sentences)

    def clamp_band(val):
        return max(3.5, min(9.0, round(val * 2) / 2))

    tr = clamp_band(3.5 + min(3.5, word_count / 70))
    cc = clamp_band(3.5 + min(2.5, len(found_academic) * 0.5) + min(1.5, sentence_count / 5))
    lr = clamp_band(3.5 + min(2.5, lexical_ratio * 4) + min(2.0, len(found_academic) * 0.4))
    gra = clamp_band(3.5 + min(2.5, sentence_count / 4) + (0.5 if word_count > 150 else 0))

    overall = round(((tr + cc + lr + gra) / 4) * 2) / 2

    feedback = f"Siz jami {word_count} ta so'z yozdingiz. "
    if overall >= 7.0:
        feedback += "Ajoyib natija! Fikrlaringiz izchil va akademik lug'at boyligi yaxshi namoyon qilingan."
    elif overall >= 5.5:
        feedback += "Yaxshi urinish. Keyingi safar murakkab bog'lovchi gaplar va xilma-xil so'z boyligidan ko'proq foydalaning."
    else:
        feedback += "Boshlang'ich natija. Matn hajmini oshirish va grammatik qoidalarga diqqat qilish zarur."

    return {
        "band": overall,
        "word_count": word_count,
        "task_achievement": tr,
        "coherence": cc,
        "lexical_resource": lr,
        "grammar": gra,
        "academic_words_used": found_academic,
        "feedback": feedback,
        "strengths": [
            f"Foydalanilgan so'zlar: {word_count} ta",
            f"Akademik bog'lovchilar: {len(found_academic)} ta ({', '.join(found_academic[:4]) if found_academic else 'kam'})"
        ],
        "improvements": [
            "Passive voice va conditional (shart mayli) gaplardan foydalaning",
            "Mavzuni to'liq yoritib beruvchi argumentlar va misollar keltiring"
        ]
    }

def evaluate_speaking(transcript: str, seconds: int = 45):
    words = [w for w in transcript.strip().split() if w]
    word_count = len(words)

    if word_count < 10:
        return {
            "band": 3.5,
            "fluency": 3.5,
            "lexical_resource": 3.5,
            "grammar": 3.5,
            "pronunciation": 4.0,
            "feedback": "Javob juda qisqa bo'ldi. Examiner savollariga batafsilroq va kamida 3-4 gap bilan javob bering.",
            "recommendation": "Har bir fikringizni 'Because...', 'For instance...' deb kengaytiring."
        }

    wpm = (word_count / max(seconds, 15)) * 60
    fluency_score = 4.0
    if wpm >= 100: fluency_score = 7.5
    elif wpm >= 75: fluency_score = 6.5
    elif wpm >= 50: fluency_score = 5.5
    else: fluency_score = 4.5

    connectors = ["well", "actually", "in my opinion", "to be honest", "furthermore", "on the other hand"]
    used_conn = [c for c in connectors if c in transcript.lower()]
    lex_score = min(8.5, 4.5 + len(used_conn) * 0.8 + (word_count / 30))
    gra_score = min(8.0, 4.5 + (len(transcript.split()) / 25))
    pron_score = 6.5

    def round_half(val):
        return max(3.5, min(9.0, round(val * 2) / 2))

    overall = round(((fluency_score + lex_score + gra_score + pron_score) / 4) * 2) / 2

    return {
        "band": overall,
        "fluency": round_half(fluency_score),
        "lexical_resource": round_half(lex_score),
        "grammar": round_half(gra_score),
        "pronunciation": round_half(pron_score),
        "word_count": word_count,
        "wpm": int(wpm),
        "connectors_used": used_conn,
        "feedback": f"Siz daqiqasiga taxminan {int(wpm)} ta so'z tezligida gapirdingiz. Umumiy nutq ravonligi yaxshi darajada.",
        "recommendation": "Nutqda to'xtab qolmaslik (hesitation) uchun 'Well, to be honest...' kabi filler iboralardan unumli foydalaning."
    }
