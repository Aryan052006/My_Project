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

def get_all_sessions():
    """Returns a list of all unique session IDs."""
    conn = _get_connection()
    c = conn.cursor()
    c.execute("SELECT DISTINCT session_id FROM chats")
    rows = c.fetchall()
    conn.close()
    return [row[0] for row in rows]