const BACKEND_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://adp-itep-portal.vercel.app"; // NEW VERCEL URL

let currentViewState = {
    stream: 'bsc-bed',
    dept: '',
    year: '2025-26' 
};

function safeBindClick(id, callback) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', callback);
    }
}

function deactivateAllViews() {
    const screens = [
        { id: 'before-start', cls: 'hidden2' },
        { id: 'login-interface', cls: 'hidden2' },
        { id: 'main-website', cls: 'hidden3' },
        { id: 'ba-bed-page', cls: 'hidden4' },
        { id: 'bsc-bed-page', cls: 'hidden5' },
        { id: 'ba-bed-select-dept', cls: 'hidden6' },
        { id: 'bsc-bed-select-dept', cls: 'hidden6' },
        { id: 'ba-bed-minor', cls: 'hidden10' },
        { id: 'bsc-bed-minor', cls: 'hidden10' },
        { id: 'dynamic-papers-display-page', cls: 'hidden2' },
        { id: 'admin-login', cls: 'hidden8' },
        { id: 'upload-dashboard', cls: 'hidden9' },
        { id: 'anonymous-contribute-page', cls: 'hidden2' }
    ];
    
    screens.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.classList.add(item.cls);
        }
    });
}

// Navigation System Listeners
safeBindClick('start', function(){ deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('bck1', function(){ deactivateAllViews(); document.getElementById('before-start').classList.remove('hidden2'); });
safeBindClick('bck2', function(){ deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('contribute-btn', function() { deactivateAllViews(); document.getElementById('anonymous-contribute-page').classList.remove('hidden2'); });
safeBindClick('bck-contribute', function() { deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('main-website-btn', function() { deactivateAllViews(); document.getElementById('main-website').classList.remove('hidden3'); });

safeBindClick('ba-bed', function(){ currentViewState.stream = 'ba-bed'; deactivateAllViews(); document.getElementById('ba-bed-page').classList.remove('hidden4'); });
safeBindClick('bsc-bed', function(){ currentViewState.stream = 'bsc-bed'; deactivateAllViews(); document.getElementById('bsc-bed-page').classList.remove('hidden5'); });

safeBindClick('select-dept-btn1', function(){ deactivateAllViews(); document.getElementById('bsc-bed-select-dept').classList.remove('hidden6'); });
safeBindClick('select-ba-dept-btn', function() { deactivateAllViews(); document.getElementById('ba-bed-select-dept').classList.remove('hidden6'); });
safeBindClick('select-all-paper-btn1', function(){ deactivateAllViews(); document.getElementById('bsc-bed-minor').classList.remove('hidden10'); });
safeBindClick('select-all-paper-btn', function() { deactivateAllViews(); document.getElementById('ba-bed-minor').classList.remove('hidden10'); });

// Department Selection Router Links
safeBindClick('mat-m-btn', function() { currentViewState.dept = 'mathematics'; openDynamicRepositoryView("Minor"); });
safeBindClick('phy-m-btn', function() { currentViewState.dept = 'physics'; openDynamicRepositoryView("Minor"); });
safeBindClick('che-m-btn', function() { currentViewState.dept = 'chemistry'; openDynamicRepositoryView("Minor"); });
safeBindClick('bot-m-btn', function() { currentViewState.dept = 'botany'; openDynamicRepositoryView("Minor"); });
safeBindClick('zoo-m-btn', function() { currentViewState.dept = 'zoology'; openDynamicRepositoryView("Minor"); });
safeBindClick('his-m-btn', function() { currentViewState.dept = 'history'; openDynamicRepositoryView("Minor"); });
safeBindClick('geo-m-btn', function() { currentViewState.dept = 'geography'; openDynamicRepositoryView("Minor"); });
safeBindClick('pol-m-btn', function() { currentViewState.dept = 'political-science'; openDynamicRepositoryView("Minor"); });
safeBindClick('eco-m-btn', function() { currentViewState.dept = 'economics'; openDynamicRepositoryView("Minor"); });
safeBindClick('eng-m-btn', function() { currentViewState.dept = 'english'; openDynamicRepositoryView("Minor"); });
safeBindClick('asm-m-btn', function() { currentViewState.dept = 'assamese'; openDynamicRepositoryView("Minor"); });
safeBindClick('hin-m-btn', function() { currentViewState.dept = 'hindi'; openDynamicRepositoryView("Minor"); });

safeBindClick('phy-btn', function(){ currentViewState.dept = 'physics'; openDynamicRepositoryView("Major"); });
safeBindClick('che-btn', function(){ currentViewState.dept = 'chemistry'; openDynamicRepositoryView("Major"); });
safeBindClick('mat-btn', function(){ currentViewState.dept = 'mathematics'; openDynamicRepositoryView("Major"); });
safeBindClick('zoo-btn', function(){ currentViewState.dept = 'zoology'; openDynamicRepositoryView("Major"); });
safeBindClick('bot-btn', function(){ currentViewState.dept = 'botany'; openDynamicRepositoryView("Major"); });
safeBindClick('his-btn', function(){ currentViewState.dept = 'history'; openDynamicRepositoryView("Major"); });
safeBindClick('geo-btn', function(){ currentViewState.dept = 'geography'; openDynamicRepositoryView("Major"); });
safeBindClick('pol-btn', function(){ currentViewState.dept = 'political-science'; openDynamicRepositoryView("Major"); });
safeBindClick('eco-btn', function(){ currentViewState.dept = 'economics'; openDynamicRepositoryView("Major"); });
safeBindClick('eng-btn', function(){ currentViewState.dept = 'english'; openDynamicRepositoryView("Major"); });
safeBindClick('asm-btn', function(){ currentViewState.dept = 'assamese'; openDynamicRepositoryView("Major"); });
safeBindClick('hin-btn', function(){ currentViewState.dept = 'hindi'; openDynamicRepositoryView("Major"); });

// --- 📊 UPDATED: Dynamic Repository Fetch Engine ---
async function openDynamicRepositoryView(categoryType = "Major") {
    deactivateAllViews();
    
    const displayPage = document.getElementById('dynamic-papers-display-page');
    if (displayPage) displayPage.classList.remove('hidden2');
    
    const titleElement = document.getElementById('dynamic-page-title');
    const tableBody = document.getElementById('dynamic-table-body');
    
    if (titleElement) titleElement.textContent = `${currentViewState.dept.toUpperCase()} ${categoryType} Papers`;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7">Querying resource servers...</td></tr>`;

    try {
        // 📌 FIXED: Now safely forwards 'category' query filter to Flask endpoint
        const response = await fetch(`${BACKEND_URL}/api/get-papers?stream=${currentViewState.stream}&dept=${currentViewState.dept}&academicYear=${currentViewState.year}&category=${categoryType}`);
        const papers = await response.json();
        
        if (!tableBody) return;
        tableBody.innerHTML = ""; 

        if (papers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No papers uploaded for this department yet.</td></tr>`;
            return;
        }

        let count = 1;
        papers.forEach(item => {
            const tr = document.createElement('tr');
            const isSessional = item.type === 'sessional';
            // Make sure this specific line inside your loop matches this layout exactly:
            const url = item.fileurl;
            // 📌 FIXED: deleteLivePaper passing item.id safely now instead of subject code string
            const sessionalLink = isSessional ? `
                <button class="view-btn" onclick="window.open('${url}', '_blank')">View</button>
                <div style="margin-top: 4px;"><span style="color:#dc3545; font-size:11px; font-weight:bold; cursor:pointer; text-decoration:underline;" onclick="window.deleteLivePaper(${item.id})">[Delete File]</span></div>
            ` : `<span>N/A</span>`;

            const endsemLink = !isSessional ? `
                <button class="view-btn" onclick="window.open('${url}', '_blank')">View</button>
                <div style="margin-top: 4px;"><span style="color:#dc3545; font-size:11px; font-weight:bold; cursor:pointer; text-decoration:underline;" onclick="window.deleteLivePaper(${item.id})">[Delete File]</span></div>
            ` : `<span>N/A</span>`;

            tr.innerHTML = `
                <td>${count++}</td>
                <td>${item.academicyear}</td>
                <td>${item.subject}</td>
                <td>${item.code}</td>
                <td>${item.semester}</td>
                <td>${sessionalLink}</td>
                <td>${endsemLink}</td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (err) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error fetching documents from backend server.</td></tr>`;
    }
}

safeBindClick('dynamic-back-btn', function() {
    deactivateAllViews();
    const currentTitle = document.getElementById('dynamic-page-title').textContent;
    const isMinor = currentTitle.includes("Minor");

    if (currentViewState.stream === 'bsc-bed') {
        const targetMenu = document.getElementById(isMinor ? 'bsc-bed-minor' : 'bsc-bed-select-dept');
        if (targetMenu) targetMenu.classList.remove(isMinor ? 'hidden10' : 'hidden6');
    } else if (currentViewState.stream === 'ba-bed') {
        const targetMenu = document.getElementById(isMinor ? 'ba-bed-minor' : 'ba-bed-select-dept');
        if (targetMenu) targetMenu.classList.remove(isMinor ? 'hidden10' : 'hidden6');
    }
});

// Structural UI Back Buttons Setup Rules
safeBindClick('bck3', function(){ deactivateAllViews(); document.getElementById('main-website').classList.remove('hidden3'); });
safeBindClick('bck4', function(){ deactivateAllViews(); document.getElementById('main-website').classList.remove('hidden3'); });
safeBindClick('bck10', function(){ deactivateAllViews(); document.getElementById('bsc-bed-page').classList.remove('hidden5'); });
safeBindClick('bck5', function(){ deactivateAllViews(); document.getElementById('bsc-bed-page').classList.remove('hidden5'); });
safeBindClick('bck-ba-major', function() { deactivateAllViews(); document.getElementById('ba-bed-page').classList.remove('hidden4'); });
safeBindClick('bck-ba-minor', function() { deactivateAllViews(); document.getElementById('ba-bed-page').classList.remove('hidden4'); });

// Authentication Processing Chains
safeBindClick('admin-register-btn', function() {
    deactivateAllViews();
    document.getElementById('admin-register').style.display = 'block';
    document.getElementById('reg-step-1').style.display = 'block';
    document.getElementById('reg-step-2').style.display = 'none';
    document.getElementById('reg-success-card').style.display = 'none';
    document.getElementById('reg-card').style.display = 'block';
});

safeBindClick('admin-login-btn', function() { deactivateAllViews(); document.getElementById('admin-login').classList.remove('hidden8'); });
safeBindClick('bck-register', function() { document.getElementById('admin-register').style.display = 'none'; deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('close-success-btn', function() { document.getElementById('admin-register').style.display = 'none'; deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('bck8', function() { deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('bck9', function(){ 
    deactivateAllViews(); 
    document.getElementById('login-interface').classList.remove('hidden2'); 
    if (typeof showAdminTab === 'function') showAdminTab(null);
});
const loginForm = document.getElementById('admin-login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const adminIdInput = document.getElementById('admin-id').value.trim();
        const passwordInput = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('login-error-msg');
        
        try {
            if (errorElement) errorElement.style.display = 'none';
            const response = await fetch(`${BACKEND_URL}/api/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminIdInput, password: passwordInput })
            });
            const result = await response.json();

            if (result.success) {
                alert(result.message);
                deactivateAllViews();
                document.getElementById('upload-dashboard').classList.remove('hidden9');
                loginForm.reset();
                loadPendingAdminsQueue();
                window.loadPendingPapers();
            } else {
                if (errorElement) { errorElement.innerText = result.message; errorElement.style.display = 'block'; }
            }
        } catch (error) {
            if (errorElement) { errorElement.innerText = "Cannot reach backend server."; errorElement.style.display = 'block'; }
        }
    });
}

// Registration Module Helpers
safeBindClick('reg-next-btn', function() {
    if (!document.getElementById('reg-name').value || !document.getElementById('reg-college').value) {
        alert("Please complete all profile fields before continuing."); return;
    }
    document.getElementById('reg-step-1').style.display = 'none';
    document.getElementById('reg-step-2').style.display = 'block';
});
safeBindClick('reg-prev-btn', function() { document.getElementById('reg-step-2').style.display = 'none'; document.getElementById('reg-step-1').style.display = 'block'; });

safeBindClick('send-otp-btn', async function() {
    const email = document.getElementById('reg-email').value.trim();
    const statusMsg = document.getElementById('otp-status-msg');
    if (!email) { alert("Please supply a valid administrative email address."); return; }
    if (statusMsg) { statusMsg.style.display = 'block'; statusMsg.style.color = 'blue'; statusMsg.textContent = "Dispatched security token request..."; }

    try {
        const response = await fetch(`${BACKEND_URL}/api/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        const res = await response.json();
        if (res.success) {
            if (statusMsg) { statusMsg.style.color = 'green'; statusMsg.textContent = "OTP dispatched flawlessly!"; }
            document.getElementById('otp-container').style.display = 'flex';
        } else {
            if (statusMsg) { statusMsg.style.color = 'red'; statusMsg.textContent = res.message; }
        }
    } catch {
        if (statusMsg) { statusMsg.style.color = 'red'; statusMsg.textContent = "Failed connecting to verification services."; }
    }
});

safeBindClick('verify-otp-btn', async function() {
    const email = document.getElementById('reg-email').value.trim();
    const otp = document.getElementById('reg-otp').value.trim();
    const statusMsg = document.getElementById('otp-status-msg');

    try {
        const response = await fetch(`${BACKEND_URL}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, otp: otp })
        });
        const res = await response.json();
        if (res.success) {
            if (statusMsg) { statusMsg.style.color = 'green'; statusMsg.textContent = "Identity authenticated verified perfectly!"; }
            document.getElementById('reg-submit-btn').disabled = false; 
        } else {
            if (statusMsg) { statusMsg.style.color = 'red'; statusMsg.textContent = res.message; }
        }
    } catch { alert("Verification bridge exception."); }
});

