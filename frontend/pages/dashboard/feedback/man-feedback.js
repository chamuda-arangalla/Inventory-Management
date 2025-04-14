document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');
    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Global variables
    let allFeedback = [];
    let allProducts = [];
    let supplierId = 1; // Assuming supplier ID is 1, you can change this as needed

    // Initialize the page
    initPage();

    // Initialize the page
    async function initPage() {
        await fetchProducts();
        await fetchFeedback();
        setupEventListeners();
    }

    // Fetch all products for the supplier
    async function fetchProducts() {
        try {
            const response = await axios.get(`http://localhost:8082/api/v1/product/sup-product/${supplierId}`);
            allProducts = response.data;
            populateProductFilters();
        } catch (error) {
            console.error('Error fetching products:', error);
            showErrorAlert('Failed to load products. Please try again later.');
        }
    }

    // Fetch all feedback
    async function fetchFeedback() {
        try {
            const response = await axios.get('http://localhost:8082/api/v1/feedback/all');
            allFeedback = response.data;
            renderFeedbackCards(allFeedback);
            updateNoFeedbackMessage();
        } catch (error) {
            console.error('Error fetching feedback:', error);
            showErrorAlert('Failed to load feedback. Please try again later.');
        }
    }

    // Populate product filters
    function populateProductFilters() {
        const productFilter = document.getElementById('productFilter');
        const productSelect = document.getElementById('productSelect');
        
        // Clear existing options
        productFilter.innerHTML = '<option value="">All Products</option>';
        productSelect.innerHTML = '<option value="" selected disabled>Select a product</option>';
        
        // Add products to both dropdowns
        allProducts.forEach(product => {
            const option1 = document.createElement('option');
            option1.value = product.id;
            option1.textContent = product.productName;
            productFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = product.id;
            option2.textContent = product.productName;
            productSelect.appendChild(option2);
        });
    }

    // Render feedback cards
    function renderFeedbackCards(feedbackList) {
        const feedbackContainer = document.getElementById('feedbackContainer');
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

    // Render star rating
    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= rating ? 'text-warning' : 'text-secondary'}"></i>`;
        }
        return stars;
    }

    // Show feedback details in modal
    async function showFeedbackDetails(feedbackId) {
        const feedback = allFeedback.find(f => f.id === feedbackId);
        if (!feedback) return;
        
        try {
            // Fetch detailed product information
            const response = await axios.get(`http://localhost:8082/api/v1/product/get-product/${feedback.productId}`);
            const product = response.data;
            
            // Set modal content
            document.getElementById('detailProductName').textContent = product.productName || 'Unknown Product';
            
            // Create product details HTML
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
            
            // Set rating stars
            const starsContainer = document.getElementById('detailRatingStars');
            starsContainer.innerHTML = renderStars(feedback.starRating);
            
            // Set feedback text
            document.getElementById('detailFeedbackText').textContent = feedback.feedback;
            
            // Replace the product description with detailed info
            const detailProductDesc = document.getElementById('detailProductDesc');
            detailProductDesc.innerHTML = productDetailsHTML;
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('feedbackDetailModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error fetching product details:', error);
            showErrorAlert('Failed to load product details. Please try again later.');
        }
    }

    // Update no feedback message visibility
    function updateNoFeedbackMessage() {
        const noFeedbackMessage = document.getElementById('noFeedbackMessage');
        noFeedbackMessage.classList.toggle('d-none', allFeedback.length > 0);
    }

    // Setup event listeners for filters and search
    function setupEventListeners() {
        // Rating filter
        document.getElementById('ratingFilter').addEventListener('change', function() {
            filterFeedback();
        });
        
        // Product filter
        document.getElementById('productFilter').addEventListener('change', function() {
            filterFeedback();
        });
        
        // Search input
        document.getElementById('feedbackSearch').addEventListener('input', function() {
            filterFeedback();
        });
    }

    // Filter feedback based on selected filters and search term
    function filterFeedback() {
        const ratingFilter = parseInt(document.getElementById('ratingFilter').value) || 0;
        const productFilter = document.getElementById('productFilter').value;
        const searchTerm = document.getElementById('feedbackSearch').value.toLowerCase();
        
        let filtered = allFeedback;
        
        // Apply rating filter
        if (ratingFilter > 0) {
            filtered = filtered.filter(f => f.starRating === ratingFilter);
        }
        
        // Apply product filter
        if (productFilter) {
            filtered = filtered.filter(f => f.productId === parseInt(productFilter));
        }
        
        // Apply search filter
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

    // Show error alert
    function showErrorAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to the top of the main content
        const mainContent = document.querySelector('#page-content-wrapper > .container-fluid');
        mainContent.insertBefore(alert, mainContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

      // Add each notification to the dropdown
    notifications.forEach(notification => {
    const notificationItem = document.createElement('li');
    
    // Check if notification mentions "expire today" or "expired" to set appropriate icon
    let iconClass = 'fas fa-exclamation-circle text-warning';
    if (notification.includes('expire today')) {
      iconClass = 'fas fa-exclamation-triangle text-danger';
    } else if (notification.includes('expired')) {
      iconClass = 'fas fa-times-circle text-danger';
    }
    
    notificationItem.innerHTML = `<a class="dropdown-item" href="#"><i class="${iconClass} me-2"></i>${notification}</a>`;
    notificationDropdown.appendChild(notificationItem);
  });

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
});