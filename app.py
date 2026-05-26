import os
import random
import smtplib
import sqlite3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 
import cloudinary
import cloudinary.uploader

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Configure Permanent Cloudinary Storage Subsystem ---
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

# --- Engine Database Configuration ---
DB_FILE = "itep_repository.db"  

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
            # 📌 FIXED: Added 'category' tracking field constraint column
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
                    fileUrl TEXT,
                    category TEXT
                )
            ''')

            # 4. Create Anonymous Pending Contributions holding table
            # 📌 FIXED: Added 'category' tracking field constraint column
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
                    fileUrl TEXT,
                    category TEXT
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

    body = f"Hello,\n\nThank you for initiating your Admin registration setup for the ADP ITEP Repository portal.\nVerification Code: {otp_code}\n\nBest regards,\nADP College ITEP Infrastructure System"
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


# --- 📌 ADMIN DIRECT PERMANENT CLOUD UPLOAD ---
@app.route('/api/upload-paper', methods=['POST'])
def upload_paper():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file payload found."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file chosen."}), 400

    if file and file.filename.endswith('.pdf'):
        try:


            # 🧼 Secure and scrub any recursive case-insensitive trailing '.pdf' layers
            safe_name = secure_filename(file.filename)
            while safe_name.lower().endswith('.pdf'):
                safe_name = safe_name[:-4]
                
            if not safe_name:
                safe_name = f"paper_{random.randint(1000, 9999)}"

            # Upload using the clean prefix string
            # 📌 FIXED: Preserves the native file name and .pdf format structures
            upload_result = cloudinary.uploader.upload(
                file, 
                resource_type="raw", 
                folder="itep_papers",
                public_id=safe_name
            )
            file_url = upload_result.get("secure_url")

            academic_year = request.form.get('academicYear')
            stream = request.form.get('stream')
            dept = request.form.get('dept')
            semester = request.form.get('semester')
            paper_type = request.form.get('type')  
            subject_name = request.form.get('subject')
            subject_code = request.form.get('code')
            # 📌 FIXED: Added category extractor parameter variable mapping target
            category = request.form.get('category')

            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                # 📌 FIXED: Integrated structural category values to database write command
                cursor.execute('''
                    INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url, category))
                conn.commit()
            finally:
                conn.close()
            return jsonify({"success": True, "message": "Paper published to cloud permanently!"}), 200
        except Exception as e:
            return jsonify({"success": False, "message": f"Cloud upload failed: {str(e)}"}), 500

    return jsonify({"success": False, "message": "Only PDF documents are permitted."}), 400


