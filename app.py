import os
import random
import smtplib
import sqlite3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash 

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Upload Engine Configurations ---
app.config['UPLOAD_FOLDER'] = './uploaded_papers'
app.config['MAX_CONTENT_LENGTH'] = 3 * 1024 * 1024  # Strict 3MB file size limit
DB_FILE = "itep_repository.db"  
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Temporary volatile dictionary tracking OTP storage values
OTP_STORE = {}        

# --- SQLite Connection Helper ---
def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row 
    return conn

# --- SQLite Persistent Initialization Engine ---
def init_db():
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            # 1. Create Admins table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS admins (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL,
                    name TEXT,
                    college TEXT,
                    passYear INTEGER,
                    stream TEXT,
                    subject TEXT,
                    email TEXT
                )
            ''')
            
            # 2. Create Pending Registrations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pending_approvals (
                    username TEXT PRIMARY KEY,
                    password TEXT NOT NULL,
                    name TEXT,
                    college TEXT,
                    passYear INTEGER,
                    stream TEXT,
                    subject TEXT,
                    email TEXT
                )
            ''')
            
            # 3. Create Core Live Public Question Paper Document Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS papers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    academicYear TEXT,
                    stream TEXT,
                    dept TEXT,
                    semester INTEGER,
                    type TEXT,
                    subject TEXT,
                    code TEXT,
                    fileUrl TEXT
                )
            ''')

            # 4. NEW: Create Anonymous Pending Contributions holding table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pending_papers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    academicYear TEXT,
                    stream TEXT,
                    dept TEXT,
                    semester INTEGER,
                    type TEXT,
                    subject TEXT,
                    code TEXT,
                    fileUrl TEXT
                )
            ''')
            
            # Seed default admin records securely with structured profiles and hashed passwords
            default_admins = [
                ("jyotiprasad", generate_password_hash("jp2006"), "Jyoti Prasad", "NIT Rourkela", 2029, "bsc-bed", "Physics", "jyotiprasad20062006@gmail.com"),
                ("priyaranjan2007", generate_password_hash("Priyaranjan7"), "Priyaranjan", "ADP College", 2029, "bsc-bed", "Chemistry", "priyaranjanpradhan15@gmail.com")
                
            ]
            for username, password, name, college, year, stream, subject, email in default_admins:
                cursor.execute("SELECT 1 FROM admins WHERE username = ?", (username,))
                if not cursor.fetchone():
                    cursor.execute('''
                        INSERT INTO admins (username, password, name, college, passYear, stream, subject, email) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (username, password, name, college, year, stream, subject, email))
    finally:
        conn.close()

# Invoke database generation rules on startup
init_db()


# --- Secure SMTP Live Mail Dispatch Engine ---
def send_real_otp_email(receiver_email, otp_code):
    smtp_server = "smtp.gmail.com"
    smtp_port = 465  
    sender_email = os.getenv("SMTP_EMAIL")  
    sender_password = os.getenv("SMTP_PASSWORD")          

    if not sender_email or not sender_password:
        print("❌ Missing environment variables in .env file.")
        return False
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = "ADP ITEP Portal - Administrative Registration OTP Verification"

    body = f"""
Hello,

Thank you for initiating your Admin registration setup for the ADP ITEP Repository portal.
Verification Code: {otp_code}

Best regards,
ADP College ITEP Infrastructure System
    """
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"❌ Subsystem failure routing secure data packets to Gmail delivery lines: {e}")
        return False


# --- Core Web API Router Endpoints ---

@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admins WHERE username = ?", (username,))
        row = cursor.fetchone()
        admin = dict(row) if row else None
    finally:
        conn.close()

    if admin and check_password_hash(admin["password"], password):
        return jsonify({"success": True, "message": "Access Granted!"}), 200
    else:
        return jsonify({"success": False, "message": "Incorrect Username or Password. Access Denied."}), 401


@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"success": False, "message": "Email address parameter target missing."}), 400
    otp_code = str(random.randint(100000, 999999))
    OTP_STORE[email] = otp_code
    if send_real_otp_email(email, otp_code):
        return jsonify({"success": True, "message": "OTP validation code sent successfully!"}), 200
    return jsonify({"success": False, "message": "Subsystem Mail Delivery Failure."}), 500


@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    user_otp = data.get('otp')
    if email in OTP_STORE and OTP_STORE[email] == user_otp:
        del OTP_STORE[email] 
        return jsonify({"success": True, "message": "Token matched successfully."}), 200
    return jsonify({"success": False, "message": "Invalid number parameter verification keys."}), 400


@app.route('/api/admin-register', methods=['POST'])
def admin_register():
    data = request.get_json()
    username = data.get('username', '').strip()
    if not username:
        return jsonify({"success": False, "message": "Security verification Admin ID token missing."}), 400
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM admins WHERE username = ?", (username,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Admin ID already assigned."}), 400

        hashed_password = generate_password_hash(data.get('password'))
        cursor.execute('''
            INSERT INTO pending_approvals (username, password, name, college, passYear, stream, subject, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (username, hashed_password, data.get('name'), data.get('college'), data.get('passYear'), data.get('stream'), data.get('subject'), data.get('email')))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"success": True, "message": "Account created. Awaiting peer authorization approval."}), 201


