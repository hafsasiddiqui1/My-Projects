import os
from dotenv import load_dotenv
"""
Hospital Management System - Flask Backend
Main application file with all API routes
"""
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from config import config
import database
from auth import (
    hash_password, authenticate_user, generate_token,
    login_required, require_permission, require_role
)
from datetime import datetime
import random

# Load environment variables from .env file
load_dotenv()

# ============================================================================
# APPLICATION FACTORY
# ============================================================================

def create_app(config_name='development'):
    """
    Create and configure Flask application
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
    
    # Initialize database
    database.init_app(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register routes
    register_routes(app)
    
    return app


# ============================================================================
# ERROR HANDLERS
# ============================================================================

def register_error_handlers(app):
    """Register custom error handlers"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Permission denied'}), 403


# ============================================================================
# REGISTER ALL ROUTES
# ============================================================================

def register_routes(app):
    """Register all API routes"""
    
    # ========================================================================
    # AUTHENTICATION ROUTES
    # ========================================================================
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        """
        User login endpoint
        Request: {"username": "admin", "password": "admin123"}
        Response: {"token": "jwt_token", "user": {...}}
        """
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400
        
        user = authenticate_user(data['username'], data['password'])
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = generate_token(user, app.config['JWT_SECRET_KEY'])
        
        # Don't send password hash to client
        user_data = {k: v for k, v in user.items() if k != 'password_hash'}
        
        return jsonify({
            'token': token,
            'user': user_data
        }), 200
    
