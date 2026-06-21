const BACKEND_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://adp-itep-portal.vercel.app"; 

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
        { id: 'anonymous-contribute-page', cls: 'hidden2' },
        { id: 'anonymous-contribute-common-page', cls: 'hidden2' } ,
        { id: 'manager-login-page', cls: 'hidden2' },
        { id: 'manager-dashboard-view', cls: 'hidden2' },
        { id: 'feedback-submission-page', cls: 'hidden2' }
    ];
    screens.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            el.classList.add(item.cls);
        }
    });
}

// Global View Swappers & Navigation Bindings
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

// Minor Department Event Triggers
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

// Major Department Event Triggers
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


safeBindClick('submit-feedback-btn', () => { deactivateAllViews(); document.getElementById('feedback-submission-page').classList.remove('hidden2'); });
safeBindClick('bck-feedback', () => { deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('mgr-nav-view-feedback', () => { clearAllManagerTabsActiveStates(); document.getElementById('mgr-section-view-feedback').style.display = 'block'; mgrFetchAndRenderFeedbacks(); });


safeBindClick('contribute-common-btn', function() { deactivateAllViews(); document.getElementById('anonymous-contribute-common-page').classList.remove('hidden2'); });
safeBindClick('bck-contribute-common', function() { deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('common-papers-btn', function() { 
    currentViewState.stream = 'common'; 
    currentViewState.dept = 'common'; 
    openDynamicRepositoryView("Common"); 
});

window.currentLoadedPapers = [];

async function openDynamicRepositoryView(categoryType = "Major") {
    deactivateAllViews();
    const displayPage = document.getElementById('dynamic-papers-display-page');
    if (displayPage) displayPage.classList.remove('hidden2'); 
    const titleElement = document.getElementById('dynamic-page-title');
    const tableBody = document.getElementById('dynamic-table-body');
    const yearFilter = document.getElementById('filter-year');
    const semFilter = document.getElementById('filter-sem');
    if (yearFilter) yearFilter.value = 'all';
    if (semFilter) semFilter.value = 'all';
    if (titleElement) {
        titleElement.textContent = currentViewState.stream === 'common' 
            ? "Common Question Papers" 
            : `${currentViewState.dept.toUpperCase()} ${categoryType} Papers`;
    }
    
    if (tableBody) {
        tableBody.innerHTML = "";
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '7');
        td.textContent = "Querying resource servers... ";
        tr.appendChild(td);
        tableBody.appendChild(tr);
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api/get-papers?stream=${currentViewState.stream}&dept=${currentViewState.dept}&academicYear=${currentViewState.year}&category=${categoryType}`);
        const papers = await response.json();      
        if (!tableBody) return;
        window.currentLoadedPapers = papers;
        window.renderFilteredPapers();
    } catch (err) {
        if (tableBody) {
            tableBody.innerHTML = "";
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.setAttribute('colspan', '7');
            td.style.color = "red";
            td.textContent = "Error fetching documents from backend server.";
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }
    }
}






// Function helper to reset the login interface screen back to its clean primary main-menu layout state
function resetLoginHubMenus() {
    const mainMenu = document.getElementById('main-menu-buttons');
    const adminSub = document.getElementById('admin-sub-menu');
    const contribSub = document.getElementById('contribution-sub-menu');
    
    if (mainMenu) mainMenu.classList.remove('hidden2');
    if (adminSub) adminSub.classList.add('hidden2');
    if (contribSub) contribSub.classList.add('hidden2');
}

// Modify your existing bck1 / start click definitions to handle view cleanup state resets
safeBindClick('start', function(){ deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); resetLoginHubMenus(); });
safeBindClick('bck1', function(){ deactivateAllViews(); document.getElementById('before-start').classList.remove('hidden2'); });

// --- Hub Dynamic Router Menus Event Triggers ---

// When clicking ADMIN PAGE: hide main menu, show Admin sub-choices
safeBindClick('admin-page-hub-btn', function() {
    document.getElementById('main-menu-buttons').classList.add('hidden2');
    document.getElementById('admin-sub-menu').classList.remove('hidden2');
});

// Back buttons inside submenus to return to the 5 main buttons
safeBindClick('cancel-admin-sub-btn', function() {
    resetLoginHubMenus();
});

// When clicking CONTRIBUTION PAGE: hide main menu, show Contribution sub-choices
safeBindClick('contribution-page-hub-btn', function() {
    document.getElementById('main-menu-buttons').classList.add('hidden2');
    document.getElementById('contribution-sub-menu').classList.remove('hidden2');
});

safeBindClick('cancel-contrib-sub-btn', function() {
    resetLoginHubMenus();
});





// 🛠️ PURE JS: Programmatic user archive table generator
window.renderFilteredPapers = function() {
    const tableBody = document.getElementById('dynamic-table-body');
    if (!tableBody) return;
    const selectedYear = document.getElementById('filter-year').value;
    const selectedSem = document.getElementById('filter-sem').value;
    
    const filteredPapers = window.currentLoadedPapers.filter(paper => {
        const matchesYear = (selectedYear === 'all') || (paper.academicyear === selectedYear);
        const matchesSem = (selectedSem === 'all') || (paper.semester.toString() === selectedSem);
        return matchesYear && matchesSem;
    });
    
    tableBody.innerHTML = ""; 
    if (filteredPapers.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '7');
        td.textContent = "No papers match your selected filters.";
        tr.appendChild(td);
        tableBody.appendChild(tr);
        return;
    }
    
    let count = 1;
    filteredPapers.forEach(item => {
        const tr = document.createElement('tr');
        const isSessional = item.type === 'sessional';
        
        const tdSl = document.createElement('td');
        tdSl.textContent = count++;
        tr.appendChild(tdSl);
        
        const tdYear = document.createElement('td');
        tdYear.textContent = item.academicyear;
        tr.appendChild(tdYear);
        
        const tdSubject = document.createElement('td');
        tdSubject.textContent = item.subject;
        tr.appendChild(tdSubject);
        
        const tdCode = document.createElement('td');
        tdCode.textContent = item.code;
        tr.appendChild(tdCode);
        
        const tdSem = document.createElement('td');
        tdSem.textContent = item.semester;
        tr.appendChild(tdSem);
        
        const tdSessional = document.createElement('td');
        if (isSessional) {
            const btn = document.createElement('button');
            btn.className = "view-btn";
            btn.textContent = "View";
            btn.onclick = () => window.open(item.fileurl, '_blank');
            tdSessional.appendChild(btn);
        } else {
            const spanN_A = document.createElement('span');
            spanN_A.textContent = "N/A";
            tdSessional.appendChild(spanN_A);
        }
        tr.appendChild(tdSessional);
        
        const tdEndsem = document.createElement('td');
        if (!isSessional) {
            const btn = document.createElement('button');
            btn.className = "view-btn";
            btn.textContent = "View";
            btn.onclick = () => window.open(item.fileurl, '_blank');
            tdEndsem.appendChild(btn);
        } else {
            const spanN_A = document.createElement('span');
            spanN_A.textContent = "N/A";
            tdEndsem.appendChild(spanN_A);
        }
        tr.appendChild(tdEndsem);
        
        tableBody.appendChild(tr);
    });
};

const fYear = document.getElementById('filter-year');
if (fYear) fYear.addEventListener('change', window.renderFilteredPapers);
const fSem = document.getElementById('filter-sem');
if (fSem) fSem.addEventListener('change', window.renderFilteredPapers);

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
    } else if (currentViewState.stream === 'common') {
        document.getElementById('main-website').classList.remove('hidden3');
    }
});

safeBindClick('bck3', function(){ deactivateAllViews(); document.getElementById('main-website').classList.remove('hidden3'); });
safeBindClick('bck4', function(){ deactivateAllViews(); document.getElementById('main-website').classList.remove('hidden3'); });
safeBindClick('bck10', function(){ deactivateAllViews(); document.getElementById('bsc-bed-page').classList.remove('hidden5'); });
safeBindClick('bck5', function(){ deactivateAllViews(); document.getElementById('bsc-bed-page').classList.remove('hidden5'); });
safeBindClick('bck-ba-major', function() { deactivateAllViews(); document.getElementById('ba-bed-page').classList.remove('hidden4'); });
safeBindClick('bck-ba-minor', function() { deactivateAllViews(); document.getElementById('ba-bed-page').classList.remove('hidden4'); });

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
    if (statusMsg) { statusMsg.style.display = 'block'; statusMsg.style.color = 'blue'; statusMsg.textContent = "Dispatched security token request..."; }    try {
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
        formData.append('category', document.getElementById('paper-category').value);
        formData.append('subject', document.getElementById('paper-name').value);
        formData.append('code', document.getElementById('paper-code').value);
        formData.append('file', selectedFile);
        formData.append('adminUsername', document.getElementById('admin-id').value.trim());
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

const uploadCommonForm = document.getElementById('upload-common-form');
if (uploadCommonForm) {
    uploadCommonForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        const semValue = document.getElementById('admin-common-sem').value;
        const fileInput = document.getElementById('admin-common-file');
        if (semValue < 1 || semValue > 8 || !Number.isInteger(Number(semValue))) { alert("Please enter a valid semester (1-8)."); return; }
        if (fileInput.files.length === 0) { alert("Please select a file to upload."); return; }
        if (fileInput.files[0].size > 3 * 1024 * 1024) { alert("Upload Error: File must be smaller than 3MB."); return; }
        const formData = new FormData();
        formData.append('academicYear', document.getElementById('admin-common-year').value);
        formData.append('stream', 'common'); 
        formData.append('dept', 'common');   
        formData.append('semester', semValue);
        formData.append('type', document.getElementById('admin-common-type').value);
        formData.append('category', 'Common'); 
        formData.append('subject', document.getElementById('admin-common-name').value);
        formData.append('code', document.getElementById('admin-common-code').value);
        formData.append('file', fileInput.files[0]);
        try {
            const response = await fetch(`${BACKEND_URL}/api/upload-paper`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok) {
                alert(`Success! ${result.message}`);
                uploadCommonForm.reset();
            } else { alert(`Upload Error: ${result.message}`); }
        } catch (err) { alert("Failed to connect to backend server."); }
    });
}

window.currentPendingAdmins = []; 
// 🛠️ PURE JS: Programmatic pending administrator authorization queue row builder
async function loadPendingAdminsQueue() {
    const tbody = document.getElementById('pending-admins-tbody');
    if (!tbody) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/get-pending-admins`);
        const pendingUsers = await response.json();
        window.currentPendingAdmins = pendingUsers; 
        tbody.innerHTML = ""; 
        if (pendingUsers.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.setAttribute('colspan', '5');
            td.className = "empty-queue-row";
            td.textContent = "No pending admin requests.";
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }
        pendingUsers.forEach(user => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #e2e8f0";
            
            // 1. Profile Cell (Name and College)
            const tdProfile = document.createElement('td');
            tdProfile.style.textAlign = "left";
            const bName = document.createElement('b');
            bName.textContent = user.name;
            const br = document.createElement('br');
            const smallCollege = document.createElement('small');
            smallCollege.style.color = "#64748b";
            smallCollege.textContent = user.college;
            tdProfile.appendChild(bName);
            tdProfile.appendChild(br);
            tdProfile.appendChild(smallCollege);
            tr.appendChild(tdProfile);
            
            // 2. Username Cell
            const tdUser = document.createElement('td');
            tdUser.style.textAlign = "left";
            tdUser.textContent = user.username;
            tr.appendChild(tdUser);
            
            // 3. Email Cell
            const tdEmail = document.createElement('td');
            tdEmail.style.textAlign = "left";
            tdEmail.style.fontFamily = "monospace";
            tdEmail.textContent = user.email || 'N/A';
            tr.appendChild(tdEmail);
            
            // 4. Stream Cell
            const tdStream = document.createElement('td');
            tdStream.style.textAlign = "left";
            tdStream.textContent = user.stream.toUpperCase();
            tr.appendChild(tdStream);
            
            // 5. Action Cell
            const tdActions = document.createElement('td');
            tdActions.style.textAlign = "left";
            const groupDiv = document.createElement('div');
            groupDiv.className = "moderation-btn-group";
            
            const btnDetails = document.createElement('button');
            btnDetails.className = "view-btn btn-review";
            btnDetails.textContent = "Details";
            btnDetails.onclick = () => window.viewAdminDetails(user.username);
            groupDiv.appendChild(btnDetails);
            
            const btnAccept = document.createElement('button');
            btnAccept.className = "view-btn btn-approve";
            btnAccept.textContent = "Accept";
            btnAccept.onclick = () => window.processAdminApproval(user.username, 'approve');
            groupDiv.appendChild(btnAccept);
            
            const btnReject = document.createElement('button');
            btnReject.className = "view-btn btn-reject";
            btnReject.textContent = "Reject";
            btnReject.onclick = () => window.processAdminApproval(user.username, 'reject');
            groupDiv.appendChild(btnReject);
            
            tdActions.appendChild(groupDiv);
            tr.appendChild(tdActions);
            
            tbody.appendChild(tr);
        });
    } catch (err) { 
        tbody.innerHTML = "";
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '5');
        td.style.color = "red";
        td.style.textAlign = "center";
        td.textContent = "Error loading queue elements.";
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

window.processAdminApproval = async function(usernameToApprove, actionDirective) {
    if (actionDirective === 'reject') {
        if (!confirm(`Are you sure you want to reject the admin application for ${usernameToApprove}?`)) return;
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api/approve-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameToApprove, action: actionDirective }) 
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

const anonCommonForm = document.getElementById('anonymous-upload-common-form');
if (anonCommonForm) {
    anonCommonForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const semValue = document.getElementById('contrib-common-sem').value;      
        if (semValue < 1 || semValue > 8 || !Number.isInteger(Number(semValue)) || semValue.includes('.')){
            alert("Please enter a valid whole semester integer between 1 and 8."); return;
        }
        const formData = new FormData();
        formData.append('academicYear', document.getElementById('contrib-common-year').value);
        formData.append('stream', 'common'); 
        formData.append('dept', 'common');   
        formData.append('semester', semValue);
        formData.append('type', document.getElementById('contrib-common-type').value);
        formData.append('category', 'Common'); 
        formData.append('subject', document.getElementById('contrib-common-name').value);
        formData.append('code', document.getElementById('contrib-common-code').value);
        formData.append('file', document.getElementById('contrib-common-file').files[0]);
        try {
            const response = await fetch(`${BACKEND_URL}/api/contribute-paper`, { method: 'POST', body: formData });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                anonCommonForm.reset();
            } else { alert("Submission Refused: " + data.message); }
        } catch { alert("Error sending request payload to background servers."); }
    });
}