const regForm = document.getElementById('admin-register-form');
if (regForm) {
    regForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = document.getElementById('reg-admin-password').value;
        const confirmPass = document.getElementById('reg-admin-confirm-password').value;
        if (password !== confirmPass) { alert("Passwords are not identical."); return; }

        const payload = {
            username: document.getElementById('reg-admin-id').value.trim(),
            name: document.getElementById('reg-name').value,
            college: document.getElementById('reg-college').value,
            passYear: document.getElementById('reg-pass-year').value,
            stream: document.getElementById('reg-stream').value,
            subject: document.getElementById('reg-subject').value,
            email: document.getElementById('reg-email').value.trim(),
            password: password
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/admin-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await response.json();
            if (response.ok) {
                document.getElementById('reg-card').style.display = 'none';
                document.getElementById('reg-success-card').style.display = 'block';
                regForm.reset();
                document.getElementById('reg-submit-btn').disabled = true; 
            } else { alert(res.message); }
        } catch { alert("Account registration failure."); }
    });
}

// Cascading Options Subsystem mapping
const streamSelect = document.getElementById('paper-stream');
const deptSelect = document.getElementById('paper-dept');
const departmentsByStream = {
    'bsc-bed': [
        { value: 'physics', text: 'Physics' },
        { value: 'chemistry', text: 'Chemistry' },
        { value: 'mathematics', text: 'Mathematics' },
        { value: 'zoology', text: 'Zoology' },
        { value: 'botany', text: 'Botany' }
    ],
    'ba-bed': [
        { value: 'history', text: 'History' },
        { value: 'geography', text: 'Geography' },
        { value: 'political-science', text: 'Political Science' },
        { value: 'english', text: 'English' },
        { value: 'economics', text: 'Economics'},
        { value: 'assamese', text: 'Assamese'},
        { value: 'hindi', text: 'Hindi'}
    ]
};

