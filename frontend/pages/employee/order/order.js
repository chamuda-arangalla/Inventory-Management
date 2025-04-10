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
    
    axios.get('http://localhost:8082/api/v1/order/')
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
        
        // Format date (handle potential null/undefined)
        const orderDate = order.orderDate || new Date().toISOString().split('T')[0];
        const formattedDate = orderDate.split('T')[0]; // Remove time if present
        
        // Create status badge
        let statusClass = 'badge ';
        let statusText = order.orderStatus || 'PENDING';
        
        if (statusText === 'PENDING') {
            statusClass += 'bg-warning text-dark';
        } else if (statusText === 'CONFIRMED') {
            statusClass += 'bg-success';
        } else {
            statusClass += 'bg-secondary';
        }

        row.innerHTML = `
            <td class="order-id">#ORD-${order.id.toString().padStart(3, '0')}</td>
            <td class="date">${formattedDate}</td>
            <td><span class="${statusClass}">${statusText}</span></td>
            <td class="amount">$${(order.totalAmount || 0).toFixed(2)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-success confirm" data-order-id="${order.id}">
                    <i class="fas fa-check"></i> 
                </button>
                <button class="btn btn-sm btn-danger reject" data-order-id="${order.id}">
                    <i class="fas fa-times"></i> 
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    addButtonEventListeners();
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