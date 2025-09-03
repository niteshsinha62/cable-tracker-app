// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyA0BBrvVfbg13i5BDyFgS4_IapoHYhbEks",
    authDomain: "cableworktracker.firebaseapp.com",
    projectId: "cableworktracker",
    storageBucket: "cableworktracker.appspot.com",
    messagingSenderId: "363803214900",
    appId: "1:363803214900:web:d65d39ec958a31e7533661"
};
const ADMIN_UID = "6suqqzr9j8gCUqEAHk4jEA1x1AA2";

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dzcvp4zor";
const CLOUDINARY_UPLOAD_PRESET = "cable-tracker-preset";

// --- Firebase Initialization ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const loginView = document.getElementById('login-view'),
      staffView = document.getElementById('staff-view'),
      adminContainer = document.getElementById('admin-container'),
      dashboardView = document.getElementById('dashboard-view'),
      mapView = document.getElementById('map-view'),
      analyticsView = document.getElementById('analytics-view'),
      loginBtn = document.getElementById('login-btn'),
      emailInput = document.getElementById('email'),
      passwordInput = document.getElementById('password'),
      loginError = document.getElementById('login-error'),
      submitJobBtn = document.getElementById('submit-job-btn'),
      cancelJobBtn = document.getElementById('cancel-job-btn'),
      jobList = document.getElementById('job-list'),
      dashboardTableBody = document.getElementById('dashboard-table-body'),
      searchInput = document.getElementById('search-input'),
      photoInput = document.getElementById('photo'),
      imagePreviewContainer = document.getElementById('image-preview-container'),
      staffNameInput = document.getElementById('staff-name'),
      jobTypeInput = document.getElementById('job-type'),
      serviceAreaInput = document.getElementById('service-area'),
      landmarkInput = document.getElementById('landmark'),
      junctionAddressInput = document.getElementById('junction-address'),
      jobNotesInput = document.getElementById('job-notes'),
      areaFilterInput = document.getElementById('area-filter'),
      jobTypeFilterInput = document.getElementById('job-type-filter'),
      staffNameFilterInput = document.getElementById('staff-name-filter'),
      mapAreaFilter = document.getElementById('map-area-filter'),
      mapSearchInput = document.getElementById('map-search-input'),
      mapListInfo = document.getElementById('map-list-info'),
      openCameraBtn = document.getElementById('open-camera-btn'),
      cameraView = document.getElementById('camera-view'),
      cameraStream = document.getElementById('camera-stream'),
      cameraCanvas = document.getElementById('camera-canvas'),
      captureBtn = document.getElementById('capture-btn'),
      cancelCameraBtn = document.getElementById('cancel-camera-btn'),
      langSwitcherStaff = document.getElementById('language-switcher-staff'),
      viewMapBtn = document.getElementById('view-map-btn'),
      viewAnalyticsBtn = document.getElementById('view-analytics-btn'),
      backToDashboardBtn = document.getElementById('back-to-dashboard-btn'),
      backToDashboardBtn2 = document.getElementById('back-to-dashboard-btn2'),
      analyticsPeriod = document.getElementById('analytics-period'),
      analyticsResults = document.getElementById('analytics-results'),
      successModal = document.getElementById('success-modal'),
      okBtn = document.getElementById('ok-btn'),
      currentLocationBtn = document.getElementById('current-location-btn'),
      currentLocationBtnText = document.getElementById('current-location-btn-text'),
      currentLocationLoader = document.getElementById('current-location-loader'),
      locationSearchInput = document.getElementById('location-search-input'),
      locationSection = document.getElementById('location-section'),
      imageModal = document.getElementById('image-modal'),
      closeImageModal = document.getElementById('close-image-modal'),
      modalImage = document.getElementById('modal-image'),
      prevImageBtn = document.getElementById('prev-image-btn'),
      nextImageBtn = document.getElementById('next-image-btn'),
      downloadImageBtn = document.getElementById('download-image-btn'),
      customDateRange = document.getElementById('custom-date-range'),
      startDateInput = document.getElementById('start-date'),
      endDateInput = document.getElementById('end-date'),
      exportMenuBtn = document.getElementById('export-menu-btn'),
      exportOptions = document.getElementById('export-options'),
      exportExcelBtn = document.getElementById('export-excel-btn'),
      exportPdfBtn = document.getElementById('export-pdf-btn'),
      deleteModal = document.getElementById('delete-modal'),
      cancelDeleteBtn = document.getElementById('cancel-delete-btn'),
      confirmDeleteBtn = document.getElementById('confirm-delete-btn'),
      deleteBtnText = document.getElementById('delete-btn-text'),
      deleteBtnLoader = document.getElementById('delete-btn-loader'),
      updateModal = document.getElementById('update-modal'),
      cancelUpdateBtn = document.getElementById('cancel-update-btn'),
      confirmUpdateBtn = document.getElementById('confirm-update-btn'),
      updateBtnText = document.getElementById('update-btn-text'),
      updateBtnLoader = document.getElementById('update-btn-loader'),
      dashboardPeriod = document.getElementById('dashboard-period'),
      dashboardCustomDateRange = document.getElementById('dashboard-custom-date-range'),
      dashboardStartDate = document.getElementById('dashboard-start-date'),
      dashboardEndDate = document.getElementById('dashboard-end-date');

// --- State Variables ---
let googleMap, currentInfoWindow = null, markers = [];
let staffMap, staffMarker;
let allJobs = [], currentFilteredJobs = [], currentStream = null, filesToUpload = [],
    selectedLocation = null, currentSort = { key: 'timestamp', dir: 'desc' },
    modalImages = [], currentModalImageIndex = 0, isInitialLoad = true,
    jobToDelete = null, staffViewInitialized = false,
    jobToEdit = null, isEditMode = false;

// Landmark data
const landmarkData = {
    "KURTHOUL": ["RAJPUTANA", "CHAKIYA PAR", "GYATRI NAGAR", "PASURAMCHAK", "NATHUPUR", "BADHAI TOAL", "RAMESH COLONY", "RAM NAGAR", "MAMTA DHAM", "CHURA MILL", "SCHIDANAND COLONY", "RJESHWAR BIHAR COLONY", "20 FEET", "SHIV NAGAR", "DARIYAPUR", "SADDILICHAK", "BRAHAMASHTHAN", "ADARSH COLONY"],
    "SAMPATCHAK": ["GOPALPUR", "GOPALPUR BAGICHA", "SOHGI", "RAMPUR", "AZIMCHAK", "BANDOH PAR", "NAHAR PAR", "GOSAIMATH", "ABDULLAHCHAK", "JANAKPUR", "FATEHPUR", "SAMPATCHAK GAUN", "PANCHRUKHIYA", "KUSH PAR", "JAGDAMBA NAGAR", "CHIPURA"],
    "SIPARA": []
};

