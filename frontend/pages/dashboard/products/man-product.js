document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const notificationBell = document.querySelector('#navbarDropdown');
    const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
    const notificationBadge = notificationBell.querySelector('.badge');
    
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Initialize product management
    initProductManagement();


});


// DOM elements
const notificationBell = document.querySelector('#navbarDropdown');
const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
const notificationBadge = notificationBell.querySelector('.badge');

function initProductManagement() {
    // Load products when page loads
    loadProducts();
    
    // Set up form submission
    document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
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

function loadProducts() {
    axios.get('http://localhost:8080/api/v1/product/all')
        .then(response => {
            const products = response.data;
            const tableBody = document.querySelector('#productsTable tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            
            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.productName}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td>${product.category}</td>
                    <td>${product.quantityInStock}</td>
                    <td>$${product.unitPrice.toFixed(2)}</td>
                    <td>${product.expiryDate}</td>
                    <td>${product.supplier.name}</td>
                    <td>
                        <span class="badge ${getStatusBadgeClass(product.inventory.stockStatus)}">
                            ${product.inventory.stockStatus}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showAlert('Failed to load products. Please try again.', 'danger');
        });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'Active': return 'bg-success';
        case 'Low Stock': return 'bg-warning text-dark';
        case 'Out of Stock': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function editProduct(productId) {
    // Implement edit functionality
    console.log('Edit product:', productId);
    // You can open a modal similar to addProductModal but pre-filled with product data
    // and make a PUT request to /api/v1/product/update/{productId}
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        axios.delete(`http://localhost:8080/api/v1/product/delete/${productId}`)
            .then(response => {
                // Reload products
                loadProducts();
                
                // Show success message
                showAlert('Product deleted successfully!', 'success');
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                showAlert('Failed to delete product. Please try again.', 'danger');
            });
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function fetchNotifications() {
  axios.get('http://localhost:8080/api/v1/notifications/')
    .then(response => {
      // Get the expiring product notifications from the response
      const notifications = response.data;
      
      // Update the notification badge count
      updateNotificationBadge(notifications.length);
      
      // Update the dropdown with notifications
      updateNotificationDropdown(notifications);
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
    });
}


// Function to update the notification badge with the count
function updateNotificationBadge(count) {
  notificationBadge.textContent = count;
  
  // Hide badge if no notifications
  if (count === 0) {
    notificationBadge.style.display = 'none';
  } else {
    notificationBadge.style.display = 'inline-block';
  }
}

function updateNotificationDropdown(notifications) {
  // Clear existing notification items (keeping the header)
  while (notificationDropdown.children.length > 1) {
    notificationDropdown.removeChild(notificationDropdown.lastChild);
  }
  
  // If there are no notifications, add a message
  if (notifications.length === 0) {
    const noNotificationsItem = document.createElement('li');
    noNotificationsItem.innerHTML = '<a class="dropdown-item" href="#"><i class="fas fa-check-circle text-success me-2"></i>No expiring products</a>';
    notificationDropdown.appendChild(noNotificationsItem);
    return;
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
  
  // Add "View All" link if there are multiple notifications
  if (notifications.length > 1) {
    const viewAllItem = document.createElement('li');
    const divider = document.createElement('li');
    divider.innerHTML = '<hr class="dropdown-divider">';
    viewAllItem.innerHTML = '<a class="dropdown-item text-center" href="#"><small>View all notifications</small></a>';
    
    notificationDropdown.appendChild(divider);
    notificationDropdown.appendChild(viewAllItem);
  }
}


// Fetch notifications when the page loads
document.addEventListener('DOMContentLoaded', function() {
  fetchNotifications();
  
  // Set up periodic refresh (every 5 minutes)
  setInterval(fetchNotifications, 300000);
});

// Optional: Add a click handler to refresh notifications manually
notificationBell.addEventListener('click', function() {
  fetchNotifications();
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
      window.location.href = '../login.html';
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