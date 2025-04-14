document.addEventListener('DOMContentLoaded', function() {
    // ----------------------------------
    // 1. HELPER FUNCTIONS
    // ----------------------------------
    
    /**
     * Capitalize the first letter of a given string.
     * @param {string} str 
     * @returns {string}
     */
    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ----------------------------------
    // 2. NOTIFICATION-RELATED LOGIC
    // ----------------------------------
    
    // DOM elements for notifications
    const notificationBell = document.querySelector('#navbarDropdown');
    const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
    // The notification badge is the <span class="badge"> inside the bell nav link
    const notificationBadge = notificationBell ? notificationBell.querySelector('.badge') : null;

    /**
     * Fetch notifications from the server.
     */
    function fetchNotifications() {
        // Adjust this URL to match your backend if needed:
        axios.get('http://localhost:8080/api/v1/notifications/')
            .then(response => {
                const notifications = response.data;
                // Update the notification badge
                updateNotificationBadge(notifications.length);
                // Update the dropdown with notifications
                updateNotificationDropdown(notifications);
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
    }

    /**
     * Update the bell badge with the current count of notifications.
     * Hide the badge if there are zero notifications.
     */
    function updateNotificationBadge(count) {
        if (!notificationBadge) return;
        notificationBadge.textContent = count;
        notificationBadge.style.display = (count === 0) ? 'none' : 'inline-block';
    }

    /**
     * Populate the dropdown menu with a list of notifications.
     */
    function updateNotificationDropdown(notifications) {
        if (!notificationDropdown) return;

        // Clear existing items (except the first child, which is the dropdown header)
        while (notificationDropdown.children.length > 1) {
            notificationDropdown.removeChild(notificationDropdown.lastChild);
        }

        // If no notifications, show a "No expiring products" message
        if (notifications.length === 0) {
            const noNotificationsItem = document.createElement('li');
            noNotificationsItem.innerHTML = '<a class="dropdown-item" href="#"><i class="fas fa-check-circle text-success me-2"></i>No expiring products</a>';
            notificationDropdown.appendChild(noNotificationsItem);
            return;
        }

        // Add each notification item to the dropdown
        notifications.forEach(notification => {
            const notificationItem = document.createElement('li');
            let iconClass = 'fas fa-exclamation-circle text-warning';

            // Adjust icon based on the notification text
            if (notification.includes('expire today')) {
                iconClass = 'fas fa-exclamation-triangle text-danger';
            } else if (notification.includes('expired')) {
                iconClass = 'fas fa-times-circle text-danger';
            }

            notificationItem.innerHTML = `<a class="dropdown-item" href="#"><i class="${iconClass} me-2"></i>${notification}</a>`;
            notificationDropdown.appendChild(notificationItem);
        });

        // Add "View All" if there are multiple notifications
        if (notifications.length > 1) {
            const divider = document.createElement('li');
            divider.innerHTML = '<hr class="dropdown-divider">';
            notificationDropdown.appendChild(divider);

            const viewAllItem = document.createElement('li');
            viewAllItem.innerHTML = '<a class="dropdown-item text-center" href="#"><small>View all notifications</small></a>';
            notificationDropdown.appendChild(viewAllItem);
        }
    }

    // If the bell icon exists, fetch notifications on click
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            fetchNotifications();
        });
    }

    // ----------------------------------
    // 3. USER DISPLAY LOGIC
    // ----------------------------------
    
    /**
     * Display the user in the navbar if stored in sessionStorage.
     */
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

    // ----------------------------------
    // 4. EMPLOYEE CRUD LOGIC
    // ----------------------------------

    // Load employees when the page is ready
    loadEmployees();

    // Assign button listeners for adding/updating employees
    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener('click', function() {
            addEmployee();
        });
    }

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
        axios.get('http://localhost:8080/api/v1/user/all-suppliers')
            .then(response => {
                const employees = response.data;
                const tableBody = document.getElementById('employeesTableBody');
                if (!tableBody) return;

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
                        <td>
                            <button class="btn btn-sm btn-warning edit-btn" data-id="${employee.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${employee.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Add event listeners to Edit buttons
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const employeeId = this.getAttribute('data-id');
                        editEmployee(employeeId);
                    });
                });

                // Add event listeners to Delete buttons
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
                // Close the Add Employee modal
                const modalEl = document.getElementById('addEmployeeModal');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                }

                // Reset the form
                const form = document.getElementById('addEmployeeForm');
                if (form) form.reset();

                // Reload employees
                loadEmployees();

                // Success message
                alert('Employee added successfully!');
            })
            .catch(error => {
                console.error('Error adding employee:', error);
                alert('Error adding employee. Please try again.');
            });
    }

    /**
     * Fetch an employee by ID, populate the edit form, and show the edit modal.
     * @param {number} id 
     */
    function editEmployee(id) {
        axios.get(`http://localhost:8080/api/v1/user/get-user/${id}`)
            .then(response => {
                const employee = response.data;
                document.getElementById('editId').value = employee.id;
                document.getElementById('editName').value = employee.name;
                document.getElementById('editEmail').value = employee.email;
                document.getElementById('editPhone').value = employee.phone;
                document.getElementById('editRole').value = employee.role;
                document.getElementById('editUsername').value = employee.username;
                document.getElementById('editPassword').value = employee.password;

                // Show the edit modal
                const editModalEl = document.getElementById('editEmployeeModal');
                const editModal = new bootstrap.Modal(editModalEl);
                editModal.show();
            })
            .catch(error => {
                console.error('Error fetching employee:', error);
                alert('Error fetching employee details. Please try again.');
            });
    }

    /**
     * Update employee with the data from the edit form.
     */
    function updateEmployee() {
        const id = document.getElementById('editId').value;
        const employeeData = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            role: document.getElementById('editRole').value,
            username: document.getElementById('editUsername').value,
            password: document.getElementById('editPassword').value
        };

        axios.put(`http://localhost:8080/api/v1/user/update/${id}`, employeeData)
            .then(response => {
                // Close the Edit Employee modal
                const editModalEl = document.getElementById('editEmployeeModal');
                if (editModalEl) {
                    const editModal = bootstrap.Modal.getInstance(editModalEl);
                    if (editModal) editModal.hide();
                }

                // Reload employees
                loadEmployees();

                // Success message
                alert('Employee updated successfully!');
            })
            .catch(error => {
                console.error('Error updating employee:', error);
                alert('Error updating employee. Please try again.');
            });
    }

    /**
     * Delete an employee by ID.
     * @param {number} id 
     */
    function deleteEmployee(id) {
        axios.delete(`http://localhost:8080/api/v1/user/delete/${id}`)
            .then(response => {
                // Reload employees
                loadEmployees();
                // Success message
                alert('Employee deleted successfully!');
            })
            .catch(error => {
                console.error('Error deleting employee:', error);
                alert('Error deleting employee. Please try again.');
            });
    }

    // ----------------------------------
    // 5. INITIALIZATION
    // ----------------------------------
    
    // Show user info in the navbar (if present)
    displayUserInNavbar();

    // Fetch notifications immediately
    fetchNotifications();

    // Periodically refresh notifications every 5 minutes (300000 ms)
    setInterval(fetchNotifications, 300000);

    // ----------------------------------
    // 6. SIDEBAR TOGGLE FUNCTIONALITY
    // ----------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }
});
