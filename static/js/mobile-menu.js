document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    menuButton.style.cssText = `
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 30;
        background: var(--primary);
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.375rem;
        box-shadow: var(--shadow);
        display: none;
    `;

    const sidebar = document.querySelector('.sidebar');
    document.body.appendChild(menuButton);

    function toggleMenu() {
        sidebar.classList.toggle('show');
    }

    menuButton.addEventListener('click', toggleMenu);

    // Show menu button on mobile
    if (window.innerWidth <= 768) {
        menuButton.style.display = 'block';
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            menuButton.style.display = 'block';
        } else {
            menuButton.style.display = 'none';
            sidebar.classList.remove('show');
        }
    });
});