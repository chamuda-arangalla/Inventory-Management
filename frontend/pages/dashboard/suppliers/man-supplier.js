
        document.addEventListener('DOMContentLoaded', function() {
            // Sidebar toggle functionality
            const menuToggle = document.getElementById('menu-toggle');
            const wrapper = document.getElementById('wrapper');

            if (menuToggle && wrapper) {
                menuToggle.addEventListener('click', function() {
                    wrapper.classList.toggle('toggled');
                });
            }

            // Load employees when page loads
            loadEmployees();

            // Save employee button click handler
            document.getElementById('saveEmployeeBtn').addEventListener('click', function() {
                addEmployee();
            });

            // Update employee button click handler
            document.getElementById('updateEmployeeBtn').addEventListener('click', function() {
                updateEmployee();
            });

            // Function to load employees
            function loadEmployees() {
                axios.get('http://localhost:8082/api/v1/user/all-suppliers')
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

                        // Add event listeners to edit buttons
                        document.querySelectorAll('.edit-btn').forEach(button => {
                            button.addEventListener('click', function() {
                                const employeeId = this.getAttribute('data-id');
                                editEmployee(employeeId);
                            });
                        });

                        // Add event listeners to delete buttons
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

            // Function to add a new employee
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
                        // Close the modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
                        modal.hide();

                        // Reset the form
                        document.getElementById('addEmployeeForm').reset();

                        // Reload the employees
                        loadEmployees();

                        // Show success message
                        alert('Employee added successfully!');
                    })
                    .catch(error => {
                        console.error('Error adding employee:', error);
                        alert('Error adding employee. Please try again.');
                    });
            }

            // Function to edit an employee
            function editEmployee(id) {
                axios.get(`http://localhost:8080/api/v1/user/get-user/${id}`)
                    .then(response => {
                        const employee = response.data;

                        // Populate the edit form
                        document.getElementById('editId').value = employee.id;
                        document.getElementById('editName').value = employee.name;
                        document.getElementById('editEmail').value = employee.email;
                        document.getElementById('editPhone').value = employee.phone;
                        document.getElementById('editRole').value = employee.role;
                        document.getElementById('editUsername').value = employee.username;
                        document.getElementById('editPassword').value = employee.password;

                        // Show the edit modal
                        const editModal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
                        editModal.show();
                    })
                    .catch(error => {
                        console.error('Error fetching employee:', error);
                        alert('Error fetching employee details. Please try again.');
                    });
            }

            // Function to update an employee
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
                        // Close the modal
                        const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
                        modal.hide();

                        // Reload the employees
                        loadEmployees();

                        // Show success message
                        alert('Employee updated successfully!');
                    })
                    .catch(error => {
                        console.error('Error updating employee:', error);
                        alert('Error updating employee. Please try again.');
                    });
            }

            // Function to delete an employee
            function deleteEmployee(id) {
                axios.delete(`http://localhost:8080/api/v1/user/delete/${id}`)
                    .then(response => {
                        // Reload the employees
                        loadEmployees();

                        // Show success message
                        alert('Employee deleted successfully!');
                    })
                    .catch(error => {
                        console.error('Error deleting employee:', error);
                        alert('Error deleting employee. Please try again.');
                    });
            }
        });
 