// 🛠️ PURE JS: Programmatic moderation queue dashboard card component builder
window.loadPendingPapers = function() {
    fetch(`${BACKEND_URL}/api/get-pending-papers`)
    .then(res => res.json())
    .then(papers => {
        const container = document.getElementById('pending-papers-container');
        const commonContainer = document.getElementById('pending-common-container');
        if (!container || !commonContainer) return;
        const regularPapers = papers.filter(p => p.stream !== 'common');
        const commonPapers = papers.filter(p => p.stream === 'common');
        
        const renderPapers = (paperArray, targetDiv, emptyMsg) => {
            targetDiv.innerHTML = '';
            if (paperArray.length === 0) {
                const p = document.createElement('p');
                p.className = "empty-queue-row msg-muted-centered";
                p.style.textAlign = "center";
                p.style.padding = "20px";
                p.style.color = "#64748b";
                p.textContent = emptyMsg;
                targetDiv.appendChild(p);
                return;
            }
            
            paperArray.forEach(paper => {
                const card = document.createElement('div');
                card.className = "paper-card";
                card.style.border = "1px solid #cbd5e1";
                card.style.padding = "12px";
                card.style.marginBottom = "10px";
                card.style.borderRadius = "6px";
                card.style.background = "#f8fafc";

                const h4 = document.createElement('h4');
                h4.style.margin = "0 0 5px 0";
                
                const titleText = document.createTextNode(paper.subject + " (");
                const codeSpan = document.createElement('span');
                codeSpan.style.fontFamily = "monospace";
                codeSpan.textContent = paper.code;
                const closingText = document.createTextNode(")");
                
                h4.appendChild(titleText);
                h4.appendChild(codeSpan);
                h4.appendChild(closingText);
                card.appendChild(h4);

                const p = document.createElement('p');
                p.style.margin = "0 0 10px 0";
                p.style.fontSize = "12px";
                p.style.color = "#475569";
                p.style.lineHeight = "1.5";
                
                const bYear = document.createElement('b'); bYear.textContent = "Year: ";
                const textYear = document.createTextNode(paper.academicyear + " | ");
                const bSem = document.createElement('b'); bSem.textContent = "Sem: ";
                const textSem = document.createTextNode(paper.semester + " | ");
                const bType = document.createElement('b'); bType.textContent = "Type: ";
                const textType = document.createTextNode(paper.type.toUpperCase());
                const br = document.createElement('br');

                p.appendChild(bYear); p.appendChild(textYear);
                p.appendChild(bSem);  p.appendChild(textSem);
                p.appendChild(bType); p.appendChild(textType);
                p.appendChild(br);

                if (paper.stream === 'common') {
                    const commonBadge = document.createElement('span');
                    commonBadge.style.cssText = "background:#17a2b8; color:white; padding:2px 6px; border-radius:4px; font-size:10px;";
                    commonBadge.textContent = "COMMON PAPER";
                    p.appendChild(commonBadge);
                } else {
                    const bStream = document.createElement('b'); bStream.textContent = "Stream: ";
                    const textStream = document.createTextNode(paper.stream.toUpperCase() + " | ");
                    const bDept = document.createElement('b'); bDept.textContent = "Dept: ";
                    const textDept = document.createTextNode(paper.dept.toUpperCase() + " | ");
                    const bCat = document.createElement('b'); bCat.textContent = "Category: ";
                    const textCat = document.createTextNode(paper.category || 'Major');

                    p.appendChild(bStream); p.appendChild(textStream);
                    p.appendChild(bDept);   p.appendChild(textDept);
                    p.appendChild(bCat);   p.appendChild(textCat);
                }
                card.appendChild(p);

                const btnGroup = document.createElement('div');
                
                const btnReview = document.createElement('button');
                btnReview.className = "view-btn";
                btnReview.textContent = "Review PDF";
                btnReview.onclick = () => window.open(paper.fileurl, '_blank');
                btnGroup.appendChild(btnReview);

                const btnPublish = document.createElement('button');
                btnPublish.className = "view-btn";
                btnPublish.style.cssText = "background-color:#28a745; color:white;";
                btnPublish.textContent = "Publish";
                btnPublish.onclick = () => window.processPaper(paper.id, 'approve');
                btnGroup.appendChild(btnPublish);

                const btnDrop = document.createElement('button');
                btnDrop.className = "view-btn";
                btnDrop.style.cssText = "background-color:#dc3545; color:white;";
                btnDrop.textContent = "Drop";
                btnDrop.onclick = () => window.processPaper(paper.id, 'reject');
                btnGroup.appendChild(btnDrop);

                card.appendChild(btnGroup);
                targetDiv.appendChild(card);
            });
        };
        renderPapers(regularPapers, container, "No pending paper requests matching queue parameters.");
        renderPapers(commonPapers, commonContainer, "No pending common paper requests.");
    });
};

