import os
import random
import requests
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 
import cloudinary
import cloudinary.uploader
import psycopg2
from psycopg2.extras import RealDictCursor

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


# Temporary volatile dictionary tracking OTP storage values
OTP_STORE = {}        





# --- Core Web API Router Endpoints ---

@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
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
        cursor.execute("SELECT 1 FROM admins WHERE username = %s", (username,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Admin ID already assigned."}), 400

        hashed_password = generate_password_hash(data.get('password'))
        cursor.execute('''
            INSERT INTO pending_approvals (username, password, name, college, passYear, stream, subject, email)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
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
            # 🧼 Secure and scrub the filename
            safe_name = secure_filename(file.filename)
            while safe_name.lower().endswith('.pdf'):
                safe_name = safe_name[:-4]
            
            # 👇 THE FIX: Generate a unique ID and append it to the filename
            unique_id = random.randint(10000, 99999)
            safe_name = f"{safe_name}_{unique_id}" if safe_name else f"paper_{unique_id}"

            # Upload using the unique public_id
            upload_result = cloudinary.uploader.upload(
                file, 
                resource_type="image", 
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
            category = request.form.get('category')

            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url, category))
                conn.commit()
            finally:
                conn.close()
            return jsonify({"success": True, "message": "Paper published to cloud permanently!"}), 200
        except Exception as e:
            return jsonify({"success": False, "message": f"Cloud upload failed: {str(e)}"}), 500

    return jsonify({"success": False, "message": "Only PDF documents are permitted."}), 400




# --- Secure API Relay Mail Dispatch Engine ---
def send_real_otp_email(receiver_email, otp_code):
    # PUT YOUR GOOGLE SCRIPT URL RIGHT HERE:
    google_script_url = "https://script.google.com/macros/s/AKfycbzZ_UYC3WrVOh1IWkdjVuunnIWYDV37_cn7vErnUcwin2VPqsyLK02amH87I5RQjhAHkQ/exec"
    
    body_text = f"Hello,\n\nThank you for initiating your Admin registration setup for the ADP ITEP Repository portal.\nVerification Code: {otp_code}\n\nBest regards,\nADP College ITEP Infrastructure System"

    payload = {
        "email": receiver_email,
        "subject": "ADP ITEP Portal - Administrative Registration OTP Verification",
        "body": body_text
    }

    try:
        # This sends a web request (allowed) instead of an SMTP request (blocked)
        response = requests.post(google_script_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            return True
        else:
            print("❌ Google Script refused the payload.")
            return False
            
    except Exception as e:
        print(f"❌ Subsystem API relay failure: {e}")
        return False









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
                resource_type="image", 
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
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
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
        cursor.execute("SELECT * FROM pending_papers WHERE id = %s", (paper_id,))
        row = cursor.fetchone()
        paper = dict(row) if row else None

        if not paper:
            return jsonify({"success": False, "message": "Paper record not found in queue."}), 404

        if action == 'approve':
            # 📌 FIXED: Preserves the paper 'category' field data during approval transitions
            cursor.execute('''
                INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (paper['academicyear'], paper['stream'], paper['dept'], paper['semester'], paper['type'], paper['subject'], paper['code'], paper['fileurl'], paper.get('category', 'Major')))
            
            cursor.execute("DELETE FROM pending_papers WHERE id = %s", (paper_id,))
            conn.commit()
            return jsonify({"success": True, "message": "Paper approved and published publicly!"}), 200

        elif action == 'reject':
            # 📌 FIXED: Added automatic cloud storage asset deletion when drop action triggers
            file_url = paper['fileurl']
            try:
                url_parts = file_url.split('/')
                if 'itep_pending' in url_parts:
                    folder_index = url_parts.index('itep_pending')
                    public_id = '/'.join(url_parts[folder_index:])
                    cloudinary.uploader.destroy(public_id, resource_type="image")
            except Exception as cloud_err:
                print(f"⚠️ Cloud curation cleanup note: {str(cloud_err)}")

            cursor.execute("DELETE FROM pending_papers WHERE id = %s", (paper_id,))
            conn.commit()
            return jsonify({"success": True, "message": "Paper contribution rejected cleanly from cloud system."}), 200
            
    finally:
        conn.close()

    return jsonify({"success": False, "message": "Invalid operations directive parameter."}), 400











# --- 📌 UPGRADED: Permanent Neon/PostgreSQL Connection Engine ---
def get_db_connection():
    # Render's DATABASE_URL is automatically used here
    conn = psycopg2.connect(os.environ.get("DATABASE_URL"), cursor_factory=RealDictCursor)
    return conn












@app.route('/api/get-papers', methods=['GET'])
def get_papers():
    stream = request.args.get('stream')
    dept = request.args.get('dept')
    # 📌 FIXED: Collects category configuration parameter mapping variables from client query
    category = request.args.get('category', 'Major')

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # 📌 FIXED: Separates folders by Major and Minor parameters explicitly inside WHERE filter
        cursor.execute('''
            SELECT id, academicyear, stream, dept, semester, type, subject, code, fileurl 
            FROM papers 
            WHERE stream = %s AND dept = %s  AND category = %s
        ''', (stream, dept, category))
        rows = cursor.fetchall()
        matching_papers = [dict(row) for row in rows]
    finally:
        conn.close()
    return jsonify(matching_papers), 200


@app.route('/api/approve-admin', methods=['POST'])
def approve_admin():
    data = request.get_json()
    username_to_approve = data.get('username', '').strip()
    action = data.get('action') # New parameter to catch Accept/Reject

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pending_approvals WHERE username = %s", (username_to_approve,))
        row = cursor.fetchone()
        user_profile = dict(row) if row else None

        if not user_profile:
            return jsonify({"success": False, "message": "Admin target not found."}), 404

        if action == 'approve':
            cursor.execute('''
                INSERT INTO admins (username, password, name, college, passYear, stream, subject, email)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (user_profile["username"], user_profile["password"], user_profile["name"], user_profile["college"], user_profile["passyear"], user_profile["stream"], user_profile["subject"], user_profile["email"]))
            cursor.execute("DELETE FROM pending_approvals WHERE username = %s", (username_to_approve,))
            conn.commit()
            return jsonify({"success": True, "message": f"Admin '{username_to_approve}' approved!"}), 200
            
        elif action == 'reject':
            # Simply delete them from the pending queue
            cursor.execute("DELETE FROM pending_approvals WHERE username = %s", (username_to_approve,))
            conn.commit()
            return jsonify({"success": True, "message": f"Admin request for '{username_to_approve}' rejected."}), 200

    finally:
        conn.close()
    return jsonify({"success": False, "message": "Invalid operations directive parameter."}), 400











def init_db():
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.cursor()
            # 1. Admins
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
            # 2. Pending Approvals
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
            # 3. Papers (PostgreSQL uses SERIAL for auto-increment)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS papers (
                    id SERIAL PRIMARY KEY,
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
            # 4. Pending Papers
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pending_papers (
                    id SERIAL PRIMARY KEY,
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
            conn.commit()
    finally:
        conn.close()









@app.route('/api/get-pending-admins', methods=['GET'])
def get_pending_admins():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Changed to SELECT * to grab the full profile (Subject, Year, etc.) for the Details button
        cursor.execute("SELECT * FROM pending_approvals")
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
        cursor.execute("SELECT fileUrl FROM papers WHERE id = %s", (paper_id,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "message": "Paper record not found in database."}), 404
            
        file_url = row['fileurl']

        # --- ☁️ Cloudinary Asset Footprint Eraser Subsystem ---
        try:
            url_parts = file_url.split('/')
            # 📌 FIXED: Added fallback condition logic tracking to wipe both types of asset folders cleanly
            if 'itep_papers' in url_parts:
                folder_index = url_parts.index('itep_papers')
                public_id = '/'.join(url_parts[folder_index:])
                public_id = public_id.rsplit('.', 1)[0]
                cloudinary.uploader.destroy(public_id, resource_type="image")
            elif 'itep_pending' in url_parts:
                folder_index = url_parts.index('itep_pending')
                public_id = '/'.join(url_parts[folder_index:])



                public_id = public_id.rsplit('.', 1)[0]
                cloudinary.uploader.destroy(public_id, resource_type="image")
        except Exception as cloud_err:
            print(f"⚠️ Cloud storage deletion note: {str(cloud_err)}")

        cursor.execute("DELETE FROM papers WHERE id = %s", (paper_id,))
        conn.commit()
        
        return jsonify({"success": True, "message": "Paper vanished permanently from website and cloud storage!"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Database transaction error: {str(e)}"}), 500
    finally:
        conn.close()






init_db()
# 📌 THIS REMAINS AT THE ABSOLUTE BOTTOM
if __name__ == '__main__':
    app.run(debug=True, port=5000)
