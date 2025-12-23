"""
Authentication and Authorization Module
Handles login, JWT tokens, password hashing, and permission checking
"""
from functools import wraps
from flask import request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from database import get_user_by_username, get_user_by_id, check_permission

# ============================================================================
# PASSWORD HASHING
# ============================================================================

def hash_password(password):
    """
    Hash password using werkzeug's security module
    Uses PBKDF2 with SHA256
    """
    return generate_password_hash(password, method='pbkdf2:sha256')


def verify_password(password_hash, password):
    """
    Verify password against hash
    """
    return check_password_hash(password_hash, password)


# ============================================================================
# JWT TOKEN GENERATION AND VERIFICATION
# ============================================================================

def generate_token(user, secret_key, expires_delta=None):
    """
    Generate JWT token for authenticated user
    
    Args:
        user: User dict from database
        secret_key: Application secret key
        expires_delta: Token expiration time (default 24 hours)
    
    Returns:
        JWT token string
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=24)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        'user_id': user['user_id'],
        'username': user['username'],
        'role': user['role'],
        'exp': expire,
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token


def decode_token(token, secret_key):
    """
    Decode and verify JWT token
    
    Args:
        token: JWT token string
        secret_key: Application secret key
    
    Returns:
        Decoded payload dict or None if invalid
    """
    try:
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token


# ============================================================================
# AUTHENTICATION DECORATOR
# ============================================================================

def login_required(f):
    """
    Decorator to protect routes that require authentication
    Extracts and verifies JWT token from Authorization header
    Stores user info in Flask's g object
    
    Usage:
        @app.route('/protected')
        @login_required
        def protected_route():
            user = g.current_user
            return jsonify({'message': f'Hello {user["username"]}'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        # Extract token (format: "Bearer <token>")
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        # Decode token
        from flask import current_app
        payload = decode_token(token, current_app.config['JWT_SECRET_KEY'])
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get user from database
        user = get_user_by_id(payload['user_id'])
        
        if not user or not user['is_active']:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        # Store user in Flask's g object (request context)
        g.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function


# ============================================================================
# AUTHORIZATION DECORATOR (RBAC)
# ============================================================================

def require_permission(resource, action):
    """
    Decorator to check if user has permission for action on resource
    Must be used AFTER @login_required decorator
    
    Args:
        resource: Resource name (users, appointments, etc.)
        action: Action type (create, read, update, delete)
    
    Usage:
        @app.route('/api/users', methods=['POST'])
        @login_required
        @require_permission('users', 'create')
        def create_user():
            # Only users with create permission on users resource can access
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get current user from g object (set by @login_required)
            if not hasattr(g, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user = g.current_user
            
            # Check permission in database
            has_permission = check_permission(user['role'], resource, action)
            
            if not has_permission:
                return jsonify({
                    'error': 'Permission denied',
                    'message': f'Role {user["role"]} does not have {action} permission on {resource}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


# ============================================================================
# ROLE CHECKING DECORATOR
# ============================================================================

def require_role(*allowed_roles):
    """
    Decorator to check if user has one of the allowed roles
    Must be used AFTER @login_required decorator
    
    Args:
        *allowed_roles: Variable number of role names
    
    Usage:
        @app.route('/api/admin/dashboard')
        @login_required
        @require_role('Admin')
        def admin_dashboard():
            # Only Admin role can access
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'current_user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user = g.current_user
            
            if user['role'] not in allowed_roles:
                return jsonify({
                    'error': 'Access denied',
                    'message': f'This endpoint requires one of these roles: {", ".join(allowed_roles)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def authenticate_user(username, password):
    """
    Authenticate user with username and password
    
    Args:
        username: Username string
        password: Plain text password
    
    Returns:
        User dict if authenticated, None otherwise
    """
    user = get_user_by_username(username)
    
    if not user:
        return None
    
    if not verify_password(user['password_hash'], password):
        return None
    
    return user


def is_owner(resource_user_id):
    """
    Check if current user owns the resource
    Useful for allowing users to only modify their own data
    
    Args:
        resource_user_id: User ID of resource owner
    
    Returns:
        Boolean: True if current user owns resource
    """
    if not hasattr(g, 'current_user'):
        return False
    
    return g.current_user['user_id'] == resource_user_id


def can_access_resource(user, resource_type, resource_data):
    """
    Check if user can access specific resource based on role
    
    Args:
        user: User dict
        resource_type: Type of resource (appointment, billing, etc.)
        resource_data: The resource data dict
    
    Returns:
        Boolean: True if user can access resource
    """
    # Admin can access everything
    if user['role'] == 'Admin':
        return True
    
    # Doctor can access their own appointments/schedules
    if user['role'] == 'Doctor':
        from database import get_doctor_by_user_id
        doctor = get_doctor_by_user_id(user['user_id'])
        if not doctor:
            return False
        
        if resource_type == 'appointment':
            return resource_data.get('doctor_id') == doctor['doctor_id']
        elif resource_type == 'schedule':
            return resource_data.get('doctor_id') == doctor['doctor_id']
    
    # Patient can access their own appointments/billings
    if user['role'] == 'Patient':
        from database import get_patient_by_user_id
        patient = get_patient_by_user_id(user['user_id'])
        if not patient:
            return False
        
        if resource_type == 'appointment':
            return resource_data.get('patient_id') == patient['patient_id']
        elif resource_type == 'billing':
            return resource_data.get('patient_id') == patient['patient_id']
    
    return False