window.processPaper = function(paperId, actionDirective) {
    fetch(`${BACKEND_URL}/api/approve-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: paperId, 
            action: actionDirective,
            adminUsername: document.getElementById('admin-id').value.trim()
        })
    })
    .then(res => res.json())
    .then(data => { 
        alert(data.message); 
        window.loadPendingPapers(); 
    })
    .catch(err => alert("Could not reach backend server pipeline."));
};

const navPendingAdmins = document.getElementById('nav-pending-admins');
const navPendingPapers = document.getElementById('nav-pending-papers');
const navPendingCommon = document.getElementById('nav-pending-common'); 
const navUploadPaper = document.getElementById('nav-upload-paper');
const navUploadCommon = document.getElementById('nav-upload-common');   
const secPendingAdmins = document.getElementById('section-pending-admins');
const secPendingPapers = document.getElementById('section-pending-papers');
const secPendingCommon = document.getElementById('section-pending-common'); 
const secUploadPaper = document.getElementById('section-upload-paper');
const secUploadCommon = document.getElementById('section-upload-common');   

function showAdminTab(targetSection) {
    if (secPendingAdmins) secPendingAdmins.style.display = 'none';
    if (secPendingPapers) secPendingPapers.style.display = 'none';
    if (secPendingCommon) secPendingCommon.style.display = 'none';
    if (secUploadPaper) secUploadPaper.style.display = 'none';
    if (secUploadCommon) secUploadCommon.style.display = 'none';
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

if (navPendingAdmins) {
    navPendingAdmins.addEventListener('click', () => { showAdminTab(secPendingAdmins); loadPendingAdminsQueue(); });
}
if (navPendingPapers) {
    navPendingPapers.addEventListener('click', () => { showAdminTab(secPendingPapers); window.loadPendingPapers(); });
}
if (navPendingCommon) {
    navPendingCommon.addEventListener('click', () => { showAdminTab(secPendingCommon); window.loadPendingPapers(); });
}
if (navUploadPaper) {
    navUploadPaper.addEventListener('click', () => { showAdminTab(secUploadPaper); });
}
if (navUploadCommon) {
    navUploadCommon.addEventListener('click', () => { showAdminTab(secUploadCommon); });
}

function hideExtendedViews() {
    const panels = [
        'section-change-password',
        'mgr-section-edit-papers',
        'mgr-section-view-admins',
        'mgr-section-view-feedback',
        'mgr-edit-paper-modal'
    ];
    panels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

const baseDeactivateAllViews = deactivateAllViews;
deactivateAllViews = function() {
    baseDeactivateAllViews();
    hideExtendedViews();
};

safeBindClick('manager-login-btn', () => { deactivateAllViews(); document.getElementById('manager-login-page').classList.remove('hidden2'); });
safeBindClick('bck-manager-login', () => { deactivateAllViews(); document.getElementById('login-interface').classList.remove('hidden2'); });
safeBindClick('nav-change-password', () => {
    showAdminTab(document.getElementById('section-change-password'));
});

safeBindClick('send-pwd-otp-btn', async () => {
    const currentAdminUser = document.getElementById('admin-id').value.trim();
    if(!currentAdminUser) { alert("Session identity Context Lost. Please login again."); return; }
    document.getElementById('send-pwd-otp-btn').textContent = "Requesting Secure Token...";
    try {
        const res = await fetch(`${BACKEND_URL}/api/admin-request-password-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentAdminUser })
        });
        const data = await res.json();
        if(data.success) {
            alert("🔒 Secure code sent! Check your verified administrative email address.");
            document.getElementById('pwd-otp-wrapper').classList.remove('hidden-otp-input');
            document.getElementById('submit-pwd-change-btn').disabled = false;
            document.getElementById('send-pwd-otp-btn').textContent = "Token Routed Successfully ✔";
        } else {
            alert("Error routing verification code: " + data.message);
            document.getElementById('send-pwd-otp-btn').textContent = "Step 1: Request Security OTP";
        }
    } catch {
        alert("Communications error linking to email dispatch pipeline.");
        document.getElementById('send-pwd-otp-btn').textContent = "Step 1: Request Security OTP";
    }
});

