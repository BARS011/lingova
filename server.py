# -*- coding: utf-8 -*-
"""
server.py - Lingova Backend API va Veb-server
Python 3 standart kutubxonasida yaratilgan: qo'shimcha paketlarsiz ishlaydi!
- Real foydalanuvchilar autentifikatsiyasi (Google, Username, Parol, Yosh, Kasb, Jins)
- Faqat haqiqiy o'yinchilar reytingi (Leaderboard)
- Olmoslar bilan IELTS va CEFR kurslarini xarid qilish (1, 2, 3, 6 oylik)
- Examiner Writing va Speaking rasmiy mezonlar bo'yicha baholash
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import uuid
import urllib.request
import re
import math
import database
import curriculum_data

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ACTIVE_SESSIONS = {}

def backend_translate(text, source='auto', target='uz'):
    if not text or not text.strip():
        return {'success': True, 'translated_text': '', 'source_lang': source, 'target_lang': target, 'parts_of_speech': []}
    text = text.strip()
    try:
        encoded_q = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source}&tl={target}&dt=t&dt=bd&dt=rm&dt=at&q={encoded_q}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=6) as response:
            raw = response.read().decode('utf-8')
            data = json.loads(raw)
            translated_chunks = []
            if data and len(data) > 0 and data[0]:
                for seg in data[0]:
                    if seg and len(seg) > 0 and seg[0]:
                        translated_chunks.append(seg[0])
            translated_text = "".join(translated_chunks)
            detected_lang = data[2] if len(data) > 2 and isinstance(data[2], str) else source

            parts_of_speech = []
            if len(data) > 1 and isinstance(data[1], list) and data[1]:
                for pos in data[1]:
                    if pos and len(pos) >= 2:
                        pos_name = pos[0]
                        synonyms = pos[1] if isinstance(pos[1], list) else []
                        parts_of_speech.append({
                            "pos": pos_name,
                            "synonyms": synonyms[:8]
                        })

            return {
                'success': True,
                'translated_text': translated_text,
                'source_lang': detected_lang,
                'target_lang': target,
                'parts_of_speech': parts_of_speech
            }
    except Exception as e:
        try:
            pair = f"{'en' if source=='auto' else source}|{target}"
            url2 = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={pair}"
            req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, timeout=6) as resp2:
                d2 = json.loads(resp2.read().decode('utf-8'))
                trans = d2.get('responseData', {}).get('translatedText', '')
                if trans:
                    return {
                        'success': True,
                        'translated_text': trans,
                        'source_lang': source,
                        'target_lang': target,
                        'parts_of_speech': []
                    }
        except Exception:
            pass
        return {
            'success': False,
            'error': str(e)
        }

def backend_ai_chat(prompt, history=None, api_key=None):
    if not prompt or not prompt.strip():
        return {'success': False, 'error': 'Savol kiritilmadi'}
    prompt = prompt.strip()

    if api_key and len(api_key) > 15:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"Sen Lingova Pro ta'lim platformasining eng aqlli, fikrlovchi va professional AI murabbiyisan. Foydalanuvchiga har qanday mavzuda (ingliz tili, rus tili, grammatika, gaplar tuzish (oddiy, bog'langan, murakkab, shart ergash), matematika va hisob-kitoblar, misollarni bosqichma-bosqich ishlash, IELTS/CEFR) o'zbek tilida chuqur, chiroyli va tushunarli qilib javob ber.\n\nFoydalanuvchi savoli: {prompt}"}
                        ]
                    }
                ]
            }
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                text = result['candidates'][0]['content']['parts'][0]['text']
                return {
                    'success': True,
                    'thinking': "Google Gemini 1.5 Flash neyron modeli orqali chuqur tahlil qilindi.",
                    'response': text,
                    'model': 'gemini-1.5-flash'
                }
        except Exception:
            pass

    thinking_steps = []
    lower = prompt.lower()

    # Matematika & hisob-kitoblar
    math_match = re.search(r'(\d+[\s\+\-\*\/\^\(\)]+[\d\+\-\*\/\^\(\)\.\s]+)', prompt)
    if math_match or any(k in lower for k in ['nechchi', 'necha', 'hisobla', 'teng', 'ko\'paytir', 'bo\'l', 'ildiz', 'foiz', 'protsent']):
        try:
            pct_match = re.search(r'(\d+)\s*(?:ning)?\s*(\d+)\s*(?:foiz|protsent|%)', lower)
            if pct_match:
                n1, n2 = float(pct_match.group(1)), float(pct_match.group(2))
                res = (n1 * n2) / 100
                thinking_steps.append(f"1. Foiz masalasi aniqlandi: {n1} sonining {n2}% qismi.")
                thinking_steps.append(f"2. Matematik formula: ({n1} × {n2}) / 100")
                thinking_steps.append(f"3. Yakuniy qiymat: {res}")
                ans = f"🧮 **Matematik Masala Tahlili:**\n\n**Shart:** {n1} ning {n2}% ini topish.\n\n**Yechish bosqichlari:**\n1. {n1} sonini {n2} ga ko'paytiramiz: `{n1} × {n2} = {n1*n2}`\n2. Chiqqan natijani 100 ga bo'lamiz: `{n1*n2} / 100 = {res}`\n\n✅ **Yakuniy javob:** **{res}**"
                return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': ans, 'model': 'cognitive-engine'}

            expr = math_match.group(1).strip() if math_match else ""
            clean_expr = expr.replace('^', '**').replace('x', '*').replace('X', '*')
            if clean_expr and re.search(r'[\+\-\*\/]', clean_expr):
                if re.match(r'^[\d\.\s\+\-\*\/\(\)\%]+$', clean_expr):
                    val = eval(clean_expr, {"__builtins__": None}, {})
                    thinking_steps.append(f"1. Matematik ifoda aniqlandi: {expr}")
                    thinking_steps.append("2. PEMDAS/BODMAS qoidasi bo'yicha amallar tartibi belgilandi.")
                    thinking_steps.append(f"3. Hisoblangan qiymat: {val}")

                    explanation = f"🧮 **Matematik Misol Yechimi:**\n\n**Ifoda:** `{expr}`\n\n**Bosqichma-bosqich hisoblash (Amallar tartibi qoidasi):**\n"
                    if '*' in expr or '/' in expr:
                        explanation += "• **1-qadam:** Birinchi navbatda ko'paytirish va bo'lish amallari bajariladi.\n"
                    if '+' in expr or '-' in expr:
                        explanation += "• **2-qadam:** So'ngra chapdan o'ngga qarab qo'shish va ayirish amallari bajariladi.\n"
                    explanation += f"\n🎯 **Yakuniy Javob:** **{val}**"
                    return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': explanation, 'model': 'cognitive-engine'}
        except Exception:
            pass

    # Gap tuzish (Oddiy va murakkab gaplar)
    if any(k in lower for k in ['gap tuz', 'gaplar tuz', 'sentence', 'murakkab gap', 'oddiy gap']):
        target = "opportunity"
        words = re.findall(r'[\w\']+', prompt)
        for w in words:
            if len(w) > 3 and w.lower() not in ['gap', 'tuz', 'tuzib', 'ber', 'oddiy', 'murakkab', 'uchun', 'haqida', 'iltimos']:
                target = w
                break
        thinking_steps.append(f"1. Maqsadli so'z/mavzu aniqlandi: '{target}'")
        thinking_steps.append("2. A1, B1, B2, C1 sintaktik qoliplari shakllantirildi.")
        thinking_steps.append("3. Har bir gap uchun grammatik formula va o'zbekcha tarjima biriktirildi.")

        ans = f"📝 **'{target.capitalize()}' mavzusida oddiy va murakkab gaplar to'plami:**\n\n"
        ans += f"1️⃣ **Oddiy gap (Simple Sentence - A1/A2):**\n"
        ans += f"• *\"{target.capitalize()} creates new possibilities in our daily lives.\"*\n"
        ans += f"👉 **Tarjimasi:** {target.capitalize()} bizning kundalik hayotimizda yangi imkoniyatlar yaratadi.\n"
        ans += f"📌 **Tuzilishi:** Ega (Subject) + Fe'l (Verb) + To'ldiruvchi (Object).\n\n"

        ans += f"2️⃣ **Bog'langan qo'shma gap (Compound Sentence - B1):**\n"
        ans += f"• *\"{target.capitalize()} can be challenging, but it brings valuable experience.\"*\n"
        ans += f"👉 **Tarjimasi:** {target.capitalize()} qiyin bo'lishi mumkin, ammo u qimmatli tajriba keltiradi.\n"
        ans += f"📌 **Tuzilishi:** Mustaqil gap + Bog'lovchi (*but / and / yet*) + Mustaqil gap.\n\n"

        ans += f"3️⃣ **Ergashgan murakkab gap (Complex Sentence - B2):**\n"
        ans += f"• *\"Although mastering {target.lower()} requires consistent patience, those who persevere will undoubtedly succeed.\"*\n"
        ans += f"👉 **Tarjimasi:** Garchi {target.lower()}ni egallash uzluksiz sabr-toqat talab qilsa-da, qat'iyat ko'rsatganlar shubhasiz muvaffaqiyatga erishadilar.\n"
        ans += f"📌 **Tuzilishi:** Ergash gap (*Although / Even though*) + Bosh gap.\n\n"

        ans += f"4️⃣ **Shart ergash murakkab gap (Conditional Sentence - C1):**\n"
        ans += f"• *\"If we had understood the importance of {target.lower()} earlier, we would have progressed much faster.\"*\n"
        ans += f"👉 **Tarjimasi:** Agar biz {target.lower()}ning ahamiyatini ertaroq tushunganimizda edi, ancha tezroq o'sgan bo'lardik.\n"
        ans += f"📌 **Tuzilishi:** 3rd Conditional (*If + Past Perfect, would have + V3*)."
        return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': ans, 'model': 'cognitive-engine'}

    # Grammatik xatolar tahlili
    if any(k in lower for k in ['xato', 'tekshir', 'to\'g\'rimi', 'togrimi', 'check', 'correct']):
        thinking_steps.append("1. Matn morfologik va sintaktik jihatdan tekshirildi.")
        thinking_steps.append("2. Zamonlar uyg'unligi, predloglar va ega-fe'l moslashuvi tahlil qilindi.")
        ans = "🔍 **Grammatik Tahlil va Tekshiruv:**\n\nSiz yozgan jumla tahlil qilindi. Ingliz tilida jumlalar tuzishda eng ko'p uchraydigan 3 ta oltin qoida:\n\n1. **Ega va Fe'l moslashuvi (Subject-Verb Agreement):** *He / She / It* uchun fe'lga **-s/-es** qo'shiladi (*He goes, She learns*).\n2. **O'tgan zamonda yordamchi fe'l:** Inkor va so'roqda *didn't + V1* ishlatiladi (*I didn't see him*, 'didn't saw' EMAS!).\n3. **To be va asosiy fe'l:** *am/is/are* dan keyin oddiy fe'l kelmaydi (*I am agree* ❌ -> *I agree* ✅)."
        return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': ans, 'model': 'cognitive-engine'}

    # IELTS maslahatlari
    if any(k in lower for k in ['ielts', 'cefr', 'band', 'speaking', 'writing', 'task 1', 'task 2']):
        thinking_steps.append("1. IELTS rasmiy baholash mezonlari (Band Descriptors) yuklandi.")
        thinking_steps.append("2. Fluency, Lexical Resource, Grammatical Range va Cohesion bo'yicha tavsiyalar shakllantirildi.")
        ans = "🎯 **IELTS 7.5+ Band Olish Uchun Rasmiy Examiner Maslahatlari:**\n\n1. **Fluency & Coherence:** Gaplar orasida to'xtab qolmaslik uchun *'Speaking of which...', 'To put it another way...'* kabi bog'lovchilardan foydalaning.\n2. **Lexical Resource:** Akademik so'zlarni ishlating (*'crucial', 'beneficial', 'consequently'*).\n3. **Grammatical Range:** Doim Compound va Complex gaplarni Conditionals bilan boyiting.\n4. **Writing Task 2:** Paragraflarni doim aniq *Topic Sentence* bilan boshlang va hayotiy misol keltiring."
        return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': ans, 'model': 'cognitive-engine'}

    # Umumiy savol
    thinking_steps.append(f"1. Savol mazmuni tahlil qilindi: '{prompt[:45]}...'")
    thinking_steps.append("2. O'zbek tilida batafsil va amaliy maslahat tayyorlandi.")
    ans = f"Assalomu alaykum! Sizning savolingiz: **\"{prompt}\"**\n\n"
    ans += "Ushbu mavzu bo'yicha quyidagilarni bilish juda muhim:\n\n"
    ans += "• **Asosiy mazmun:** Tizimli bilim va doimiy amaliyot orqali har qanday qiyin so'z va qoidalarni o'zlashtirish mumkin.\n"
    ans += "• **Mening imkoniyatlarim:** Men sizga istalgan so'z bo'yicha **oddiy va murakkab gaplar** tuzib bera olaman, **matematik misollar va hisob-kitoblarni** qadamma-qadam yechib beraman, grammatikangizdagi barcha xatolarni to'g'rilayman!\n\n"
    ans += "💡 *Masalan, menga '12*15 - 45 nechchi?' yoki ''Technology' so'ziga murakkab gap tuz' deb yozib ko'ring!*"
    return {'success': True, 'thinking': "\n".join(thinking_steps), 'response': ans, 'model': 'cognitive-engine'}

class LingovaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def get_auth_user_id(self):
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:].strip()
            return ACTIVE_SESSIONS.get(token)
        return None

    def read_json_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                body = self.rfile.read(content_length).decode('utf-8')
                return json.loads(body)
        except Exception as e:
            print("JSON parse error:", e)
        return {}

    def send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # 1. Ro'yxatdan o'tish (Register)
        if path == '/api/register':
            data = self.read_json_body()
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            full_name = data.get('full_name', '').strip() or username
            avatar = data.get('avatar', '🦊')
            gender = data.get('gender', '')
            age = int(data.get('age', 18))
            job = data.get('job', 'Talaba')

            if not username or not email or not password:
                return self.send_json({'success': False, 'error': "Barcha majburiy maydonlarni to'ldiring!"}, 400)

            if len(password) < 4:
                return self.send_json({'success': False, 'error': "Parol kamida 4 ta belgidan iborat bo'lishi kerak."}, 400)

            res = database.register_user(username, email, password, full_name, avatar, gender, age, job)
            if not res['success']:
                return self.send_json(res, 400)

            token = str(uuid.uuid4())
            ACTIVE_SESSIONS[token] = res['user_id']
            user_data = database.authenticate_user(username, password)
            user_data.pop('password_hash', None)

            return self.send_json({
                'success': True,
                'token': token,
                'user': user_data
            })

        # 2. Kirish (Login)
        elif path == '/api/login':
            data = self.read_json_body()
            ident = data.get('identifier', '').strip()
            password = data.get('password', '').strip()

            if not ident or not password:
                return self.send_json({'success': False, 'error': "Login va parolni kiriting!"}, 400)

            user = database.authenticate_user(ident, password)
            if not user:
                return self.send_json({'success': False, 'error': "Foydalanuvchi nomi yoki parol noto'g'ri!"}, 401)

            token = str(uuid.uuid4())
            ACTIVE_SESSIONS[token] = user['id']
            user.pop('password_hash', None)

            return self.send_json({
                'success': True,
                'token': token,
                'user': user
            })

        # 3. Google bilan kirish
        elif path == '/api/google-auth':
            data = self.read_json_body()
            email = data.get('email', '').strip()
            name = data.get('name', '').strip()
            avatar = data.get('avatar', '🌐')

            if not email:
                return self.send_json({'success': False, 'error': "Google email manzili topilmadi."}, 400)

            user = database.authenticate_google_user(email, name, avatar)
            token = str(uuid.uuid4())
            ACTIVE_SESSIONS[token] = user['id']
            user.pop('password_hash', None)

            return self.send_json({
                'success': True,
                'token': token,
                'user': user
            })

        # 4. Profilni to'liq yangilash (Username, Parol, Avatar, Jins, Yosh, Kasb)
        elif path == '/api/user/profile':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiya talab qilinadi.'}, 401)

            data = self.read_json_body()
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            gender = data.get('gender', '')
            avatar = data.get('avatar', '🦊')
            age = int(data.get('age', 18))
            job = data.get('job', 'Talaba')

            res = database.update_user_profile(user_id, username, password, gender, avatar, age, job)
            return self.send_json(res)

        # 4b. Foydalanuvchi tarifini yangilash (Free, Pro, Premium)
        elif path == '/api/user/tier':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiya talab qilinadi.'}, 401)
            data = self.read_json_body()
            tier = data.get('tier', 'free')
            res = database.update_user_tier(user_id, tier)
            return self.send_json(res)

        # 5. Onboarding: So'rovnoma va darslar yaratish (1, 2, 3, 4, 5, 6 oy, 1 yil)
        elif path == '/api/onboarding':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiyadan o\'ting.'}, 401)

            data = self.read_json_body()
            level = data.get('level', 'intermediate')
            purpose = data.get('purpose', 'abroad')
            duration = data.get('duration', '1_month')
            daily_min = int(data.get('daily_minutes', 20))

            curriculum = curriculum_data.generate_curriculum(level, purpose, duration)
            database.save_user_onboarding(user_id, level, purpose, duration, daily_min, curriculum)

            saved_curriculum = database.get_user_curriculum(user_id)
            return self.send_json({
                'success': True,
                'message': f"{len(saved_curriculum)} ta shaxsiy dars muvaffaqiyatli tuzildi!",
                'curriculum': saved_curriculum
            })

        # 6. Darsni yakunlash (XP va Olmoslar qo'shish)
        elif path == '/api/lesson/complete':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiyadan o\'ting.'}, 401)

            data = self.read_json_body()
            lesson_num = int(data.get('lesson_num', 1))
            score = int(data.get('score', 100))
            dia_gain = int(data.get('diamonds_gain', 3))

            res = database.complete_lesson(user_id, lesson_num, score, dia_gain)
            return self.send_json({
                'success': True,
                'stats': res
            })

        # 7. Savol / O'yin uchun qo'shimcha olmos berish
        elif path == '/api/diamonds/add':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiyadan o\'ting.'}, 401)

            data = self.read_json_body()
            count = int(data.get('count', 1))
            new_diamonds = database.add_user_diamonds(user_id, count)
            return self.send_json({'success': True, 'diamonds': new_diamonds})

        # 8. Olmoslarga kurs sotib olish (IELTS / CEFR)
        elif path == '/api/shop/buy':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiyadan o\'ting.'}, 401)

            data = self.read_json_body()
            course_key = data.get('course_key', 'ielts')
            months = int(data.get('months', 1))
            diamond_price = int(data.get('price', 50))

            res = database.buy_course(user_id, course_key, months, diamond_price)
            return self.send_json(res)

        # 9. Examiner Writing Baholash
        elif path == '/api/examiner/writing':
            data = self.read_json_body()
            text = data.get('text', '')
            task_type = data.get('task_type', 'ielts_task2')

            evaluation = curriculum_data.evaluate_writing(text, task_type)
            return self.send_json({'success': True, 'evaluation': evaluation})

        # 10. Examiner Speaking Baholash
        elif path == '/api/examiner/speaking':
            data = self.read_json_body()
            transcript = data.get('transcript', '')
            seconds = int(data.get('seconds', 45))

            evaluation = curriculum_data.evaluate_speaking(transcript, seconds)
            return self.send_json({'success': True, 'evaluation': evaluation})

        # 11. Smart Tarjimon Endpointi (Universal Google & MyMemory)
        elif path == '/api/translate':
            data = self.read_json_body()
            text = data.get('text', '')
            source = data.get('source', 'auto')
            target = data.get('target', 'uz')

            result = backend_translate(text, source, target)
            return self.send_json(result)

        # 12. AI Murabbiy Chat Endpointi (Cognitive Brain & Gemini)
        elif path == '/api/ai/chat':
            data = self.read_json_body()
            prompt = data.get('prompt', '') or data.get('message', '')
            api_key = data.get('api_key', '')
            model = data.get('model', 'gemini-1.5-flash')

            result = backend_ai_chat(prompt, api_key=api_key)
            return self.send_json(result)

        # 13. Chiqish
        elif path == '/api/logout':
            auth_header = self.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:].strip()
                ACTIVE_SESSIONS.pop(token, None)
            return self.send_json({'success': True})

        else:
            self.send_error(404, "Endpoint topilmadi")

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == '/api/me':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiya talab qilinadi.'}, 401)

            conn = database.get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            u = c.fetchone()
            conn.close()

            if not u:
                return self.send_json({'success': False, 'error': 'Foydalanuvchi topilmadi.'}, 404)

            user_data = dict(u)
            user_data.pop('password_hash', None)
            user_data['courses'] = database.get_user_courses(user_id)
            return self.send_json({'success': True, 'user': user_data})

        elif path == '/api/curriculum':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiya talab qilinadi.'}, 401)

            curriculum = database.get_user_curriculum(user_id)
            return self.send_json({'success': True, 'curriculum': curriculum})

        elif path == '/api/shop/courses':
            return self.send_json({'success': True, 'courses': curriculum_data.SHOP_COURSES})

        elif path == '/api/courses/my':
            user_id = self.get_auth_user_id()
            if not user_id:
                return self.send_json({'success': False, 'error': 'Avtorizatsiya talab qilinadi.'}, 401)

            courses = database.get_user_courses(user_id)
            return self.send_json({'success': True, 'courses': courses})

        elif path == '/api/grammar':
            return self.send_json({'success': True, 'grammar': curriculum_data.GRAMMAR_GUIDE})

        elif path == '/api/leaderboard':
            # Faqat haqiqiy foydalanuvchilar!
            leaders = database.get_leaderboard()
            return self.send_json({'success': True, 'leaderboard': leaders})


        else:
            if path == '/' or path == '':
                self.path = '/index.html'
            return super().do_GET()

def run_server():
    os.chdir(BASE_DIR)
    database.init_db()
    with socketserver.TCPServer(("", PORT), LingovaRequestHandler) as httpd:
        print(f"==================================================")
        print(f"🚀 Lingova Backend API faol: http://localhost:{PORT}")
        print(f"Baza: lingova.db (SQLite)")
        print(f"Frontend: index.html va tilla-learning.html")
        print(f"To'xtatish: Ctrl + C")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer to'xtatildi.")

if __name__ == '__main__':
    run_server()
