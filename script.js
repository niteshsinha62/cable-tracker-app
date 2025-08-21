// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyA0BBrvVfbg13i5BDyFgS4_IapoHYhbEks",
    authDomain: "cableworktracker.firebaseapp.com",
    projectId: "cableworktracker",
    storageBucket: "cableworktracker.appspot.com",
    messagingSenderId: "363803214900",
    appId: "1:363803214900:web:d65d39ec958a31e7533661"
};
const ADMIN_UID = "Ci07GidQBtecle56m6Nsne8IJ643";

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dzcvp4zor";
const CLOUDINARY_UPLOAD_PRESET = "cable-tracker-preset";

// --- Firebase Initialization ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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
      langSwitcherAdmin = document.getElementById('language-switcher-admin'),
      viewMapBtn = document.getElementById('view-map-btn'),
      viewAnalyticsBtn = document.getElementById('view-analytics-btn'),
      backToDashboardBtn = document.getElementById('back-to-dashboard-btn'),
      backToDashboardBtn2 = document.getElementById('back-to-dashboard-btn2'),
      analyticsPeriod = document.getElementById('analytics-period'),
      analyticsResults = document.getElementById('analytics-results'),
      successModal = document.getElementById('success-modal'),
      newEntryBtn = document.getElementById('new-entry-btn'),
      logoutSuccessBtn = document.getElementById('logout-success-btn'),
      currentLocationBtn = document.getElementById('current-location-btn'),
      locationSearchInput = document.getElementById('location-search-input'),
      imageModal = document.getElementById('image-modal'),
      closeImageModal = document.getElementById('close-image-modal'),
      modalImage = document.getElementById('modal-image'),
      prevImageBtn = document.getElementById('prev-image-btn'),
      nextImageBtn = document.getElementById('next-image-btn'),
      downloadImageBtn = document.getElementById('download-image-btn'),
      customDateRange = document.getElementById('custom-date-range'),
      startDateInput = document.getElementById('start-date'),
      endDateInput = document.getElementById('end-date'),
      exportBtn = document.getElementById('export-btn');

// --- State Variables ---
let googleMap, currentInfoWindow = null, markers = [];
let staffMap, staffMarker;
let allJobs = [], currentFilteredJobs = [], currentStream = null, filesToUpload = [],
    selectedLocation = null, currentSort = { key: 'timestamp', dir: 'desc' },
    modalImages = [], currentModalImageIndex = 0, isInitialLoad = true;

// --- Language Translations ---
const translations = {
    en: {
        loginTitle: "Cable Operations Portal", email: "Email", password: "Password", login: "Login",
        recordJobActivity: "Record Job Activity", logout: "Logout", jobType: "Job Type",
        selectJobType: "Select a job type...", installation: "Installation", maintenance: "Maintenance",
        repair: "Repair", serviceArea: "Service Area", selectServiceArea: "Select a service area...",
        junctionAddress: "Cable Junction Address (Optional)", junctionAddressPlaceholder: "e.g., House #123, Near Water Tank",
        jobNotes: "Job Notes / Description (Optional)", jobNotesPlaceholder: "Describe the work done...",
        attachments: "Attachments", uploadPhoto: "Upload Photo", takePhoto: "Take Photo",
        capturePhoto: "Capture Photo", cancel: "Cancel", submit: "Submit",
        jobList: "Job List", allAreas: "All Areas", searchPlaceholder: "Search by address, staff, notes...",
        navigate: "Navigate", shareLocation: "Share Location", sharePhoto: "Share Photo",
        copied: "Copied!", noAddress: "No Address", noMatchingJobs: "No matching jobs found.",
        successTitle: "Success!", successMessage: "Successfully logged your work.", newEntry: "New Entry"
    },
    hi: {
        loginTitle: "केबल संचालन पोर्टल", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन",
        recordJobActivity: "जॉब गतिविधि रिकॉर्ड करें", logout: "लॉगआउट", jobType: "जॉब का प्रकार",
        selectJobType: "जॉब का प्रकार चुनें...", installation: "इंस्टॉलेशन", maintenance: "रखरखाव",
        repair: "मरम्मत", serviceArea: "सेवा क्षेत्र", selectServiceArea: "सेवा क्षेत्र चुनें...",
        junctionAddress: "केबल जंक्शन पता (वैकल्पिक)", junctionAddressPlaceholder: "उदा., घर #123, पानी की टंकी के पास",
        jobNotes: "जॉब नोट्स / विवरण (वैकल्पिक)", jobNotesPlaceholder: "किए गए काम का वर्णन करें...",
        attachments: "अटैचमेंट्स", uploadPhoto: "फोटो अपलोड करें", takePhoto: "फोटो लें",
        capturePhoto: "फोटो खींचे", cancel: "रद्द करें", submit: "सबमिट करें",
        jobList: "जॉब सूची", allAreas: "सभी क्षेत्र", searchPlaceholder: "पता, कर्मचारी, नोट्स द्वारा खोजें...",
        navigate: "네비게이션", shareLocation: "위치 공유", sharePhoto: "사진 공유",
        copied: "복사!", noAddress: "주소 없음", noMatchingJobs: "일치하는 작업이 없습니다.",
        successTitle: "성공!", successMessage: "작업이 성공적으로 기록되었습니다.", newEntry: "새 항목"
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
    localStorage.setItem('language', lang);
    langSwitcherStaff.value = lang;
    langSwitcherAdmin.value = lang;
}

langSwitcherStaff.addEventListener('change', (e) => setLanguage(e.target.value));
langSwitcherAdmin.addEventListener('change', (e) => setLanguage(e.target.value));

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
        adminContainer.classList.add('hidden');
    }
});

