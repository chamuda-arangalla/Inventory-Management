document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Initialize sales data
    initSalesDashboard();
});

function initSalesDashboard() {
    // Fetch and display sales data
    fetchSalesData();

    // Set up refresh button
    const refreshBtn = document.getElementById('refreshSales');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Refreshing...';
            fetchSalesData()
                .finally(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Refresh';
                });
        });
    }
}

async function fetchSalesData() {
    try {
        const response = await axios.get('http://localhost:8082/api/v1/sale/all');
        const salesData = response.data;
        
        displaySalesTable(salesData);
        updateSalesSummary(salesData);
        renderSalesChart(salesData);
        
        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        showErrorToast('Failed to load sales data. Please try again.');
        throw error;
    }
}

function displaySalesTable(sales) {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    sales.forEach(sale => {
        const row = document.createElement('tr');
        
        // Format the date to be more readable
        const saleDate = new Date(sale.date);
        const formattedDate = saleDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${formattedDate}</td>
            <td class="fw-bold">${formatCurrency(sale.totalSale)}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary view-details" data-id="${sale.id}">
                        <i class="fas fa-eye me-1"></i> Details
                    </button>
                    
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });

    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const saleId = this.getAttribute('data-id');
            viewSaleDetails(saleId);
        });
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-sale').forEach(button => {
        button.addEventListener('click', function() {
            const saleId = this.getAttribute('data-id');
            deleteSale(saleId);
        });
    });
}

async function viewSaleDetails(saleId) {
    try {
        // Show loading state
        const button = document.querySelector(`.view-details[data-id="${saleId}"]`);
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Loading...';
        button.disabled = true;

        const response = await axios.get(`http://localhost:8080/api/v1/sale/${saleId}`);
        const saleDetails = response.data;

        // Show details in a modal (you'll need to implement this)
        showSaleDetailsModal(saleDetails);
    } catch (error) {
        console.error('Error fetching sale details:', error);
        showErrorToast('Failed to load sale details.');
    } finally {
        // Reset button state
        const button = document.querySelector(`.view-details[data-id="${saleId}"]`);
        if (button) {
            button.innerHTML = originalContent;
            button.disabled = false;
        }
    }
}

async function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
        return;
    }

    try {
        const button = document.querySelector(`.delete-sale[data-id="${saleId}"]`);
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Deleting...';
        button.disabled = true;

        await axios.delete(`http://localhost:8080/api/v1/sale/${saleId}`);
        
        showSuccessToast('Sale deleted successfully!');
        // Refresh the sales data
        await fetchSalesData();
    } catch (error) {
        console.error('Error deleting sale:', error);
        showErrorToast('Failed to delete sale. Please try again.');
    }
}

function updateSalesSummary(sales) {
    const summaryElement = document.getElementById('salesSummary');
    if (!summaryElement) return;

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalSale, 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    summaryElement.innerHTML = `
        <span class="badge bg-primary me-2">${totalSales} Sales</span>
        <span class="badge bg-success me-2">Total: ${formatCurrency(totalRevenue)}</span>
        <span class="badge bg-info">Average: ${formatCurrency(avgSale)}</span>
    `;
}

function renderSalesChart(sales) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Group sales by date and calculate daily totals
    const salesByDate = {};
    sales.forEach(sale => {
        const date = sale.date;
        if (!salesByDate[date]) {
            salesByDate[date] = 0;
        }
        salesByDate[date] += sale.totalSale;
    });

    const dates = Object.keys(salesByDate).sort();
    const amounts = dates.map(date => salesByDate[date]);

    // Destroy previous chart if it exists
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }

    window.salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Sales',
                data: amounts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    },
                    displayColors: false
                }
            }
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function showErrorToast(message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast show align-items-center text-white bg-danger';
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showSuccessToast(message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast show align-items-center text-white bg-success';
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
    return container;
}

// Placeholder for showing sale details in a modal
function showSaleDetailsModal(saleDetails) {
    // You'll need to implement this based on your modal implementation
    console.log('Showing details for sale:', saleDetails);
    alert(`Sale Details:\nID: ${saleDetails.id}\nDate: ${saleDetails.date}\nTotal: ${formatCurrency(saleDetails.totalSale)}`);
}