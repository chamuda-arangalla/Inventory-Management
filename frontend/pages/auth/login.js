document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        submitBtn.disabled = true;

        try {
            const response = await axios.post('http://localhost:8082/api/v1/login', {
                username: username,
                password: password
            });

            const { token, role, username: loggedInUsername, userId } = response.data;
            
            // Store user data in sessionStorage
            sessionStorage.setItem('userData', JSON.stringify({
                token,
                role,
                username: loggedInUsername,
                userId
            }));

            // Redirect based on role
            redirectBasedOnRole(role);

        } catch (error) {
            handleLoginError(error);
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

function redirectBasedOnRole(role) {
    switch(role.toLowerCase()) {
        case 'employee':
            window.location.href = '../employee/employee.html';
            break;
        case 'manager':
            window.location.href = '../dashboard/dashboard.html';
            break;
        case 'supplier':
            window.location.href = '../supplier/supplier.html';
            break;
        default:
            showError('Unknown user role');
    }
}

function handleLoginError(error) {
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
        if (error.response.status === 401) {
            errorMessage = 'Invalid username or password';
        } else if (error.response.status === 404) {
            errorMessage = 'User not found';
        } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
    } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
    }
    
    showError(errorMessage);
}

function showError(message) {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    
    // Create and show new alert
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger mt-3 animate__animated animate__fadeIn';
    errorAlert.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
    `;
    
    // Insert the alert after the form
    const loginForm = document.querySelector('form');
    loginForm.parentNode.insertBefore(errorAlert, loginForm.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorAlert.classList.remove('animate__fadeIn');
        errorAlert.classList.add('animate__fadeOut');
        setTimeout(() => errorAlert.remove(), 500);
    }, 5000);
}