if (streamSelect && deptSelect) {
    streamSelect.addEventListener('change', function() {
        const selectedStream = this.value;
        deptSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
        if (departmentsByStream[selectedStream]) {
            deptSelect.disabled = false;
            departmentsByStream[selectedStream].forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.value; option.textContent = dept.text; deptSelect.appendChild(option);
            });
        } else { deptSelect.disabled = true; }
    });
}

const adminYearSelect = document.getElementById('paper-year');
if (adminYearSelect) { adminYearSelect.addEventListener('change', function() { currentViewState.year = this.value; }); }

const semInput = document.getElementById('paper-sem');
const semError = document.getElementById('sem-error-msg');
if (semInput && semError) {
    semInput.addEventListener('input', function() {
        const val = this.value;
        if (val !== "" && (val < 1 || val > 8 || !Number.isInteger(Number(val)))) {
            semError.textContent = "Please enter a valid number (1-8) !"; semError.style.display = 'block'; this.classList.add('input-error-border');
        } else { semError.style.display = 'none'; this.classList.remove('input-error-border'); }
    });
}

// --- 📌 UPDATED: Admin Form Upload Handler ---
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        const semValue = document.getElementById('paper-sem').value;
        const fileInput = document.getElementById('paper-file');
        const maxFileSize = 3 * 1024 * 1024;

        if (semValue < 1 || semValue > 8 || !Number.isInteger(Number(semValue))) { alert("Please fix form errors first."); return; }
        if (fileInput.files.length === 0) { alert("Please select a file to upload."); return; }

        const selectedFile = fileInput.files[0];
        if (selectedFile.size > maxFileSize) { alert("Upload Error: File must be smaller than 3MB."); return; }

        const formData = new FormData();
        formData.append('academicYear', document.getElementById('paper-year').value);
        formData.append('stream', document.getElementById('paper-stream').value);
        formData.append('dept', document.getElementById('paper-dept').value);
        formData.append('semester', semValue);
        formData.append('type', document.getElementById('paper-type').value);
        // 📌 FIXED: Added paper category extractor (Major / Minor)
        formData.append('category', document.getElementById('paper-category').value);
        formData.append('subject', document.getElementById('paper-name').value);
        formData.append('code', document.getElementById('paper-code').value);
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${BACKEND_URL}/api/upload-paper`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok) {
                alert(`Success! ${result.message}`);
                uploadForm.reset();
                if (deptSelect) { deptSelect.innerHTML = '<option value="" disabled selected>Select Department</option>'; deptSelect.disabled = true; }
            } else { alert(`Upload Error: ${result.message}`); }
        } catch (err) { alert("Failed to connect to backend server."); }
    });
}

// Global array to hold the data temporarily so the "View Details" button can read it
window.currentPendingAdmins = []; 

// Queue Processing Rules
async function loadPendingAdminsQueue() {
    const tbody = document.getElementById('pending-admins-tbody');
    if (!tbody) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/get-pending-admins`);
        const pendingUsers = await response.json();
        
        window.currentPendingAdmins = pendingUsers; // Save for the view button
        tbody.innerHTML = ""; 

        if (pendingUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-queue-row">No pending admin requests.</td></tr>`; return;
        }

        pendingUsers.forEach(user => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #e2e8f0";
            tr.innerHTML = `
                <td style="text-align: left;"><b>${user.name}</b><br><small style="color:#64748b;">${user.college}</small></td>
                <td style="text-align: left;">${user.username}</td>
                <td style="text-align: left; font-family: monospace;">${user.email || 'N/A'}</td>
                <td style="text-align: left;">${user.stream.toUpperCase()}</td>
                <td style="text-align: left;">
                    <div class="moderation-btn-group">
                        <button class="view-btn btn-review" onclick="window.viewAdminDetails('${user.username}')">Details</button>
                        <button class="view-btn btn-approve" onclick="window.processAdminApproval('${user.username}', 'approve')">Accept</button>
                        <button class="view-btn btn-reject" onclick="window.processAdminApproval('${user.username}', 'reject')">Reject</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { tbody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Error loading queue elements.</td></tr>`; }
}

