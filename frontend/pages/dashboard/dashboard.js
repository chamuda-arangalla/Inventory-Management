document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');
    
    menuToggle.addEventListener('click', function() {
        wrapper.classList.toggle('toggled');
    });

    // Initialize Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Sales',
                data: [1200, 1900, 1700, 2100, 2400, 2800, 3200],
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Initialize Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    const inventoryChart = new Chart(inventoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [300, 45, 12],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    });

    // Simulate real-time updates (for demo purposes)
    setInterval(() => {
        // Update sales chart with random data
        const newData = salesChart.data.datasets[0].data.map(value => {
            return value + (Math.random() * 200 - 100);
        });
        salesChart.data.datasets[0].data = newData;
        salesChart.update();
        
        // Update inventory chart with random data
        inventoryChart.data.datasets[0].data = [
            Math.max(0, inventoryChart.data.datasets[0].data[0] + (Math.random() * 10 - 5)),
            Math.max(0, inventoryChart.data.datasets[0].data[1] + (Math.random() * 5 - 2)),
            Math.max(0, inventoryChart.data.datasets[0].data[2] + (Math.random() * 3 - 1))
        ];
        inventoryChart.update();
    }, 5000);
});