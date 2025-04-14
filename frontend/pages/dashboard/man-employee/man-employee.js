
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
        axios.get('http://localhost:8082/api/v1/user/all-employees')
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

   



});
