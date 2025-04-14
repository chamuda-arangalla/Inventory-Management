// ==============================
// Helper Functions
// ==============================
/**
 * Capitalize the first letter of a string.
 * @param {string} str 
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  
  // ==============================
  // Authentication & User Display
  // ==============================
  function checkAuthentication() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) {
      window.location.href = '../login.html';
      return;
    }
    console.log(`User logged in as: ${userData.role}`);
  }
  
  function displayUserInNavbar() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;
  
    const userDropdown = document.querySelector('#userDropdown');
    if (userDropdown) {
      userDropdown.innerHTML = `
        <i class="fas fa-user-circle"></i> ${userData.username}
        <span class="badge bg-primary ms-2">${capitalizeFirstLetter(userData.role)}</span>
      `;
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
  
  function setupLogout() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('#logout-link')) {
        e.preventDefault();
        logout();
      }
    });
  }
  
  function logout() {
    if (confirm('Are you sure you want to log out?')) {
      sessionStorage.removeItem('userData');
      window.location.href = '../auth/login.html';
    }
  }
  
  // ==============================
  // Sidebar Toggle
  // ==============================
  function toggleSidebar() {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
      wrapper.classList.toggle('toggled');
    }
  }
  
  function setupSidebarToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleSidebar);
    }
  }
  
  // ==============================
  // Notifications Functionality
  // ==============================
  
  // These DOM elements are assumed to exist in your navbar.
  const notificationBell = document.querySelector('#navbarDropdown');
  const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
  const notificationBadge = notificationBell ? notificationBell.querySelector('.badge') : null;
  
  /**
   * Fetch notifications from the backend.
   */
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
  
  /**
   * Update the notification badge with the count.
   * Hides the badge if the count is zero.
   * @param {number} count 
   */
  function updateNotificationBadge(count) {
    if (notificationBadge) {
      notificationBadge.textContent = count;
      notificationBadge.style.display = count === 0 ? 'none' : 'inline-block';
    }
  }
  
  /**
   * Update the notification dropdown list.
   * @param {Array} notifications 
   */
  function updateNotificationDropdown(notifications) {
    if (!notificationDropdown) return;
  
    // Keep the first child (header) and clear others.
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
  
  /**
   * Initialize notification fetching.
   */
  function initNotifications() {
    fetchNotifications();
    setInterval(fetchNotifications, 300000);
    if (notificationBell) {
      notificationBell.addEventListener('click', fetchNotifications);
    }
  }
  
  // ==============================
  // Product Management Functions
  // ==============================
  /**
   * Load products for a given supplier and populate the table.
   * @param {number|string} supplierId 
   */
  function loadProducts(supplierId) {
    axios.get(`http://localhost:8080/api/v1/product/sup-product/${supplierId}`)
      .then(response => {
        const products = response.data;
        const tableBody = document.querySelector('#productsTable tbody');
        if (!tableBody) return;
  
        tableBody.innerHTML = ''; // Clear existing rows
  
        products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.productName}</td>
            <td>${product.category}</td>
            <td>${product.quantityInStock}</td>
            <td>$${product.unitPrice.toFixed(2)}</td>
            <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
            <td><span class="badge ${getStatusBadgeClass(product.inventory.stockStatus)}">${product.inventory.stockStatus}</span></td>
            <td>
              <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${product.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
  
        // Add event listeners to edit buttons.
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            openEditModal(productId);
          });
        });
  
        // Add event listeners to delete buttons.
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            document.getElementById('deleteProductId').value = productId;
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
            deleteModal.show();
          });
        });
      })
      .catch(error => {
        console.error('Error loading products:', error);
        alert('Error loading products. Please try again.');
      });
  }
  
  /**
   * Return the appropriate badge class for a given status.
   * @param {string} status 
   * @returns {string}
   */
  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'LowStock': return 'bg-warning text-dark';
      case 'OutOfStock': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
  
  /**
   * Add a new product.
   */
  function addProduct() {
    const expiryDateInput = document.getElementById('expiryDate').value;
    if (!expiryDateInput) {
      alert('Please select an expiry date');
      return;
    }
  
    const productData = {
      productName: document.getElementById('productName').value,
      description: document.getElementById('description').value,
      category: document.getElementById('category').value,
      quantityInStock: parseInt(document.getElementById('quantity').value),
      unitPrice: parseFloat(document.getElementById('price').value),
      expiryDate: expiryDateInput,
      supplierId: parseInt(document.getElementById('supplierId').value)
    };
  
    console.log('Sending product data:', productData);
  
    axios.post('http://localhost:8080/api/v1/product/save', productData, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        if (modal) modal.hide();
        loadProducts(productData.supplierId);
        document.getElementById('addProductForm').reset();
      })
      .catch(error => {
        console.error('Full error:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          alert('Error: ' + (error.response.data.message || 'Invalid date format'));
        } else {
          alert('Network error: Could not connect to server');
        }
      });
  }
  
  /**
   * Open the edit modal for a given product.
   * @param {number|string} productId 
   */
  function openEditModal(productId) {
    if (!productId) {
      console.error('No product ID provided');
      return;
    }
  
    // Show loading state on the update button.
    const updateBtn = document.getElementById('updateProductBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  
    axios.get(`http://localhost:8080/api/v1/product/get-product/${productId}`)
      .then(response => {
        const product = response.data;
        const setValue = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.value = value || '';
        };
  
        setValue('editProductId', product.id);
        setValue('editSupplierId', product.supplier?.id);
        setValue('editProductName', product.productName);
        setValue('editDescription', product.description);
        setValue('editCategory', product.category);
        setValue('editQuantity', product.quantityInStock);
        setValue('editPrice', product.unitPrice);
        if (product.expiryDate) {
          const date = new Date(product.expiryDate);
          if (!isNaN(date.getTime())) {
            setValue('editExpiryDate', date.toISOString().split('T')[0]);
          }
        }
  
        const editModalEl = document.getElementById('editProductModal');
        const editModal = new bootstrap.Modal(editModalEl);
        editModal.show();
      })
      .catch(error => {
        console.error('Error fetching product:', error);
        alert('Error: ' + (error.response?.data?.message || 'Could not load product'));
      })
      .finally(() => {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Product';
      });
  }
  
  /**
   * Initialize edit modal event listeners for dynamically created buttons.
   */
  function initEditModal() {
    document.addEventListener('click', function (e) {
      const editBtn = e.target.closest('.edit-btn');
      if (editBtn) {
        const productId = editBtn.dataset.id;
        openEditModal(productId);
      }
    });
  
    const updateBtn = document.getElementById('updateProductBtn');
    if (updateBtn) {
      updateBtn.addEventListener('click', updateProduct);
    }
  }
  
  /**
   * Update a product.
   */
  function updateProduct() {
    const productId = document.getElementById('editProductId').value;
    const productData = {
      productName: document.getElementById('editProductName').value,
      description: document.getElementById('editDescription').value,
      category: document.getElementById('editCategory').value,
      quantityInStock: parseInt(document.getElementById('editQuantity').value),
      unitPrice: parseFloat(document.getElementById('editPrice').value),
      expiryDate: document.getElementById('editExpiryDate').value,
      supplierId: parseInt(document.getElementById('editSupplierId').value)
    };
  
    Swal.fire({
      title: 'Updating Product',
      html: 'Please wait while we update your product...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
  
    axios.put(`http://localhost:8080/api/v1/product/update/${productId}`, productData)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product updated successfully',
          confirmButtonColor: '#3085d6',
          background: '#f8f9fa',
          backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
          `
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        if (modal) modal.hide();
        loadProducts(productData.supplierId);
      })
      .catch(error => {
        let errorMessage = 'Failed to update product';
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        }
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMessage,
          confirmButtonColor: '#d33',
          background: '#f8f9fa',
          showClass: { popup: 'animate__animated animate__shakeX' }
        });
      });
  }
  
  /**
   * Delete a product.
   */
  function deleteProduct() {
    const productId = document.getElementById('deleteProductId').value;
    const supplierId = document.getElementById('supplierId').value;
  
    axios.delete(`http://localhost:8080/api/v1/product/delete/${productId}`)
      .then(response => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
        if (modal) modal.hide();
        loadProducts(supplierId);
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + (error.response?.data?.message || error.message));
      });
  }
  
  // ==============================
  // Main Initialization
  // ==============================
  document.addEventListener('DOMContentLoaded', function () {
    // Authentication & User Info
    checkAuthentication();
    setupSidebarToggle();
    displayUserInNavbar();
    setupLogout();
  
    // Initialize Notifications
    initNotifications();
  
    // Product Management
    const supplierIdEl = document.getElementById('supplierId');
    const supplierId = supplierIdEl ? supplierIdEl.value : 1;
    loadProducts(supplierId);
  
    document.getElementById('saveProductBtn')?.addEventListener('click', addProduct);
    document.getElementById('updateProductBtn')?.addEventListener('click', updateProduct);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', deleteProduct);
  
    initEditModal();
  });
  