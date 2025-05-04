import os
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
from flask import flash, redirect, url_for
from flask_login import current_user, login_required

def requires_admin(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.get_is_admin():
            flash('You do not have permission to access this page.', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function


UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_document(file, user_id):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        new_filename = f'{user_id}_{timestamp}_{filename}'
        
        # Create upload directory if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
        file.save(file_path)
        return new_filename
    return None

def get_file_path(filename):
    return os.path.join(UPLOAD_FOLDER, filename)

def delete_document(filename):
    file_path = get_file_path(filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False