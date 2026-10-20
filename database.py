# -*- coding: utf-8 -*-
"""
database.py - SQLite ma'lumotlar bazasi va foydalanuvchilar boshqaruvi
Foydalanuvchi hisoblari, profillar (yosh, kasb, jins), olmoslar balansi,
sotib olingan kurslar (IELTS / CEFR) va real foydalanuvchilar reytingini saqlaydi.
"""

import sqlite3
import hashlib
import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lingova.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # 1. Foydalanuvchilar jadvali
    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        avatar TEXT DEFAULT '🦊',
        gender TEXT DEFAULT '',
        age INTEGER DEFAULT 18,
        job TEXT DEFAULT 'Talaba',
        level TEXT DEFAULT 'intermediate',
        purpose TEXT DEFAULT 'abroad',
        duration TEXT DEFAULT '1_month',
        daily_minutes INTEGER DEFAULT 20,
        xp INTEGER DEFAULT 0,
        diamonds INTEGER DEFAULT 25,
        streak INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Mavjud bazani yangi ustunlar bilan kengaytirish (migration)
    c.execute("PRAGMA table_info(users)")
    cols = [col[1] for col in c.fetchall()]
    if "age" not in cols:
        c.execute("ALTER TABLE users ADD COLUMN age INTEGER DEFAULT 18")
    if "job" not in cols:
        c.execute("ALTER TABLE users ADD COLUMN job TEXT DEFAULT 'Talaba'")
    if "tier" not in cols:
        c.execute("ALTER TABLE users ADD COLUMN tier TEXT DEFAULT 'free'")

    # 2. Sessiyalar jadvali (tokenlar)
    c.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 3. Shaxsiy darslar ro'yxati
    c.execute("""
    CREATE TABLE IF NOT EXISTS user_curriculum (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_num INTEGER NOT NULL,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        grammar_json TEXT NOT NULL,
        vocab_json TEXT NOT NULL,
        dialogue_json TEXT NOT NULL,
        exercises_json TEXT NOT NULL,
        xp_reward INTEGER DEFAULT 30,
        diamonds_reward INTEGER DEFAULT 2,
        UNIQUE(user_id, lesson_num),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 4. Foydalanuvchining o'tgan darslari
    c.execute("""
    CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_num INTEGER NOT NULL,
        score INTEGER DEFAULT 100,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_num),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # 5. Sotib olingan kurslar jadvali (IELTS va CEFR)
    c.execute("""
    CREATE TABLE IF NOT EXISTS user_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_key TEXT NOT NULL,
        plan_months INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_key),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    salt = "lingova_secure_salt_2026"
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

def register_user(username, email, password, full_name, avatar='🦊', gender='', age=18, job='Talaba'):
    conn = get_db()
    c = conn.cursor()
    try:
        p_hash = hash_password(password)
        c.execute("""
            INSERT INTO users (username, email, password_hash, full_name, avatar, gender, age, job)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (username.strip().lower(), email.strip().lower(), p_hash, full_name.strip(), avatar, gender, int(age), job))
        user_id = c.lastrowid
        conn.commit()
        return {"success": True, "user_id": user_id}
    except sqlite3.IntegrityError as e:
        err = str(e).lower()
        if "username" in err:
            return {"success": False, "error": "Ushbu foydalanuvchi nomi allaqachon band."}
        elif "email" in err:
            return {"success": False, "error": "Ushbu email bilan akkaunt allaqachon mavjud."}
        return {"success": False, "error": "Ro'yxatdan o'tishda xatolik yuz berdi."}
    finally:
        conn.close()

def authenticate_user(identifier, password):
    conn = get_db()
    c = conn.cursor()
    ident = identifier.strip().lower()
    p_hash = hash_password(password)

    c.execute("""
        SELECT * FROM users 
        WHERE (username = ? OR email = ?) AND password_hash = ?
    """, (ident, ident, p_hash))
    user = c.fetchone()
    conn.close()

    if user:
        return dict(user)
    return None

def authenticate_google_user(email, name, avatar=None):
    conn = get_db()
    c = conn.cursor()
    clean_email = email.strip().lower()

    c.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    user = c.fetchone()

    if user:
        conn.close()
        return dict(user)

    # Yangi Google foydalanuvchisi
    base_username = clean_email.split('@')[0].replace('.', '_')
    username = base_username
    counter = 1
    while True:
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        if not c.fetchone():
            break
        username = f"{base_username}{counter}"
        counter += 1

    p_hash = hash_password(f"google_auth_oauth_{time.time()}")
    c.execute("""
        INSERT INTO users (username, email, password_hash, full_name, avatar)
        VALUES (?, ?, ?, ?, ?)
    """, (username, clean_email, p_hash, name or username, avatar or '🌐'))
    user_id = c.lastrowid
    conn.commit()

    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    new_user = c.fetchone()
    conn.close()
    return dict(new_user)

def update_user_profile(user_id, username, password, gender, avatar, age, job):
    conn = get_db()
    c = conn.cursor()
    try:
        p_hash = hash_password(password) if password else None
        if p_hash:
            c.execute("""
                UPDATE users
                SET username = ?, password_hash = ?, gender = ?, avatar = ?, age = ?, job = ?
                WHERE id = ?
            """, (username.strip().lower(), p_hash, gender, avatar, int(age), job, user_id))
        else:
            c.execute("""
                UPDATE users
                SET username = ?, gender = ?, avatar = ?, age = ?, job = ?
                WHERE id = ?
            """, (username.strip().lower(), gender, avatar, int(age), job, user_id))
        conn.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "Ushbu username allaqachon band."}
    finally:
        conn.close()

def update_user_tier(user_id, tier):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET tier = ? WHERE id = ?", (tier, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "tier": tier}