window.processAdminApproval = async function(usernameToApprove, actionDirective) {
    // Add a safety check before deleting someone
    if (actionDirective === 'reject') {
        if (!confirm(`Are you sure you want to reject the admin application for ${usernameToApprove}?`)) return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/approve-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameToApprove, action: actionDirective }) // Sends approve/reject to Python
        });
        const result = await response.json();
        if (result.success) { 
            alert(result.message); 
            loadPendingAdminsQueue(); 
        } else { 
            alert("Error processing: " + result.message); 
        }
    } catch (err) { alert("Could not reach backend server pipeline."); }
};

// New Function to display the applicant's full credentials
window.viewAdminDetails = function(username) {
    const user = window.currentPendingAdmins.find(u => u.username === username);
    if (!user) return;
    
    const details = `
👤 ADMIN APPLICANT DETAILS 👤
-----------------------------------
Name: ${user.name}
Username: ${user.username}
Email: ${user.email}

🎓 ACADEMIC PROFILE
-----------------------------------
College: ${user.college}
Stream: ${user.stream.toUpperCase()}
Subject: ${user.subject}
Passing Year: ${user.passyear}
    `;
    alert(details);
};

// --- 📌 UPDATED: Anonymous Form Contribution Handler ---
const anonForm = document.getElementById('anonymous-upload-form');
if (anonForm) {
    anonForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const semValue = document.getElementById('contrib-sem').value;
        
        if (semValue < 1 || semValue > 8 || !Number.isInteger(Number(semValue)) || semValue.includes('.')){
            alert("Please enter a valid whole semester integer between 1 and 8."); return;
        }

        const formData = new FormData();
        formData.append('academicYear', document.getElementById('contrib-year').value);
        formData.append('stream', document.getElementById('contrib-stream').value);
        formData.append('dept', document.getElementById('contrib-dept').value);
        formData.append('semester', semValue);
        formData.append('type', document.getElementById('contrib-type').value);
        // 📌 FIXED: Added contribution paper category tracker (Major / Minor)
        formData.append('category', document.getElementById('contrib-category').value);
        formData.append('subject', document.getElementById('contrib-name').value);
        formData.append('code', document.getElementById('contrib-code').value);
        formData.append('file', document.getElementById('contrib-file').files[0]);

        try {
            const response = await fetch(`${BACKEND_URL}/api/contribute-paper`, { method: 'POST', body: formData });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                anonForm.reset();
                if (contribDeptSelect) contribDeptSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
            } else { alert("Submission Refused: " + data.message); }
        } catch { alert("Error sending request payload to background servers."); }
    });
}