const chgPwdForm = document.getElementById('admin-change-password-form');
if(chgPwdForm) {
    chgPwdForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentAdminUser = document.getElementById('admin-id').value.trim();
        const oldPass = document.getElementById('chg-old-password').value;
        const newPass = document.getElementById('chg-new-password').value;
        const confirmPass = document.getElementById('chg-confirm-password').value;
        const otpToken = document.getElementById('chg-otp-input').value.trim();
        if (newPass !== confirmPass) { alert("Mismatch Error: New password confirmation blocks must match."); return; }
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin-commit-password-change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: currentAdminUser,
                    old_password: oldPass,
                    new_password: newPass,
                    otp: otpToken
                })
            });
            const data = await res.json();
            if(data.success) {
                alert("✨ Password changed successfully! Logging out for security verification loop.");
                chgPwdForm.reset();
                document.getElementById('pwd-otp-wrapper').classList.add('hidden-otp-input');
                document.getElementById('submit-pwd-change-btn').disabled = true;
                document.getElementById('send-pwd-otp-btn').textContent = "Step 1: Request Security OTP";
                document.getElementById('bck9').click();
            } else {
                alert("❌ Password rewrite request refused: " + data.message);
            }
        } catch { alert("Failed linking to background verification database server."); }
    });
}


