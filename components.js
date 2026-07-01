console.log('components.js loaded successfully');

// Load navigation and footer components
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, loading components...');
    
    // Load navigation
    fetch('navigation.html')
        .then(response => {
            console.log('Navigation fetch response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('Navigation HTML loaded');
            const navPlaceholder = document.getElementById('nav-placeholder');
            if (navPlaceholder) {
                navPlaceholder.innerHTML = html;
                console.log('Navigation inserted');
                initializeNavigation();
            } else {
                console.error('nav-placeholder not found');
            }
        })
        .catch(error => console.error('Error loading navigation:', error));

    // Load footer
    fetch('footer.html')
        .then(response => {
            console.log('Footer fetch response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            console.log('Footer HTML loaded');
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = html;
                console.log('Footer inserted');
            } else {
                console.error('footer-placeholder not found');
            }
        })
        .catch(error => console.error('Error loading footer:', error));
});

// Initialize navigation functionality
function initializeNavigation() {
    // Set active page
    const currentPage = window.location.pathname.split('/').pop() || 'selection.html';
    const navLinks = document.querySelectorAll('#mainNav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'selection.html')) {
            link.classList.add('active');
        }
    });

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('#mainNav');
    
    if (hamburger && nav) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
                nav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}