const contribSemInput = document.getElementById('contrib-sem');
if (contribSemInput) {
    contribSemInput.addEventListener('input', function() {
        const val = this.value;
        if (val !== "" && (val < 1 || val > 8 || !Number.isInteger(Number(val)) || val.includes('.'))) {
            if(val.includes('.')) { this.value = Math.floor(val); }
            this.classList.add('input-error-border');
        } else { this.classList.remove('input-error-border'); }
    });
}

const contribStreamSelect = document.getElementById('contrib-stream');
const contribDeptSelect = document.getElementById('contrib-dept');
if (contribStreamSelect && contribDeptSelect) {
    contribStreamSelect.addEventListener('change', function() {
        const selectedStream = this.value;
        contribDeptSelect.innerHTML = '<option value="" disabled selected>Select Department</option>';
        if (departmentsByStream[selectedStream]) {
            contribDeptSelect.disabled = false;
            departmentsByStream[selectedStream].forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.value; option.textContent = dept.text; contribDeptSelect.appendChild(option);
            });
        } else { contribDeptSelect.disabled = true; }
    });
}

// --- 📌 UPDATED: Review Moderation Subsystem UI ---
window.loadPendingPapers = function() {
    fetch(`${BACKEND_URL}/api/get-pending-papers`)
    .then(res => res.json())
    .then(papers => {
        const container = document.getElementById('pending-papers-container');
        if (!container) return;
        container.innerHTML = ''; 

        if (papers.length === 0) {
            container.innerHTML = '<p class="empty-queue-row" style="text-align:center; padding:20px; color:#64748b; font-family:sans-serif;">No pending paper requests.</p>';
            return;
        }

        papers.forEach(paper => {
            // 📌 FIXED: explicitly surfaces the paper Category layout and uses strictly lowercase keys for Postgres
            container.innerHTML += `
                <div class="paper-card" style="border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 10px; border-radius: 6px; background: #f8fafc;">
                    <h4 style="margin: 0 0 5px 0;">${paper.subject} (<span style="font-family: monospace;">${paper.code}</span>)</h4>
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #475569; line-height: 1.5;">
                        <b>Year:</b> ${paper.academicyear} | 
                        <b>Stream:</b> ${paper.stream.toUpperCase()} | 
                        <b>Dept:</b> ${paper.dept.toUpperCase()} | 
                        <b>Sem:</b> ${paper.semester} | 
                        <b>Type:</b> ${paper.type.toUpperCase()} | 
                        <b>Category:</b> ${paper.category || 'Major'}
                    </p>
                    <div>
                        <button class="view-btn" onclick="window.open('${paper.fileurl}', '_blank')">Review PDF</button>
                        <button class="view-btn" style="background-color:#28a745; color:white;" onclick="window.processPaper(${paper.id}, 'approve')">Publish</button>
                        <button class="view-btn" style="background-color:#dc3545; color:white;" onclick="window.processPaper(${paper.id}, 'reject')">Drop</button>
                    </div>
                </div>
            `;
        });
    });
}

