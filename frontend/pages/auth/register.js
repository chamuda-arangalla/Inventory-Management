// register.js - Complete User Registration Handling

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form submission handler
    const registerForm = document.querySelector('form');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegistration();
    });

    // Add live validation for password match
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
});

function handleRegistration() {
    // Get form values
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: document.getElementById('role').value
    };

    // Validate form
    if (!validateForm(formData)) {
        return;
    }

    // Prepare payload for backend
    const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null, // Send null if phone is empty
        username: formData.username,
        password: formData.password,
        role: mapRoleToBackend(formData.role)
    };

    // Submit to backend
    submitRegistration(payload);
}

function validateForm(formData) {
    // Required fields check
    if (!formData.name || !formData.email || !formData.username || !formData.password || !formData.role) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Information',
            text: 'Please fill in all required fields.',
        });
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Email',
            text: 'Please enter a valid email address.',
        });
        return false;
    }

    // Password validation
    if (formData.password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Weak Password',
            text: 'Password must be at least 6 characters long.',
        });
        return false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'Passwords do not match. Please try again.',
        });
        return false;
    }

    // Terms and conditions check
    if (!document.getElementById('terms').checked) {
        Swal.fire({
            icon: 'error',
            title: 'Terms Not Accepted',
            text: 'You must agree to the terms and conditions to register.',
        });
        return false;
    }

    return true;
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const mismatchElement = document.getElementById('password-mismatch');

    if (password && confirmPassword) {
        if (password !== confirmPassword) {
            if (!mismatchElement) {
                const errorElement = document.createElement('div');
                errorElement.id = 'password-mismatch';
                errorElement.className = 'text-danger small mt-1';
                errorElement.textContent = 'Passwords do not match';
                this.parentElement.appendChild(errorElement);
            }
        } else if (mismatchElement) {
            mismatchElement.remove();
        }
    }
}

function mapRoleToBackend(frontendRole) {
    switch(frontendRole) {
        case 'USER': return 'Employee';
        case 'ADMIN': return 'Manager';
        case 'MODERATOR': return 'Supplier';
        default: return 'Employee';
    }
}

function submitRegistration(payload) {
    // Show loading indicator
    const loadingSwal = Swal.fire({
        title: 'Processing...',
        html: 'Creating your account',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // API configuration
    const apiUrl = 'http://localhost:8080/api/v1/user/save';
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    // Make API call
    axios.post(apiUrl, payload, config)
        .then(response => {
            loadingSwal.close();
            handleSuccessResponse(response.data);
        })
        .catch(error => {
            loadingSwal.close();
            handleErrorResponse(error);
        });
}

function handleSuccessResponse(data) {
    Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        html: `
            <p>Your account has been created successfully.</p>
            ${data.role === 'Supplier' ? 
              '<p class="text-info">As a supplier, your profile is being set up.</p>' : ''}
        `,
        confirmButtonText: 'Continue to Login'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'login.html';
        }
    });
}

function handleErrorResponse(error) {
    let errorTitle = 'Registration Failed';
    let errorMessage = 'An error occurred during registration. Please try again.';
    
    if (error.response) {
        // Backend responded with error status
        switch(error.response.status) {
            case 400:
                errorTitle = 'Validation Error';
                errorMessage = error.response.data.message || 'Please check your input data.';
                break;
            case 409:
                errorTitle = 'Conflict';
                errorMessage = error.response.data.message || 'Username or email already exists.';
                break;
            case 500:
                errorTitle = 'Server Error';
                errorMessage = 'An internal server error occurred. Please try again later.';
                break;
        }
    } else if (error.request) {
        // Request was made but no response received
        errorTitle = 'Network Error';
        errorMessage = 'Could not connect to the server. Please check your internet connection.';
    }

    Swal.fire({
        icon: 'error',
        title: errorTitle,
        html: errorMessage,
        confirmButtonText: 'OK'
    });
}

// Password toggle functionality (keep from original)
function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const icon = document.querySelector(`#${fieldId} + label + .password-toggle i`);
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}