// Tab Manager Module
export const TabManager = {
  init() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Deactivate all tabs and content
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activate the clicked tab and corresponding content
        button.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });
  }
};