// --- Language Translations ---
const translations = {
    en: {
        loginTitle: "Cable Operations Portal", email: "Email", password: "Password", login: "Login",
        recordJobActivity: "Record Job Activity", logout: "Logout", jobType: "Job Type",
        selectJobType: "Select a job type...", installation: "Installation", maintenance: "Maintenance",
        repair: "Repair", serviceArea: "Service Area", selectServiceArea: "Select a service area...",
        cableJunctionAddressLabel: "Cable Junction Address", junctionAddressPlaceholder: "e.g., House #123, Near Water Tank",
        customerDetailsLabel: "Customer Details / Job Notes", customerDetailsPlaceholder: "Enter customer details and job notes...",
        attachments: "Attachments", uploadPhoto: "Upload Photo", takePhoto: "Take Photo",
        capturePhoto: "Capture Photo", cancel: "Cancel", submit: "Submit", update: "Update",
        jobList: "Job List", allAreas: "All Areas", searchPlaceholder: "Search by address, staff, notes...",
        navigate: "Navigate", shareLocation: "Share Location", sharePhoto: "Share Photo",
        copied: "Copied!", noAddress: "No Address", noMatchingJobs: "No matching jobs found.",
        successTitle: "Success!", successMessage: "Successfully logged your work.", newEntry: "New Entry",
        updateSuccessMessage: "Job record updated successfully.",
        staffNameLabel: "Name", staffNamePlaceholder: "Enter your full name",
        landmarkLabel: "Landmark", jobLocationLabel: "Job Location",
        jobLocationPlaceholder: "Search for a location...", useCurrentLocation: "Use Current Location",
        SAMPATCHAK: "SAMPATCHAK", KURTHOUL: "KURTHOUL", SIPARA: "SIPARA",
        RAJPUTANA: "RAJPUTANA", "CHAKIYA PAR": "CHAKIYA PAR", "GYATRI NAGAR": "GYATRI NAGAR", PASURAMCHAK: "PASURAMCHAK", NATHUPUR: "NATHUPUR", "BADHAI TOAL": "BADHAI TOAL", "RAMESH COLONY": "RAMESH COLONY", "RAM NAGAR": "RAM NAGAR", "MAMTA DHAM": "MAMTA DHAM", "CHURA MILL": "CHURA MILL", "SCHIDANAND COLONY": "SCHIDANAND COLONY", "RJESHWAR BIHAR COLONY": "RJESHWAR BIHAR COLONY", "20 FEET": "20 FEET", "SHIV NAGAR": "SHIV NAGAR", DARIYAPUR: "DARIYAPUR", "SADDILICHAK": "SADDILICHAK", BRAHAMASHTHAN: "BRAHAMASHTHAN", "ADARSH COLONY": "ADARSH COLONY",
        GOPALPUR: "GOPALPUR", "GOPALPUR BAGICHA": "GOPALPUR BAGICHA", SOHGI: "SOHGI", RAMPUR: "RAMPUR", AZIMCHAK: "AZIMCHAK", "BANDOH PAR": "BANDOH PAR", "NAHAR PAR": "NAHAR PAR", GOSAIMATH: "GOSAIMATH", ABDULLAHCHAK: "ABDULLAHCHAK", JANAKPUR: "JANAKPUR", FATEHPUR: "FATEHPUR", "SAMPATCHAK GAUN": "SAMPATCHAK GAUN", PANCHRUKHIYA: "PANCHRUKHIYA", "KUSH PAR": "KUSH PAR", "JAGDAMBA NAGAR": "JAGDAMBA NAGAR"
    },
    hi: {
        loginTitle: "केबल संचालन पोर्टल", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन",
        recordJobActivity: "जॉब गतिविधि रिकॉर्ड करें", logout: "लॉगआउट", jobType: "जॉब का प्रकार",
        selectJobType: "जॉब का प्रकार चुनें...", installation: "इंस्टॉलेशन", maintenance: "रखरखाव",
        repair: "मरम्मत", serviceArea: "सेवा क्षेत्र", selectServiceArea: "सेवा क्षेत्र चुनें...",
        cableJunctionAddressLabel: "केबल जंक्शन पता", junctionAddressPlaceholder: "उदा., घर #123, पानी की टंकी के पास",
        customerDetailsLabel: "ग्राहक विवरण / जॉब नोट्स", customerDetailsPlaceholder: "ग्राहक विवरण और जॉब नोट्स दर्ज करें...",
        attachments: "अटैचमेंट्स", uploadPhoto: "फोटो अपलोड करें", takePhoto: "फोटो लें",
        capturePhoto: "फोटो खींचे", cancel: "रद्द करें", submit: "सबमिट करें", update: "अपडेट करें",
        jobList: "जॉब सूची", allAreas: "सभी क्षेत्र", searchPlaceholder: "पता, कर्मचारी, नोट्स द्वारा खोजें...",
        navigate: "नेविगेट", shareLocation: "स्थान साझा करें", sharePhoto: "फोटो साझा करें",
        copied: "कॉपी किया गया!", noAddress: "कोई पता नहीं", noMatchingJobs: "कोई मेल खाने वाली नौकरी नहीं मिली।",
        successTitle: "सफलता!", successMessage: "आपका काम सफलतापूर्वक लॉग हो गया।", newEntry: "नई प्रविष्टि",
        updateSuccessMessage: "जॉब रिकॉर्ड सफलतापूर्वक अपडेट किया गया।",
        staffNameLabel: "नाम", staffNamePlaceholder: "अपना पूरा नाम दर्ज करें",
        landmarkLabel: "लैंडमार्क", jobLocationLabel: "जॉब लोकेशन",
        jobLocationPlaceholder: "स्थान खोजें...", useCurrentLocation: "वर्तमान स्थान का उपयोग करें",
        SAMPATCHAK: "संपतचक", KURTHOUL: "कुरथौल", SIPARA: "सिपारा",
        RAJPUTANA: "राजपुताना", "CHAKIYA PAR": "चकिया पार", "GYATRI NAGAR": "गायत्री नगर", PASURAMCHAK: "परशुरामचक", NATHUPUR: "नाथूपुर", "BADHAI TOAL": "बधाई टोल", "RAMESH COLONY": "रमेश कॉलोनी", "RAM NAGAR": "राम नगर", "MAMTA DHAM": "ममता धाम", "CHURA MILL": "चुरा मिल", "SCHIDANAND COLONY": "सच्चिदानंद कॉलोनी", "RJESHWAR BIHAR COLONY": "राजेश्वर बिहार कॉलोनी", "20 FEET": "20 फीट", "SHIV NAGAR": "शिव नगर", DARIYAPUR: "दरियापुर", SADDILICHAK: "सद्दीलिचक", BRAHAMASHTHAN: "ब्रह्मस्थान", "ADARSH COLONY": "आदर्श कॉलोनी",
        GOPALPUR: "गोपालपुर", "GOPALPUR BAGICHA": "गोपालपुर बगीचा", SOHGI: "सोहगी", RAMPUR: "रामपुर", AZIMCHAK: "अजीमचक", "BANDOH PAR": "बंदोह पार", "NAHAR PAR": "नहर पार", GOSAIMATH: "गोसाईमठ", ABDULLAHCHAK: "अब्दुल्लाहचक", JANAKPUR: "जनकपुर", FATEHPUR: "फतेहपुर", "SAMPATCHAK GAUN": "संपतचक गांव", PANCHRUKHIYA: "पंचरुखिया", "KUSH PAR": "कुश पार", "JAGDAMBA NAGAR": "जगदंबा नगर"
    }
};

