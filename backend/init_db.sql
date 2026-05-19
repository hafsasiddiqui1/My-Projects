-- ============================================================================
-- Hospital Management System - Database Schema
-- SQLite Database Initialization Script
-- ============================================================================

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS permission_audit;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS billings;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- USERS TABLE
-- Stores all user accounts (Admin, Doctor, Patient)
-- ============================================================================
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK(role IN ('Admin', 'Doctor', 'Patient', 'Sub-Admin')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- ============================================================================
-- DOCTORS TABLE
-- Extended information for users with Doctor role
-- ============================================================================
CREATE TABLE doctors (
    doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    specialization VARCHAR(100),
    qualification VARCHAR(200),
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- PATIENTS TABLE
-- Extended information for users with Patient role
-- ============================================================================
CREATE TABLE patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    date_of_birth DATE,
    blood_group VARCHAR(5),
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- SCHEDULES TABLE
-- Doctor availability (days and timings)
-- ============================================================================
CREATE TABLE schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    day_of_week VARCHAR(10) NOT NULL CHECK(day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- ============================================================================
-- APPOINTMENTS TABLE
-- Stores patient-doctor appointments
-- ============================================================================
CREATE TABLE appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
);

-- ============================================================================
-- BILLINGS TABLE
-- Stores billing information for appointments
-- ============================================================================
CREATE TABLE billings (
    billing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    services_description TEXT,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK(payment_status IN ('Pending', 'Paid', 'Cancelled')),
    billing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- ============================================================================
-- RECEIPTS TABLE
-- Stores payment receipts for paid bills
-- ============================================================================
CREATE TABLE receipts (
    receipt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    billing_id INTEGER UNIQUE NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_method VARCHAR(20) CHECK(payment_method IN ('Cash', 'Card', 'Online', 'Insurance')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (billing_id) REFERENCES billings(billing_id) ON DELETE CASCADE
);

-- ============================================================================
-- PERMISSIONS TABLE
-- Application-level RBAC (Role-Based Access Control)
-- Defines CRUD permissions for each role on each resource
-- ============================================================================
CREATE TABLE permissions (
    permission_id INTEGER PRIMARY KEY AUTOINCREMENT,
    role VARCHAR(20) NOT NULL CHECK(role IN ('Admin', 'Doctor', 'Patient', 'Sub-Admin')),
    resource VARCHAR(50) NOT NULL,
    can_create BOOLEAN DEFAULT 0,
    can_read BOOLEAN DEFAULT 0,
    can_update BOOLEAN DEFAULT 0,
    can_delete BOOLEAN DEFAULT 0,
    UNIQUE(role, resource)
);

-- ============================================================================
-- PERMISSION_AUDIT TABLE
-- Logs all GRANT/REVOKE actions performed by admins
-- ============================================================================
CREATE TABLE permission_audit (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL CHECK(action IN ('GRANT', 'REVOKE')),
    role VARCHAR(20) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    permission_type VARCHAR(10) NOT NULL CHECK(permission_type IN ('create', 'read', 'update', 'delete')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
);

-- ============================================================================
-- INDEXES for Performance Optimization
-- ============================================================================
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_billings_patient ON billings(patient_id);
CREATE INDEX idx_billings_status ON billings(payment_status);
CREATE INDEX idx_schedules_doctor ON schedules(doctor_id);
CREATE INDEX idx_permissions_role ON permissions(role);

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert Default Admin User
-- Password: admin123 (hashed with werkzeug)
INSERT INTO users (username, password_hash, role, full_name, email, phone) VALUES
('admin', 'pbkdf2:sha256:600000$l3Rk3sptS6rY93ja$34fd3b67935fb9e90116510bc712a6adba093d0c85ddd225847b1d3d2cf273b8', 'Admin', 'System Administrator', 'admin@hospital.com', '0300-1111111');

-- Insert Sample Doctor
INSERT INTO users (username, password_hash, role, full_name, email, phone) VALUES
('dr.smith', 'scrypt:32768:8:1$wxETduoMyGZ4MELt$bf355419c2f607e7b0d920ca6329ae50db0f9ea01608221b71e73d12b8e86b354bb845a64f05d4fa88fb03d1d87ea566c41cf0a209a5d5d5ec7f95bbfe064a4e', 'Doctor', 'Dr. Sarah Smith', 'sarah.smith@hospital.com', '0300-2222222');

INSERT INTO doctors (user_id, specialization, qualification, consultation_fee) VALUES
(2, 'Cardiology', 'MBBS, MD (Cardiology)', 2500.00);

-- Insert Sample Patient
INSERT INTO users (username, password_hash, role, full_name, email, phone) VALUES
('john.doe', 'pbkdf2:sha256:600000$mRz5rB4V4l1e9Q6B$0027f673e4a2c2e0b5c1f0d3b6a9a0e67b2d2f6d0f6e52c93d9a10c8f5f0a0c2', 'Patient', 'John Doe', 'john.doe@email.com', '0300-3333333');

INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history) VALUES
(3, '1990-05-15', 'O+', 'No major medical issues. Regular checkups recommended.');

-- ============================================================================
-- INSERT DEFAULT PERMISSIONS (RBAC Rules)
-- ============================================================================

-- Admin Permissions (Full Access)
INSERT INTO permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('Admin', 'users', 1, 1, 1, 1),
('Admin', 'appointments', 1, 1, 1, 1),
('Admin', 'schedules', 1, 1, 1, 1),
('Admin', 'billings', 1, 1, 1, 1),
('Admin', 'receipts', 1, 1, 1, 1),
('Admin', 'permissions', 1, 1, 1, 1);

-- Doctor Permissions (Limited Access)
INSERT INTO permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('Doctor', 'appointments', 0, 1, 1, 0),  -- Can read and update their appointments
('Doctor', 'schedules', 1, 1, 1, 1),     -- Full control over their schedules
('Doctor', 'billings', 0, 1, 0, 0),      -- Can only view billings
('Doctor', 'patients', 0, 1, 0, 0);      -- Can read patient records

-- Patient Permissions (Self-Service)
INSERT INTO permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES
('Patient', 'appointments', 1, 1, 1, 1), -- Full control over their appointments
('Patient', 'billings', 0, 1, 0, 0),     -- Can only view their billings
('Patient', 'receipts', 0, 1, 0, 0);     -- Can only view their receipts

-- Sub-Admin Permissions (Initially Restricted)
INSERT INTO permissions (role, resource, can_create, can_read, can_update, can_delete) VALUES

('Sub-Admin', 'users', 1, 1, 1, 1),
('Sub-Admin', 'appointments', 1, 1, 1, 1),
('Sub-Admin', 'schedules', 1, 1, 1, 1),
('Sub-Admin', 'billings', 1, 1, 1, 1),
('Sub-Admin', 'receipts', 1, 1, 1, 1),
('Sub-Admin', 'permissions', 1, 1, 1, 1);    -- Can only read billings

-- Insert Sample Schedule for Dr. Smith
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 'Monday', '09:00', '17:00', 1),
(1, 'Wednesday', '09:00', '17:00', 1),
(1, 'Friday', '09:00', '14:00', 1);

-- ============================================================================
-- SAMPLE APPOINTMENT, BILLING, AND RECEIPT
-- ============================================================================
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
(1, 1, '2025-12-20', '10:00', 'Scheduled', 'Regular cardiac checkup', 'Patient has history of hypertension');

INSERT INTO billings (appointment_id, patient_id, amount, services_description, payment_status) VALUES
(1, 1, 2500.00, 'Consultation - Cardiology with ECG', 'Pending');

INSERT INTO users (full_name, username, password_hash, role, email, phone) VALUES
('Ghufran', 'Ghufran123', 'ghufran123', "Patient",'ghufran123@gmail.com',03001234567);