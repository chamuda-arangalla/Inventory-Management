document.addEventListener('DOMContentLoaded', function() {
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

function initProductManagement() {
    // Load products when page loads
    loadProducts();
    
    // Set up form submission
    document.getElementById('addProductForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
}

function loadProducts() {
    axios.get('http://localhost:8082/api/v1/product/all')
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
        axios.delete(`http://localhost:8082/api/v1/product/delete/${productId}`)
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

// You'll also need to implement functions to:
// 1. Load suppliers for the dropdown
// 2. Handle the edit modal and form
// 3. Add more detailed error handling