window.processPaper = function(paperId, actionDirective) {
    fetch(`${BACKEND_URL}/api/approve-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paperId, action: actionDirective })
    })
    .then(res => res.json())
    .then(data => { alert(data.message); window.loadPendingPapers(); })
    .catch(err => alert("Could not reach backend server pipeline."));
}

// --- 📌 UPDATED: Clean File Deletion Execution Subsystem ---
window.deleteLivePaper = async function(paperId) {
    if (!paperId) { alert("Missing ID identifier parameter."); return; }
    
    const passcode = prompt("ADMIN ACTION:\nPlease enter your Admin Password to delete this file:");
    if (!passcode) return;
    
    if (passcode !== "jp2006" && passcode !== "Priyaranjan7") { alert("Incorrect administrative password."); return; }

    if (!confirm(`Are you sure you want to permanently erase record ID #${paperId}?`)) return;
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/delete-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(paperId) }) // 📌 FIXED: Sends 'id' parameter integer directly to Flask
        });
        
        const data = await response.json();
        alert(data.message);
        
        const currentTitle = document.getElementById('dynamic-page-title').textContent;
        const categoryType = currentTitle.includes("Minor") ? "Minor" : "Major";
        openDynamicRepositoryView(categoryType);
        
    } catch (err) { alert("Error connecting to backend servers."); }
};