function setLanguage(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-key-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });

    const selectedServiceArea = serviceAreaInput.value;
    Array.from(serviceAreaInput.options).forEach(option => {
        option.textContent = translations[lang][option.value];
    });
    serviceAreaInput.value = selectedServiceArea;
    populateLandmarks();

    localStorage.setItem('language', lang);
    langSwitcherStaff.value = lang;
}

// --- Authentication & Page Routing ---
onAuthStateChanged(auth, user => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    if (user) {
        loginView.classList.add('hidden');
        if (user.uid === ADMIN_UID) {
            adminContainer.classList.remove('hidden');
            staffView.classList.add('hidden');
            initAdminView();
        } else {
            staffView.classList.remove('hidden');
            adminContainer.classList.add('hidden');
            initStaffView(user);
        }
    } else {
        loginView.classList.remove('hidden');
        staffView.classList.add('hidden');
        adminContainer.add('hidden');
    }
});

function setupLogoutButtons() {
    document.getElementById('logout-btn-staff').addEventListener('click', () => {
        localStorage.setItem('language', 'en');
        signOut(auth);
    });
    document.getElementById('logout-btn-admin').addEventListener('click', () => {
        localStorage.setItem('language', 'en');
        signOut(auth);
    });
}

// --- Staff View Logic ---
function clearStaffForm() {
    ['staff-name', 'job-type', 'landmark', 'junction-address', 'job-notes', 'photo', 'location-search-input'].forEach(id => document.getElementById(id).value = '');
    serviceAreaInput.value = 'SAMPATCHAK';
    ['staff-name-error', 'job-type-error', 'service-area-error', 'landmark-error', 'photo-error', 'location-error', 'job-notes-error'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '';
        el.classList.add('hidden');
    });
    filesToUpload = [];
    imagePreviewContainer.innerHTML = '';
    stopCameraStream();
    selectedLocation = null;
    locationSection.classList.remove('hidden');
    if (staffMap) {
        const defaultCenter = { lat: 20.5937, lng: 78.9629 };
        staffMap.setCenter(defaultCenter);
        staffMap.setZoom(5);
        if (staffMarker) staffMarker.setMap(null);
    }
    populateLandmarks();
    
    // Reset edit mode state
    isEditMode = false;
    jobToEdit = null;
    document.getElementById('staff-view-title').textContent = "Record Job Activity";
    document.getElementById('submit-job-text').textContent = "Submit";
}

function stopCameraStream() {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    cameraView.classList.add('hidden');
}

function renderPreviews(filesOrUrls) {
    imagePreviewContainer.innerHTML = '';
    filesOrUrls.forEach((item, index) => {
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'relative';

        const removeBtn = document.createElement('button');
        removeBtn.dataset.index = index;
        removeBtn.className = 'remove-img-btn absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10';
        removeBtn.innerHTML = '&times;';
        previewWrapper.appendChild(removeBtn);

        const img = document.createElement('img');
        img.className = 'w-full h-24 object-cover rounded-lg';
        
        if (typeof item === 'string') { // It's a URL
            img.src = item;
            removeBtn.dataset.url = item; // Store URL for removal
        } else { // It's a File object
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            }
            reader.readAsDataURL(item);
        }
        
        previewWrapper.appendChild(img);
        imagePreviewContainer.appendChild(previewWrapper);
    });
}


function populateLandmarks() {
    const selectedArea = serviceAreaInput.value;
    const landmarks = landmarkData[selectedArea] || [];
    const lang = localStorage.getItem('language') || 'en';
    landmarkInput.innerHTML = '';
    if (landmarks.length > 0) {
        landmarks.forEach(landmark => {
            const option = document.createElement('option');
            option.value = landmark;
            option.textContent = translations[lang][landmark] || landmark;
            landmarkInput.appendChild(option);
        });
        landmarkInput.disabled = false;
    } else {
        const option = document.createElement('option');
        option.textContent = 'No landmarks available';
        landmarkInput.appendChild(option);
        landmarkInput.disabled = true;
    }
}

function initStaffView(user) {
    populateLandmarks();
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkGoogle);
            if (!staffMap) {
                initStaffMapAndAutocomplete();
            }
        }
    }, 100);

    if (!staffViewInitialized) {
        photoInput.addEventListener('change', (e) => {
            filesToUpload.push(...e.target.files);
            const currentImages = Array.from(imagePreviewContainer.querySelectorAll('img')).map(img => img.src);
            renderPreviews([...currentImages, ...filesToUpload.filter(f => typeof f !== 'string')]);
            document.getElementById('photo-error').classList.add('hidden');
        });
        openCameraBtn.addEventListener('click', async () => {
            try {
                currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                cameraView.classList.remove('hidden');
                cameraStream.srcObject = currentStream;
            } catch (err) { console.error("Error accessing camera:", err); }
        });
        captureBtn.addEventListener('click', () => {
            const context = cameraCanvas.getContext('2d');
            cameraCanvas.width = cameraStream.videoWidth;
            cameraCanvas.height = cameraStream.videoHeight;
            context.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);
            cameraCanvas.toBlob(blob => {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                filesToUpload.push(file);
                const currentImages = Array.from(imagePreviewContainer.querySelectorAll('img')).map(img => img.src);
                renderPreviews([...currentImages, ...filesToUpload.filter(f => typeof f !== 'string')]);
                stopCameraStream();
                document.getElementById('photo-error').classList.add('hidden');
            }, 'image/jpeg', 0.9);
        });
        staffViewInitialized = true;
    }
}

function initStaffMapAndAutocomplete() {
    const defaultCenter = { lat: 20.5937, lng: 78.9629 };
    staffMap = new google.maps.Map(document.getElementById('staff-map'), {
        center: defaultCenter,
        zoom: 5,
        disableDefaultUI: true,
    });

    const autocomplete = new google.maps.places.Autocomplete(locationSearchInput);
    autocomplete.bindTo('bounds', staffMap);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            console.log("No details available for input: '" + place.name + "'");
            return;
        }

        if (place.geometry.viewport) {
            staffMap.fitBounds(place.geometry.viewport);
        } else {
            staffMap.setCenter(place.geometry.location);
            staffMap.setZoom(17);
        }
        
        if (staffMarker) staffMarker.setMap(null);
        staffMarker = new google.maps.Marker({
            position: place.geometry.location,
            map: staffMap
        });

        selectedLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };
        document.getElementById('location-error').classList.add('hidden');

        if (place.formatted_address) {
            junctionAddressInput.value = place.formatted_address;
        }
    });
}