loginBtn.addEventListener('click', () => {
    signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value).catch(error => {
        loginError.textContent = "Failed to login. Check email and password.";
    });
});

function setupLogoutButtons() {
    document.getElementById('logout-btn-staff').addEventListener('click', () => signOut(auth));
    document.getElementById('logout-btn-admin').addEventListener('click', () => signOut(auth));
    logoutSuccessBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        signOut(auth);
    });
}
setupLogoutButtons();

// --- Staff View Logic ---
function clearStaffForm() {
    ['staff-name', 'job-type', 'service-area', 'junction-address', 'job-notes', 'photo', 'location-search-input'].forEach(id => document.getElementById(id).value = '');
    ['staff-name-error', 'job-type-error', 'service-area-error', 'photo-error', 'location-error'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '';
        el.classList.add('hidden');
    });
    filesToUpload = [];
    imagePreviewContainer.innerHTML = '';
    stopCameraStream();
    selectedLocation = null;
    if (staffMap) {
        const defaultCenter = { lat: 20.5937, lng: 78.9629 };
        staffMap.setCenter(defaultCenter);
        staffMap.setZoom(5);
        if (staffMarker) staffMarker.setMap(null);
    }
}
function stopCameraStream() {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    cameraView.classList.add('hidden');
}
function renderPreviews() {
    imagePreviewContainer.innerHTML = '';
    filesToUpload.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewWrapper = document.createElement('div');
            previewWrapper.className = 'relative';
            previewWrapper.innerHTML = `
                <img src="${e.target.result}" class="w-full h-24 object-cover rounded-lg">
                <button data-index="${index}" class="remove-img-btn absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
            `;
            imagePreviewContainer.appendChild(previewWrapper);
        }
        reader.readAsDataURL(file);
    });
}