// ==========================================
// ADMIN DASHBOARD TAB NAVIGATION LOGIC
// ==========================================
const navPendingAdmins = document.getElementById('nav-pending-admins');
const navPendingPapers = document.getElementById('nav-pending-papers');
const navUploadPaper = document.getElementById('nav-upload-paper');

const secPendingAdmins = document.getElementById('section-pending-admins');
const secPendingPapers = document.getElementById('section-pending-papers');
const secUploadPaper = document.getElementById('section-upload-paper');

// Helper function to hide everything, then show the target section
function showAdminTab(targetSection) {
    // Hide all sections
    if (secPendingAdmins) secPendingAdmins.style.display = 'none';
    if (secPendingPapers) secPendingPapers.style.display = 'none';
    if (secUploadPaper) secUploadPaper.style.display = 'none';

    // Show the requested section
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// Button Click Events
if (navPendingAdmins) {
    navPendingAdmins.addEventListener('click', () => {
        showAdminTab(secPendingAdmins);
        loadPendingAdminsQueue(); 
    });
}

if (navPendingPapers) {
    navPendingPapers.addEventListener('click', () => {
        showAdminTab(secPendingPapers);
        window.loadPendingPapers(); 
    });
}

if (navUploadPaper) {
    navUploadPaper.addEventListener('click', () => {
        showAdminTab(secUploadPaper);
    });
}