# --- 📌 ANONYMOUS PERMANENT CLOUD CONTRIBUTION ---
@app.route('/api/contribute-paper', methods=['POST'])
def contribute_paper():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file payload found."}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No file chosen."}), 400

    if file and file.filename.endswith('.pdf'):
        try:

            # 🧼 Secure and scrub any recursive case-insensitive trailing '.pdf' layers
            safe_name = secure_filename(file.filename)
            while safe_name.lower().endswith('.pdf'):
                safe_name = safe_name[:-4]
                
            if not safe_name:
                safe_name = f"contrib_{random.randint(1000, 9999)}"
            # 📌 FIXED: Preserves the native file name and .pdf format structures
            upload_result = cloudinary.uploader.upload(
                file, 
                resource_type="raw", 
                folder="itep_pending",
                public_id=safe_name
            )
            file_url = upload_result.get("secure_url")

            academic_year = request.form.get('academicYear')
            stream = request.form.get('stream')
            dept = request.form.get('dept')
            semester = request.form.get('semester')
            paper_type = request.form.get('type')  
            subject_name = request.form.get('subject')
            subject_code = request.form.get('code')
            # 📌 FIXED: Added category extractor parameter variable mapping target
            category = request.form.get('category')

            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                # 📌 FIXED: Integrated structural category values to database write command
                cursor.execute('''
                    INSERT INTO pending_papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url, category))
                conn.commit()
            finally:
                conn.close()
            return jsonify({"success": True, "message": "Paper submitted to permanent moderation queue!"}), 200
        except Exception as e:
            return jsonify({"success": False, "message": f"Cloud storage exception: {str(e)}"}), 500

    return jsonify({"success": False, "message": "Only PDF documents are permitted."}), 400


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


@app.route('/api/approve-paper', methods=['POST'])
def approve_paper():
    data = request.get_json()
    paper_id = data.get('id')
    action = data.get('action') 

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pending_papers WHERE id = ?", (paper_id,))
        row = cursor.fetchone()
        paper = dict(row) if row else None

        if not paper:
            return jsonify({"success": False, "message": "Paper record not found in queue."}), 404

        if action == 'approve':
            # 📌 FIXED: Preserves the paper 'category' field data during approval transitions
            cursor.execute('''
                INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (paper['academicYear'], paper['stream'], paper['dept'], paper['semester'], paper['type'], paper['subject'], paper['code'], paper['fileUrl'], paper.get('category', 'Major')))
            
            cursor.execute("DELETE FROM pending_papers WHERE id = ?", (paper_id,))
            conn.commit()
            return jsonify({"success": True, "message": "Paper approved and published publicly!"}), 200

        elif action == 'reject':
            # 📌 FIXED: Added automatic cloud storage asset deletion when drop action triggers
            file_url = paper['fileUrl']
            try:
                url_parts = file_url.split('/')
                if 'itep_pending' in url_parts:
                    folder_index = url_parts.index('itep_pending')
                    public_id = '/'.join(url_parts[folder_index:])
                    cloudinary.uploader.destroy(public_id, resource_type="raw")
            except Exception as cloud_err:
                print(f"⚠️ Cloud curation cleanup note: {str(cloud_err)}")

            cursor.execute("DELETE FROM pending_papers WHERE id = ?", (paper_id,))
            conn.commit()
            return jsonify({"success": True, "message": "Paper contribution rejected cleanly from cloud system."}), 200
            
    finally:
        conn.close()

    return jsonify({"success": False, "message": "Invalid operations directive parameter."}), 400


@app.route('/api/get-papers', methods=['GET'])
def get_papers():
    stream = request.args.get('stream')
    dept = request.args.get('dept')
    year = request.args.get('academicYear')
    # 📌 FIXED: Collects category configuration parameter mapping variables from client query
    category = request.args.get('category', 'Major')

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # 📌 FIXED: Separates folders by Major and Minor parameters explicitly inside WHERE filter
        cursor.execute('''
            SELECT id, academicYear, stream, dept, semester, type, subject, code, fileUrl 
            FROM papers 
            WHERE stream = ? AND dept = ? AND academicYear = ? AND category = ?
        ''', (stream, dept, year, category))
        rows = cursor.fetchall()
        matching_papers = [dict(row) for row in rows]
    finally:
        conn.close()
    return jsonify(matching_papers), 200


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


# --- 📌 ADMIN TARGETED DELETION ENDPOINT ---
@app.route('/api/delete-paper', methods=['POST'])
def delete_paper():
    data = request.get_json()
    paper_id = data.get('id')  
    
    if not paper_id:
        return jsonify({"success": False, "message": "Missing targeted entry identifier."}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT fileUrl FROM papers WHERE id = ?", (paper_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "message": "Paper record not found in database."}), 404
            
        file_url = row['fileUrl']

        # --- ☁️ Cloudinary Asset Footprint Eraser Subsystem ---
        try:
            url_parts = file_url.split('/')
            # 📌 FIXED: Added fallback condition logic tracking to wipe both types of asset folders cleanly
            if 'itep_papers' in url_parts:
                folder_index = url_parts.index('itep_papers')
                public_id = '/'.join(url_parts[folder_index:])
                cloudinary.uploader.destroy(public_id, resource_type="raw")
            elif 'itep_pending' in url_parts:
                folder_index = url_parts.index('itep_pending')
                public_id = '/'.join(url_parts[folder_index:])
                cloudinary.uploader.destroy(public_id, resource_type="raw")
        except Exception as cloud_err:
            print(f"⚠️ Cloud storage deletion note: {str(cloud_err)}")

        cursor.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
        conn.commit()
        
        return jsonify({"success": True, "message": "Paper vanished permanently from website and cloud storage!"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Database transaction error: {str(e)}"}), 500
    finally:
        conn.close()


# 📌 THIS REMAINS AT THE ABSOLUTE BOTTOM
if __name__ == '__main__':
    app.run(debug=True, port=5000)
