document.addEventListener('DOMContentLoaded', function() {
    // -------------------------------------------------------
    // Sidebar Toggle Functionality
    // -------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');
    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // -------------------------------------------------------
    // Global Variables for Product and Feedback Management
    // -------------------------------------------------------
    let allFeedback = [];
    let allProducts = [];
    let supplierId = 1; // Assuming supplier ID is 1; adjust as needed

    // -------------------------------------------------------
    // Notifications: DOM Elements and Functions
    // -------------------------------------------------------
    const notificationBell = document.querySelector('#navbarDropdown');
    const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
    const notificationBadge = notificationBell ? notificationBell.querySelector('.badge') : null;

    // Fetch notifications from the backend
    function fetchNotifications() {
        axios.get('http://localhost:8080/api/v1/notifications/')
            .then(response => {
                const notifications = response.data;
                updateNotificationBadge(notifications.length);
                updateNotificationDropdown(notifications);
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
    }

    // Update the notification badge with the count
    function updateNotificationBadge(count) {
        if (notificationBadge) {
            notificationBadge.textContent = count;
            notificationBadge.style.display = (count === 0) ? 'none' : 'inline-block';
        }
    }

    // Update the dropdown with the fetched notifications
    function updateNotificationDropdown(notifications) {
        if (!notificationDropdown) return;
        // Clear existing items except the header (assumed to be the first child)
        while (notificationDropdown.children.length > 1) {
            notificationDropdown.removeChild(notificationDropdown.lastChild);
        }
        if (notifications.length === 0) {
            const noNotificationsItem = document.createElement('li');
            noNotificationsItem.innerHTML = '<a class="dropdown-item" href="#"><i class="fas fa-check-circle text-success me-2"></i>No expiring products</a>';
            notificationDropdown.appendChild(noNotificationsItem);
            return;
        }
        notifications.forEach(notification => {
            const notificationItem = document.createElement('li');
            let iconClass = 'fas fa-exclamation-circle text-warning';
            if (notification.includes('expire today')) {
                iconClass = 'fas fa-exclamation-triangle text-danger';
            } else if (notification.includes('expired')) {
                iconClass = 'fas fa-times-circle text-danger';
            }
            notificationItem.innerHTML = `<a class="dropdown-item" href="#"><i class="${iconClass} me-2"></i>${notification}</a>`;
            notificationDropdown.appendChild(notificationItem);
        });
        if (notifications.length > 1) {
            const divider = document.createElement('li');
            divider.innerHTML = '<hr class="dropdown-divider">';
            notificationDropdown.appendChild(divider);
            const viewAllItem = document.createElement('li');
            viewAllItem.innerHTML = '<a class="dropdown-item text-center" href="#"><small>View all notifications</small></a>';
            notificationDropdown.appendChild(viewAllItem);
        }
    }

    // Initialize notifications: fetch immediately, set up a periodic refresh, and a click handler
    fetchNotifications();
    setInterval(fetchNotifications, 300000); // Refresh every 5 minutes
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            fetchNotifications();
        });
    }

    // -------------------------------------------------------
    // Initialize the Page: Load Products, Feedback, and Setup Events
    // -------------------------------------------------------
    initPage();

    async function initPage() {
        await fetchProducts();
        await fetchFeedback();
        setupEventListeners();
    }

    // -------------------------------------------------------
    // Product Management Functions
    // -------------------------------------------------------
    // Fetch all products for the supplier
    async function fetchProducts() {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/product/sup-product/${supplierId}`);
            allProducts = response.data;
            populateProductFilters();
        } catch (error) {
            console.error('Error fetching products:', error);
            showErrorAlert('Failed to load products. Please try again later.');
        }
    }

    // Populate product filters (for dropdowns)
    function populateProductFilters() {
        const productFilter = document.getElementById('productFilter');
        const productSelect = document.getElementById('productSelect');
        
        if (productFilter) {
            productFilter.innerHTML = '<option value="">All Products</option>';
            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productName;
                productFilter.appendChild(option);
            });
        }
        
        if (productSelect) {
            productSelect.innerHTML = '<option value="" selected disabled>Select a product</option>';
            allProducts.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productName;
                productSelect.appendChild(option);
            });
        }
    }

    // -------------------------------------------------------
    // Feedback Management Functions
    // -------------------------------------------------------
    // Fetch all feedback
    async function fetchFeedback() {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/feedback/all');
            allFeedback = response.data;
            renderFeedbackCards(allFeedback);
            updateNoFeedbackMessage();
        } catch (error) {
            console.error('Error fetching feedback:', error);
            showErrorAlert('Failed to load feedback. Please try again later.');
        }
    }

    // Render feedback cards on the page
    function renderFeedbackCards(feedbackList) {
        const feedbackContainer = document.getElementById('feedbackContainer');
        if (!feedbackContainer) return;
        feedbackContainer.innerHTML = '';

        feedbackList.forEach(feedback => {
            const product = allProducts.find(p => p.id === feedback.productId) || {};
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            card.innerHTML = `
                <div class="card feedback-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">${product.productName || 'Unknown Product'}</h5>
                            <div class="rating">
                                ${renderStars(feedback.starRating)}
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <small class="text-muted">Category: ${product.category || 'N/A'}</small>
                            <small class="text-muted">Qty: ${product.quantityInStock || 'N/A'}</small>
                        </div>
                        <p class="card-text mt-2">${feedback.feedback}</p>
                    </div>
                    <div class="card-footer bg-transparent">
                        <button class="btn btn-sm btn-outline-primary view-details" data-id="${feedback.id}">
                            <i class="fas fa-eye me-1"></i> View Details
                        </button>
                    </div>
                </div>
            `;
            feedbackContainer.appendChild(card);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const feedbackId = parseInt(this.getAttribute('data-id'));
                showFeedbackDetails(feedbackId);
            });
        });
    }

    // Render star rating as HTML icons
    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= rating ? 'text-warning' : 'text-secondary'}"></i>`;
        }
        return stars;
    }

    // Show feedback details in a modal
    async function showFeedbackDetails(feedbackId) {
        const feedback = allFeedback.find(f => f.id === feedbackId);
        if (!feedback) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/product/get-product/${feedback.productId}`);
            const product = response.data;
            
            document.getElementById('detailProductName').textContent = product.productName || 'Unknown Product';
            
            const productDetailsHTML = `
                <div class="row">
                    <div class="col-6">
                        <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                        <p><strong>Price:</strong> $${product.unitPrice || 'N/A'}</p>
                    </div>
                    <div class="col-6">
                        <p><strong>Quantity:</strong> ${product.quantityInStock || 'N/A'}</p>
                        <p><strong>Expiry:</strong> ${product.expiryDate || 'N/A'}</p>
                    </div>
                </div>
                <p><strong>Supplier:</strong> ${product.supplier?.name || 'N/A'}</p>
            `;
            
            document.getElementById('detailRatingStars').innerHTML = renderStars(feedback.starRating);
            document.getElementById('detailFeedbackText').textContent = feedback.feedback;
            document.getElementById('detailProductDesc').innerHTML = productDetailsHTML;
            
            const modal = new bootstrap.Modal(document.getElementById('feedbackDetailModal'));
            modal.show();
        } catch (error) {
            console.error('Error fetching product details:', error);
            showErrorAlert('Failed to load product details. Please try again later.');
        }
    }

    // Update visibility of "no feedback" message based on data
    function updateNoFeedbackMessage() {
        const noFeedbackMessage = document.getElementById('noFeedbackMessage');
        if (noFeedbackMessage) {
            noFeedbackMessage.classList.toggle('d-none', allFeedback.length > 0);
        }
    }

    // Setup event listeners for filters and search inputs
    function setupEventListeners() {
        const ratingFilterEl = document.getElementById('ratingFilter');
        const productFilterEl = document.getElementById('productFilter');
        const feedbackSearchEl = document.getElementById('feedbackSearch');
        
        if (ratingFilterEl) {
            ratingFilterEl.addEventListener('change', filterFeedback);
        }
        if (productFilterEl) {
            productFilterEl.addEventListener('change', filterFeedback);
        }
        if (feedbackSearchEl) {
            feedbackSearchEl.addEventListener('input', filterFeedback);
        }
    }

    // Filter feedback based on rating, product, and search term
    function filterFeedback() {
        const ratingFilter = parseInt(document.getElementById('ratingFilter').value) || 0;
        const productFilter = document.getElementById('productFilter').value;
        const searchTerm = document.getElementById('feedbackSearch').value.toLowerCase();
        
        let filtered = allFeedback;
        if (ratingFilter > 0) {
            filtered = filtered.filter(f => f.starRating === ratingFilter);
        }
        if (productFilter) {
            filtered = filtered.filter(f => f.productId === parseInt(productFilter));
        }
        if (searchTerm) {
            filtered = filtered.filter(f => {
                const product = allProducts.find(p => p.id === f.productId) || {};
                return (
                    f.feedback.toLowerCase().includes(searchTerm) ||
                    (product.productName && product.productName.toLowerCase().includes(searchTerm))
                );
            });
        }
        renderFeedbackCards(filtered);
        updateNoFeedbackMessage();
    }

    // Show error alert messages (auto-removes after 5 seconds)
    function showErrorAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        const mainContent = document.querySelector('#page-content-wrapper > .container-fluid');
        if (mainContent) {
            mainContent.insertBefore(alert, mainContent.firstChild);
        }
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    checkAuthentication();
    
    // Setup sidebar toggle
    document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
    
    // Load user data and display in navbar
    displayUserInNavbar();
    
    // Setup logout functionality
    setupLogout();
  });
  
  // Function to check authentication
  function checkAuthentication() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    
    if (!userData) {
        window.location.href = '../../auth/login.html';
        return;
    }
    
    // Display user role in console for debugging
    console.log(`User logged in as: ${userData.role}`);
  }
  
  // Function to display user in navbar
  function displayUserInNavbar() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;
    
    const userDropdown = document.querySelector('#userDropdown');
    if (userDropdown) {
        // Update the username display
        userDropdown.innerHTML = `
            <i class="fas fa-user-circle"></i> ${userData.username}
            <span class="badge bg-primary ms-2">${capitalizeFirstLetter(userData.role)}</span>
        `;
        
        // Update the dropdown menu with user-specific options
        const dropdownMenu = userDropdown.nextElementSibling;
        dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">${userData.username}</h6></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logout-link"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        `;
    }
  }
  
  // Helper function to capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  
  // Function to setup logout
  function setupLogout() {
    // Handle logout from dropdown
    document.addEventListener('click', function(e) {
        if (e.target.closest('#logout-link')) {
            e.preventDefault();
            logout();
        }
    });
  }
  
  // Logout function (frontend only)
  function logout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to log out?')) {
        // Clear session storage
        sessionStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = '../../auth/login.html';
    }
  }
  
  function toggleSidebar() {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.classList.toggle('toggled');
    }
  }