function validateForm() {
    let isValid = true;
    const lang = localStorage.getItem('language') || 'en';
    const errorMessages = {
        en: { name: "Please enter your name.", jobType: "Please select a job type.", serviceArea: "Please select a service area.", landmark: "Please select a landmark.", photo: "Please attach at least one photo.", location: "Please provide a location.", jobNotes: "Please enter customer details or job notes." },
        hi: { name: "कृपया अपना नाम दर्ज करें।", jobType: "कृपया जॉब का प्रकार चुनें।", serviceArea: "कृपया सेवा क्षेत्र चुनें।", landmark: "कृपया एक मील का पत्थर चुनें।", photo: "कृपया कम से कम एक फोटो संलग्न करें।", location: "कृपया एक स्थान प्रदान करें।", jobNotes: "कृपया ग्राहक विवरण या जॉब नोट्स दर्ज करें।" }
    };
    ['staff-name-error', 'job-type-error', 'service-area-error', 'landmark-error', 'photo-error', 'location-error', 'job-notes-error'].forEach(id => document.getElementById(id).classList.add('hidden'));
    
    if (!staffNameInput.value.trim()) {
        document.getElementById('staff-name-error').textContent = errorMessages[lang].name;
        document.getElementById('staff-name-error').classList.remove('hidden');
        isValid = false;
    }
    if (!jobTypeInput.value) {
        document.getElementById('job-type-error').textContent = errorMessages[lang].jobType;
        document.getElementById('job-type-error').classList.remove('hidden');
        isValid = false;
    }
    if (!serviceAreaInput.value) {
        document.getElementById('service-area-error').textContent = errorMessages[lang].serviceArea;
        document.getElementById('service-area-error').classList.remove('hidden');
        isValid = false;
    }
    if (!landmarkInput.value || landmarkInput.disabled) {
        document.getElementById('landmark-error').textContent = errorMessages[lang].landmark;
        document.getElementById('landmark-error').classList.remove('hidden');
        isValid = false;
    }
    if (!selectedLocation) {
        document.getElementById('location-error').textContent = errorMessages[lang].location;
        document.getElementById('location-error').classList.remove('hidden');
        isValid = false;
    }
    if (!jobNotesInput.value.trim()) {
        document.getElementById('job-notes-error').textContent = errorMessages[lang].jobNotes;
        document.getElementById('job-notes-error').classList.remove('hidden');
        isValid = false;
    }
    const existingPhotos = Array.from(imagePreviewContainer.querySelectorAll('img')).length;
    if (filesToUpload.length === 0 && existingPhotos === 0) {
        document.getElementById('photo-error').textContent = errorMessages[lang].photo;
        document.getElementById('photo-error').classList.remove('hidden');
        isValid = false;
    }
    return isValid;
}

function setSubmitButtonLoading(isLoading) {
    const btnText = document.getElementById('submit-job-text');
    const btnLoader = document.getElementById('submit-job-loader');
    submitJobBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnLoader.classList.toggle('hidden', !isLoading);
    submitJobBtn.classList.toggle('bg-gray-400', isLoading);
}


function setUpdateButtonLoading(isLoading) {
    confirmUpdateBtn.disabled = isLoading;
    updateBtnText.classList.toggle('hidden', isLoading);
    updateBtnLoader.classList.toggle('hidden', !isLoading);
    confirmUpdateBtn.classList.toggle('bg-gray-400', isLoading);
}

function setCurrentLocationButtonLoading(isLoading) {
    currentLocationBtn.disabled = isLoading;
    currentLocationBtnText.classList.toggle('hidden', isLoading);
    currentLocationLoader.classList.toggle('hidden', !isLoading);
    currentLocationBtn.classList.toggle('bg-gray-400', isLoading);
}

// --- Admin View Logic ---

window.initMap = () => {
    if (document.getElementById("map")) {
        const mapOptions = {
            center: { lat: 20.5937, lng: 78.9629 },
            zoom: 5,
        };
        googleMap = new google.maps.Map(document.getElementById("map"), mapOptions);
    }
}

function setDeleteButtonLoading(isLoading) {
    confirmDeleteBtn.disabled = isLoading;
    deleteBtnText.classList.toggle('hidden', isLoading);
    deleteBtnLoader.classList.toggle('hidden', !isLoading);
    confirmDeleteBtn.classList.toggle('bg-gray-400', isLoading);
}

async function handleDeleteJob() {
    if (!jobToDelete) return;
    setDeleteButtonLoading(true);

    try {
        await deleteDoc(doc(db, "jobs", jobToDelete));
        console.log("Job deleted from Firestore.");
    } catch (error) {
        console.error("Error deleting job:", error);
    } finally {
        deleteModal.classList.add('hidden');
        jobToDelete = null;
        setDeleteButtonLoading(false);
    }
}

function initAdminView() {
    listenForJobs();
}

function populateFilterDropdowns() {
    const selectedArea = areaFilterInput.value;
    const selectedJobType = jobTypeFilterInput.value;
    const selectedStaff = staffNameFilterInput.value;

    const areas = ["KURTHOUL", "SAMPATCHAK", "SIPARA"];
    const jobTypes = [...new Set(allJobs.map(job => job.category))].filter(Boolean);
    const staffNames = [...new Set(allJobs.map(job => job.staffName))].filter(Boolean);

    areaFilterInput.innerHTML = '<option value="all">All Areas</option>';
    areas.forEach(area => {
        areaFilterInput.innerHTML += `<option value="${area}">${area}</option>`;
    });

    jobTypeFilterInput.innerHTML = '<option value="all">All Job Types</option>';
    jobTypes.forEach(type => {
        jobTypeFilterInput.innerHTML += `<option value="${type}">${type}</option>`;
    });

    staffNameFilterInput.innerHTML = '<option value="all">All Staff</option>';
    staffNames.forEach(name => {
        staffNameFilterInput.innerHTML += `<option value="${name}">${name}</option>`;
    });

    areaFilterInput.value = selectedArea;
    jobTypeFilterInput.value = selectedJobType;
    staffNameFilterInput.value = selectedStaff;
}

function populateMapFilterDropdowns() {
    const areas = [...new Set(allJobs.map(job => job.area))];
    mapAreaFilter.innerHTML = '<option value="all">All Areas</option>';
    areas.forEach(area => {
        mapAreaFilter.innerHTML += `<option value="${area}">${area}</option>`;
    });
}