const feedbackForm = document.getElementById('user-feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop standard browser page reload behavior
        const messageVal = document.getElementById('feedback-message').value.trim();
        try {
            const res = await fetch(`${BACKEND_URL}/api/submit-feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageVal })
            });
            const data = await res.json();
            if (data.success) {
                alert("👍 Feedback entry submitted successfully!");
                feedbackForm.reset(); // Clear the text area
                document.getElementById('bck-feedback').click(); // Route user back
            } else { 
                alert("Failed uploading: " + data.message); 
            }
        } catch { 
            alert("Communications error linking to server."); 
        }
    });
}


async function mgrFetchAndRenderFeedbacks() {
    const container = document.getElementById('mgr-feedback-cards-container');
    if (!container) return;
    container.innerHTML = "";
    
    const loadPara = document.createElement('p');
    loadPara.className = "msg-muted-centered";
    loadPara.textContent = "Pulling logs...";
    container.appendChild(loadPara);
    
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-get-feedback`);
        const data = await res.json();
        container.innerHTML = ""; 
        
        if (data.length === 0) {
            const noLogPara = document.createElement('p');
            noLogPara.className = "msg-muted-centered";
            noLogPara.textContent = "No user communications recorded.";
            container.appendChild(noLogPara);
            return;
        }
        
        data.forEach(f => {
            const card = document.createElement('div');
            card.className = "paper-card mgr-feedback-bubble";
            
            const metaContainer = document.createElement('div');
            metaContainer.className = "mgr-feedback-card-meta";
            
            const badgeSpan = document.createElement('span');
            badgeSpan.className = "mgr-feedback-badge";
            badgeSpan.textContent = "📩 Anonymous User Submission Statement";
            
            const tokenSpan = document.createElement('span');
            tokenSpan.className = "mgr-feedback-token";
            tokenSpan.textContent = `Log Token Track Match: #ENTRY-${f.id}`;
            
            metaContainer.appendChild(badgeSpan);
            metaContainer.appendChild(tokenSpan);
            
            const bodyParagraph = document.createElement('p');
            bodyParagraph.className = "mgr-feedback-body";
            bodyParagraph.textContent = f.message;
            
            card.appendChild(metaContainer);
            card.appendChild(bodyParagraph);
            container.appendChild(card);
        });
    } catch { 
        container.innerHTML = "";
        const errPara = document.createElement('p');
        errPara.className = "msg-muted-centered text-error-color";
        errPara.textContent = "Failed compiling incoming communications metrics streams.";
        container.appendChild(errPara);
    }
}



