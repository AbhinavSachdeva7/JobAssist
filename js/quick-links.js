// Quick Links Module
const QuickLinks = {
  STORAGE_KEY: 'jobAppHelperQuickLinks',
  currentLinks: {},
  defaultLinks: {
    linkedin: 'https://www.linkedin.com/in/mab-malik/',
    website: 'https://abdullahmalik.me/',
    github: 'https://github.com/Abdullah-Malik'
  },
  
  init() {
    // Cache DOM elements
    this.editLinksButton = document.getElementById('edit-links-button');
    this.saveLinksButton = document.getElementById('save-links-button');
    this.cancelEditLinksButton = document.getElementById('cancel-edit-links-button');
    this.linksDisplayDiv = document.querySelector('.links-display');
    this.linksEditDiv = document.querySelector('.links-edit');
    this.linkedinEditInput = document.getElementById('linkedin-edit');
    this.websiteEditInput = document.getElementById('website-edit');
    this.githubEditInput = document.getElementById('github-edit');
    this.linkItems = document.querySelectorAll('.link-item');
    
    // Bind methods to preserve context
    this.enterEditMode = this.enterEditMode.bind(this);
    this.exitEditMode = this.exitEditMode.bind(this);
    this.saveLinks = this.saveLinks.bind(this);
    
    // Set up event listeners
    this.editLinksButton.addEventListener('click', this.enterEditMode);
    this.cancelEditLinksButton.addEventListener('click', this.exitEditMode);
    this.saveLinksButton.addEventListener('click', this.saveLinks);
    
    // Set up click handlers for link items
    this.linkItems.forEach(item => {
      item.addEventListener('click', (event) => {
        const key = item.dataset.linkKey;
        const urlToCopy = this.currentLinks[key];
        if (urlToCopy) {
          this.copyToClipboard(urlToCopy, item);
        } else {
          alert(`${item.querySelector('.link-title').textContent} link is not set. Click Edit to add it.`);
        }
      });
    });
    
    // Load stored links
    this.loadQuickLinks();
  },
  
  async loadQuickLinks() {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    this.currentLinks = result[this.STORAGE_KEY] || { ...this.defaultLinks };
    this.updateLinkItems();
  },
  
  updateLinkItems() {
    this.linkItems.forEach(item => {
      const key = item.dataset.linkKey;
      const urlSpan = item.querySelector('.link-url');
      if (urlSpan) {
        urlSpan.textContent = this.currentLinks[key] || '(Not Set)';
      }
      // Ensure logo and title are always visible
      const logo = item.querySelector('.link-logo');
      const title = item.querySelector('.link-title');
      if (logo) logo.style.display = '';
      if (title) title.style.display = '';
    });
  },
  
  copyToClipboard(text, element) {
    // Clear any existing copy feedback
    const existingFeedback = document.querySelectorAll('.copy-feedback-label');
    existingFeedback.forEach(el => el.remove());
    
    navigator.clipboard.writeText(text).then(() => {
      // Add animation classes
      element.classList.add('being-copied');
      
      // Create and append a temporary checkmark icon
      const checkmark = document.createElement('div');
      checkmark.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="color: var(--primary); position: absolute; top: 50%; right: 10px; transform: translateY(-50%); opacity: 0; transition: opacity 0.3s ease;">
        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
      </svg>`;
      const svg = checkmark.firstChild;
      element.appendChild(svg);
      
      // Create a proper copy feedback element inside the link item
      const feedback = document.createElement('div');
      feedback.className = 'copy-feedback-label';
      feedback.textContent = 'Copied!';
      feedback.style.position = 'absolute';
      feedback.style.right = '10px';
      feedback.style.top = '50%';
      feedback.style.transform = 'translateY(-50%)';
      feedback.style.backgroundColor = 'var(--primary)';
      feedback.style.color = 'white';
      feedback.style.padding = '3px 8px';
      feedback.style.borderRadius = '4px';
      feedback.style.fontSize = '12px';
      feedback.style.fontWeight = 'bold';
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.3s ease';
      feedback.style.zIndex = '5';
      
      element.appendChild(feedback);
      
      // Fade in the feedback elements
      setTimeout(() => {
        svg.style.opacity = '1';
        feedback.style.opacity = '1';
      }, 100);
      
      // Remove animation classes and clean up after animation completes
      setTimeout(() => {
        element.classList.remove('being-copied');
        
        // Fade out feedback elements
        svg.style.opacity = '0';
        feedback.style.opacity = '0';
        
        // Remove the elements after fade out
        setTimeout(() => {
          if (element.contains(svg)) {
            element.removeChild(svg);
          }
          if (element.contains(feedback)) {
            element.removeChild(feedback);
          }
        }, 300);
      }, 800);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      const originalBorder = element.style.borderColor; 
      element.style.border = '1px solid var(--danger-red)';
      setTimeout(() => {
        element.style.border = originalBorder || 'none'; // Revert border
      }, 1500);
    });
  },
  
  enterEditMode() {
    // Populate inputs with current values
    this.linkedinEditInput.value = this.currentLinks.linkedin || '';
    this.websiteEditInput.value = this.currentLinks.website || '';
    this.githubEditInput.value = this.currentLinks.github || '';

    // Toggle visibility using body class
    document.body.classList.add('editing-links');
  },
  
  exitEditMode() {
    document.body.classList.remove('editing-links');
  },
  
  async saveLinks() {
    const newLinks = {
      linkedin: this.linkedinEditInput.value.trim(),
      website: this.websiteEditInput.value.trim(),
      github: this.githubEditInput.value.trim()
    };

    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: newLinks });
      this.currentLinks = newLinks;
      this.updateLinkItems();
      this.exitEditMode();
      
      // Show a success message
      this.showToast('Links saved successfully!');
      
    } catch (error) {
      console.error("Error saving links:", error);
      alert("Failed to save links. See console for details.");
    }
  },
  
  // Helper for showing toast messages
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
};