function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedArea = areaFilterInput.value;
    const selectedJobType = jobTypeFilterInput.value;
    const selectedStaff = staffNameFilterInput.value;
    const period = dashboardPeriod.value;
    let filteredJobs = allJobs;

    // Date Range Filter
    const now = new Date();
    let startDate = new Date();
    if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        filteredJobs = filteredJobs.filter(job => (job.timestamp.seconds * 1000) >= startDate.getTime());
    } else if (period === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        filteredJobs = filteredJobs.filter(job => (job.timestamp.seconds * 1000) >= startDate.getTime());
    } else if (period === 'custom') {
        const start = dashboardStartDate.valueAsDate;
        const end = dashboardEndDate.valueAsDate;
        if (start && end) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            filteredJobs = filteredJobs.filter(job => {
                const jobDate = job.timestamp.seconds * 1000;
                return jobDate >= start.getTime() && jobDate <= end.getTime();
            });
        }
    }

    if (selectedArea !== 'all') filteredJobs = filteredJobs.filter(job => job.area === selectedArea);
    if (selectedJobType !== 'all') filteredJobs = filteredJobs.filter(job => job.category === selectedJobType);
    if (selectedStaff !== 'all') filteredJobs = filteredJobs.filter(job => job.staffName === selectedStaff);
    
    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job => 
            (job.notes.toLowerCase() + (job.customerAddress || '')).includes(searchTerm)
        );
    }

    filteredJobs.sort((a, b) => {
        const valA = a[currentSort.key];
        const valB = b[currentSort.key];
        let comparison = 0;
        if (currentSort.key === 'timestamp') {
            comparison = valB.seconds - valA.seconds;
        } else {
            comparison = String(valA).localeCompare(String(valB));
        }
        return currentSort.dir === 'asc' ? comparison : -comparison;
    });

    document.querySelectorAll('.sortable-header i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
    });
    const activeHeader = document.querySelector(`.sortable-header[data-sort="${currentSort.key}"] i`);
    if (activeHeader) {
        activeHeader.className = currentSort.dir === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
    }
    
    currentFilteredJobs = filteredJobs;
    renderDashboardTable(filteredJobs);
}

function applyMapFilters() {
    const selectedArea = mapAreaFilter.value;
    const searchTerm = mapSearchInput.value.toLowerCase();
    let filteredJobs = allJobs;

    if (selectedArea !== 'all') {
        filteredJobs = filteredJobs.filter(job => job.area === selectedArea);
    }
    
    if (searchTerm) {
        filteredJobs = filteredJobs.filter(job => 
            (job.notes.toLowerCase() + (job.customerAddress || '').toLowerCase() + job.staffName.toLowerCase() + job.category.toLowerCase()).includes(searchTerm)
        );
    }
    
    renderMapMarkers(filteredJobs);
}

function listenForJobs() {
    const q = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
    onSnapshot(q, (querySnapshot) => {
        allJobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        populateFilterDropdowns();
        applyFiltersAndSort();

        if (isInitialLoad) {
            document.getElementById('dashboard-loader').classList.add('hidden');
            isInitialLoad = false;

            const urlParams = new URLSearchParams(window.location.search);
            const viewParam = urlParams.get('view');
            const jobIdParam = urlParams.get('jobId');

            if (viewParam === 'map' && jobIdParam) {
                const jobToShow = allJobs.find(j => j.id === jobIdParam);
                if (jobToShow) {
                    dashboardView.classList.add('hidden');
                    mapView.classList.remove('hidden');
                    const checkMapReady = setInterval(() => {
                        if (googleMap) {
                            clearInterval(checkMapReady);
                            renderMapMarkers([jobToShow]);
                            googleMap.setCenter(jobToShow.location);
                            googleMap.setZoom(16);
                        }
                    }, 100);
                }
            }
        }
    });
}

