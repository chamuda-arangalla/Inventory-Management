document.addEventListener('DOMContentLoaded', function() {
    // ========================================================================
    // NOTIFICATIONS FUNCTIONALITY
    // ========================================================================
    
    // DOM elements for notifications
    const notificationBell = document.querySelector('#navbarDropdown');
    const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
    let notificationBadge = null;
    if (notificationBell) {
      notificationBadge = notificationBell.querySelector('.badge');
    }
  
    /**
     * Fetch notifications from the server.
     */
    function fetchNotifications() {
      axios.get('http://localhost:8080/api/v1/notifications/')
        .then(response => {
          // Get the notifications from the response
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
  
    /**
     * Update the notification badge with the count.
     * Hide the badge if there are no notifications.
     * @param {number} count 
     */
    function updateNotificationBadge(count) {
      if (notificationBadge) {
        notificationBadge.textContent = count;
        notificationBadge.style.display = (count === 0) ? 'none' : 'inline-block';
      }
    }
  
    /**
     * Update the notifications dropdown with the list of notifications.
     * @param {Array} notifications 
     */
    function updateNotificationDropdown(notifications) {
      if (!notificationDropdown) return;
  
      // Clear existing notification items while keeping the header (if any)
      while (notificationDropdown.children.length > 1) {
        notificationDropdown.removeChild(notificationDropdown.lastChild);
      }
  
      // If no notifications, add a no-results message.
      if (notifications.length === 0) {
        const noNotificationsItem = document.createElement('li');
        noNotificationsItem.innerHTML = '<a class="dropdown-item" href="#"><i class="fas fa-check-circle text-success me-2"></i>No expiring products</a>';
        notificationDropdown.appendChild(noNotificationsItem);
        return;
      }
  
      // Loop through all notifications and add them to the dropdown.
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
  
      // Optionally add a "View All" link if there are multiple notifications.
      if (notifications.length > 1) {
        const divider = document.createElement('li');
        divider.innerHTML = '<hr class="dropdown-divider">';
        notificationDropdown.appendChild(divider);
  
        const viewAllItem = document.createElement('li');
        viewAllItem.innerHTML = '<a class="dropdown-item text-center" href="#"><small>View all notifications</small></a>';
        notificationDropdown.appendChild(viewAllItem);
      }
    }
  
    // Fetch notifications immediately when the page loads.
    fetchNotifications();
    // Set up periodic refresh for notifications (every 5 minutes).
    setInterval(fetchNotifications, 300000);
  
    // Optional: Add a click handler to refresh notifications manually.
    if (notificationBell) {
      notificationBell.addEventListener('click', function() {
        fetchNotifications();
      });
    }
    
    // ========================================================================
    // EMPLOYEE MANAGEMENT & SIDEBAR FUNCTIONALITY
    // ========================================================================
    
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');
    if (menuToggle && wrapper) {
      menuToggle.addEventListener('click', function() {
        wrapper.classList.toggle('toggled');
      });
    }
  
    // Load employees when the page loads.
    loadEmployees();
  
    // Save employee button click handler.
    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    if (saveEmployeeBtn) {
      saveEmployeeBtn.addEventListener('click', function() {
        addEmployee();
      });
    }
  
    // Update employee button click handler.
    const updateEmployeeBtn = document.getElementById('updateEmployeeBtn');
    if (updateEmployeeBtn) {
      updateEmployeeBtn.addEventListener('click', function() {
        updateEmployee();
      });
    }
  
    /**
     * Load employees and populate the table.
     */
    function loadEmployees() {
      axios.get('http://localhost:8080/api/v1/user/all-employees')
        .then(response => {
          const employees = response.data;
          const tableBody = document.getElementById('employeesTableBody');
          tableBody.innerHTML = '';
  
          employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${employee.id}</td>
              <td>${employee.name}</td>
              <td>${employee.email}</td>
              <td>${employee.phone}</td>
              <td>${employee.role}</td>
              <td>${employee.username}</td>
            `;
            tableBody.appendChild(row);
          });
  
          // Add event listeners to edit buttons (if any exist).
          document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
              const employeeId = this.getAttribute('data-id');
              editEmployee(employeeId);
            });
          });
  
          // Add event listeners to delete buttons (if any exist).
          document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
              const employeeId = this.getAttribute('data-id');
              if (confirm('Are you sure you want to delete this employee?')) {
                deleteEmployee(employeeId);
              }
            });
          });
        })
        .catch(error => {
          console.error('Error loading employees:', error);
          alert('Error loading employees. Please try again.');
        });
    }
  
    /**
     * Add a new employee.
     */
    function addEmployee() {
      const employeeData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        role: document.getElementById('role').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      };
  
      axios.post('http://localhost:8080/api/v1/user/save', employeeData)
        .then(response => {
          // Close the Add Employee modal.
          const modalEl = document.getElementById('addEmployeeModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) {
            modal.hide();
          }
          // Reset the form.
          document.getElementById('addEmployeeForm').reset();
          // Reload employees.
          loadEmployees();
          // Show success message.
          alert('Employee added successfully!');
        })
        .catch(error => {
          console.error('Error adding employee:', error);
          alert('Error adding employee. Please try again.');
        });
    }
  
    /**
     * Stub function for updating an employee.
     * (Implement as needed.)
     */
    function updateEmployee() {
      alert('Update employee functionality is not implemented in this example.');
    }
  
    /**
     * Stub function for deleting an employee.
     * (Implement as needed.)
     */
    function deleteEmployee(employeeId) {
      alert('Delete employee functionality is not implemented in this example.');
    }
  
    /**
     * Stub function for editing an employee.
     * (Implement as needed.)
     */
    function editEmployee(employeeId) {
      alert('Edit employee functionality is not implemented in this example.');
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