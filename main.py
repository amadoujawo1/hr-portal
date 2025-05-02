
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/leave_management'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_hr = db.Column(db.Boolean, default=False)
    leaves = db.relationship('Leave', backref='employee', lazy=True)

class Leave(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and user.password == password:  # In production, use proper password hashing
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        is_hr = 'is_hr' in request.form
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
            
        user = User(username=username, password=password, is_hr=is_hr)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful')
        return redirect(url_for('login'))
    return render_template('register.html')

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
        
        leave = Leave(start_date=start_date, end_date=end_date, 
                     reason=reason, user_id=current_user.id)
        db.session.add(leave)
        db.session.commit()
        flash('Leave application submitted successfully!')
        return redirect(url_for('dashboard'))
    return render_template('apply_leave.html')

@app.route('/process-leave/<int:id>/<action>')
@login_required
def process_leave(id, action):
    if not current_user.is_hr:
        flash('Unauthorized access!')
        return redirect(url_for('dashboard'))
    
    leave = Leave.query.get_or_404(id)
    leave.status = action.capitalize()
    db.session.commit()
    flash(f'Leave {action}d successfully!')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
