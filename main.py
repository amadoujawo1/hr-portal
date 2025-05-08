
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from datetime import datetime
from functools import wraps
from flask_socketio import SocketIO, emit
from flask_migrate import Migrate
from database import db
from models import User, Leave, Document, Notification
from utils import save_document, delete_document, allowed_file, UPLOAD_FOLDER, requires_admin
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://jawo:abc_123@localhost/hrportal'
app.config['SQLALCHEMY_POOL_RECYCLE'] = 280
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 20
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_SIZE'] = 10
app.config['SQLALCHEMY_MAX_OVERFLOW'] = 5
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

socketio = SocketIO(app)

db.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Initialize database and create admin user if needed
def init_database():
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        
        # Initialize migrations
        migrate.init_app(app, db)
        
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', employee_id='ADMIN001', password='Admin@123', is_admin=True, is_hr=True, department='IT Department')
            db.session.add(admin)
            db.session.commit()

# Initialize database
init_database()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        department = request.form['department']
        employee_id = request.form['employee_id']
        is_hr = request.form.get('is_hr') == 'true'
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return redirect(url_for('register'))
            
        if User.query.filter_by(employee_id=employee_id).first():
            flash('Employee ID already exists', 'error')
            return redirect(url_for('register'))
        
        user = User(username=username, password=password, department=department, employee_id=employee_id, is_hr=is_hr)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and user.password == password:  # In production, use proper password hashing
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/admin/add-user', methods=['POST'])
@login_required
@requires_admin
def add_user():
    username = request.form['username']
    password = request.form['password']
    department = request.form['department']
    is_hr = 'is_hr' in request.form
    
    if User.query.filter_by(username=username).first():
        flash('Username already exists', 'error')
        return redirect(url_for('admin'))
    
    # Generate employee ID based on department and current timestamp
    dept_prefix = ''.join(word[0].upper() for word in department.split())
    timestamp = datetime.now().strftime('%y%m%d%H%M')
    employee_id = f"{dept_prefix}{timestamp}"
    
    # Ensure employee_id is unique
    while User.query.filter_by(employee_id=employee_id).first():
        timestamp = str(int(timestamp) + 1)
        employee_id = f"{dept_prefix}{timestamp}"
    
    user = User(username=username, password=password, department=department, employee_id=employee_id, is_hr=is_hr)
    db.session.add(user)
    db.session.commit()
    flash(f'User added successfully with Employee ID: {employee_id}', 'success')
    return redirect(url_for('admin'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/profile')
@login_required
def profile():
    leave_count = Leave.query.filter_by(
        user_id=current_user.id,
        status='Approved'
    ).count()
    return render_template('profile.html', leave_count=leave_count)

def requires_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.get_is_admin():
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin')
@login_required
@requires_admin
def admin():
    users = User.query.all()
    leaves = Leave.query.all()
    return render_template('admin.html', users=users, leaves=leaves)

@app.route('/admin/toggle-role/<int:user_id>', methods=['POST'])
@login_required
@requires_admin
def toggle_user_role(user_id):
    user = User.query.get_or_404(user_id)
    if user == current_user:
        flash('Cannot modify your own role', 'error')
    else:
        user.is_hr = not user.is_hr
        db.session.commit()
        flash('User role updated successfully', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/toggle-status/<int:user_id>', methods=['POST'])
@login_required
@requires_admin
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    if user == current_user:
        flash('Cannot modify your own status', 'error')
    else:
        user.is_active = not user.is_active
        db.session.commit()
        flash('User status updated successfully', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/reset-password/<int:user_id>', methods=['POST'])
@login_required
@requires_admin
def reset_password(user_id):
    user = User.query.get_or_404(user_id)
    if user == current_user:
        flash('Cannot reset your own password', 'error')
    else:
        user.password = 'password123'  # In production, use a secure password generator and proper hashing
        db.session.commit()
        flash('Password has been reset to: password123', 'success')
    return redirect(url_for('admin'))

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
@login_required
@requires_admin
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user == current_user:
        flash('Cannot delete your own account', 'error')
    else:
        # Delete associated leaves first to maintain referential integrity
        Leave.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        flash('User deleted successfully', 'success')
    return redirect(url_for('admin'))

@app.route('/')
@login_required
def dashboard():
    if current_user.is_hr:
        leaves = Leave.query.all()
    else:
        leaves = Leave.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', leaves=leaves)

@app.route('/apply-leave', methods=['GET', 'POST'])
@login_required
def apply_leave():
    if request.method == 'POST':
        start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d')
        reason = request.form['reason']
        
        employee_name = request.form['employee_name']
        employee_id = request.form['employee_id']
        leave = Leave(start_date=start_date, end_date=end_date, 
                     reason=reason, user_id=current_user.id,
                     employee_id=employee_id,
                     employee_name=employee_name)
        db.session.add(leave)
        db.session.commit()
        flash('Leave application submitted successfully!', 'success')
        return redirect(url_for('dashboard'))
    return render_template('apply_leave.html')

@app.route('/process-leave/<int:id>/<action>')
@login_required
def process_leave(id, action):
    if not current_user.is_hr:
        flash('Unauthorized access!', 'error')
        return redirect(url_for('dashboard'))
    
    leave = Leave.query.get_or_404(id)
    leave.status = action.capitalize()
    db.session.commit()
    
    # Create notification for the leave applicant
    message = f'Your leave request has been {action}d'
    notification = Notification.create_notification(
        user_id=leave.user_id,
        message=message,
        type='success' if action == 'approve' else 'error'
    )
    
    # Emit real-time notification
    socketio.emit('notification', {
        'type': 'leave_update',
        'leaveId': leave.id,
        'status': leave.status,
        'message': message
    }, room=str(leave.user_id))
    
    flash(f'Leave {action}d successfully!', 'success')
    return redirect(url_for('dashboard'))

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        socketio.emit('notification', {
            'type': 'connection',
            'message': 'Connected to real-time notifications'
        }, room=str(current_user.id))

# API endpoints for notifications and documents
@app.route('/api/notifications/unread-count')
@login_required
def get_unread_notifications_count():
    count = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).count()
    return jsonify({'count': count})

@app.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    if notification.user_id == current_user.id:
        notification.mark_as_read()
        return jsonify({'success': True})
    return jsonify({'success': False}), 403

@app.route('/api/leaves/upload-document', methods=['POST'])
@login_required
def upload_leave_document():
    if 'document' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'})
    
    file = request.files['document']
    leave_id = request.form.get('leave_id')
    
    if not leave_id:
        return jsonify({'success': False, 'message': 'Leave ID required'})
    
    leave = Leave.query.get_or_404(leave_id)
    if leave.user_id != current_user.id and not current_user.is_hr:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    filename = save_document(file, current_user.id)
    if filename:
        document = Document(filename=filename, leave_id=leave_id)
        db.session.add(document)
        db.session.commit()
        return jsonify({'success': True, 'document': {
            'id': document.id,
            'filename': filename,
            'url': url_for('get_document', filename=filename)
        }})
    
    return jsonify({'success': False, 'message': 'Invalid file type'})

@app.route('/uploads/<filename>')
@login_required
def get_document(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_leave_document(document_id):
    document = Document.query.get_or_404(document_id)
    leave = Leave.query.get(document.leave_id)
    
    if leave.user_id != current_user.id and not current_user.is_hr:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    if delete_document(document.filename):
        db.session.delete(document)
        db.session.commit()
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Failed to delete document'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