function initStaffView(user) {
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkGoogle);
            if (!staffMap) {
                initStaffMapAndAutocomplete();
            }
        }
    }, 100);

    photoInput.addEventListener('change', (e) => {
        filesToUpload.push(...e.target.files);
        renderPreviews();
        document.getElementById('photo-error').classList.add('hidden');
    });
    openCameraBtn.addEventListener('click', async () => {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            cameraView.classList.remove('hidden');
            cameraStream.srcObject = currentStream;
        } catch (err) { console.error("Error accessing camera:", err); }
    });
    cancelCameraBtn.addEventListener('click', stopCameraStream);
    cancelJobBtn.addEventListener('click', clearStaffForm);
    captureBtn.addEventListener('click', () => {
        const context = cameraCanvas.getContext('2d');
        cameraCanvas.width = cameraStream.videoWidth;
        cameraCanvas.height = cameraStream.videoHeight;
        context.drawImage(cameraStream, 0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraCanvas.toBlob(blob => {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            filesToUpload.push(file);
            renderPreviews();
            stopCameraStream();
            document.getElementById('photo-error').classList.add('hidden');
        }, 'image/jpeg', 0.9);
    });
    imagePreviewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-img-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            filesToUpload.splice(index, 1);
            renderPreviews();
        }
    });
    newEntryBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        clearStaffForm();
    });
    currentLocationBtn.addEventListener('click', () => {
        if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
            console.error("Google Maps API not ready for geocoding.");
            alert("Map service is not ready, please try again in a moment.");
            return;
        }

        navigator.geolocation.getCurrentPosition(pos => {
            const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            selectedLocation = location;
            document.getElementById('location-error').classList.add('hidden');

            staffMap.setCenter(location);
            staffMap.setZoom(15);
            if (staffMarker) staffMarker.setMap(null);
            staffMarker = new google.maps.Marker({ position: location, map: staffMap });

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: location }, (results, status) => {
                if (status === "OK") {
                    if (results && results.length > 0) {
                        // [FIXED] Prefer a more specific address type if available
                        let bestResult = results.find(r => r.types.includes("street_address")) || 
                                         results.find(r => r.types.includes("route")) || 
                                         results[0];
                        locationSearchInput.value = bestResult.formatted_address;
                    } else {
                        console.warn("Reverse geocode was successful but returned no results.");
                        locationSearchInput.value = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
                    }
                } else {
                    console.error("Geocoder failed due to: " + status);
                    locationSearchInput.value = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`;
                }
            });
        }, (error) => {
            console.error("Error getting current location: ", error);
            alert("Could not get your current location. Please check your browser's location settings.");
        });
    });
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
    });
}

function validateForm() {
    let isValid = true;
    const lang = localStorage.getItem('language') || 'en';
    const errorMessages = {
        en: { name: "Please enter your name.", jobType: "Please select a job type.", serviceArea: "Please select a service area.", photo: "Please attach at least one photo.", location: "Please provide a location." },
        hi: { name: "कृपया अपना नाम दर्ज करें।", jobType: "कृपया जॉब का प्रकार चुनें।", serviceArea: "कृपया सेवा क्षेत्र चुनें।", photo: "कृपया कम से कम एक फोटो संलग्न करें।", location: "कृपया एक स्थान प्रदान करें।" }
    };
    ['staff-name-error', 'job-type-error', 'service-area-error', 'photo-error', 'location-error'].forEach(id => document.getElementById(id).classList.add('hidden'));
    
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
    if (!selectedLocation) {
        document.getElementById('location-error').textContent = errorMessages[lang].location;
        document.getElementById('location-error').classList.remove('hidden');
        isValid = false;
    }
    if (filesToUpload.length === 0) {
        document.getElementById('photo-error').textContent = errorMessages[lang].photo;
        document.getElementById('photo-error').classList.remove('hidden');
        isValid = false;
    }
    return isValid;
}
submitJobBtn.addEventListener('click', async () => {
    if (!validateForm()) return;
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
            customerAddress: junctionAddressInput.value,
            notes: jobNotesInput.value, 
            location: selectedLocation,
            timestamp: new Date(), 
            photoURLs: photoURLs
        });
        successModal.classList.remove('hidden');
    } catch (error) { console.error("Error submitting job:", error);
    } finally { setSubmitButtonLoading(false); }
});
function setSubmitButtonLoading(isLoading) {
    const btnText = document.getElementById('submit-job-text');
    const btnLoader = document.getElementById('submit-job-loader');
    submitJobBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnLoader.classList.toggle('hidden', !isLoading);
    submitJobBtn.classList.toggle('bg-gray-400', isLoading);
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

function initAdminView() {
    listenForJobs();
    searchInput.addEventListener('input', applyFiltersAndSort);
    areaFilterInput.addEventListener('change', applyFiltersAndSort);
    jobTypeFilterInput.addEventListener('change', applyFiltersAndSort);
    staffNameFilterInput.addEventListener('change', applyFiltersAndSort);
    mapAreaFilter.addEventListener('change', applyMapFilters);
    mapSearchInput.addEventListener('input', applyMapFilters);

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
    
    exportBtn.addEventListener('click', () => {
        exportToExcel(currentFilteredJobs);
    });
}

function populateFilterDropdowns() {
    const areas = [...new Set(allJobs.map(job => job.area))];
    const jobTypes = [...new Set(allJobs.map(job => job.category))];
    const staffNames = [...new Set(allJobs.map(job => job.staffName))];
    
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
    let filteredJobs = allJobs;

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
            comparison = valA.seconds - valB.seconds;
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
        if (isInitialLoad) {
            document.getElementById('dashboard-loader').classList.add('hidden');
            populateFilterDropdowns();
            applyFiltersAndSort();
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
            <td class="py-2 px-4">${job.area}</td>
            <td class="py-2 px-4">${job.category}</td>
            <td class="py-2 px-4">${job.staffName}</td>
            <td class="py-2 px-4">${job.customerAddress || 'N/A'}</td>
            <td class="py-2 px-4">${new Date(job.timestamp.seconds * 1000).toLocaleString()}</td>
            <td class="py-2 px-4"><a href="index.html?view=map&jobId=${job.id}" target="_blank" class="text-blue-600 hover:underline">View on Map</a></td>
            <td class="py-2 px-4">
                ${(job.photoURLs && job.photoURLs.length > 0) ? `<button class="view-photos-btn text-blue-600 hover:underline" data-job-id="${job.id}"><i class="fa-solid fa-images mr-1"></i> View (${job.photoURLs.length})</button>` : 'N/A'}
            </td>
        `;
        dashboardTableBody.appendChild(row);
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
                <h3 class="font-bold text-lg mb-2">${translations[lang][job.category.toLowerCase()] || job.category} <span class="text-sm font-medium text-gray-500">(${job.area})</span></h3>
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
    analyticsPeriod.addEventListener('change', renderAnalytics);
    startDateInput.addEventListener('change', renderAnalytics);
    endDateInput.addEventListener('change', renderAnalytics);
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


function getCategoryColor(category) {
    const colors = {
        Installation: { bg: 'bg-green-100', text: 'text-green-800', marker: '#22c55e' },
        Maintenance: { bg: 'bg-blue-100', text: 'text-blue-800', marker: '#3b82f6' },
        Repair: { bg: 'bg-red-100', text: 'text-red-800', marker: '#ef4444' }
    };
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-800', marker: '#6b7280' };
}
