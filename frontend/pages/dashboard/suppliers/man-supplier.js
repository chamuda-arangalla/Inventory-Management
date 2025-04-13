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
