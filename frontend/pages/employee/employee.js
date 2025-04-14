// ===============================
// GLOBAL VARIABLE DECLARATIONS
// ===============================
let allFeedback = [];
let allProducts = [];
let supplierId = 1; // Adjust supplier ID as needed

// Notification DOM elements (assumes these exist in your navbar)
const notificationBell = document.querySelector('#navbarDropdown');
const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
const notificationBadge = notificationBell ? notificationBell.querySelector('.badge') : null;

// ===============================
// AUTHENTICATION & USER FUNCTIONS
// ===============================
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
  document.addEventListener('click', function(e) {
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// ===============================
// SIDEBAR TOGGLE FUNCTIONALITY
// ===============================
function toggleSidebar() {
  const wrapper = document.getElementById('wrapper');
  if (wrapper) {
    wrapper.classList.toggle('toggled');
  }
}

function setupSidebarToggle() {
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle && document.getElementById('wrapper')) {
    menuToggle.addEventListener('click', function() {
      toggleSidebar();
    });
  }
}

// ===============================
// ORDERS & RECEIPT FUNCTIONS
// ===============================
function fetchOrders() {
  console.log("[DEBUG] Starting to fetch orders...");
  axios.get('http://localhost:8080/api/v1/order/')
    .then(response => {
      console.log("[DEBUG] Received response:", response);
      console.log("[DEBUG] Response data:", response.data);
      if (!response.data) {
        console.error("[ERROR] No data in response");
        return;
      }
      displayOrders(response.data);
      updateMetrics(response.data);
    })
    .catch(error => {
      console.error("[ERROR] Failed to fetch orders:", error);
      if (error.response) {
        console.error("Server responded with:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    });
}

function displayOrders(orders) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = ''; // Clear existing rows

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
    return;
  }

  orders.forEach(order => {
    const row = document.createElement('tr');
    // Format date (assume order.orderDate is ISO-formatted)
    const orderDate = order.orderDate || new Date().toISOString();
    const formattedDate = orderDate.split('T')[0];

    // Create status badge
    let statusText = order.status || 'PENDING';
    let statusClass = 'badge ';
    if (statusText === 'PENDING') {
      statusClass += 'bg-warning text-dark';
    } else if (statusText === 'CONFIRM') {
      statusClass += 'bg-success';
    } else {
      statusClass += 'bg-secondary';
    }

    // Determine if action buttons should be shown (only for pending orders)
    const showActions = statusText === 'PENDING';

    row.innerHTML = `
      <td class="order-id">#ORD-${order.id.toString().padStart(3, '0')}</td>
      <td class="date">${formattedDate}</td>
      <td><span class="${statusClass}">${statusText}</span></td>
      <td class="amount">$${(order.totalAmount || 0).toFixed(2)}</td>
      <td class="actions">
        ${showActions ? `
          <button class="btn btn-sm btn-success confirm" data-order-id="${order.id}">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-sm btn-danger reject" data-order-id="${order.id}">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
        <button class="btn btn-sm btn-primary view-details" data-order-id="${order.id}">
          <i class="fas fa-eye"></i> View
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  addButtonEventListeners();
  addViewDetailsListeners(orders);
}

function addViewDetailsListeners(orders) {
  document.querySelectorAll('.view-details').forEach(button => {
    button.addEventListener('click', function() {
      const orderId = parseInt(this.getAttribute('data-order-id'));
      const order = orders.find(o => o.id === orderId);
      if (order) {
        showOrderDetails(order);
      }
    });
  });
}

function showOrderDetails(order) {
  // Set order info in the details modal
  document.getElementById('modalOrderId').textContent = `#ORD-${order.id.toString().padStart(3, '0')}`;
  document.getElementById('modalOrderDate').textContent = order.orderDate.split('T')[0];
  document.getElementById('modalOrderAmount').textContent = `$${order.totalAmount.toFixed(2)}`;
  
  const statusBadge = document.getElementById('modalOrderStatus');
  statusBadge.textContent = order.status;
  statusBadge.className = 'badge ' + (order.status === 'PENDING' ? 'bg-warning text-dark' : 
                          order.status === 'CONFIRM' ? 'bg-success' : 'bg-secondary');

  const productsBody = document.getElementById('modalProductsBody');
  productsBody.innerHTML = '';
  order.products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.productName}</td>
      <td>${product.description}</td>
      <td>${product.category}</td>
      <td>$${product.unitPrice.toFixed(2)}</td>
    `;
    productsBody.appendChild(row);
  });

  // Show or hide the "Generate Receipt" button based on status
  const generateReceiptBtn = document.getElementById('generateReceiptBtn');
  if (order.status === 'CONFIRM') {
    generateReceiptBtn.style.display = 'inline-block';
    generateReceiptBtn.onclick = function() {
      generateReceipt(order);
    };
  } else {
    generateReceiptBtn.style.display = 'none';
  }

  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
  modal.show();
}

function generateReceipt(order) {
  const receiptContent = document.getElementById('receiptContent');
  receiptContent.innerHTML = `
    <div class="receipt-container p-4 border">
      <div class="text-center mb-4">
        <h2 class="mb-1">Your Company Name</h2>
        <p class="mb-1">123 Business Street, City, Country</p>
        <p class="mb-1">Phone: (123) 456-7890</p>
        <p class="mb-1">Email: info@yourcompany.com</p>
        <hr>
      </div>
      <div class="row mb-4">
        <div class="col-md-6">
          <h4>Order Receipt</h4>
          <p><strong>Order ID:</strong> #ORD-${order.id.toString().padStart(3, '0')}</p>
          <p><strong>Date:</strong> ${order.orderDate.split('T')[0]}</p>
        </div>
        <div class="col-md-6 text-end">
          <div class="status-badge ${order.status === 'PENDING' ? 'bg-warning text-dark' : 
                                    order.status === 'CONFIRM' ? 'bg-success' : 'bg-secondary'} badge p-2 mb-2">
            ${order.status}
          </div>
        </div>
      </div>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.products.map((product, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${product.productName}</td>
              <td>${product.description}</td>
              <td>$${product.unitPrice.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <th colspan="3" class="text-end">Total:</th>
            <th>$${order.totalAmount.toFixed(2)}</th>
          </tr>
        </tfoot>
      </table>
      <div class="mt-4 pt-3 border-top text-center">
        <p>Thank you for your business!</p>
        <p class="small text-muted">For any inquiries, please contact our customer service</p>
      </div>
    </div>
  `;
  
  // Close the order details modal and show the receipt modal
  const detailsModal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
  if (detailsModal) detailsModal.hide();
  const receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
  receiptModal.show();
}

function printReceipt() {
  const element = document.getElementById('receiptContent');
  const opt = {
    margin: 10,
    filename: `receipt_ORD-${document.getElementById('modalOrderId').textContent.replace('#', '')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const receiptModal = bootstrap.Modal.getInstance(document.getElementById('receiptModal'));
  if (receiptModal) receiptModal.hide();

  html2pdf().from(element).set(opt).save().then(() => {
    // Optional: Re-open modal after PDF generation if needed
  });
}

function updateMetrics(orders) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.orderStatus === 'PENDING').length;
  const confirmedOrders = orders.filter(order => order.orderStatus === 'CONFIRMED').length;

  document.querySelector('.metric-card.primary .metric-value').textContent = totalOrders;
  document.querySelector('.metric-card.warning .metric-value').textContent = pendingOrders;
  document.querySelector('.metric-card.success .metric-value').textContent = confirmedOrders;
}

// Using SweetAlert for confirm/reject events
function addButtonEventListeners() {
  // Confirm Order
  document.querySelectorAll('.confirm').forEach(button => {
    button.addEventListener('click', function() {
      const orderId = this.getAttribute('data-order-id');
      Swal.fire({
        title: 'Confirm Order',
        text: 'Are you sure you want to confirm this order?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, confirm it!'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.post('http://localhost:8080/api/v1/sale/', { orderId: parseInt(orderId) })
            .then(response => {
              Swal.fire(
                'Confirmed!',
                'Order has been confirmed and sale created.',
                'success'
              ).then(() => {
                fetchOrders(); // Refresh orders table
              });
            })
            .catch(error => {
              Swal.fire(
                'Error!',
                error.response?.data?.message || error.message,
                'error'
              );
            });
        }
      });
    });
  });
  
  // Reject Order
  document.querySelectorAll('.reject').forEach(button => {
    button.addEventListener('click', function() {
      const orderId = this.getAttribute('data-order-id');
      const row = this.closest('tr');
      Swal.fire({
        title: 'Reject Order',
        text: 'Are you sure you want to reject this order?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // For demonstration, we remove the row from UI
          row.remove();
          Swal.fire(
            'Rejected!',
            'Order has been rejected.',
            'success'
          );
          if (document.querySelectorAll('table tbody tr').length === 0) {
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
          }
        }
      });
    });
  });
}

function updateOrderStatus(orderId, status) {
  console.log(`Updating order ${orderId} to status ${status}`);
  const row = document.querySelector(`[data-order-id="${orderId}"]`).closest('tr');
  if (row) {
    const statusCell = row.querySelector('td:nth-child(3)');
    if (status === 'CONFIRMED') {
      statusCell.innerHTML = '<span class="status confirmed">Confirmed</span>';
    } else if (status === 'REJECTED') {
      statusCell.innerHTML = '<span class="status rejected">Rejected</span>';
    }
    fetchOrders();
  }
}

// ===============================
// NOTIFICATIONS FUNCTIONS
// ===============================
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

function updateNotificationBadge(count) {
  if (notificationBadge) {
    notificationBadge.textContent = count;
    notificationBadge.style.display = (count === 0) ? 'none' : 'inline-block';
  }
}

function updateNotificationDropdown(notifications) {
  if (!notificationDropdown) return;
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

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', function() {
  // Setup Sidebar Toggle
  setupSidebarToggle();
  
  // Authentication and User Display
  checkAuthentication();
  displayUserInNavbar();
  setupLogout();
  
  // Fetch orders and set up orders UI
  fetchOrders();
  
  // Initialize notifications
  fetchNotifications();
  setInterval(fetchNotifications, 300000);
  if (notificationBell) {
    notificationBell.addEventListener('click', fetchNotifications);
  }
});
