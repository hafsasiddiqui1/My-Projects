# database.py
import sqlite3
from contextlib import closing
from config import config

DB_PATH = config['development'].SQLALCHEMY_DATABASE_URI.replace("sqlite:///", "")

# ========================
# DB CONNECTION
# ========================
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def query_db(query, args=(), one=False):
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        rv = cur.fetchall()
        return (dict(rv[0]) if rv and one else [dict(r) for r in rv]) if rv else ([] if not one else None)

def execute_db(query, args=()):
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        conn.commit()
        return cur.lastrowid

# ========================
# INIT DB
# ========================
def init_db():
    """Initialize DB from schema.sql"""
    # Open the SQL file that contains the database schema (tables, indexes, etc.)
    with open('init_db.sql', 'r') as f:
        sql = f.read()  # Read the entire SQL script into a string

    # Establish a connection to the database using a helper function `get_connection()`
    # `closing` ensures that the connection is properly closed after the block
    with closing(get_connection()) as conn:
        # Execute the entire SQL script (create tables, insert initial data, etc.)
        conn.executescript(sql)


def init_app(app):
    """Optional Flask integration"""
    # Attach the database path or connection info to the Flask app object
    # This allows other parts of the app to access the database via `app.db`
    app.db = DB_PATH


# ========================
# USERS
# ========================
def get_user_by_username(username):
    return query_db('SELECT * FROM users WHERE username = ?', [username], one=True)

def get_user_by_id(user_id):
    return query_db('SELECT * FROM users WHERE user_id = ?', [user_id], one=True)

# ========================
# DOCTORS
# ========================
def get_doctor_by_user_id(user_id):
    return query_db('SELECT * FROM doctors WHERE user_id = ?', [user_id], one=True)

def get_all_doctors():
    return query_db(
        '''SELECT d.*, u.full_name, u.email, u.phone
           FROM doctors d
           JOIN users u ON d.user_id = u.user_id'''
    )

def get_doctor_schedule(doctor_id, day_of_week):
    return query_db('SELECT * FROM schedules WHERE doctor_id = ? AND day_of_week = ?', [doctor_id, day_of_week], one=True)

# ========================
# PATIENTS
# ========================
def get_patient_by_user_id(user_id):
    return query_db('SELECT * FROM patients WHERE user_id = ?', [user_id], one=True)

# ========================
# APPOINTMENTS
# ========================
def get_appointments_with_details():
    return query_db(
        '''SELECT a.*, 
                  p_user.full_name as patient_name,
                  d_user.full_name as doctor_name,
                  doc.specialization
           FROM appointments a
           JOIN patients p ON a.patient_id = p.patient_id
           JOIN users p_user ON p.user_id = p_user.user_id
           JOIN doctors doc ON a.doctor_id = doc.doctor_id
           JOIN users d_user ON doc.user_id = d_user.user_id
           ORDER BY a.appointment_date DESC, a.appointment_time DESC'''
    )

def check_appointment_conflict(doctor_id, date, time, appointment_id=None):
    query = 'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?'
    args = [doctor_id, date, time]
    appointments = query_db(query, args)
    if not appointments:
        return False
    if appointment_id:
        return any(a['appointment_id'] != appointment_id for a in appointments)
    return True

# ========================
# PERMISSIONS / RBAC
# ========================
def check_permission(role, resource, action):
    """Check if a role has permission for a specific action on a resource."""
    column_name = f"can_{action}"
    
    # Ensure the column_name is a valid one to prevent SQL injection
    if column_name not in ['can_create', 'can_read', 'can_update', 'can_delete']:
        return False
        
    permission = query_db(
        f'SELECT {column_name} FROM permissions WHERE role = ? AND resource = ?',
        [role, resource],
        one=True
    )
    
    if not permission:
        return False
        
    return bool(permission[column_name])

def log_permission_change(admin_user_id, action, role, resource, permission_type):
    execute_db(
        '''INSERT INTO permission_audit (admin_user_id, action, role, resource, permission_type)
           VALUES (?, ?, ?, ?, ?)''',
        [admin_user_id, action, role, resource, permission_type]
    )