function renderDashboardTable(jobs) {
    dashboardTableBody.innerHTML = '';
    if (jobs.length === 0) {
        dashboardTableBody.innerHTML = `<tr><td colspan="7" class="text-center p-4">No matching jobs found.</td></tr>`;
        return;
    }
    jobs.forEach(job => {
        const row = document.createElement('tr');
        row.className = 'border-b';
        row.innerHTML = `
            <td class="py-2 px-4">${job.area}, ${job.landmark}</td>
            <td class="py-2 px-4">${job.category}</td>
            <td class="py-2 px-4">${job.staffName}</td>
            <td class="py-2 px-4">${job.customerAddress || 'N/A'}</td>
            <td class="py-2 px-4">${job.notes || ''}</td>
            <td class="py-2 px-4">${new Date(job.timestamp.seconds * 1000).toLocaleString()}</td>
            <td class="py-2 px-4">
                <div class="flex items-center gap-3">
                    <button class="edit-job-btn text-blue-600 hover:underline" data-job-id="${job.id}" title="Edit Job"><i class="fa-solid fa-pencil-alt"></i></button>
                    <a href="index.html?view=map&jobId=${job.id}" target="_blank" class="text-blue-600 hover:underline" title="View on Map"><i class="fa-solid fa-map-location-dot"></i></a>
                    ${(job.photoURLs && job.photoURLs.length > 0) ? `<button class="view-photos-btn text-blue-600 hover:underline" data-job-id="${job.id}" title="View Photos"><i class="fa-solid fa-images"></i> (${job.photoURLs.length})</button>` : ''}
                    <button class="delete-job-btn text-red-500 hover:text-red-700" data-job-id="${job.id}" title="Delete Job"><i class="fa-solid fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        dashboardTableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.currentTarget.dataset.jobId;
            const jobData = allJobs.find(j => j.id === jobId);
            if (jobData) {
                isEditMode = true;
                jobToEdit = jobId;
                populateStaffFormForEdit(jobData);
                dashboardView.classList.add('hidden');
                adminContainer.classList.add('hidden');
                staffView.classList.remove('hidden');
            }
        });
    });

    document.querySelectorAll('.view-photos-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.currentTarget.dataset.jobId;
            const job = allJobs.find(j => j.id === jobId);
            if (job && job.photoURLs) {
                openImageModal(job.photoURLs);
            }
        });
    });

    document.querySelectorAll('.delete-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            jobToDelete = e.currentTarget.dataset.jobId;
            deleteModal.classList.remove('hidden');
        });
    });
}


function populateStaffFormForEdit(job) {
    document.getElementById('staff-view-title').textContent = "Edit Job Record";
    document.getElementById('submit-job-text').textContent = "Update";
    locationSection.classList.add('hidden');

    staffNameInput.value = job.staffName;
    jobTypeInput.value = job.category;
    serviceAreaInput.value = job.area;
    populateLandmarks();
    landmarkInput.value = job.landmark;
    junctionAddressInput.value = job.customerAddress || '';
    jobNotesInput.value = job.notes;
    
    selectedLocation = job.location;
    
    filesToUpload = []; // Clear any pending new files
    if (job.photoURLs && job.photoURLs.length > 0) {
        renderPreviews(job.photoURLs);
    } else {
        imagePreviewContainer.innerHTML = '';
    }
}


function openImageModal(images) {
    modalImages = images;
    currentModalImageIndex = 0;
    imageModal.classList.remove('hidden');
    showModalImage(0);
}

function showModalImage(index) {
    if (index < 0 || index >= modalImages.length) return;
    currentModalImageIndex = index;
    modalImage.src = modalImages[index];
    downloadImageBtn.href = modalImages[index];
    prevImageBtn.classList.toggle('hidden', index === 0);
    nextImageBtn.classList.toggle('hidden', index === modalImages.length - 1);
}

function renderMapMarkers(jobs) {
    if (!googleMap) return;

    markers.forEach(marker => marker.setMap(null));
    markers = [];
    if (currentInfoWindow) currentInfoWindow.close();

    const lang = localStorage.getItem('language') || 'en';
    const isFiltered = mapAreaFilter.value !== 'all' || mapSearchInput.value !== '';

    mapListInfo.textContent = isFiltered ? `Showing ${jobs.length} results.` : 'Showing top 10 recent jobs.';

    jobList.innerHTML = '';
    if (jobs.length === 0) {
        jobList.innerHTML = `<p class="text-center text-gray-500 p-4">${translations[lang].noMatchingJobs}</p>`;
        return;
    }

    const bounds = new google.maps.LatLngBounds();

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${getCategoryColor(job.category).bg} ${getCategoryColor(job.category).text}">${translations[lang][job.category.toLowerCase()] || job.category}</span>
            </div>
            <div>
                <p class="font-bold text-gray-800 mt-2">${job.customerAddress || translations[lang].noAddress}</p>
                <p class="text-sm text-gray-500 mt-1"><i class="fa-solid fa-user mr-1"></i> ${job.staffName}</p>
                <p class="text-sm text-gray-500"><i class="fa-solid fa-calendar-days mr-1"></i> ${new Date(job.timestamp.seconds * 1000).toLocaleDateString()}</p>
            </div>`;
        
        const marker = new google.maps.Marker({
            position: job.location,
            map: googleMap,
            title: job.customerAddress || job.category,
            icon: {
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: getCategoryColor(job.category).marker,
                fillOpacity: 1,
                strokeWeight: 0,
                rotation: 0,
                scale: 1.5,
                anchor: new google.maps.Point(12, 24),
            },
        });

        card.addEventListener('click', () => {
            googleMap.panTo(job.location);
            googleMap.setZoom(16);
            new google.maps.event.trigger(marker, 'click');
        });
        jobList.appendChild(card);

        const photoGallery = (job.photoURLs && job.photoURLs.length > 0) 
            ? `<div class="flex gap-2 overflow-x-auto mt-2 pb-2">${job.photoURLs.map(url => `<a href="${url}" target="_blank"><img src="${url}" class="h-20 w-20 object-cover rounded-md"></a>`).join('')}</div>`
            : '';

        const infoWindowContent = `
            <div class="w-64">
                <h3 class="font-bold text-lg mb-2">${translations[lang][job.category.toLowerCase()] || job.category} <span class="text-sm font-medium text-gray-500">(${job.area}, ${job.landmark})</span></h3>
                <p class="text-sm text-gray-800 mb-2"><b>Address:</b> ${job.customerAddress || translations[lang].noAddress}</p>
                <p class="text-gray-700 mb-2">${job.notes}</p>
                ${photoGallery}
                <div class="text-xs text-gray-500 mt-2 border-t pt-2">
                    <p><i class="fa-solid fa-user mr-1"></i> ${job.staffName}</p>
                    <p><i class="fa-solid fa-clock mr-1"></i> ${new Date(job.timestamp.seconds * 1000).toLocaleString()}</p>
                </div>
                <div class="mt-3 flex flex-col space-y-2">
                    <a href="https://www.google.com/maps?daddr=${job.location.lat},${job.location.lng}" target="_blank" class="w-full text-center bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 font-semibold">${translations[lang].navigate}</a>
                    <button id="share-location-btn-${job.id}" class="w-full bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">${translations[lang].shareLocation}</button>
                    ${(job.photoURLs && job.photoURLs.length > 0) ? `<button id="share-photo-btn-${job.id}" class="w-full bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">${translations[lang].sharePhoto}</button>` : ''}
                </div>
            </div>`;
        
        const infoWindow = new google.maps.InfoWindow({ content: infoWindowContent });

        marker.addListener('click', () => {
            if (currentInfoWindow) {
                currentInfoWindow.close();
            }
            infoWindow.open(googleMap, marker);
            currentInfoWindow = infoWindow;
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
            const shareLocationBtn = document.getElementById(`share-location-btn-${job.id}`);
            if (shareLocationBtn) {
                shareLocationBtn.addEventListener('click', async () => {
                    const locationUrl = `https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`;
                    const shareData = { title: 'Cable Job Location', text: `Location for job: ${job.notes}`, url: locationUrl };
                     try {
                        if (navigator.share) await navigator.share(shareData);
                        else {
                            await navigator.clipboard.writeText(locationUrl);
                            shareLocationBtn.textContent = translations[lang].copied;
                            setTimeout(() => { shareLocationBtn.textContent = translations[lang].shareLocation; }, 2000);
                        }
                    } catch(err) { console.error("Share failed:", err); }
                });
            }
            const sharePhotoBtn = document.getElementById(`share-photo-btn-${job.id}`);
            if (sharePhotoBtn) {
                sharePhotoBtn.addEventListener('click', async () => {
                    try {
                        const files = await Promise.all(job.photoURLs.map(async (url, i) => {
                            const response = await fetch(url);
                            const blob = await response.blob();
                            return new File([blob], `photo-${i+1}.jpg`, { type: blob.type });
                        }));

                        if (navigator.canShare && navigator.canShare({ files })) {
                            await navigator.share({
                                title: 'Cable Job Photos',
                                text: `Photos from job: ${job.notes}`,
                                files: files
                            });
                        } else {
                            throw new Error("File sharing not supported.");
                        }
                    } catch (err) {
                        console.error("File share failed, falling back to URL:", err);
                        await navigator.clipboard.writeText(job.photoURLs.join(', '));
                        sharePhotoBtn.textContent = translations[lang].copied;
                        setTimeout(() => { sharePhotoBtn.textContent = translations[lang].sharePhoto; }, 2000);
                    }
                });
            }
        });
        
        markers.push(marker);
        bounds.extend(job.location);
    });

    if (jobs.length > 1) {
        googleMap.fitBounds(bounds);
    } else if (jobs.length === 1) {
        googleMap.setCenter(jobs[0].location);
        googleMap.setZoom(15);
    }
}

function initAnalyticsView() {
    renderAnalytics();
}