const mgrLoginForm = document.getElementById('manager-login-form');
if(mgrLoginForm) {
    mgrLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('mgr-username').value.trim();
        const p = document.getElementById('mgr-password').value;
        try {
            const res = await fetch(`${BACKEND_URL}/api/manager-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            const data = await res.json();
            if(data.success) {
                alert("🛡️ System Manager Identity Confirmed. Unlocking Workspace Dashboard.");
                mgrLoginForm.reset();
                deactivateAllViews();
                document.getElementById('manager-dashboard-view').classList.remove('hidden2');
                document.getElementById('mgr-nav-edit-papers').click();
            } else { alert("Access level authentication failure: " + data.message); }
        } catch { alert("Administrative authorization portal server linkage failed."); }
    });
}

safeBindClick('bck-manager-dashboard', () => {
    deactivateAllViews();
    document.getElementById('login-interface').classList.remove('hidden2');
});

function clearAllManagerTabsActiveStates() {
    document.getElementById('mgr-section-edit-papers').style.display = 'none';
    document.getElementById('mgr-section-view-admins').style.display = 'none';
    document.getElementById('mgr-section-view-feedback').style.display = 'none';
}


safeBindClick('close-mgr-edit-modal', () => { document.getElementById('mgr-edit-paper-modal').style.display = 'none'; });
safeBindClick('mgr-nav-edit-papers', () => { clearAllManagerTabsActiveStates(); document.getElementById('mgr-section-edit-papers').style.display = 'block'; mgrFetchAndRenderPapers(); });
safeBindClick('mgr-nav-view-admins', () => { clearAllManagerTabsActiveStates(); document.getElementById('mgr-section-view-admins').style.display = 'block'; mgrFetchAndRenderAdmins(); });
window.mgrMasterPapersCache = [];

async function mgrFetchAndRenderPapers() {
    const tbody = document.getElementById('mgr-published-papers-tbody');
    if(!tbody) return;
    tbody.innerHTML = "";   
    const loadingTr = document.createElement('tr');
    const loadingTd = document.createElement('td');
    loadingTd.setAttribute('colspan', '6');
    loadingTd.textContent = "Querying data repository blocks...";
    loadingTr.appendChild(loadingTd);
    tbody.appendChild(loadingTr);
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-get-all-papers`);
        window.mgrMasterPapersCache = await res.json();
        window.mgrRenderFilteredMasterPapers();
    } catch { 
        tbody.innerHTML = "";
        const errorTr = document.createElement('tr');
        const errorTd = document.createElement('td');
        errorTd.setAttribute('colspan', '6');
        errorTd.className = "text-error-centered";
        errorTd.textContent = "Error fetching documents from backend cloud arrays.";
        errorTr.appendChild(errorTd);
        tbody.appendChild(errorTr);
    }
}

