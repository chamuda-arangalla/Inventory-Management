document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Product form handling
    const productForm = document.getElementById('productForm');
    const saveProductBtn = document.getElementById('saveProduct');
    
    if (saveProductBtn && productForm) {
        saveProductBtn.addEventListener('click', function() {
            if (productForm.checkValidity()) {
                // Here you would typically send the data to your backend
                alert('Product saved successfully!');
                $('#addProductModal').modal('hide');
                productForm.reset();
            } else {
                productForm.reportValidity();
            }
        });
    }
    
    // Edit product functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            // In a real app, you would fetch the product data from your backend
            // Here we're just simulating with the first product's data
            document.getElementById('editProductId').value = productId;
            document.getElementById('editProductName').value = "Wireless Headphones";
            document.getElementById('editSku').value = "WH-1000XM4";
            document.getElementById('editCategory').value = "Electronics";
            document.getElementById('editBrand').value = "Sony";
            document.getElementById('editPrice').value = "349.99";
            document.getElementById('editCost').value = "250.00";
            document.getElementById('editQuantity').value = "45";
            document.getElementById('editDescription').value = "Premium noise-canceling wireless headphones with long battery life.";
            
            editProductModal.show();
        });
    });
    
    // Update product
    const updateProductBtn = document.getElementById('updateProduct');
    if (updateProductBtn) {
        updateProductBtn.addEventListener('click', function() {
            const editForm = document.getElementById('editProductForm');
            if (editForm.checkValidity()) {
                alert('Product updated successfully!');
                editProductModal.hide();
            } else {
                editForm.reportValidity();
            }
        });
    }
    
    // Delete product functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            document.getElementById('deleteProductId').value = productId;
            deleteModal.show();
        });
    });
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const productId = document.getElementById('deleteProductId').value;
            // In a real app, you would send a delete request to your backend
            alert(`Product with ID ${productId} deleted successfully!`);
            deleteModal.hide();
        });
    }
    
    // Image preview functionality
    const productImageInput = document.getElementById('productImage');
    if (productImageInput) {
        const productImagePreview = document.createElement('img');
        productImagePreview.className = 'image-preview';
        productImageInput.parentNode.appendChild(productImagePreview);
        
        productImageInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const src = URL.createObjectURL(e.target.files[0]);
                productImagePreview.src = src;
                productImagePreview.style.display = 'block';
            }
        });
    }
    
    // Edit image preview
    const editProductImageInput = document.getElementById('editProductImage');
    if (editProductImageInput) {
        const editProductImagePreview = document.createElement('img');
        editProductImagePreview.className = 'image-preview';
        editProductImageInput.parentNode.appendChild(editProductImagePreview);
        
        editProductImageInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const src = URL.createObjectURL(e.target.files[0]);
                editProductImagePreview.src = src;
                editProductImagePreview.style.display = 'block';
            }
        });
    }
});