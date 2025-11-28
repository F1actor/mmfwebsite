// --- SAHTE VERİTABANI ---
let requests = [
    { id: 101, date: '28.11.2025', user: 'Ahmet Yılmaz', issue: 'Kalorifer su akıtıyor', status: 0 },
    { id: 102, date: '28.11.2025', user: 'Ayşe Demir', issue: 'Priz çalışmıyor', status: 0 }
];

// DEĞİŞKENLER
let pendingDeleteId = null; // Silinecek ID'yi burada tutacağız

// ELEMENTLER
const loginView = document.getElementById('login-view');
const mainApp = document.getElementById('main-app');
const adminView = document.getElementById('admin-view');
const formView = document.getElementById('form-view');
const myRequestsView = document.getElementById('my-requests-view');
const loadingScreen = document.getElementById('loading-screen');
const modalOverlay = document.getElementById('custom-modal');
const confirmationModal = document.getElementById('confirmation-modal');

// YÜKLEME VE MODALLER
function showLoading(text, callback) {
    document.getElementById('loading-text').innerText = text;
    loadingScreen.classList.remove('hidden');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        if (callback) callback();
    }, 800);
}

function showModal(title, message, type) {
    const iconDiv = document.getElementById('modal-icon');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    
    if (type === 'success') {
        iconDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        iconDiv.className = 'modal-icon success';
    } else if (type === 'error') {
        iconDiv.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        iconDiv.className = 'modal-icon error';
    } else {
        iconDiv.innerHTML = '<i class="fa-solid fa-info-circle"></i>';
        iconDiv.className = 'modal-icon info';
    }
    modalOverlay.classList.remove('hidden');
}

function closeModal() { modalOverlay.classList.add('hidden'); }

// SİLME ONAY MODALI FONKSİYONLARI
function closeConfirmModal() {
    confirmationModal.classList.add('hidden');
    pendingDeleteId = null;
}

function confirmDeleteAction() {
    if (pendingDeleteId !== null) {
        // Gerçek silme işlemi burada yapılıyor
        requests = requests.filter(r => r.id !== pendingDeleteId);
        
        closeConfirmModal(); // Onay penceresini kapat
        
        // Başarı mesajını göster
        showModal("Silindi", "Talep başarıyla silindi.", "info");
        
        renderAdminTable(); // Tabloyu yenile
    }
}


// GİRİŞ İŞLEMLERİ
function switchTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').reset();
    document.getElementById('login-type').value = type;
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const loginType = document.getElementById('login-type').value;

    if (loginType === 'personel') {
        if (username === 'personel' && pass === '1234') {
            showLoading("Personel Paneli Yükleniyor...", () => {
                loginView.classList.add('hidden');
                mainApp.classList.remove('hidden');
                document.getElementById('user-display-personel').innerText = `Hoşgeldiniz, Personel`;
            });
        } else { showModal("Hata", "Kullanıcı adı veya şifre yanlış!", "error"); }
    } else {
        if (username === 'admin' && pass === '1234') {
            showLoading("Yönetici Paneli Hazırlanıyor...", () => {
                loginView.classList.add('hidden');
                adminView.classList.remove('hidden');
                document.getElementById('user-display-admin').innerText = `Hoşgeldiniz, Admin`;
                renderAdminTable();
            });
        } else { showModal("Hata", "Admin bilgileri yanlış!", "error"); }
    }
}

function logout() {
    mainApp.classList.add('hidden');
    adminView.classList.add('hidden');
    formView.classList.add('hidden');
    myRequestsView.classList.add('hidden');
    showLoading("Çıkış Yapılıyor...", () => {
        loginView.classList.remove('hidden');
        document.getElementById('login-form').reset();
    });
}

// FORM İŞLEMLERİ
function startFormProcess(categoryName) {
    showLoading("Form Hazırlanıyor...", () => {
        mainApp.classList.add('hidden');
        formView.classList.remove('hidden');
        document.getElementById('subject').value = categoryName;
        document.getElementById('selected-category').value = categoryName;
        window.scrollTo(0,0);
    });
}

function goBack() {
    formView.classList.add('hidden');
    mainApp.classList.remove('hidden');
    document.getElementById('complaint-form').reset();
}

function submitForm(event) {
    event.preventDefault();
    const category = document.getElementById('selected-category').value;
    const name = document.getElementById('fullname').value;
    const desc = document.getElementById('message').value;

    const newReq = {
        id: Math.floor(Math.random() * 1000) + 100,
        date: new Date().toLocaleDateString('tr-TR'),
        user: name,
        issue: `${category} - ${desc.substring(0, 20)}...`,
        status: 0
    };
    requests.push(newReq);

    showLoading("Talebiniz Gönderiliyor...", () => {
        showModal("Başarılı", "Şikayetiniz oluşturuldu ve yöneticiye iletildi.", "success");
        document.getElementById('complaint-form').reset();
        setTimeout(() => { goBack(); }, 2000);
    });
}