window.mgrRenderFilteredMasterPapers = function() {
    const tbody = document.getElementById('mgr-published-papers-tbody');
    if(!tbody) return;  
    const yFilter = document.getElementById('mgr-filter-year').value;
    const sFilter = document.getElementById('mgr-filter-sem').value;
    const dFilter = document.getElementById('mgr-filter-dept').value;
    const targetedRows = window.mgrMasterPapersCache.filter(p => {
        const matchesY = (yFilter === 'all') || (p.academicyear === yFilter);
        const matchesS = (sFilter === 'all') || (p.semester.toString() === sFilter);
        const matchesD = (dFilter === 'all') || (p.dept.toLowerCase() === dFilter); // <--- ADD THIS LINE!
        return matchesY && matchesS && matchesD ;
    });
    tbody.innerHTML = "";
    if(targetedRows.length === 0) {
        const noDataTr = document.createElement('tr');
        const noDataTd = document.createElement('td');
        noDataTd.setAttribute('colspan', '6');
        noDataTd.textContent = "No papers match your active filter parameters.";
        noDataTr.appendChild(noDataTd);
        tbody.appendChild(noDataTr);
        return;
    }
    let sl = 1;
    targetedRows.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = "mgr-flat-border-row";
        const tdSl = document.createElement('td');
        tdSl.textContent = sl++;
        const tdYear = document.createElement('td');
        const markYear = document.createElement('mark');
        markYear.className = "mgr-year-badge";
        markYear.textContent = p.academicyear;
        tdYear.appendChild(markYear);
        const tdInfo = document.createElement('td');
        tdInfo.className = "text-left-align";
        const bSubject = document.createElement('b');
        bSubject.textContent = p.subject;
        const brElement = document.createElement('br');
        const smallMeta = document.createElement('small');
        smallMeta.className = "mgr-subtext-muted";
        smallMeta.textContent = `Stream: ${p.stream.toUpperCase()} | Dept: ${p.dept.toUpperCase()} | Type: ${p.type.toUpperCase()}`;
        tdInfo.appendChild(bSubject);
        tdInfo.appendChild(brElement);
        tdInfo.appendChild(smallMeta);
        const tdCode = document.createElement('td');
        const codeElement = document.createElement('code');
        codeElement.textContent = p.code;
        tdCode.appendChild(codeElement);
        const tdSem = document.createElement('td');
        tdSem.textContent = `Sem ${p.semester}`;
        const tdActions = document.createElement('td');
        tdActions.className = "text-right-align";
        const btnGroup = document.createElement('div');
        btnGroup.className = "moderation-btn-group mgr-right-justify";
        const btnDetails = document.createElement('button');
        btnDetails.className = "view-btn btn-review";
        btnDetails.textContent = "Details";
        btnDetails.addEventListener('click', () => window.mgrTriggerDetailsPopup(p));
        const btnEdit = document.createElement('button');
        btnEdit.className = "view-btn btn-approve";
        btnEdit.textContent = "Edit";
        btnEdit.addEventListener('click', () => window.mgrTriggerEditModal(p));
        const btnDelete = document.createElement('button');
        btnDelete.className = "view-btn btn-reject";
        btnDelete.textContent = "Delete";
        btnDelete.addEventListener('click', () => window.mgrExecuteDeletion(p.id));
        btnGroup.appendChild(btnDetails);
        btnGroup.appendChild(btnEdit);
        btnGroup.appendChild(btnDelete);
        tdActions.appendChild(btnGroup);
        tr.appendChild(tdSl);
        tr.appendChild(tdYear);
        tr.appendChild(tdInfo);
        tr.appendChild(tdCode);
        tr.appendChild(tdSem);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
};

document.getElementById('mgr-filter-year').addEventListener('change', window.mgrRenderFilteredMasterPapers);
document.getElementById('mgr-filter-sem').addEventListener('change', window.mgrRenderFilteredMasterPapers);
document.getElementById('mgr-filter-dept').addEventListener('change', window.mgrRenderFilteredMasterPapers);


window.mgrTriggerDetailsPopup = function(p) {
    alert(`📄 QUESTION PAPER DETAILS CARD\n------------------------------------\nSubject Name: ${p.subject}\nSubject Code: ${p.code}\nAcademic Year: ${p.academicyear}\nSemester Track: Semester ${p.semester}\nStream Layout: ${p.stream.toUpperCase()}\nDepartment: ${p.dept.toUpperCase()}\n\n☁️ CLOUD MANAGEMENT AUDITING MARKS\n------------------------------------\nDirect Resource URL: ${p.fileurl}\nPublished/Uploaded By: ${p.published_by || 'Original Master Administrator'}\nApproved/Reviewed By: ${p.approved_by || 'Core System Automated Verification'}`);
};

window.mgrTriggerEditModal = function(p) {
    document.getElementById('mgr-edit-id').value = p.id;
    document.getElementById('mgr-edit-year').value = p.academicyear;
    document.getElementById('mgr-edit-subject').value = p.subject;
    document.getElementById('mgr-edit-code').value = p.code;
    document.getElementById('mgr-edit-url').value = p.fileurl;
    document.getElementById('mgr-edit-paper-modal').style.display = 'flex';
};

document.getElementById('mgr-edit-paper-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        id: document.getElementById('mgr-edit-id').value,
        academicYear: document.getElementById('mgr-edit-year').value.trim(),
        subject: document.getElementById('mgr-edit-subject').value.trim(),
        code: document.getElementById('mgr-edit-code').value.trim(),
        fileUrl: document.getElementById('mgr-edit-url').value.trim(),
    };
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-modify-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
            alert("✨ Document records edited successfully!");
            document.getElementById('mgr-edit-paper-modal').style.display = 'none';
            mgrFetchAndRenderPapers();
        } else { alert("Adjustment Refused: " + data.message); }
    } catch { alert("Failed rewriting database storage structural entry rows."); }
});

window.mgrExecuteDeletion = async function(id) {
    const confirmPass = prompt("⚠️ CRITICAL OPERATIONS DIRECTIVE:\nErasures are permanent. Please input your personal Manager Security Password to continue:");
    if(!confirmPass) return;
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-delete-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, manager_password: confirmPass })
        });
        const data = await res.json();
        if(data.success) {
            alert(data.message);
            mgrFetchAndRenderPapers();
        } else { alert("Deletion Terminated: " + data.message); }
    } catch { alert("Communications failure to transactional backend structural tables."); }
};

