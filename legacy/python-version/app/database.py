import os
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path


ROOT_DIRECTORY = Path(__file__).resolve().parents[1]
DATA_DIRECTORY = ROOT_DIRECTORY / "data"

database_file_env = os.getenv("DATABASE_FILE", "").strip()
database_file = (
    str(Path(database_file_env).expanduser().resolve())
    if database_file_env
    else str((DATA_DIRECTORY / "appointments.db").resolve())
)
database_directory = Path(database_file).parent

DATA_DIRECTORY.mkdir(parents=True, exist_ok=True)
database_directory.mkdir(parents=True, exist_ok=True)

_connection = sqlite3.connect(database_file, check_same_thread=False)
_connection.row_factory = sqlite3.Row
_lock = threading.Lock()


def _initialize_database():
    with _lock:
        _connection.executescript(
            """
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                service TEXT NOT NULL,
                preferred_date TEXT,
                preferred_time TEXT,
                cep TEXT,
                street TEXT,
                neighborhood TEXT,
                city_state TEXT,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'site_form',
                status TEXT NOT NULL DEFAULT 'novo',
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_appointments_created_at
            ON appointments (created_at DESC);
            """
        )
        _connection.commit()


def _iso_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def save_appointment(appointment):
    created_at = _iso_now()

    with _lock:
        cursor = _connection.execute(
            """
            INSERT INTO appointments (
                client_name,
                email,
                phone,
                service,
                preferred_date,
                preferred_time,
                cep,
                street,
                neighborhood,
                city_state,
                subject,
                message,
                source,
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                appointment["nome"],
                appointment["email"],
                appointment["telefone"],
                appointment["servico"],
                appointment["dataPreferencial"],
                appointment["horarioPreferencial"],
                appointment["cep"],
                appointment["logradouro"],
                appointment["bairro"],
                appointment["localidade"],
                appointment["assunto"],
                appointment["mensagem"],
                appointment["origemAgendamento"],
                "novo",
                created_at,
            ),
        )
        _connection.commit()

    return {
        "id": int(cursor.lastrowid),
        **appointment,
        "status": "novo",
        "criadoEm": created_at,
    }


def list_appointments(limit=25):
    try:
        safe_limit = int(limit or 25)
    except (TypeError, ValueError):
        safe_limit = 25

    safe_limit = max(1, min(safe_limit, 100))

    with _lock:
        rows = _connection.execute(
            """
            SELECT
                id,
                client_name AS nome,
                email,
                phone AS telefone,
                service AS servico,
                preferred_date AS dataPreferencial,
                preferred_time AS horarioPreferencial,
                cep,
                street AS logradouro,
                neighborhood AS bairro,
                city_state AS localidade,
                subject AS assunto,
                message AS mensagem,
                source AS origemAgendamento,
                status,
                created_at AS criadoEm
            FROM appointments
            ORDER BY created_at DESC, id DESC
            LIMIT ?
            """,
            (safe_limit,),
        ).fetchall()

    return [dict(row) | {"id": int(row["id"])} for row in rows]


def get_appointment_by_id(appointment_id):
    try:
        safe_id = int(appointment_id)
    except (TypeError, ValueError):
        return None

    with _lock:
        row = _connection.execute(
            """
            SELECT
                id,
                client_name AS nome,
                email,
                phone AS telefone,
                service AS servico,
                preferred_date AS dataPreferencial,
                preferred_time AS horarioPreferencial,
                cep,
                street AS logradouro,
                neighborhood AS bairro,
                city_state AS localidade,
                subject AS assunto,
                message AS mensagem,
                source AS origemAgendamento,
                status,
                created_at AS criadoEm
            FROM appointments
            WHERE id = ?
            LIMIT 1
            """,
            (safe_id,),
        ).fetchone()

    if not row:
        return None

    return dict(row) | {"id": int(row["id"])}


_initialize_database()
