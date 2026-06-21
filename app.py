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
            uploaded_by_admin = request.form.get('adminUsername', 'Admin')
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
               # 🛠️ FIXED: Columns and parameters matched to your table initialization rules
                cursor.execute('''
                    INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category, published_by, approved_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (academic_year, stream, dept, semester, paper_type, subject_name, subject_code, file_url, category, uploaded_by_admin, 'Direct Upload'))            
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

            reviewer_admin = data.get('adminUsername', 'System Peer')
            # 🛠️ FIXED: Captures anonymous origin details alongside the active approving admin ID
            cursor.execute('''
                INSERT INTO papers (academicYear, stream, dept, semester, type, subject, code, fileUrl, category, published_by, approved_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (paper['academicyear'], paper['stream'], paper['dept'], paper['semester'], paper['type'], paper['subject'], paper['code'], paper['fileurl'], paper.get('category', 'Major'), 'Anonymous Contributor', reviewer_admin))
           


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
            email_body = (
                f"Dear {user_profile['name']},\n\n"
                f"We are glad to share that your pending admin approval request has been approved by the admin panel!\n"
                f"You can now log in as an administrator using your provided username ('{user_profile['username']}') and password.\n\n"
                f"Welcome aboard!\nBest regards,\nADP College ITEP System Infrastructure Panel"
            )
            dispatch_html_notification_email(user_profile['email'], "✨ ADP ITEP Portal - Administrative Credentials Verified!", email_body)
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
            
            # 1. Verified Institutional Administrators Table
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
            # 🛠️ Add this inside init_db() to construct your collection table on server launch:
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS system_feedbacks (
                    id SERIAL PRIMARY KEY,
                    message TEXT NOT NULL
                )
            ''')
            
            # 2. Pending Admin Registration Approvals Queue
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
            
            # 3. Main Published Papers Archive Table (With Audit Tracking Fields)
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
                    category TEXT,
                    published_by TEXT DEFAULT 'Admin',
                    approved_by TEXT DEFAULT 'System Core'
                )
            ''')
            
            # Dynamic migration helper to patch existing old tables without data loss
            try:
                cursor.execute("ALTER TABLE papers ADD COLUMN IF NOT EXISTS published_by TEXT DEFAULT 'Admin';")
                cursor.execute("ALTER TABLE papers ADD COLUMN IF NOT EXISTS approved_by TEXT DEFAULT 'System Core';")
            except Exception:
                pass

            # 4. Anonymous/User Question Paper Contributions Queue
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

# ============================================================================
# 🆕 BACKEND ENGINE EXTENSIONS: MANAGERS, FEEDBACK, & ADMINISTRATIVE SECURITY
# ============================================================================
from werkzeug.security import generate_password_hash, check_password_hash

# ⚙️ Helper: Universal Mail Distribution Engine wrapping your Google Apps Script
def dispatch_html_notification_email(target_email, subject_title, dynamic_body_content):
    google_script_url = "https://script.google.com/macros/s/AKfycbzZ_UYC3WrVOh1IWkdjVuunnIWYDV37_cn7vErnUcwin2VPqsyLK02amH87I5RQjhAHkQ/exec"
    payload = {
        "email": target_email,
        "subject": subject_title,
        "body": dynamic_body_content
    }
    try:
        response = requests.post(google_script_url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"⚠️ Email dispatch exception layer caught: {e}")
        return False


# --- 🔐 SECTION: SECURITY UPGRADES & PASSWORD MANAGEMENT CONTROLLERS ---

