document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const galleryLink = document.getElementById('gallery-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Gallery external link
    galleryLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://0000nyc.pixieset.com/folder/B7ujXGZwzroO/', '_blank');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.querySelector('.navbar');
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // Load events from JSON
    loadEvents();

    // Form submission handling for private events page
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Simple validation
            if (!formObject.name || !formObject.email) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            alert('Thank you for your inquiry! We will get back to you within 24 hours.');
            this.reset();
        });
    }
});

// Function to load events from JSON
async function loadEvents() {
    console.log('Loading events...');
    
    // Check for preview data first
    const previewData = localStorage.getItem('preview_events');
    let data;
    
    if (previewData) {
        // Use preview data if available
        data = JSON.parse(previewData);
        console.log('Using preview events data:', data);
        
        // Show preview indicator with close button
        const previewIndicator = document.createElement('div');
        previewIndicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; font-family: system-ui; display: flex; align-items: center; gap: 10px;';
        previewIndicator.innerHTML = '👁️ Preview Mode <button onclick="localStorage.removeItem(\'preview_events\'); location.reload();" style="background: white; color: #3b82f6; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Exit Preview</button>';
        document.body.appendChild(previewIndicator);
    } else {
        // Load from file normally
        try {
            const response = await fetch('events.json?v=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            console.log('Events data loaded:', data);
        } catch (error) {
            console.error('Error loading events:', error);
            return;
        }
    }
    
    // Filter visible events and sort by date
    const visibleEvents = data.events
        .filter(event => event.visible)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('Visible events:', visibleEvents.length);
        
        // Get the events grid container
        const eventsGrid = document.querySelector('.events-grid');
        console.log('Events grid found:', !!eventsGrid);
        
        if (eventsGrid) {
            // Clear existing content
            eventsGrid.innerHTML = '';
            
            // Create event cards
            visibleEvents.forEach(event => {
                console.log('Creating card for:', event.image);
                const eventCard = createEventCard(event);
                eventsGrid.appendChild(eventCard);
            });
            
            console.log('All cards created');
        } else {
            // Fallback: create static event cards
            const eventsGrid = document.querySelector('.events-grid');
        if (eventsGrid) {
            console.log('Loading fallback events...');
            const fallbackEvents = [
                { image: "images/events/0821.png", date: "2025-08-21", name: "V5 Reggaeton", link: "https://posh.vip/e/0000-reggaeton-long-island-city" },
                { image: "images/events/0822_0.png", date: "2025-08-22", name: "World Stage 2025", link: "https://posh.vip/e/world-stage-2025" },
                { image: "images/events/0822_1.jpg", date: "2025-08-22", name: "Midnight City", link: "https://posh.vip/e/0000-midnight-city-082225" },
                { image: "images/events/0823_0.jpg", date: "2025-08-23", name: "Sunset Rooftop Party", link: "https://posh.vip/e/0000-midnight-sunset-rooftop-party" },
                { image: "images/events/0823_1.jpg", date: "2025-08-23", name: "Anime Rave NYC", link: "https://posh.vip/e/0000-the-sanctuary" },
                { image: "images/events/0829.jpg", date: "2025-08-29", name: "Midnight City", link: "https://posh.vip/e/0000-midnight-city-082925" },
                { image: "images/events/0905.jpg", date: "2025-09-05", name: "K-POP x Hip-Hop Night", link: "https://posh.vip/e/0000-kpop-x-hiphop-night" }
            ];
            
            eventsGrid.innerHTML = '';
            fallbackEvents.forEach(event => {
                const eventCard = createEventCard(event);
                eventsGrid.appendChild(eventCard);
            });
            console.log('Fallback events loaded');
        }
    }
}

// Function to create an event card
function createEventCard(event) {
    console.log('Creating card for event:', event);
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // 创建图片容器
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'event-card-image-wrapper';
    
    // 创建图片元素
    const img = document.createElement('img');
    // Use preview image if available (base64), otherwise use regular path
    img.src = event.imagePreview || event.image;
    img.alt = event.name || 'Event';
    img.className = 'event-image';
    
    // Add debugging for image loading
    img.onload = function() {
        console.log('Image loaded successfully:', event.image);
    };
    img.onerror = function() {
        console.error('Image failed to load:', event.image);
    };
    
    // 格式化日期 (YYYY-MM-DD -> AUG 22)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const [year, month, day] = dateStr.split('-');
        const monthName = months[parseInt(month) - 1];
        return `${monthName} ${parseInt(day)}`;
    };
    
    // 如果有链接，创建<a>标签包裹图片
    if (event.link) {
        const link = document.createElement('a');
        link.href = event.link;
        link.target = '_blank';  // 在新标签页打开
        link.style.display = 'block';
        link.style.textDecoration = 'none';  // 移除下划线
        
        imageWrapper.appendChild(img);
        link.appendChild(imageWrapper);
        card.appendChild(link);
    } else {
        // 没有链接就直接添加图片
        imageWrapper.appendChild(img);
        card.appendChild(imageWrapper);
    }
    
    // 创建信息容器（独立于链接）
    const infoContainer = document.createElement('div');
    infoContainer.className = 'event-info';
    
    // 创建日期元素
    const dateElement = document.createElement('span');
    dateElement.className = 'event-date';
    dateElement.textContent = formatDate(event.date);
    
    // 创建名称元素
    const nameElement = document.createElement('span');
    nameElement.className = 'event-name';
    nameElement.textContent = event.name || '';
    
    infoContainer.appendChild(dateElement);
    infoContainer.appendChild(nameElement);
    card.appendChild(infoContainer);
    
    console.log('Card created with image src:', event.image);
    return card;
}

// Function to add hover effects
function addHoverEffects() {
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Fallback function to show default events
function showDefaultEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    if (eventsGrid && eventsGrid.children.length === 0) {
        // If no events loaded and grid is empty, show default structure
        const defaultHTML = `
            <div class="event-card">
                <img src="images/events/event1.jpg" alt="Event 1" class="event-image">
            </div>
            <div class="event-card">
                <img src="images/events/event2.jpg" alt="Event 2" class="event-image">
            </div>
            <div class="event-card">
                <img src="images/events/event3.jpg" alt="Event 3" class="event-image">
            </div>
            <div class="event-card">
                <img src="images/events/event4.jpg" alt="Event 4" class="event-image">
            </div>
        `;
        eventsGrid.innerHTML = defaultHTML;
        addHoverEffects();
    }
}