# --- 📌 NEW CONTRIBUTE PAPER ENDPOINT (For Anonymous Users) ---
@app.route('/api/contribute-paper', methods=['POST'])
def contribute_paper():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file payload found."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file chosen."}), 400

    if file and file.filename.endswith('.pdf'):
        academic_year = request.form.get('academicYear')
        stream = request.form.get('stream')
        dept = request.form.get('dept')
        semester = request.form.get('semester')
        paper_type = request.form.get('type')  
        subject_name = request.form.get('subject')
        subject_code = request.form.get('code')

        safe_filename = secure_filename(f"PENDING_{academic_year}_{stream}_{dept}_S{semester}_{subject_code}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], safe_filename))

        file_url = f"/uploaded_papers/{safe_filename}"
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            # Insert directly into pending_papers holding table queue instead of the public one
            cursor.execute('''
                INSERT INTO pending_papers (academicYear, stream, dept, semester, type, subject, code, fileUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url))
            conn.commit()
        finally:
            conn.close()
        return jsonify({"success": True, "message": "Paper submitted to the moderation queue successfully!"}), 200

    return jsonify({"success": False, "message": "Only PDF documents are permitted."}), 400


# --- 📌 NEW GET PENDING PAPERS ENDPOINT (For Admin Panel View) ---
@app.route('/api/get-pending-papers', methods=['GET'])
def get_pending_papers():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pending_papers")
        rows = cursor.fetchall()
        pending_list = [dict(row) for row in rows]
    finally:
        conn.close()
    return jsonify(pending_list), 200


# --- 📌 NEW ADMIN APPROVE/REJECT PAPER ENDPOINT ---
@app.route('/api/approve-paper', methods=['POST'])
def approve_paper():
    data = request.get_json()
    paper_id = data.get('id')
    action = data.get('action') # 'approve' or 'reject'

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Find the targeted file record inside the moderation queue
        cursor.execute("SELECT * FROM pending_papers WHERE id = ?", (paper_id,))
        row = cursor.fetchone()
        paper = dict(row) if row else None

        if not paper:
            return jsonify({"success": False, "message": "Paper record not found in queue."}), 404

        if action == 'approve':
            # 1. Copy row values into the live public table catalog
            cursor.execute('''
                INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (paper['academicYear'], paper['stream'], paper['dept'], paper['semester'], paper['type'], paper['subject'], paper['code'], paper['fileUrl']))
            
            # 2. Delete the record out of the moderation queue
            cursor.execute("DELETE FROM pending_papers WHERE id = ?", (paper_id,))
            conn.commit()
            return jsonify({"success": True, "message": "Paper approved and published publicly!"}), 200

        elif action == 'reject':
            # 1. Delete file tracking record off the database table
            cursor.execute("DELETE FROM pending_papers WHERE id = ?", (paper_id,))
            conn.commit()
            
            # 2. Optional: Erase file footprint cleanly off local drive sectors
            try:
                filename = paper['fileUrl'].split('/')[-1]
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            except Exception:
                pass
                
            return jsonify({"success": True, "message": "Paper contribution rejected and deleted cleanly."}), 200
            
    finally:
        conn.close()

    return jsonify({"success": False, "message": "Invalid operations directive parameter."}), 400


# --- Existing Route: Fetch Public Papers ---
@app.route('/api/get-papers', methods=['GET'])
def get_papers():
    stream = request.args.get('stream')
    dept = request.args.get('dept')
    year = request.args.get('academicYear')

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT academicYear, stream, dept, semester, type, subject, code, fileUrl 
            FROM papers 
            WHERE stream = ? AND dept = ? AND academicYear = ?
        ''', (stream, dept, year))
        rows = cursor.fetchall()
        matching_papers = [dict(row) for row in rows]
    finally:
        conn.close()
    return jsonify(matching_papers), 200


@app.route('/uploaded_papers/<filename>')
def serve_paper(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/approve-admin', methods=['POST'])
def approve_admin():
    data = request.get_json()
    username_to_approve = data.get('username', '').strip()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pending_approvals WHERE username = ?", (username_to_approve,))
        row = cursor.fetchone()
        user_profile = dict(row) if row else None

        if user_profile:
            cursor.execute('''
                INSERT INTO admins (username, password, name, college, passYear, stream, subject, email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user_profile["username"], user_profile["password"], user_profile["name"], user_profile["college"], user_profile["passYear"], user_profile["stream"], user_profile["subject"], user_profile["email"]))
            cursor.execute("DELETE FROM pending_approvals WHERE username = ?", (username_to_approve,))
            conn.commit()
            return jsonify({"success": True, "message": f"Admin '{username_to_approve}' approved!"}), 200
    finally:
        conn.close()
    return jsonify({"success": False, "message": "Admin target not found."}), 404


@app.route('/api/get-pending-admins', methods=['GET'])
def get_pending_admins():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT username, name, college, email FROM pending_approvals")
        rows = cursor.fetchall()
        pending_list = [dict(row) for row in rows]
    finally:
        conn.close()
    return jsonify(pending_list), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)





    # --- ADMIN DIRECT UPLOAD ENDPOINT ---
@app.route('/api/upload-paper', methods=['POST'])
def upload_paper():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file payload found."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file chosen."}), 400

    if file and file.filename.endswith('.pdf'):
        academic_year = request.form.get('academicYear')
        stream = request.form.get('stream')
        dept = request.form.get('dept')
        semester = request.form.get('semester')
        paper_type = request.form.get('type')  
        subject_name = request.form.get('subject')
        subject_code = request.form.get('code')

        safe_filename = secure_filename(f"{academic_year}_{stream}_{dept}_S{semester}_{subject_code}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], safe_filename))

        # Relative path for cross-device compatibility
        file_url = f"/uploaded_papers/{safe_filename}"

        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url))
            conn.commit()
        finally:
            conn.close()
        return jsonify({"success": True, "message": "Paper published to live system successfully!"}), 200

    return jsonify({"success": False, "message": "Only PDF documents are permitted."}), 400