async function mgrFetchAndRenderAdmins() {
    const tbody = document.getElementById('mgr-active-admins-tbody');
    if(!tbody) return;
    tbody.innerHTML = "";    
    const loadingTr = document.createElement('tr');
    const loadingTd = document.createElement('td');
    loadingTd.setAttribute('colspan', '5');
    loadingTd.textContent = "Retrieving active profile configurations...";
    loadingTr.appendChild(loadingTd);
    tbody.appendChild(loadingTr);
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-get-admins`);
        const admins = await res.json();
        tbody.innerHTML = "";       
        if(admins.length === 0) {
            const noAdminsTr = document.createElement('tr');
            const noAdminsTd = document.createElement('td');
            noAdminsTd.setAttribute('colspan', '5');
            noAdminsTd.textContent = "No administrators indices have been compiled yet.";
            noAdminsTr.appendChild(noAdminsTd);
            tbody.appendChild(noAdminsTr);
            return;
        }
        admins.forEach(a => {
            const tr = document.createElement('tr');
            tr.className = "mgr-flat-border-row";
            const tdName = document.createElement('td');
            tdName.className = "text-left-align";
            const bName = document.createElement('b');
            bName.textContent = a.name;
            const brNode = document.createElement('br');
            const smallCollege = document.createElement('small');
            smallCollege.className = "mgr-subtext-muted";
            smallCollege.textContent = a.college;
            tdName.appendChild(bName);
            tdName.appendChild(brNode);
            tdName.appendChild(smallCollege);
            const tdUser = document.createElement('td');
            const codeUser = document.createElement('code');
            codeUser.textContent = a.username;
            tdUser.appendChild(codeUser);
            const tdEmail = document.createElement('td');
            tdEmail.className = "text-left-align class-monospace-text";
            tdEmail.textContent = a.email || 'N/A';
            const tdSpec = document.createElement('td');
            tdSpec.className = "text-left-align";
            tdSpec.textContent = `${a.subject} (${a.stream.toUpperCase()})`;
            const tdActions = document.createElement('td');
            const btnGroup = document.createElement('div');
            btnGroup.className = "moderation-btn-group";
            btnGroup.style.justifyContent = "center"; // <-- Centers the buttons!
            const btnDetails = document.createElement('button');
            btnDetails.className = "view-btn btn-review";
            btnDetails.textContent = "View admin details";
            btnDetails.addEventListener('click', () => window.mgrInspectAdminFullStats(a));
            const btnPub = document.createElement('button');
            btnPub.className = "view-btn btn-approve";
            btnPub.textContent = "View papers published by the admin";
            btnPub.addEventListener('click', () => window.mgrViewAdminContributions(a.username, 'published'));
            const btnApp = document.createElement('button');
            btnApp.className = "view-btn btn-review btn-purple-override";
            btnApp.textContent = "View papers approved by the admin";
            btnApp.addEventListener('click', () => window.mgrViewAdminContributions(a.username, 'approved'));
            const btnRemove = document.createElement('button');
            btnRemove.className = "view-btn btn-reject";
            btnRemove.textContent = "Remove as Admin";
            btnRemove.addEventListener('click', () => window.mgrEraseAdmin(a.username));
            btnGroup.appendChild(btnDetails);
            btnGroup.appendChild(btnPub);
            btnGroup.appendChild(btnApp);
            btnGroup.appendChild(btnRemove);
            tdActions.appendChild(btnGroup)
            tr.appendChild(tdName);
            tr.appendChild(tdUser);
            tr.appendChild(tdEmail);
            tr.appendChild(tdSpec);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    } catch { 
        tbody.innerHTML = "";
        const errorTr = document.createElement('tr');
        const errorTd = document.createElement('td');
        errorTd.setAttribute('colspan', '5');
        errorTd.className = "text-error-centered";
        errorTd.textContent = "Failed pulling active profiles index mapping configurations.";
        errorTr.appendChild(errorTd);
        tbody.appendChild(errorTr);
    }}

window.mgrInspectAdminFullStats = function(a) {
    alert(`👤 INSTITUTIONAL ADMINISTRATOR PROFILE IDENT SHEET\n------------------------------------\nFull Name Location: ${a.name}\nAdmin System Username ID: ${a.username}\nVerified Contact Email: ${a.email}\nCollege/Institution: ${a.college}\nAcademic Program Stream: ${a.stream.toUpperCase()}\nSpecialization Department: ${a.subject}\nExpected Year of Graduation: ${a.passyear}\n\n📊 SYSTEM TRACKING PERFORMANCE SCORECARDS\n------------------------------------\nPapers Directly Published / Uploaded: ${a.papers_published_count || 0}\nPapers Moderated & Approved Out of Queue: ${a.papers_approved_count || 0}`);
};

window.mgrViewAdminContributions = async function(username, targetActionType) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-get-admin-contributions?username=${username}&type=${targetActionType}`);
        const data = await res.json();
        let reportStr = `📦 FILE MATRIX FOOTPRINT TRACE: ${username.toUpperCase()} (${targetActionType.toUpperCase()})\n--------------------------------------------------\n`;
        if(data.length === 0) {
            reportStr += "No operations data records exist inside tracking logs for this configuration path parameters.";
        } else {
            let itemIndex = 1;
            data.forEach(p => {
                reportStr += `${itemIndex++}. [Semester ${p.semester}] ${p.subject} (${p.code}) - Academic Year: ${p.academicyear}\n`;
            });
        }
        alert(reportStr);
    } catch { alert("Failed compiling tracking logs for the selected administrative profile."); }
};

window.mgrEraseAdmin = async function(username) {
    if(!confirm(`🚨 WARNING - REVOKING ACCOUNT CLEARANCE:\nAre you completely certain you want to permanently delete the admin profile for '${username}'?`)) return;
    try {
        const res = await fetch(`${BACKEND_URL}/api/manager-remove-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        });
        const data = await res.json();
        if(data.success) {
            alert(`Account wiped successfully!`);
            mgrFetchAndRenderAdmins();
        } else { alert("Operation error: " + data.message); }
    } catch { alert("Error connecting to database core configuration registers."); }
};
