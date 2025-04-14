document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Fetch and display orders when page loads
    fetchOrders();
});

// Function to fetch orders from backend
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
            console.error("Full error object:", JSON.stringify(error, null, 2));
            
            if (error.response) {
                console.error("Server responded with:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        });
}

// Function to display orders in the table
// Function to display orders in the table
function displayOrders(orders) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    // Check if no orders
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format date
        const orderDate = order.orderDate || new Date().toISOString().split('T')[0];
        const formattedDate = orderDate.split('T')[0];
        
        // Create status badge
        let statusClass = 'badge ';
        let statusText = order.status || 'PENDING';
        
        if (statusText === 'PENDING') {
            statusClass += 'bg-warning text-dark';
        } else if (statusText === 'CONFIRM') {
            statusClass += 'bg-success';
        } else {
            statusClass += 'bg-secondary';
        }

        // Determine if action buttons should be shown
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
                <button class="btn btn-sm btn-primary view-details " data-order-id="${order.id}">
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
    // Set order info
    document.getElementById('modalOrderId').textContent = `#ORD-${order.id.toString().padStart(3, '0')}`;
    document.getElementById('modalOrderDate').textContent = order.orderDate.split('T')[0];
    document.getElementById('modalOrderAmount').textContent = `$${order.totalAmount.toFixed(2)}`;
    
    // Set status badge
    const statusBadge = document.getElementById('modalOrderStatus');
    statusBadge.textContent = order.status;
    statusBadge.className = 'badge ' + (order.status === 'PENDING' ? 'bg-warning text-dark' : 
                          order.status === 'CONFIRM' ? 'bg-success' : 'bg-secondary');
    
    // Populate products table
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
    
    // Show or hide generate receipt button based on order status
    const generateReceiptBtn = document.getElementById('generateReceiptBtn');
    if (order.status === 'CONFIRM') {
        generateReceiptBtn.style.display = 'inline-block';
        generateReceiptBtn.onclick = function() {
            generateReceipt(order);
        };
    } else {
        generateReceiptBtn.style.display = 'none';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

function generateReceipt(order) {
    const receiptContent = document.getElementById('receiptContent');
    
    // Create a beautiful receipt
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
                                          order.status === 'CONFIRM' ? 'bg-success' : 'bg-secondary'} 
                                          badge p-2 mb-2">
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
    
    // Close the details modal
    const detailsModal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
    detailsModal.hide();
    
    // Show the receipt modal
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

    // Close the modal first
    const receiptModal = bootstrap.Modal.getInstance(document.getElementById('receiptModal'));
    receiptModal.hide();

    // Generate the PDF
    html2pdf().from(element).set(opt).save().then(() => {
        // Re-open the modal after PDF generation if needed
        // receiptModal.show();
    });
}

// Function to update the metrics cards
function updateMetrics(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.orderStatus === 'PENDING').length;
    const confirmedOrders = orders.filter(order => order.orderStatus === 'CONFIRMED').length;

    document.querySelector('.metric-card.primary .metric-value').textContent = totalOrders;
    document.querySelector('.metric-card.warning .metric-value').textContent = pendingOrders;
    document.querySelector('.metric-card.success .metric-value').textContent = confirmedOrders;
}

// Function to add event listeners to action buttons
function addButtonEventListeners() {
    document.querySelectorAll('.btn.confirm').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            updateOrderStatus(orderId, 'CONFIRMED');
        });
    });

    document.querySelectorAll('.btn.reject').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            updateOrderStatus(orderId, 'REJECTED');
        });
    });
}

// Function to update order status
function updateOrderStatus(orderId, status) {
    // In a real application, you would send a PATCH or PUT request to your backend
    // For now, we'll just update the UI
    console.log(`Updating order ${orderId} to status ${status}`);
    
    // Find the row with this order ID
    const row = document.querySelector(`[data-order-id="${orderId}"]`).closest('tr');
    
    if (row) {
        const statusCell = row.querySelector('td:nth-child(3)');
        if (status === 'CONFIRMED') {
            statusCell.innerHTML = '<span class="status confirmed">Confirmed</span>';
        } else if (status === 'REJECTED') {
            statusCell.innerHTML = '<span class="status rejected">Rejected</span>';
        }
        
        // Refresh the metrics
        fetchOrders();
    }
}

function addButtonEventListeners() {
    // Confirm button event listeners
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
                                // Refresh the orders table
                                fetchOrders();
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
    
    // Reject button event listeners
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
                    // Just remove the row from the UI without calling the backend
                    row.remove();
                    
                    // Show success message
                    Swal.fire(
                        'Rejected!',
                        'Order has been rejected.',
                        'success'
                    );
                    
                    // If no orders left, show the "No orders" message
                    if (document.querySelectorAll('table tbody tr').length === 0) {
                        const tbody = document.querySelector('table tbody');
                        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
                    }
                }
            });
        });
    });
}

// async function fetchOrdersAndDisplay() {
//     try {
//         const response = await axios.get('/api/v1/orders');
//         displayOrders(response.data);
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         const tbody = document.querySelector('table tbody');
//         tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading orders</td></tr>';
        
//         Swal.fire(
//             'Error!',
//             error.response?.data?.message || error.message,
//             'error'
//         );
//     }
// }