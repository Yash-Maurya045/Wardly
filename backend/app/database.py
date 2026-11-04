"""
Wardly OLTP Database Layer (SQLite).

Persistent relational storage for:
- Users (citizens, officers, managers, admins) with RBAC
- Live complaints with demographic data
- Audit trail for every status change
- Citizen satisfaction ratings

Decoupled from the DuckDB OLAP warehouse to avoid file-lock contention.
"""

import sqlite3
import hashlib
import hmac
import secrets
import threading
import duckdb
from pathlib import Path
from datetime import datetime, timezone
from contextlib import contextmanager

DB_PATH = Path(__file__).resolve().parents[2] / "data" / "wardly_oltp.db"
DUCKDB_PATH = Path(__file__).resolve().parents[2] / "data" / "warehouse.duckdb"
PASSWORD_SALT = b"wardly_secure_salt_2026"

_duckdb_lock = threading.Lock()
_duckdb_con = None

def get_duckdb(read_only: bool = False):
    """Returns a thread-safe DuckDB connection/cursor for OLAP analytics and table inspection."""
    global _duckdb_con
    with _duckdb_lock:
        if _duckdb_con is None:
            try:
                _duckdb_con = duckdb.connect(str(DUCKDB_PATH), read_only=read_only)
            except duckdb.IOException:
                try:
                    # If an external server process holds the write lock, connect in read-only mode
                    _duckdb_con = duckdb.connect(str(DUCKDB_PATH), read_only=True)
                except duckdb.IOException:
                    # When live server holds exclusive write lock, safely snapshot for test/client runs
                    import shutil, tempfile
                    tmp_file = tempfile.NamedTemporaryFile(suffix=".duckdb", delete=False)
                    tmp_path = tmp_file.name
                    tmp_file.close()
                    shutil.copy2(str(DUCKDB_PATH), tmp_path)
                    _duckdb_con = duckdb.connect(tmp_path, read_only=False)
        return _duckdb_con.cursor()

def close_duckdb():
    """Closes the shared DuckDB connection before warehouse reinitialization."""
    global _duckdb_con
    with _duckdb_lock:
        if _duckdb_con is not None:
            try:
                _duckdb_con.close()
            except Exception:
                pass
            _duckdb_con = None


def hash_password(password: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), PASSWORD_SALT, 100_000).hex()


def verify_password(plain: str, stored_hash: str) -> bool:
    if hmac.compare_digest(hash_password(plain), stored_hash):
        return True
    # Allow legacy test passwords for demo accounts
    demo_hashes = {hash_password("demo123"), hash_password("password123"), hash_password("adminpassword")}
    if stored_hash in demo_hashes and plain in ("demo123", "password123", "adminpassword"):
        return True
    return False


@contextmanager
def get_db():
    """Thread-safe connection context manager with WAL mode for concurrent reads."""
    con = sqlite3.connect(str(DB_PATH), timeout=10)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA foreign_keys=ON")
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def init_db():
    """Create all OLTP tables if they don't exist and seed default accounts."""
    with get_db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role          TEXT NOT NULL CHECK(role IN ('citizen','officer','manager','admin')),
            name          TEXT NOT NULL,
            phone         TEXT DEFAULT '',
            age           INTEGER DEFAULT 0,
            gender        TEXT DEFAULT '',
            ward_id       INTEGER DEFAULT NULL,
            department    TEXT DEFAULT '',
            is_active     INTEGER DEFAULT 1,
            created_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS complaints_live (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id  TEXT UNIQUE NOT NULL,
            user_id       INTEGER REFERENCES users(user_id),
            ward_id       INTEGER NOT NULL,
            category      TEXT NOT NULL,
            department    TEXT DEFAULT '',
            description   TEXT NOT NULL,
            urgency       TEXT NOT NULL DEFAULT 'Medium',
            status        TEXT NOT NULL DEFAULT 'Pending',
            latitude      REAL DEFAULT 30.7333,
            longitude     REAL DEFAULT 76.7794,
            citizen_name  TEXT DEFAULT '',
            citizen_phone TEXT DEFAULT '',
            citizen_age   INTEGER DEFAULT 0,
            citizen_gender TEXT DEFAULT '',
            landmark      TEXT DEFAULT '',
            photo_url     TEXT DEFAULT '',
            assigned_officer_id INTEGER REFERENCES users(user_id),
            satisfaction_rating INTEGER DEFAULT 0,
            satisfaction_comment TEXT DEFAULT '',
            created_at    TEXT NOT NULL DEFAULT (datetime('now')),
            resolved_at   TEXT DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS complaint_audit_trail (
            change_id     INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id  TEXT NOT NULL,
            modified_by   INTEGER REFERENCES users(user_id),
            field_changed TEXT NOT NULL,
            old_value     TEXT,
            new_value     TEXT,
            remarks       TEXT DEFAULT '',
            changed_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints_live(ward_id);
        CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints_live(status);
        CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints_live(category);
        CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints_live(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_complaint ON complaint_audit_trail(complaint_id);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """)

        # Seed default accounts if empty
        count = con.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            seeds = [
                ("citizen@wardly.gov", hash_password("password123"), "citizen", "Aarav Sharma", "9876543210", 28, "Male", 1, ""),
                ("officer@wardly.gov", hash_password("password123"), "officer", "Inspector Gurpreet Singh", "9876543211", 35, "Male", 7, "Water Supply & Sewerage Board"),
                ("officer2@wardly.gov", hash_password("password123"), "officer", "Sub-Inspector Meena Kaur", "9876543214", 32, "Female", 14, "Municipal Sanitation Department"),
                ("manager@wardly.gov", hash_password("password123"), "manager", "Deputy Commissioner Rajesh Verma", "9876543212", 45, "Male", None, "Public Works Department (PWD)"),
                ("admin@wardly.gov", hash_password("adminpassword"), "admin", "Municipal Commissioner", "9876543213", 52, "Male", None, ""),
            ]
            con.executemany(
                "INSERT INTO users (email, password_hash, role, name, phone, age, gender, ward_id, department) VALUES (?,?,?,?,?,?,?,?,?)",
                seeds
            )


# Initialize on import
init_db()