function renderAnalytics() {
    const period = analyticsPeriod.value;
    customDateRange.classList.toggle('hidden', period !== 'custom');
    
    let filteredJobs = allJobs;
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        filteredJobs = allJobs.filter(job => (job.timestamp.seconds * 1000) >= startDate.getTime());
    } else if (period === 'month') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        filteredJobs = allJobs.filter(job => (job.timestamp.seconds * 1000) >= startDate.getTime());
    } else if (period === 'custom') {
        const start = startDateInput.valueAsDate;
        const end = endDateInput.valueAsDate;
        if (start && end) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            filteredJobs = allJobs.filter(job => {
                const jobDate = job.timestamp.seconds * 1000;
                return jobDate >= start.getTime() && jobDate <= end.getTime();
            });
        }
    }

    const areaStats = filteredJobs.reduce((acc, job) => {
        if (!acc[job.area]) {
            acc[job.area] = { Installation: 0, Maintenance: 0, Repair: 0, total: 0 };
        }
        acc[job.area][job.category]++;
        acc[job.area].total++;
        return acc;
    }, {});

    analyticsResults.innerHTML = '';
    if (Object.keys(areaStats).length === 0) {
        analyticsResults.innerHTML = `<p class="text-center text-gray-500 col-span-full">No data for this period.</p>`;
        return;
    }

    for (const areaName in areaStats) {
        const stats = areaStats[areaName];
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md';
        card.innerHTML = `
            <h3 class="text-xl font-bold text-gray-800 mb-4">${areaName}</h3>
            <div class="space-y-2 text-gray-700">
                <p class="flex justify-between">
                    <span><i class="fa-solid fa-wrench mr-2 text-green-500"></i> Installation:</span> 
                    <a href="#" class="font-semibold analytics-link text-blue-600 hover:underline" data-area="${areaName}" data-job-type="Installation">${stats.Installation}</a>
                </p>
                <p class="flex justify-between">
                    <span><i class="fa-solid fa-screwdriver-wrench mr-2 text-blue-500"></i> Maintenance:</span> 
                    <a href="#" class="font-semibold analytics-link text-blue-600 hover:underline" data-area="${areaName}" data-job-type="Maintenance">${stats.Maintenance}</a>
                </p>
                <p class="flex justify-between">
                    <span><i class="fa-solid fa-triangle-exclamation mr-2 text-red-500"></i> Repair:</span> 
                    <a href="#" class="font-semibold analytics-link text-blue-600 hover:underline" data-area="${areaName}" data-job-type="Repair">${stats.Repair}</a>
                </p>
            </div>
            <div class="mt-4 pt-4 border-t">
                <p class="flex justify-between text-lg font-bold"><span>Total Jobs:</span> <span>${stats.total}</span></p>
            </div>
        `;
        analyticsResults.appendChild(card);
    }
}

function exportToExcel(jobs) {
    const dataToExport = jobs.map(job => ({
        'Area': job.area,
        'Landmark': job.landmark,
        'Job Type': job.category,
        'Staff Name': job.staffName,
        'Address': job.customerAddress,
        'Timestamp': new Date(job.timestamp.seconds * 1000).toLocaleString(),
        'Location': `https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`,
        'Photos': (job.photoURLs || []).join(', ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, "Cable_Operations_Export.xlsx");
}

async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function exportToPdf(jobs) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        let y = 20;

        if (i > 0) {
            doc.addPage();
        }

        doc.setFontSize(16);
        doc.text("Job Report", pageWidth / 2, y, { align: 'center' });
        y += 10;
        doc.setFontSize(10);
        doc.text(`Timestamp: ${new Date(job.timestamp.seconds * 1000).toLocaleString()}`, margin, y);
        y += 7;
        doc.text(`Staff Name: ${job.staffName}`, margin, y);
        y += 7;
        doc.text(`Area: ${job.area}, ${job.landmark}`, margin, y);
        y += 7;
        doc.text(`Job Type: ${job.category}`, margin, y);
        y += 7;
        doc.text(`Address: ${job.customerAddress || 'N/A'}`, margin, y);
        y += 7;
        
        const locationLink = `https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`;
        doc.setTextColor(0, 0, 255);
        doc.textWithLink('View on Map', margin, y, { url: locationLink });
        doc.setTextColor(0, 0, 0);
        y += 10;

        if (job.photoURLs && job.photoURLs.length > 0) {
            doc.setFontSize(12);
            doc.text("Photos:", margin, y);
            y += 5;

            for (const url of job.photoURLs) {
                try {
                    const base64Image = await imageUrlToBase64(url);
                    const imgProps = doc.getImageProperties(base64Image);
                    const imgWidth = 80;
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    if (y + imgHeight > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }

                    doc.addImage(base64Image, 'JPEG', margin, y, imgWidth, imgHeight);
                    y += imgHeight + 5;

                } catch (e) {
                    console.error("Error adding image to PDF", e);
                    if (y + 10 > pageHeight - margin) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text("Could not load image.", margin, y);
                    y += 10;
                }
            }
        }
    }

    doc.save("Cable_Operations_Report.pdf");
}


function getCategoryColor(category) {
    const colors = {
        Installation: { bg: 'bg-green-100', text: 'text-green-800', marker: '#22c55e' },
        Maintenance: { bg: 'bg-blue-100', text: 'text-blue-800', marker: '#3b82f6' },
        Repair: { bg: 'bg-red-100', text: 'text-red-800', marker: '#ef4444' }
    };
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-800', marker: '#6b7280' };
}

async function updateJob() {
    if (!validateForm() || !jobToEdit) return;
    
    setUpdateButtonLoading(true);

    try {
        // 1. Upload new photos to Cloudinary
        const uploadPromises = filesToUpload.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => data.secure_url);
        });
        const newPhotoURLs = await Promise.all(uploadPromises);

        // 2. Get existing photo URLs
        const existingPhotoURLs = Array.from(imagePreviewContainer.querySelectorAll('img'))
            .map(img => img.src)
            .filter(src => src.startsWith('https://'));

        // 3. Combine photo URLs
        const allPhotoURLs = [...existingPhotoURLs, ...newPhotoURLs];

        // 4. Prepare data for Firestore update
        const updatedData = {
            staffName: staffNameInput.value.trim(),
            category: jobTypeInput.value,
            area: serviceAreaInput.value,
            landmark: landmarkInput.value,
            customerAddress: junctionAddressInput.value,
            notes: jobNotesInput.value,
            photoURLs: allPhotoURLs,
            lastUpdated: new Date() // Add a timestamp for the update
        };

        // 5. Update the document in Firestore
        const jobRef = doc(db, "jobs", jobToEdit);
        await updateDoc(jobRef, updatedData);

        // 6. Show success and reset
        updateModal.classList.add('hidden');
        const lang = localStorage.getItem('language') || 'en';
        document.getElementById('success-modal-title').textContent = translations[lang].successTitle;
        document.getElementById('success-modal-message').textContent = translations[lang].updateSuccessMessage;
        successModal.classList.remove('hidden');
        
    } catch (error) {
        console.error("Error updating job:", error);
        alert("Failed to update job. Please try again.");
    } finally {
        setUpdateButtonLoading(false);
    }
}


