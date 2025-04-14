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

// Update the updateSalesSummary function to update the cards instead
function updateSalesSummary(sales) {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalSale, 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Update Total Sales card
    const totalSalesCard = document.querySelector('.col-md-4:nth-child(1) h3.fs-2');
    if (totalSalesCard) {
        totalSalesCard.textContent = totalSales.toLocaleString();
    }

    // Update Revenue card (third card)
    const revenueCard = document.querySelector('.col-md-4:nth-child(3) h3.fs-2');
    if (revenueCard) {
        revenueCard.textContent = formatCurrency(totalRevenue);
    }

    // Note: The products card (second card) would need separate product data
    // We'll keep it as is or you can fetch product count separately
}

// You can keep your existing formatCurrency function
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Update your fetchSalesData function to use this
async function fetchSalesData() {
    try {
        const response = await axios.get('http://localhost:8082/api/v1/sale/all');
        const salesData = response.data;
        
        displaySalesTable(salesData);
        updateSalesSummary(salesData); // This now updates the cards
        renderSalesChart(salesData);
        
        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        showErrorToast('Failed to load sales data. Please try again.');
        throw error;
    }
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


// Add this after your existing event listeners
document.getElementById('generateReport')?.addEventListener('click', generateWeeklyReport);

async function generateWeeklyReport() {
    try {
        const btn = document.getElementById('generateReport');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Generating...';
        btn.disabled = true;

        // Calculate date range for the past week
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        // Format dates for API
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        // Fetch sales data for the week
        const response = await axios.get(`http://localhost:8082/api/v1/sale/all?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`);
        const weeklySales = response.data;

        if (weeklySales.length === 0) {
            showErrorToast('No sales data available for the selected week.');
            return;
        }

        // Generate PDF report
        await generatePDFReport(weeklySales, startDate, endDate);
        
        showSuccessToast('Weekly report generated successfully!');
    } catch (error) {
        console.error('Error generating report:', error);
        showErrorToast('Failed to generate report. Please try again.');
    } finally {
        const btn = document.getElementById('generateReport');
        if (btn) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    }
}

async function generatePDFReport(salesData, startDate, endDate) {
    // Use jsPDF library - add this to your head section:
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title and date range
    doc.setFontSize(18);
    doc.text('Weekly Sales Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Report Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 30);
    
    // Calculate totals
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.totalSale, 0);
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    
    doc.setFontSize(12);
    doc.text(`Total Sales: ${totalSales}`, 14, 55);
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 65);
    doc.text(`Average Sale: ${formatCurrency(avgSale)}`, 14, 75);
    
    // Add sales table
    doc.setFontSize(14);
    doc.text('Sales Details', 14, 90);
    
    // Prepare data for the table
    const tableData = salesData.map(sale => {
        const saleDate = new Date(sale.date);
        return [
            sale.id,
            saleDate.toLocaleDateString(),
            formatCurrency(sale.totalSale),
            sale.customerName || 'N/A'
        ];
    });
    
    // Add the table
    doc.autoTable({
        startY: 95,
        head: [['ID', 'Date', 'Amount', 'Customer']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [54, 162, 235],
            textColor: 255
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        margin: { top: 95 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text('Generated by InventoryPro', 14, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`Weekly_Sales_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    checkAuthentication();
    
    // Setup sidebar toggle
    document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
    
    // Load user data and display in navbar
    displayUserInNavbar();
    
    // Setup logout functionality
    setupLogout();
});

// Function to check authentication
function checkAuthentication() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    
    if (!userData) {
        window.location.href = '../login.html';
        return;
    }
    
    // Display user role in console for debugging
    console.log(`User logged in as: ${userData.role}`);
}

// Function to display user in navbar
function displayUserInNavbar() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;
    
    const userDropdown = document.querySelector('#userDropdown');
    if (userDropdown) {
        // Update the username display
        userDropdown.innerHTML = `
            <i class="fas fa-user-circle"></i> ${userData.username}
            <span class="badge bg-primary ms-2">${capitalizeFirstLetter(userData.role)}</span>
        `;
        
        // Update the dropdown menu with user-specific options
        const dropdownMenu = userDropdown.nextElementSibling;
        dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">${userData.username}</h6></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logout-link"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        `;
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// Function to setup logout
function setupLogout() {
    // Handle logout from dropdown
    document.addEventListener('click', function(e) {
        if (e.target.closest('#logout-link')) {
            e.preventDefault();
            logout();
        }
    });
}

// Logout function (frontend only)
function logout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to log out?')) {
        // Clear session storage
        sessionStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = '../auth/login.html';
    }
}

// Sidebar toggle function
function toggleSidebar() {
    const wrapper = document.getElementById('wrapper');
    wrapper.classList.toggle('toggled');
}

// dashboard.js - Add this code to your existing dashboard.js file

// DOM elements
const notificationBell = document.querySelector('#navbarDropdown');
const notificationDropdown = document.querySelector('#navbarDropdown + .dropdown-menu');
const notificationBadge = notificationBell.querySelector('.badge');

// Function to fetch notifications from the backend
function fetchNotifications() {
  axios.get('http://localhost:8082/api/v1/notifications/')
    .then(response => {
      // Get the expiring product notifications from the response
      const notifications = response.data;
      
      // Update the notification badge count
      updateNotificationBadge(notifications.length);
      
      // Update the dropdown with notifications
      updateNotificationDropdown(notifications);
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
    });
}

// Function to update the notification badge with the count
function updateNotificationBadge(count) {
  notificationBadge.textContent = count;
  
  // Hide badge if no notifications
  if (count === 0) {
    notificationBadge.style.display = 'none';
  } else {
    notificationBadge.style.display = 'inline-block';
  }
}

// Function to update the notification dropdown with the fetched notifications
function updateNotificationDropdown(notifications) {
  // Clear existing notification items (keeping the header)
  while (notificationDropdown.children.length > 1) {
    notificationDropdown.removeChild(notificationDropdown.lastChild);
  }
  
  // If there are no notifications, add a message
  if (notifications.length === 0) {
    const noNotificationsItem = document.createElement('li');
    noNotificationsItem.innerHTML = '<a class="dropdown-item" href="#"><i class="fas fa-check-circle text-success me-2"></i>No expiring products</a>';
    notificationDropdown.appendChild(noNotificationsItem);
    return;
  }
  
  // Add each notification to the dropdown
  notifications.forEach(notification => {
    const notificationItem = document.createElement('li');
    
    // Check if notification mentions "expire today" or "expired" to set appropriate icon
    let iconClass = 'fas fa-exclamation-circle text-warning';
    if (notification.includes('expire today')) {
      iconClass = 'fas fa-exclamation-triangle text-danger';
    } else if (notification.includes('expired')) {
      iconClass = 'fas fa-times-circle text-danger';
    }
    
    notificationItem.innerHTML = `<a class="dropdown-item" href="#"><i class="${iconClass} me-2"></i>${notification}</a>`;
    notificationDropdown.appendChild(notificationItem);
  });
  
  // Add "View All" link if there are multiple notifications
  if (notifications.length > 1) {
    const viewAllItem = document.createElement('li');
    const divider = document.createElement('li');
    divider.innerHTML = '<hr class="dropdown-divider">';
    viewAllItem.innerHTML = '<a class="dropdown-item text-center" href="#"><small>View all notifications</small></a>';
    
    notificationDropdown.appendChild(divider);
    notificationDropdown.appendChild(viewAllItem);
  }
}

// Fetch notifications when the page loads
document.addEventListener('DOMContentLoaded', function() {
  fetchNotifications();
  
  // Set up periodic refresh (every 5 minutes)
  setInterval(fetchNotifications, 300000);
});

// Optional: Add a click handler to refresh notifications manually
notificationBell.addEventListener('click', function() {
  fetchNotifications();
});