#signup
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        """
        User registration endpoint for Patient and Doctor roles.
        Admin registration is not allowed via this endpoint.
        Request: {
            "username": "newuser",
            "password": "password123",
            "role": "Patient", // or "Doctor"
            "full_name": "New User",
            "email": "newuser@example.com",
            "phone": "123-456-7890",
            // Doctor specific:
            "specialization": "General Medicine",
            "qualification": "MBBS",
            "consultation_fee": 1000,
            // Patient specific:
            "date_of_birth": "1990-01-01",
            "blood_group": "A+",
            "medical_history": "None"
        }
        """
        data = request.get_json()

        # 1. Validate required fields
        required_fields = ['username', 'password', 'role', 'full_name', 'email']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username']
        password = data['password']
        role = data['role']
        full_name = data['full_name']
        email = data['email']
        phone = data.get('phone', '')

        # 2. Validate role
        if role not in ['Patient', 'Doctor']:
            return jsonify({'error': 'Invalid role. Only "Patient" or "Doctor" allowed for registration.'}), 400
        
        # 3. Check if username or email already exists
        if database.get_user_by_username(username):
            return jsonify({'error': 'Username already exists'}), 409 # 409 Conflict
        
        # Assuming email also needs to be unique if used for login/identification later
        # (Current get_user_by_username doesn't check email, but good practice to prevent duplicate emails)
        # You might need to add a get_user_by_email to database.py
        # For now, we'll proceed with just username check as per existing structure.

        # 4. Hash password
        password_hash = hash_password(password)

        try:
            # 5. Insert user into users table
            user_id = database.execute_db(
                '''INSERT INTO users (username, password_hash, role, full_name, email, phone)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                [username, password_hash, role, full_name, email, phone]
            )

            if user_id:
                # 6. Insert into role-specific table
                if role == 'Doctor':
                    specialization = data.get('specialization', '')
                    qualification = data.get('qualification', '')
                    consultation_fee = data.get('consultation_fee', 0.0)
                    database.execute_db(
                        '''INSERT INTO doctors (user_id, specialization, qualification, consultation_fee)
                           VALUES (?, ?, ?, ?)''',
                        [user_id, specialization, qualification, consultation_fee]
                    )
                elif role == 'Patient':
                    date_of_birth = data.get('date_of_birth')
                    blood_group = data.get('blood_group', '')
                    medical_history = data.get('medical_history', '')
                    database.execute_db(
                        '''INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history)
                           VALUES (?, ?, ?, ?)''',
                        [user_id, date_of_birth, blood_group, medical_history]
                    )
                
                return jsonify({'message': f'{role} registered successfully', 'user_id': user_id}), 201
            else:
                return jsonify({'error': 'Failed to create user'}), 500

        except Exception as e:
            # Rollback in case of error (though sqlite3 usually handles this implicitly per execute_db)
            # A more robust solution might involve explicit transactions
            return jsonify({'error': f'Registration failed: {str(e)}'}), 500
    
    
    @app.route('/api/auth/me', methods=['GET'])
    @login_required
    def get_current_user_info():
        """Get current authenticated user info"""
        user = g.current_user
        user_data = {k: v for k, v in user.items() if k != 'password_hash'}
        return jsonify(user_data), 200
    

    
    # ========================================================================
    # USER MANAGEMENT ROUTES (Admin only)
    # ========================================================================
    
    @app.route('/api/users', methods=['GET'])
    @login_required
    @require_permission('users', 'read')
    def get_users():
        """Get all users"""
        users = database.query_db('SELECT * FROM users')
        # Remove password hashes
        users_safe = [{k: v for k, v in user.items() if k != 'password_hash'} for user in users]
        return jsonify(users_safe), 200
    
    
    @app.route('/api/users', methods=['POST'])
    @login_required
    @require_permission('users', 'create')
    def create_user():
        """
        Create new user
        Request: {
            "username": "newuser",
            "password": "password123",
            "role": "Patient",
            "full_name": "John Doe",
            "email": "john@email.com",
            "phone": "0300-1234567"
        }
        """
        data = request.get_json()
        
        # Validate required fields
        required = ['username', 'password', 'role', 'full_name', 'email']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate role
        if data['role'] not in app.config['ROLES']:
            return jsonify({'error': f'Invalid role. Must be one of: {app.config["ROLES"]}'}), 400
        
        # Check if username exists
        existing = database.get_user_by_username(data['username'])
        if existing:
            return jsonify({'error': 'Username already exists'}), 400
        
        # Hash password
        password_hash = hash_password(data['password'])
        
        # Insert user
        user_id = database.execute_db(
            '''INSERT INTO users (username, password_hash, role, full_name, email, phone)
               VALUES (?, ?, ?, ?, ?, ?)''',
            [data['username'], password_hash, data['role'], data['full_name'], 
             data['email'], data.get('phone', '')]
        )
        
        # If Doctor, create doctor record
        if data['role'] == 'Doctor':
            database.execute_db(
                '''INSERT INTO doctors (user_id, specialization, qualification, consultation_fee)
                   VALUES (?, ?, ?, ?)''',
                [user_id, data.get('specialization', ''), 
                 data.get('qualification', ''), data.get('consultation_fee', 0)]
            )
        
        # If Patient, create patient record
        if data['role'] == 'Patient':
            database.execute_db(
                '''INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history)
                   VALUES (?, ?, ?, ?)''',
                [user_id, data.get('date_of_birth'), 
                 data.get('blood_group', ''), data.get('medical_history', '')]
            )
        
        return jsonify({'message': 'User created', 'user_id': user_id}), 201
    
    
    @app.route('/api/users/<int:user_id>', methods=['PUT'])
    @login_required
    @require_permission('users', 'update')
    def update_user(user_id):
        """Update user information"""
        data = request.get_json()
        
        user = database.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build update query dynamically
        allowed_fields = ['full_name', 'email', 'phone', 'is_active']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
        values = list(updates.values()) + [user_id]
        
        database.execute_db(
            f'UPDATE users SET {set_clause} WHERE user_id = ?',
            values
        )
        
        return jsonify({'message': 'User updated'}), 200
    
    
    @app.route('/api/users/<int:user_id>', methods=['DELETE'])
    @login_required
    @require_permission('users', 'delete')
    def delete_user(user_id):
        """Delete user (soft delete by setting is_active=0)"""
        user = database.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting yourself
        if g.current_user['user_id'] == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        database.execute_db('UPDATE users SET is_active = 0 WHERE user_id = ?', [user_id])
        return jsonify({'message': 'User deleted'}), 200
    
    
    # ========================================================================
    # DOCTOR ROUTES
    # ========================================================================
    
    @app.route('/api/doctors', methods=['GET'])
    @login_required
    def get_doctors():
        """Get all active doctors"""
        doctors = database.get_all_doctors()
        return jsonify(doctors), 200
    
    
    @app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
    @login_required
    def get_doctor(doctor_id):
        """Get specific doctor details"""
        doctor = database.query_db(
            '''SELECT d.*, u.full_name, u.email, u.phone
               FROM doctors d
               JOIN users u ON d.user_id = u.user_id
               WHERE d.doctor_id = ?''',
            [doctor_id],
            one=True
        )
        
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        return jsonify(doctor), 200
    
    
    # ========================================================================
    # SCHEDULE ROUTES
    # ========================================================================
    
    @app.route('/api/schedules', methods=['GET'])
    @login_required
    def get_schedules():
        """
        Get schedules
        Query params: doctor_id (optional)
        """
        doctor_id = request.args.get('doctor_id')
        
        if doctor_id:
            schedules = database.query_db(
                'SELECT * FROM schedules WHERE doctor_id = ? ORDER BY day_of_week',
                [doctor_id]
            )
        else:
            schedules = database.query_db('SELECT * FROM schedules ORDER BY doctor_id, day_of_week')
        
        return jsonify(schedules), 200
    
    
    @app.route('/api/schedules', methods=['POST'])
    @login_required
    @require_permission('schedules', 'create')
    def create_schedule():
        """
        Create doctor schedule
        Request: {
            "doctor_id": 1,
            "day_of_week": "Monday",
            "start_time": "09:00",
            "end_time": "17:00"
        }
        """
        data = request.get_json()
        
        required = ['doctor_id', 'day_of_week', 'start_time', 'end_time']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate day
        if data['day_of_week'] not in app.config['DAYS_OF_WEEK']:
            return jsonify({'error': 'Invalid day of week'}), 400
        
        # Check if doctor owns this schedule (if not admin)
        if g.current_user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(g.current_user['user_id'])
            if not doctor or doctor['doctor_id'] != data['doctor_id']:
                return jsonify({'error': 'Permission denied'}), 403
        
        # Insert schedule
        schedule_id = database.execute_db(
            '''INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time)
               VALUES (?, ?, ?, ?)''',
            [data['doctor_id'], data['day_of_week'], data['start_time'], data['end_time']]
        )
        
        return jsonify({'message': 'Schedule created', 'schedule_id': schedule_id}), 201
    
    
    @app.route('/api/schedules/<int:schedule_id>', methods=['PUT'])
    @login_required
    @require_permission('schedules', 'update')
    def update_schedule(schedule_id):
        """Update schedule"""
        data = request.get_json()
        
        schedule = database.query_db('SELECT * FROM schedules WHERE schedule_id = ?', [schedule_id], one=True)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        # Check ownership
        if g.current_user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(g.current_user['user_id'])
            if not doctor or doctor['doctor_id'] != schedule['doctor_id']:
                return jsonify({'error': 'Permission denied'}), 403
        
        allowed_fields = ['day_of_week', 'start_time', 'end_time', 'is_available']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
        values = list(updates.values()) + [schedule_id]
        
        database.execute_db(f'UPDATE schedules SET {set_clause} WHERE schedule_id = ?', values)
        
        return jsonify({'message': 'Schedule updated'}), 200
    
    
    @app.route('/api/schedules/<int:schedule_id>', methods=['DELETE'])
    @login_required
    @require_permission('schedules', 'delete')
    def delete_schedule(schedule_id):
        """Delete schedule"""
        schedule = database.query_db('SELECT * FROM schedules WHERE schedule_id = ?', [schedule_id], one=True)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        # Check ownership
        if g.current_user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(g.current_user['user_id'])
            if not doctor or doctor['doctor_id'] != schedule['doctor_id']:
                return jsonify({'error': 'Permission denied'}), 403
        
        database.execute_db('DELETE FROM schedules WHERE schedule_id = ?', [schedule_id])
        return jsonify({'message': 'Schedule deleted'}), 200
        
    # ========================================================================
    # APPOINTMENT ROUTES
    # ========================================================================

    @app.route('/api/appointments', methods=['GET'])
    @login_required
    @require_permission('appointments', 'read')
    def get_appointments():
        """
        Get appointments based on user role
        Admin: All appointments
        Doctor: Their appointments only
        Patient: Their appointments only
        """
        user = g.current_user
        
        if user['role'] == 'Admin':
            appointments = database.get_appointments_with_details()
        elif user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(user['user_id'])
            if not doctor:
                return jsonify({'error': 'Doctor profile not found'}), 404
            
            appointments = database.query_db(
                '''SELECT a.*,
                   p_user.full_name as patient_name,
                   d_user.full_name as doctor_name,
                   doc.specialization
                   FROM appointments a
                   JOIN patients p ON a.patient_id = p.patient_id
                   JOIN users p_user ON p.user_id = p_user.user_id
                   JOIN doctors doc ON a.doctor_id = doc.doctor_id
                   JOIN users d_user ON doc.user_id = d_user.user_id
                   WHERE a.doctor_id = ?
                   ORDER BY a.appointment_date DESC, a.appointment_time DESC''',
                [doctor['doctor_id']]
            )
        else:  # Patient
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient:
                return jsonify({'error': 'Patient profile not found'}), 404
            
            appointments = database.query_db(
                '''SELECT a.*,
                   p_user.full_name as patient_name,
                   d_user.full_name as doctor_name,
                   doc.specialization
                   FROM appointments a
                   JOIN patients p ON a.patient_id = p.patient_id
                   JOIN users p_user ON p.user_id = p_user.user_id
                   JOIN doctors doc ON a.doctor_id = doc.doctor_id
                   JOIN users d_user ON doc.user_id = d_user.user_id
                   WHERE a.patient_id = ?
                   ORDER BY a.appointment_date DESC, a.appointment_time DESC''',
                [patient['patient_id']]
            )
        
        return jsonify(appointments), 200


    @app.route('/api/appointments', methods=['POST'])
    @login_required
    @require_permission('appointments', 'create')
    def create_appointment():
        """
        Book new appointment
        Request: {
            "doctor_id": 1,
            "appointment_date": "2025-12-20",
            "appointment_time": "10:00",
            "reason": "Regular checkup"
        }
        """
        data = request.get_json()
        
        required = ['doctor_id', 'appointment_date', 'appointment_time']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get patient_id from current user
        user = g.current_user
        
        if user['role'] == 'Admin':
            # Admin can book for any patient
            if 'patient_id' not in data:
                return jsonify({'error': 'patient_id required for admin'}), 400
            patient_id = data['patient_id']
        else:
            # Patient books for themselves
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient:
                return jsonify({'error': 'Patient profile not found'}), 404
            patient_id = patient['patient_id']
        
        # Check if doctor exists
        doctor = database.query_db('SELECT * FROM doctors WHERE doctor_id = ?', [data['doctor_id']], one=True)
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        
        # Check for appointment conflict
        if database.check_appointment_conflict(data['doctor_id'], data['appointment_date'], data['appointment_time']):
            return jsonify({'error': 'Doctor already has appointment at this time'}), 400
        
        # Verify doctor has schedule for this day
        appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d')
        day_of_week = appointment_date.strftime('%A')
        
        schedule = database.get_doctor_schedule(data['doctor_id'], day_of_week)
        if not schedule:
            return jsonify({'error': f'Doctor not available on {day_of_week}'}), 400
        
        # Create appointment
        appointment_id = database.execute_db(
            '''INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, notes)
               VALUES (?, ?, ?, ?, ?, ?)''',
            [patient_id, data['doctor_id'], data['appointment_date'], data['appointment_time'],
             data.get('reason', ''), data.get('notes', '')]
        )
        
        # Auto-generate billing
        billing_id = database.execute_db(
            '''INSERT INTO billings (appointment_id, patient_id, amount, services_description)
               VALUES (?, ?, ?, ?)''',
            [appointment_id, patient_id, doctor['consultation_fee'],
             f"Consultation - {doctor.get('specialization', 'General')}"]
        )
        
        return jsonify({
            'message': 'Appointment created',
            'appointment_id': appointment_id,
            'billing_id': billing_id
        }), 201


    @app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
    @login_required
    @require_permission('appointments', 'update')
    def update_appointment(appointment_id):
        """Update appointment (change time, status, notes)"""
        data = request.get_json()
        
        appointment = database.query_db('SELECT * FROM appointments WHERE appointment_id = ?', [appointment_id], one=True)
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Check access permissions
        user = g.current_user
        if user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(user['user_id'])
            if not doctor or doctor['doctor_id'] != appointment['doctor_id']:
                return jsonify({'error': 'Permission denied'}), 403
        elif user['role'] == 'Patient':
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient or patient['patient_id'] != appointment['patient_id']:
                return jsonify({'error': 'Permission denied'}), 403
        
        # Allowed fields
        allowed_fields = ['appointment_date', 'appointment_time', 'status', 'notes']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Check for conflicts if date/time changed
        if 'appointment_date' in updates or 'appointment_time' in updates:
            new_date = updates.get('appointment_date', appointment['appointment_date'])
            new_time = updates.get('appointment_time', appointment['appointment_time'])
            
            if database.check_appointment_conflict(appointment['doctor_id'], new_date, new_time, appointment_id):
                return jsonify({'error': 'Doctor already has appointment at this time'}), 400
        
        updates['updated_at'] = database.query_db('SELECT CURRENT_TIMESTAMP')[0]['CURRENT_TIMESTAMP']
        
        set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
        values = list(updates.values()) + [appointment_id]
        
        database.execute_db(f'UPDATE appointments SET {set_clause} WHERE appointment_id = ?', values)
        
        return jsonify({'message': 'Appointment updated'}), 200


    @app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
    @login_required
    @require_permission('appointments', 'delete')
    def delete_appointment(appointment_id):
        """Cancel/delete appointment"""
        appointment = database.query_db('SELECT * FROM appointments WHERE appointment_id = ?', [appointment_id], one=True)
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Check access permissions
        user = g.current_user
        if user['role'] == 'Patient':
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient or patient['patient_id'] != appointment['patient_id']:
                return jsonify({'error': 'Permission denied'}), 403
        
        # Update status to Cancelled instead of deleting
        database.execute_db('UPDATE appointments SET status = ? WHERE appointment_id = ?', ['Cancelled', appointment_id])
        
        # Update billing status
        database.execute_db('UPDATE billings SET payment_status = ? WHERE appointment_id = ?', ['Cancelled', appointment_id])
        
        return jsonify({'message': 'Appointment cancelled'}), 200


    # ========================================================================
    # BILLING ROUTES
    # ========================================================================

    @app.route('/api/billings', methods=['GET'])
    @login_required
    def get_billings():
        """
        Get billings based on user role
        Admin: All billings
        Patient: Their billings only
        """
        user = g.current_user
        
        if user['role'] == 'Admin':
            billings = database.query_db(
                '''SELECT b.*, 
                   p_user.full_name as patient_name,
                   a.appointment_date, a.appointment_time
                   FROM billings b
                   JOIN patients p ON b.patient_id = p.patient_id
                   JOIN users p_user ON p.user_id = p_user.user_id
                   JOIN appointments a ON b.appointment_id = a.appointment_id
                   ORDER BY b.billing_date DESC'''
            )
        else:  # Patient
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient:
                return jsonify({'error': 'Patient profile not found'}), 404
            
            billings = database.query_db(
                '''SELECT b.*, 
                   p_user.full_name as patient_name,
                   a.appointment_date, a.appointment_time
                   FROM billings b
                   JOIN patients p ON b.patient_id = p.patient_id
                   JOIN users p_user ON p.user_id = p_user.user_id
                   JOIN appointments a ON b.appointment_id = a.appointment_id
                   WHERE b.patient_id = ?
                   ORDER BY b.billing_date DESC''',
                [patient['patient_id']]
            )
        
        return jsonify(billings), 200


    @app.route('/api/billings/<int:billing_id>/pay', methods=['POST'])
    @login_required
    def pay_billing(billing_id):
        """
        Mark billing as paid and generate receipt
        Request: {"payment_method": "Cash"}
        """
        data = request.get_json()
        
        billing = database.query_db('SELECT * FROM billings WHERE billing_id = ?', [billing_id], one=True)
        if not billing:
            return jsonify({'error': 'Billing not found'}), 404
        
        # Check if already paid
        if billing['payment_status'] == 'Paid':
            return jsonify({'error': 'Billing already paid'}), 400
        
        # Update billing status
        database.execute_db('UPDATE billings SET payment_status = ? WHERE billing_id = ?', ['Paid', billing_id])
        
        # Generate receipt
        receipt_number = f"RCP-{random.randint(10000, 99999)}"
        
        receipt_id = database.execute_db(
            '''INSERT INTO receipts (billing_id, receipt_number, payment_method)
               VALUES (?, ?, ?)''',
            [billing_id, receipt_number, data.get('payment_method', 'Cash')]
        )
        
        return jsonify({
            'message': 'Payment successful',
            'receipt_id': receipt_id,
            'receipt_number': receipt_number
        }), 200


    @app.route('/api/receipts', methods=['GET'])
    @login_required
    def get_receipts():
        """Get receipts for current patient"""
        user = g.current_user
        
        if user['role'] == 'Admin':
            receipts = database.query_db(
                '''SELECT r.*, b.amount, b.services_description,
                   p_user.full_name as patient_name
                   FROM receipts r
                   JOIN billings b ON r.billing_id = b.billing_id
                   JOIN patients p ON b.patient_id = p.patient_id
                   JOIN users p_user ON p.user_id = p_user.user_id
                   ORDER BY r.payment_date DESC'''
            )
        else:  # Patient
            patient = database.get_patient_by_user_id(user['user_id'])
            if not patient:
                return jsonify({'error': 'Patient profile not found'}), 404
            
            receipts = database.query_db(
                '''SELECT r.*, b.amount, b.services_description
                   FROM receipts r
                   JOIN billings b ON r.billing_id = b.billing_id
                   WHERE b.patient_id = ?
                   ORDER BY r.payment_date DESC''',
                [patient['patient_id']]
            )
        
        return jsonify(receipts), 200


    # ========================================================================
    # PERMISSIONS ROUTES (Admin only)
    # ========================================================================

    @app.route('/api/permissions', methods=['GET'])
    @login_required
    @require_permission('permissions', 'read')
    def get_permissions():
        """Get all permissions"""
        permissions = database.query_db('SELECT * FROM permissions ORDER BY role, resource')
        return jsonify(permissions), 200


    @app.route('/api/permissions/<int:permission_id>', methods=['PUT'])
    @login_required
    @require_permission('permissions', 'update')
    def update_permission(permission_id):
        """
        Update permission (GRANT/REVOKE)
        Request: {"can_create": true, "can_read": true, ...}
        """
        data = request.get_json()
        
        permission = database.query_db('SELECT * FROM permissions WHERE permission_id = ?', [permission_id], one=True)
        if not permission:
            return jsonify({'error': 'Permission not found'}), 404
        
        allowed_fields = ['can_create', 'can_read', 'can_update', 'can_delete']
        updates = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not updates:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Log changes in audit table
        for field, value in updates.items():
            action = 'GRANT' if value else 'REVOKE'
            perm_type = field.replace('can_', '')
            
            database.log_permission_change(
                g.current_user['user_id'],
                action,
                permission['role'],
                permission['resource'],
                perm_type
            )
        
        set_clause = ', '.join([f'{k} = ?' for k in updates.keys()])
        values = list(updates.values()) + [permission_id]
        
        database.execute_db(f'UPDATE permissions SET {set_clause} WHERE permission_id = ?', values)
        
        return jsonify({'message': 'Permission updated'}), 200


    @app.route('/api/permissions/audit', methods=['GET'])
    @login_required
    @require_role('Admin')
    def get_permission_audit():
        """Get audit log of permission changes"""
        audit = database.query_db(
            '''SELECT pa.*, u.username, u.full_name
               FROM permission_audit pa
               JOIN users u ON pa.admin_user_id = u.user_id
               ORDER BY pa.timestamp DESC
               LIMIT 100'''
        )
        return jsonify(audit), 200


    # ========================================================================
    # DASHBOARD/STATS ROUTES
    # ========================================================================

    @app.route('/api/stats', methods=['GET'])
    @login_required
    def get_stats():
        """Get dashboard statistics"""
        user = g.current_user
        
        if user['role'] == 'Admin':
            stats = {
                'total_users': database.query_db('SELECT COUNT(*) as count FROM users WHERE is_active = 1')[0]['count'],
                'total_doctors': database.query_db('SELECT COUNT(*) as count FROM doctors')[0]['count'],
                'total_patients': database.query_db('SELECT COUNT(*) as count FROM patients')[0]['count'],
                'total_appointments': database.query_db('SELECT COUNT(*) as count FROM appointments')[0]['count'],
                'pending_billings': database.query_db("SELECT COUNT(*) as count FROM billings WHERE payment_status = 'Pending'")[0]['count'],
                'total_revenue': database.query_db("SELECT SUM(amount) as total FROM billings WHERE payment_status = 'Paid'")[0]['total'] or 0
            }
        elif user['role'] == 'Doctor':
            doctor = database.get_doctor_by_user_id(user['user_id'])
            stats = {
                'todays_appointments': database.query_db(
                    "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = DATE('now')",
                    [doctor['doctor_id']]
                )[0]['count'],
                'total_appointments': database.query_db(
                    'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?',
                    [doctor['doctor_id']]
                )[0]['count']
            }
        else:  # Patient
            patient = database.get_patient_by_user_id(user['user_id'])
            stats = {
                'upcoming_appointments': database.query_db(
                    "SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND appointment_date >= DATE('now') AND status = 'Scheduled'",
                    [patient['patient_id']]
                )[0]['count'],
                'total_spent': database.query_db(
                    "SELECT SUM(amount) as total FROM billings WHERE patient_id = ? AND payment_status = 'Paid'",
                    [patient['patient_id']]
                )[0]['total'] or 0
            }
        
        return jsonify(stats), 200


    # ========================================================================
    # INITIALIZATION ROUTE (for development)
    # ========================================================================

    @app.route('/api/init-db', methods=['POST'])
    def initialize_database():
        """Initialize database with schema (development only)"""
        if not app.config['DEBUG']:
            return jsonify({'error': 'Only available in debug mode'}), 403
        
        try:
            database.init_db()
            return jsonify({'message': 'Database initialized successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return app

# ========================================================================
# RUN APPLICATION
# ========================================================================

if __name__ == '__main__':
    app = create_app()
    db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace("sqlite:///", "")

    if not os.path.exists(db_path):
        with app.app_context():
            database.init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