function initializeEventListeners() {
    loginBtn.addEventListener('click', () => {
        signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).catch(error => {
            loginError.textContent = "Failed to login. Check email and password.";
        });
    });

    setupLogoutButtons();
    
    langSwitcherStaff.addEventListener('change', (e) => setLanguage(e.target.value));

    // Staff View Listeners
    serviceAreaInput.addEventListener('change', populateLandmarks);
    cancelCameraBtn.addEventListener('click', stopCameraStream);
    cancelJobBtn.addEventListener('click', () => {
        if (isEditMode) {
            // If editing, go back to admin view
            staffView.classList.add('hidden');
            adminContainer.classList.remove('hidden');
            dashboardView.classList.remove('hidden');
            clearStaffForm(); // This also resets isEditMode
        } else {
            // If creating new, just clear the form
            clearStaffForm();
        }
    });
    imagePreviewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-img-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            const urlToRemove = e.target.dataset.url;

            if (urlToRemove) {
                // It's an existing image URL, remove it from the DOM
                e.target.parentElement.remove();
                // We need to re-render to update indices
                const currentImages = Array.from(imagePreviewContainer.querySelectorAll('img')).map(img => img.src);
                renderPreviews(currentImages);
            } else {
                // It's a new file, remove from filesToUpload array
                filesToUpload.splice(index, 1);
                const currentImages = Array.from(imagePreviewContainer.querySelectorAll('img')).map(img => img.src).filter(src => src.startsWith('https://'));
                renderPreviews([...currentImages, ...filesToUpload]);
            }
        }
    });
    okBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        if (isEditMode) {
            staffView.classList.add('hidden');
            adminContainer.classList.remove('hidden');
            dashboardView.classList.remove('hidden');
            clearStaffForm();
        } else {
            clearStaffForm();
        }
    });
    currentLocationBtn.addEventListener('click', () => {
        setCurrentLocationButtonLoading(true);
        navigator.geolocation.getCurrentPosition(pos => {
            const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            selectedLocation = location;
            document.getElementById('location-error').classList.add('hidden');
    
            staffMap.setCenter(location);
            staffMap.setZoom(15);
            if (staffMarker) staffMarker.setMap(null);
            staffMarker = new google.maps.Marker({ position: location, map: staffMap });
    
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'location': location }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        locationSearchInput.value = results[0].formatted_address;
                        junctionAddressInput.value = results[0].formatted_address;
                    } else {
                        locationSearchInput.value = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
                    }
                } else {
                    locationSearchInput.value = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
                    console.error('Geocoder failed due to: ' + status);
                }
                setCurrentLocationButtonLoading(false);
            });
        }, (error) => {
            console.error("Error getting current location: ", error);
            setCurrentLocationButtonLoading(false);
        });
    });
    submitJobBtn.addEventListener('click', async () => {
        if (!validateForm()) return;

        if (isEditMode) {
            updateModal.classList.remove('hidden');
            return;
        }

        const user = auth.currentUser;
        setSubmitButtonLoading(true);
    
        if (!junctionAddressInput.value.trim() && locationSearchInput.value) {
            junctionAddressInput.value = locationSearchInput.value;
        }
    
        try {
            const uploadPromises = filesToUpload.map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                return fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
                    .then(response => response.json())
                    .then(data => data.secure_url);
            });
            const photoURLs = await Promise.all(uploadPromises);
    
            await addDoc(collection(db, "jobs"), {
                staffName: staffNameInput.value.trim(),
                staffUid: user.uid, 
                category: jobTypeInput.value,
                area: serviceAreaInput.value, 
                landmark: landmarkInput.value,
                customerAddress: junctionAddressInput.value,
                notes: jobNotesInput.value, 
                location: selectedLocation,
                timestamp: new Date(), 
                photoURLs: photoURLs
            });
            const lang = localStorage.getItem('language') || 'en';
            document.getElementById('success-modal-title').textContent = translations[lang].successTitle;
            document.getElementById('success-modal-message').textContent = translations[lang].successMessage;
            successModal.classList.remove('hidden');
        } catch (error) { console.error("Error submitting job:", error);
        } finally { setSubmitButtonLoading(false); }
    });


    // Admin View Listeners
    searchInput.addEventListener('input', applyFiltersAndSort);
    areaFilterInput.addEventListener('change', applyFiltersAndSort);
    jobTypeFilterInput.addEventListener('change', applyFiltersAndSort);
    staffNameFilterInput.addEventListener('change', applyFiltersAndSort);
    dashboardPeriod.addEventListener('change', applyFiltersAndSort);
    dashboardStartDate.addEventListener('change', applyFiltersAndSort);
    dashboardEndDate.addEventListener('change', applyFiltersAndSort);
    mapAreaFilter.addEventListener('change', applyMapFilters);
    mapSearchInput.addEventListener('input', applyMapFilters);
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
        jobToDelete = null;
    });
    confirmDeleteBtn.addEventListener('click', handleDeleteJob);

    cancelUpdateBtn.addEventListener('click', () => {
        updateModal.classList.add('hidden');
    });
    confirmUpdateBtn.addEventListener('click', updateJob);

    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            if (currentSort.key === sortKey) {
                currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = sortKey;
                currentSort.dir = 'asc';
            }
            applyFiltersAndSort();
        });
    });
    viewMapBtn.addEventListener('click', () => {
        dashboardView.classList.add('hidden');
        mapView.classList.remove('hidden');
        if (!googleMap && window.google) {
            window.initMap();
        }
        populateMapFilterDropdowns();
        renderMapMarkers(allJobs.slice(0, 10)); 
    });
    viewAnalyticsBtn.addEventListener('click', () => {
        dashboardView.classList.add('hidden');
        analyticsView.classList.remove('hidden');
        initAnalyticsView();
    });
    backToDashboardBtn.addEventListener('click', () => {
        mapView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    });
    backToDashboardBtn2.addEventListener('click', () => {
        analyticsView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    });
    closeImageModal.addEventListener('click', () => imageModal.classList.add('hidden'));
    nextImageBtn.addEventListener('click', () => showModalImage(currentModalImageIndex + 1));
    prevImageBtn.addEventListener('click', () => showModalImage(currentModalImageIndex - 1));
    downloadImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fetch(e.currentTarget.href)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `job-photo-${currentModalImageIndex + 1}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            });
    });
    analyticsResults.addEventListener('click', (e) => {
        const link = e.target.closest('.analytics-link');
        if (link) {
            e.preventDefault();
            const area = link.dataset.area;
            const jobType = link.dataset.jobType;
            
            const filteredJobs = allJobs.filter(job => 
                job.area === area && job.category === jobType
            );

            dashboardView.classList.add('hidden');
            analyticsView.classList.add('hidden');
            mapView.classList.remove('hidden');
            if (!googleMap && window.google) window.initMap();
            renderMapMarkers(filteredJobs);
        }
    });
    exportMenuBtn.addEventListener('click', () => {
        exportOptions.classList.toggle('hidden');
    });
    exportExcelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        exportToExcel(currentFilteredJobs);
        exportOptions.classList.add('hidden');
    });
    exportPdfBtn.addEventListener('click', (e) => {
        e.preventDefault();
        exportToPdf(currentFilteredJobs);
        exportOptions.classList.add('hidden');
    });
    analyticsPeriod.addEventListener('change', renderAnalytics);
    startDateInput.addEventListener('change', renderAnalytics);
    endDateInput.addEventListener('change', renderAnalytics);
    dashboardPeriod.addEventListener('change', () => {
        dashboardCustomDateRange.classList.toggle('hidden', dashboardPeriod.value !== 'custom');
        applyFiltersAndSort();
    });
}

// Initialize all event listeners once when the script loads
initializeEventListeners();