// TALEPLERİM SAYFASI
function openMyRequests() {
    showLoading("Talepleriniz Getiriliyor...", () => {
        mainApp.classList.add('hidden');
        myRequestsView.classList.remove('hidden');
        renderPersonelRequests();
    });
}

function closeMyRequests() {
    myRequestsView.classList.add('hidden');
    mainApp.classList.remove('hidden');
}

function renderPersonelRequests() {
    const container = document.getElementById('requests-container');
    container.innerHTML = "";
    if (requests.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Henüz bir talebiniz bulunmamaktadır.</p>";
        return;
    }
    requests.forEach(req => {
        let s1 = "active", s2 = "", s3 = "", s4 = "";
        if (req.status >= 1) s2 = "active";
        if (req.status >= 2) s3 = "active";
        if (req.status >= 3) s4 = "active";

        const card = `
        <div class="request-card">
            <div class="request-header"><span>Konu: ${req.issue}</span><span>Tarih: ${req.date}</span></div>
            <div class="progress-track">
                <div class="step ${s1}"><div class="step-circle">1</div><div class="step-label">Talep Alındı</div></div>
                <div class="step ${s2}"><div class="step-circle">2</div><div class="step-label">Onaylandı</div></div>
                <div class="step ${s3}"><div class="step-circle">3</div><div class="step-label">Tamirde</div></div>
                <div class="step ${s4}"><div class="step-circle">4</div><div class="step-label">Sonuçlandı</div></div>
            </div>
        </div>`;
        container.innerHTML += card;
    });
}

// ADMIN YÖNETİMİ
function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = "";
    requests.forEach(req => {
        let statusHtml = "";
        let actionHtml = "";

        if (req.status === 0) {
            statusHtml = '<span class="status-badge pending">Bekliyor</span>';
            actionHtml = `<button class="btn-approve" onclick="updateStatus(${req.id}, 1)"><i class="fa-solid fa-check"></i> Onayla</button> <button class="btn-delete" onclick="deleteRequest(${req.id})"><i class="fa-solid fa-trash"></i> Sil</button>`;
        } else if (req.status === 1) {
            statusHtml = '<span class="status-badge approved">Onaylandı</span>';
            actionHtml = `<button class="btn-repair" onclick="updateStatus(${req.id}, 2)"><i class="fa-solid fa-wrench"></i> Tamir Ediliyor</button> <button class="btn-delete" onclick="deleteRequest(${req.id})"><i class="fa-solid fa-trash"></i> Sil</button>`;
        } else if (req.status === 2) {
            statusHtml = '<span class="status-badge repair">Tamirde</span>';
            actionHtml = `<button class="btn-finish" onclick="updateStatus(${req.id}, 3)"><i class="fa-solid fa-check-double"></i> İşlem Bitti</button> <button class="btn-delete" onclick="deleteRequest(${req.id})"><i class="fa-solid fa-trash"></i> Sil</button>`;
        } else if (req.status === 3) {
            statusHtml = '<span class="status-badge done">Bitti</span>';
            actionHtml = `<span style="color:green; font-weight:bold;">✔ İşlem Tamamlandı</span>`;
        }

        const row = `<tr id="row-${req.id}"><td>${req.date}</td><td>${req.user}</td><td>${req.issue}</td><td>${statusHtml}</td><td><button class="view-photo-btn"><i class="fa-solid fa-image"></i> Gör</button></td><td class="action-buttons">${actionHtml}</td></tr>`;
        tbody.innerHTML += row;
    });
}

function updateStatus(id, newStatus) {
    const req = requests.find(r => r.id === id);
    if (req) {
        req.status = newStatus;
        let msg = "";
        if(newStatus === 1) msg = "Talep onaylandı, kullanıcı bilgilendirildi.";
        if(newStatus === 2) msg = "Tamir süreci başlatıldı.";
        if(newStatus === 3) msg = "İşlem başarıyla tamamlandı.";
        showModal("Güncellendi", msg, "success");
        renderAdminTable();
    }
}

function deleteRequest(id) {
    // SİLME BUTONUNA BASINCA ARTIK DIREK SİLMİYORUZ
    // ID'yi kaydedip Modalı açıyoruz
    pendingDeleteId = id;
    confirmationModal.classList.remove('hidden');
}