// Admin Panel JavaScript - Event Management System

// Global variables
let events = [];
let currentEditIndex = -1;
let githubToken = '';
let githubRepo = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadGitHubConfig();
    setupEventListeners();
    loadEvents();
});

// Check authentication
function checkAuth() {
    const auth = localStorage.getItem('admin_auth');
    if (!auth) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('admin_auth');
        window.location.href = '/admin/login.html';
    });

    // Add event button
    document.getElementById('addEventBtn').addEventListener('click', () => {
        openModal();
    });

    // Save all button
    document.getElementById('saveAllBtn').addEventListener('click', saveToGitHub);

    // Event form
    document.getElementById('eventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveEvent();
    });

    // Image upload
    const imagePreview = document.getElementById('imagePreview');
    const imageFile = document.getElementById('eventImageFile');
    
    imagePreview.addEventListener('click', () => {
        imageFile.click();
    });

    imageFile.addEventListener('change', handleImageUpload);
}

// Load GitHub configuration
function loadGitHubConfig() {
    githubToken = localStorage.getItem('github_token') || '';
    githubRepo = localStorage.getItem('github_repo') || 'Orichen0914/0000space-website';
    
    if (!githubToken) {
        document.getElementById('tokenModal').classList.add('active');
    }
}

// Save GitHub configuration
function saveGitHubConfig() {
    const token = document.getElementById('githubToken').value;
    const repo = document.getElementById('githubRepo').value;
    
    if (token && repo) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_repo', repo);
        githubToken = token;
        githubRepo = repo;
        
        document.getElementById('tokenModal').classList.remove('active');
        showToast('GitHub configuration saved!');
        loadEvents();
    }
}

// Load events from events.json
async function loadEvents() {
    const loading = document.getElementById('loadingIndicator');
    loading.style.display = 'block';
    
    try {
        // Try to load from GitHub
        if (githubToken && githubRepo) {
            const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/events.json`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const content = atob(data.content);
                const eventsData = JSON.parse(content);
                events = eventsData.events || [];
                renderEvents();
            }
        } else {
            // Fallback to local file
            const response = await fetch('/events.json');
            const data = await response.json();
            events = data.events || [];
            renderEvents();
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Error loading events', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Render events list
function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    events.forEach((event, index) => {
        const eventCard = createEventCard(event, index);
        eventsList.appendChild(eventCard);
    });
}

// Create event card element
function createEventCard(event, index) {
    const div = document.createElement('div');
    div.className = 'admin-event-item';
    
    // Format date for display
    const date = new Date(event.date);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;
    
    div.innerHTML = `
        <img src="/${event.image}" alt="${event.name}" class="admin-event-image">
        <div class="admin-event-info">
            <div class="admin-event-date">${formattedDate}</div>
            <div class="admin-event-name">${event.name}</div>
            <a href="${event.link}" target="_blank" class="admin-event-link">${event.link}</a>
        </div>
        <div class="admin-event-actions">
            <button class="admin-btn admin-btn-secondary admin-btn-small" onclick="editEvent(${index})">Edit</button>
            <button class="admin-btn admin-btn-danger admin-btn-small" onclick="deleteEvent(${index})">Delete</button>
            <button class="admin-btn admin-btn-secondary admin-btn-small" onclick="moveEvent(${index}, -1)">↑</button>
            <button class="admin-btn admin-btn-secondary admin-btn-small" onclick="moveEvent(${index}, 1)">↓</button>
        </div>
    `;
    
    return div;
}

// Open modal for add/edit
function openModal(eventIndex = -1) {
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('eventForm');
    
    currentEditIndex = eventIndex;
    
    if (eventIndex >= 0) {
        // Edit mode
        modalTitle.textContent = 'Edit Event';
        const event = events[eventIndex];
        
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventName').value = event.name;
        document.getElementById('eventLink').value = event.link;
        document.getElementById('eventVisible').checked = event.visible;
        document.getElementById('eventImage').value = event.image;
        
        // Show image preview
        const previewImg = document.getElementById('previewImg');
        previewImg.src = '/' + event.image;
        
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Event';
        form.reset();
        document.getElementById('previewImg').src = '';
        document.getElementById('eventImage').value = '';
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditIndex = -1;
}

// Save event (add or update)
function saveEvent() {
    const eventData = {
        id: currentEditIndex >= 0 ? events[currentEditIndex].id : Date.now(),
        image: document.getElementById('eventImage').value,
        date: document.getElementById('eventDate').value,
        name: document.getElementById('eventName').value,
        link: document.getElementById('eventLink').value,
        visible: document.getElementById('eventVisible').checked
    };
    
    if (currentEditIndex >= 0) {
        // Update existing
        events[currentEditIndex] = eventData;
    } else {
        // Add new
        events.push(eventData);
    }
    
    renderEvents();
    closeModal();
    showToast('Event saved locally. Click "Save & Publish" to update website.');
}

// Delete event
function deleteEvent(index) {
    if (confirm('Are you sure you want to delete this event?')) {
        events.splice(index, 1);
        renderEvents();
        showToast('Event deleted. Click "Save & Publish" to update website.');
    }
}

// Move event up or down
function moveEvent(index, direction) {
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < events.length) {
        const temp = events[index];
        events[index] = events[newIndex];
        events[newIndex] = temp;
        renderEvents();
    }
}

// Edit event
function editEvent(index) {
    openModal(index);
}

// Handle image upload
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
    }
    
    // Generate filename
    const date = new Date();
    const filename = `${date.getMonth() + 1}${String(date.getDate()).padStart(2, '0')}_${Date.now() % 1000}.${file.name.split('.').pop()}`;
    const imagePath = `images/events/${filename}`;
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('eventImage').value = imagePath;
        
        // Store base64 for GitHub upload
        document.getElementById('eventImage').dataset.base64 = e.target.result.split(',')[1];
        document.getElementById('eventImage').dataset.filename = filename;
    };
    reader.readAsDataURL(file);
}

// Save to GitHub
async function saveToGitHub() {
    if (!githubToken || !githubRepo) {
        showToast('Please configure GitHub settings first', 'error');
        document.getElementById('tokenModal').classList.add('active');
        return;
    }
    
    try {
        showToast('Publishing to GitHub...');
        
        // First, get the current file to get its SHA
        const getResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/events.json`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
        
        // Prepare events data
        const eventsData = {
            events: events
        };
        
        // Update events.json
        const updateResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/events.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update events via admin panel',
                content: btoa(JSON.stringify(eventsData, null, 2)),
                sha: sha
            })
        });
        
        if (updateResponse.ok) {
            showToast('Successfully published! Website will update in a few moments.');
            
            // Upload any new images
            await uploadNewImages();
        } else {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update');
        }
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

// Upload new images to GitHub
async function uploadNewImages() {
    // This would handle uploading new image files
    // For now, images need to be uploaded separately
    // In a full implementation, we'd track which images are new and upload them
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'admin-toast show';
    if (type === 'error') {
        toast.classList.add('error');
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// PWA Installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    const installBtn = document.createElement('button');
    installBtn.className = 'admin-install-btn';
    installBtn.textContent = '📱 Install App';
    installBtn.onclick = installPWA;
    document.body.appendChild(installBtn);
    installBtn.style.display = 'block';
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('App installed successfully!');
            }
            deferredPrompt = null;
        });
    }
}