@app.route('/api/admin-request-password-otp', methods=['POST'])
def admin_request_password_otp():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT email FROM admins WHERE username = %s", (username,))
        row = cursor.fetchone()
    finally:
        conn.close()
        
    if not row:
        return jsonify({"success": False, "message": "Administrative profile lookups failed empty."}), 404
        
    email = row['email']
    otp_code = str(random.randint(100000, 999999))
    OTP_STORE[f"PWD_CHG_{username}"] = otp_code
    
    mail_template = (
        f"Security Alert Notice:\n\n"
        f"A password modification request was triggered for account identifier: '{username}'.\n"
        f"Your verification authorization code is: {otp_code}\n\n"
        f"If you did not initiate this request, log into your admin console to check your security log history."
    )
    
    if dispatch_html_notification_email(email, "🔒 ADP ITEP Portal - Password Update Verification Token", mail_template):
        return jsonify({"success": True, "message": "OTP successfully routed onto verified mailbox array."}), 200
    return jsonify({"success": False, "message": "Communications mail delivery server error."}), 500


@app.route('/api/admin-commit-password-change', methods=['POST'])
def admin_commit_password_change():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    old_pwd = data.get('old_password')
    new_pwd = data.get('new_password')
    user_otp = data.get('otp', '').strip()

    otp_key = f"PWD_CHG_{username}"
    if otp_key not in OTP_STORE or OTP_STORE[otp_key] != user_otp:
        return jsonify({"success": False, "message": "Security Verification Failed: Code token invalid or expired."}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT password, email FROM admins WHERE username = %s", (username,))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({"success": False, "message": "Context Mismatch: Admin profile index failed empty."}), 404
            
        if not check_password_hash(row['password'], old_pwd):
            return jsonify({"success": False, "message": "Authentication Denied: Existing password validation failed."}), 401

        hashed_new_pwd = generate_password_hash(new_pwd)
        cursor.execute("UPDATE admins SET password = %s WHERE username = %s", (hashed_new_pwd, username))
        conn.commit()
        
        # Clear transactional verification cache space safely
        del OTP_STORE[otp_key]
        
        success_body = f"Success Notification:\n\nYour account profile password for identifier '{username}' was updated successfully.\nYou can now use your newly configured credentials during future authentication requests."
        dispatch_html_notification_email(row['email'], "✔ ADP ITEP Portal - Security Profile Updated Successfully", success_body)
        
        return jsonify({"success": True, "message": "Security profile modifications written live into data arrays."}), 200
    finally:
        conn.close()


# --- 📨 SECTION: ANONYMOUS USER FEEDBACK PROCESSORS ---

@app.route('/api/manager-login', methods=['POST'])
def manager_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    # 🔒 EXACT DUAL CREDENTIALS POLICY MATRIX
    VALID_MANAGERS = {
        "jyotiprasad": "jps2006",
        "PR_2007": "Pintu@2026"
    }
    
    if username in VALID_MANAGERS and VALID_MANAGERS[username] == password:
        return jsonify({"success": True, "message": "System Manager Authorization Confirmed."}), 200
    return jsonify({"success": False, "message": "Invalid Administrative Core Credentials."}), 401


@app.route('/api/manager-get-all-papers', methods=['GET'])
def manager_get_all_papers():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, academicYear as academicyear, stream, dept, semester, type, subject, code, fileUrl as fileurl, published_by, approved_by FROM papers ORDER BY id DESC")
        rows = cursor.fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()


@app.route('/api/manager-modify-paper', methods=['POST'])
def manager_modify_paper():
    data = request.get_json() or {}
    mgr_pwd = data.get('manager_password')
    
    # Challenge check: Verify authorization signature token matching active master keys
    if mgr_pwd not in ["jps2006", "Pintu@2026"]:
        return jsonify({"success": False, "message": "Manager security re-authentication challenge failed."}), 403
        
    paper_id = data.get('id')
    year = data.get('academicYear')
    subject = data.get('subject')
    code = data.get('code')
    url = data.get('fileUrl')

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE papers 
            SET academicYear = %s, subject = %s, code = %s, fileUrl = %s
            WHERE id = %s
        ''', (year, subject, code, url, paper_id))
        conn.commit()
        return jsonify({"success": True, "message": "Paper records edited successfully."}), 200
    finally:
        conn.close()


@app.route('/api/manager-delete-paper', methods=['POST'])
def manager_delete_paper():
    data = request.get_json() or {}
    mgr_pwd = data.get('manager_password')
    
    if mgr_pwd not in ["jps2006", "Pintu@2026"]:
        return jsonify({"success": False, "message": "Security interceptor note: Incorrect Manager password challenge."}), 403
        
    paper_id = data.get('id')
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT fileUrl FROM papers WHERE id = %s", (paper_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Target document tracking reference not located."}), 404
            
        # Wipe background binaries off Cloudinary media space safely
        try:
            url_parts = row['fileurl'].split('/')
            for folder in ['itep_papers', 'itep_pending']:
                if folder in url_parts:
                    idx = url_parts.index(folder)
                    pid = '/'.join(url_parts[idx:]).rsplit('.', 1)[0]
                    cloudinary.uploader.destroy(pid, resource_type="image")
        except Exception:
            pass

        cursor.execute("DELETE FROM papers WHERE id = %s", (paper_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Record cleared from transaction loop pipelines."}), 200
    finally:
        conn.close()


@app.route('/api/manager-get-admins', methods=['GET'])
def manager_get_admins():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Evaluates accountability metrics on the fly using mapping queries
        cursor.execute('''
            SELECT username, name, college, passYear as passyear, stream, subject, email,
            (SELECT COUNT(*) FROM papers WHERE published_by = username OR published_by = name) as papers_published_count,
            (SELECT COUNT(*) FROM papers WHERE approved_by = username OR approved_by = name) as papers_approved_count
            FROM admins ORDER BY name ASC
        ''')
        rows = cursor.fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()




@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    data = request.get_json() or {}
    message_val = data.get('message', '').strip()
    if not message_val:
        return jsonify({"success": False, "message": "Empty feedback parameter refused."}), 400
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO system_feedbacks (message) VALUES (%s)", (message_val,))
        conn.commit()
        return jsonify({"success": True, "message": "Feedback logged successfully."}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/manager-get-admin-contributions', methods=['GET'])
def manager_get_admin_contributions():
    username = request.args.get('username')
    action_type = request.args.get('type', 'published')
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if action_type == 'published':
            cursor.execute("SELECT subject, code, semester, academicYear as academicyear FROM papers WHERE published_by = %s", (username,))
        else:
            cursor.execute("SELECT subject, code, semester, academicYear as academicyear FROM papers WHERE approved_by = %s", (username,))
        rows = cursor.fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()


@app.route('/api/manager-remove-admin', methods=['POST'])
def manager_remove_admin():
    data = request.get_json() or {}
    username = data.get('username')
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT email, name FROM admins WHERE username = %s", (username,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Target administrator definitions mapping failed empty."}), 404
            
        cursor.execute("DELETE FROM admins WHERE username = %s", (username,))
        conn.commit()
        
        # Dispatch notification removal trace warning email to revoked user
        revocation_notice = (
            f"Administrative Clearance Levels Altered:\n\n"
            f"Hello {row['name']},\n"
            f"This email serves as an automated verification notice informing you that your administrative access privileges "
            f"for the ADP ITEP portal platform have been officially revoked by the system Manager.\n\n"
            f"If you suspect this action occurred due to an operational system calculation error, coordinate with your manager leads."
        )
        dispatch_html_notification_email(row['email'], "🚨 ADP ITEP Portal - Administrative Access Level Revoked", revocation_notice)
        
        return jsonify({"success": True, "message": "Administrator record cleared from tracking arrays successfully."}), 200
    finally:
        conn.close()


@app.route('/api/manager-get-feedback', methods=['GET'])
def manager_get_feedback():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, message FROM system_feedbacks ORDER BY id DESC")
        rows = cursor.fetchall()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


try:
    init_db()
except Exception as e:
    print(f"Database init failed: {e}")



# 📌 THIS REMAINS AT THE ABSOLUTE BOTTOM
if __name__ == '__main__':
    app.run(debug=True, port=5000)