def save_user_onboarding(user_id, level, purpose, duration, daily_minutes, curriculum_list):
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        UPDATE users 
        SET level = ?, purpose = ?, duration = ?, daily_minutes = ?
        WHERE id = ?
    """, (level, purpose, duration, daily_minutes, user_id))

    c.execute("DELETE FROM user_curriculum WHERE user_id = ?", (user_id,))

    for lesson in curriculum_list:
        c.execute("""
            INSERT INTO user_curriculum 
            (user_id, lesson_num, title, topic, icon, category, grammar_json, vocab_json, dialogue_json, exercises_json, xp_reward, diamonds_reward)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            lesson['id'],
            lesson['title'],
            lesson['topic'],
            lesson['icon'],
            lesson['category'],
            json.dumps(lesson.get('grammar', lesson.get('grammar_detailed', {})), ensure_ascii=False),
            json.dumps(lesson.get('vocab', []), ensure_ascii=False),
            json.dumps(lesson.get('dialogue', []), ensure_ascii=False),
            json.dumps(lesson['exercises'], ensure_ascii=False),
            lesson.get('xp_reward', 30),
            lesson.get('diamonds_reward', 2)
        ))

    conn.commit()
    conn.close()

def get_user_curriculum(user_id):
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        SELECT c.*, (p.id IS NOT NULL) AS is_completed, p.score, p.completed_at
        FROM user_curriculum c
        LEFT JOIN user_progress p ON c.user_id = p.user_id AND c.lesson_num = p.lesson_num
        WHERE c.user_id = ?
        ORDER BY c.lesson_num ASC
    """, (user_id,))

    rows = c.fetchall()
    conn.close()

    lessons = []
    for r in rows:
        lessons.append({
            "id": r["lesson_num"],
            "title": r["title"],
            "topic": r["topic"],
            "icon": r["icon"],
            "category": r["category"],
            "grammar": json.loads(r["grammar_json"]),
            "vocab": json.loads(r["vocab_json"]),
            "dialogue": json.loads(r["dialogue_json"]),
            "exercises": json.loads(r["exercises_json"]),
            "xp_reward": r["xp_reward"],
            "diamonds_reward": r["diamonds_reward"],
            "is_completed": bool(r["is_completed"]),
            "score": r["score"],
            "completed_at": r["completed_at"]
        })
    return lessons

def complete_lesson(user_id, lesson_num, score=100, diamonds_gain=3):
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        INSERT INTO user_progress (user_id, lesson_num, score)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, lesson_num) DO UPDATE SET score = excluded.score
    """, (user_id, lesson_num, score))

    xp_gain = 35 + (score // 10)
    c.execute("""
        UPDATE users 
        SET xp = xp + ?, diamonds = diamonds + ?
        WHERE id = ?
    """, (xp_gain, diamonds_gain, user_id))

    c.execute("SELECT xp, diamonds FROM users WHERE id = ?", (user_id,))
    updated = c.fetchone()
    conn.commit()
    conn.close()
    return {"xp": updated["xp"], "diamonds": updated["diamonds"], "gain_xp": xp_gain, "gain_dia": diamonds_gain}

def add_user_diamonds(user_id, count):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET diamonds = diamonds + ? WHERE id = ?", (count, user_id))
    c.execute("SELECT diamonds FROM users WHERE id = ?", (user_id,))
    res = c.fetchone()
    conn.commit()
    conn.close()
    return res["diamonds"] if res else 0

def buy_course(user_id, course_key, months, diamond_price):
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT diamonds FROM users WHERE id = ?", (user_id,))
    user = c.fetchone()
    if not user or user["diamonds"] < diamond_price:
        conn.close()
        return {"success": False, "error": f"Olmoslar yetarli emas! Sizda {user['diamonds'] if user else 0} 💎 bor, kerak: {diamond_price} 💎."}

    # Olmoslarni yechish
    c.execute("UPDATE users SET diamonds = diamonds - ? WHERE id = ?", (diamond_price, user_id))
    
    # Kurs amal qilish muddatini hisoblash
    duration_seconds = months * 30 * 86400
    now = time.time()
    
    c.execute("SELECT expires_at FROM user_courses WHERE user_id = ? AND course_key = ?", (user_id, course_key))
    existing = c.fetchone()
    if existing:
        current_exp = max(float(existing["expires_at"]), now)
        new_exp = current_exp + duration_seconds
        c.execute("UPDATE user_courses SET plan_months = plan_months + ?, expires_at = ? WHERE user_id = ? AND course_key = ?", 
                  (months, new_exp, user_id, course_key))
    else:
        new_exp = now + duration_seconds
        c.execute("INSERT INTO user_courses (user_id, course_key, plan_months, expires_at) VALUES (?, ?, ?, ?)",
                  (user_id, course_key, months, new_exp))

    c.execute("SELECT diamonds FROM users WHERE id = ?", (user_id,))
    updated_dia = c.fetchone()["diamonds"]
    conn.commit()
    conn.close()
    return {"success": True, "remaining_diamonds": updated_dia, "expires_at": new_exp}

def get_user_courses(user_id):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM user_courses WHERE user_id = ?", (user_id,))
    rows = c.fetchall()
    conn.close()
    now = time.time()
    result = {}
    for r in rows:
        exp = float(r["expires_at"])
        result[r["course_key"]] = {
            "is_active": exp > now,
            "expires_at": exp,
            "months": r["plan_months"]
        }
    return result

def get_leaderboard():
    """Faqat tizimda ro'yxatdan o'tgan haqiqiy foydalanuvchilar reytingi"""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT username, full_name, avatar, xp, diamonds, level, job, age, tier
        FROM users
        ORDER BY xp DESC
        LIMIT 50
    """)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

init_db()
