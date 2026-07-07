import sqlite3
import os

DB_PATH = "chats.db"
MAX_HISTORY = 10

def _get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = _get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    c.execute('''
        CREATE TABLE IF NOT EXISTS performance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT,
            latency_ms REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on load
init_db()

def add_message(session_id, role, content):
    conn = _get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO chats (session_id, role, content) VALUES (?, ?, ?)",
        (session_id, role, content)
    )
    conn.commit()
    conn.close()

def get_history(session_id, limit=MAX_HISTORY):
    conn = _get_connection()
    c = conn.cursor()
    # Fetch the last N messages for the session
    c.execute(
        "SELECT role, content FROM chats WHERE session_id = ? ORDER BY id DESC LIMIT ?",
        (session_id, limit)
    )
    rows = c.fetchall()
    conn.close()
    
    # Reverse to return them in chronological order
    history = [{"role": row[0], "content": row[1]} for row in rows]
    history.reverse()
    
    return history

def get_all_history(session_id):
    """Fetch the entire chat history for a session."""
    conn = _get_connection()
    c = conn.cursor()
    c.execute(
        "SELECT role, content FROM chats WHERE session_id = ? ORDER BY id ASC",
        (session_id,)
    )
    rows = c.fetchall()
    conn.close()
    return [{"role": row[0], "content": row[1]} for row in rows]

def clear_history(session_id):
    conn = _get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM chats WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

def get_all_sessions(user_id):
    """Returns a list of all unique session IDs with their titles."""
    conn = _get_connection()
    c = conn.cursor()
    prefix = f"{user_id}_"
    c.execute("SELECT DISTINCT session_id FROM chats WHERE session_id LIKE ?", (prefix + '%',))
    rows = c.fetchall()
    
    sessions_data = []
    for row in rows:
        full_session_id = row[0]
        
        # Get the first user message for this session
        c.execute("SELECT content FROM chats WHERE session_id = ? AND role = 'user' ORDER BY id ASC LIMIT 1", (full_session_id,))
        msg_row = c.fetchone()
        
        display_name = "New Chat"
        if msg_row:
            text = msg_row[0].strip()
            display_name = text[:30] + ("..." if len(text) > 30 else "")
            
        sessions_data.append({
            "id": full_session_id.replace(prefix, "", 1),
            "title": display_name
        })
        
    conn.close()
    return sessions_data

def get_analytics():
    conn = _get_connection()
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM chats WHERE role = 'user'")
    total_questions = c.fetchone()[0] or 0
    
    c.execute("SELECT COUNT(DISTINCT session_id) FROM chats")
    total_sessions = c.fetchone()[0] or 0
    
    c.execute("SELECT AVG(latency_ms) FROM performance_logs WHERE endpoint = 'retrieval'")
    avg_retrieval = c.fetchone()[0] or 0
    
    c.execute("SELECT AVG(latency_ms) FROM performance_logs WHERE endpoint = 'generation'")
    avg_generation = c.fetchone()[0] or 0
    
    conn.close()
    
    return {
        "total_questions": total_questions,
        "total_sessions": total_sessions,
        "avg_retrieval_ms": round(avg_retrieval, 2),
        "avg_generation_ms": round(avg_generation, 2)
    }

def log_performance(endpoint, latency_ms):
    conn = _get_connection()
    c = conn.cursor()
    c.execute("INSERT INTO performance_logs (endpoint, latency_ms) VALUES (?, ?)", (endpoint, latency_ms))
    conn.commit()
    conn.close()