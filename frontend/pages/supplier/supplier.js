document.addEventListener('DOMContentLoaded', function() {
    // Get the supplier ID - you might want to get this from a session or other source
    const supplierId = document.getElementById('supplierId').value;
    
    // Load products when page loads
    loadProducts(supplierId);

    // Add product event
    document.getElementById('saveProductBtn').addEventListener('click', addProduct);
    
    // Update product event would be set when opening the edit modal
    document.getElementById('updateProductBtn').addEventListener('click', updateProduct);
    
    // Delete product event
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteProduct);
});

const supplierId = 1;

function loadProducts(supplierId) {
    axios.get(`http://localhost:8082/api/v1/product/sup-product/${supplierId}`)
        .then(response => {
            const products = response.data;
            const tableBody = document.querySelector('#productsTable tbody');
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
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    openEditModal(productId);
                });
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
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

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Active': return 'bg-success';
        case 'LowStock': return 'bg-warning text-dark';
        case 'OutOfStock': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function addProduct() {
    // Get the raw date input value (format depends on browser but usually YYYY-MM-DD)
    const expiryDateInput = document.getElementById('expiryDate').value;
    
    // Validate the date is not empty
    if (!expiryDateInput) {
        alert('Please select an expiry date');
        return;
    }

    // Create the product data object
    const productData = {
        productName: document.getElementById('productName').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        quantityInStock: parseInt(document.getElementById('quantity').value),
        unitPrice: parseFloat(document.getElementById('price').value),
        expiryDate: expiryDateInput, // Use the raw input value directly
        supplierId: parseInt(document.getElementById('supplierId').value)
    };

    // Debug: Log the actual data being sent
    console.log('Sending product data:', productData);

    axios.post('http://localhost:8082/api/v1/product/save', productData, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // Success handling
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
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
// Function to open edit modal
function openEditModal(productId) {
    if (!productId) {
        console.error('No product ID provided');
        return;
    }

    // Show loading state
    const updateBtn = document.getElementById('updateProductBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';

    axios.get(`http://localhost:8082/api/v1/product/get-product/${productId}`)
        .then(response => {
            const product = response.data;
            
            // Populate form - with null checks
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
            
            // Format date
            if (product.expiryDate) {
                const date = new Date(product.expiryDate);
                if (!isNaN(date.getTime())) {
                    setValue('editExpiryDate', date.toISOString().split('T')[0]);
                }
            }

            // Show modal
            const editModal = new bootstrap.Modal('#editProductModal');
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

// Initialize event listeners
function initEditModal() {
    // Edit button clicks (for dynamically created buttons)
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const productId = editBtn.dataset.id;
            openEditModal(productId);
        }
    });

    // Update button handler
    document.getElementById('updateProductBtn')?.addEventListener('click', updateProduct);
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', initEditModal);
function updateProduct() {
    // Get form values
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

    // Show loading alert
    Swal.fire({
        title: 'Updating Product',
        html: 'Please wait while we update your product...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Make the API call
    axios.put(`http://localhost:8082/api/v1/product/update/${productId}`, productData)
        .then(response => {
            // Success notification
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
            
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            modal.hide();
            
            // Refresh the product list
            loadProducts(productData.supplierId);
        })
        .catch(error => {
            // Error notification
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
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                }
            });
        });
}

function deleteProduct() {
    const productId = document.getElementById('deleteProductId').value;
    const supplierId = document.getElementById('supplierId').value;
    
    axios.delete(`http://localhost:8082/api/v1/product/delete/${productId}`)
        .then(response => {
            // Close modal and refresh table
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
            modal.hide();
            loadProducts(supplierId);
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + (error.response?.data?.message || error.message));
        });
}