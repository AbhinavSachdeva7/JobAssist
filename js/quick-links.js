// Quick Links Module
const QuickLinks = {
  STORAGE_KEY: 'jobAppHelperQuickLinks',
  TEMPLATES_KEY: 'jobAppHelperEmailTemplates',
  currentLinks: {},
  currentTemplates: {},
  defaultLinks: {
    linkedin: 'https://www.linkedin.com/in/mab-malik/',
    website: 'https://abdullahmalik.me/',
    github: 'https://github.com/Abdullah-Malik'
  },
  defaultTemplates: {
    'follow-up': `Dear [Hiring Manager's Name],

Thank you for the opportunity to interview for the [Position] role at [Company Name]. I enjoyed our conversation and learning more about the team and position.

I'm writing to follow up on our discussion about [specific topic discussed]. As I mentioned during the interview, my experience with [relevant skill/project] has prepared me well for this role.

Please let me know if you need any additional information from me. I'm excited about the possibility of joining [Company Name] and contributing to [specific goal or project].

Best regards,
[Your Name]`,
    'introduction': `Dear [Hiring Manager's Name],

I'm reaching out to express my interest in the [Position] role at [Company Name]. With [number] years of experience in [relevant field] and a background in [relevant background], I believe I would be a great fit for this position.

My key accomplishments include:
• [Accomplishment 1]
• [Accomplishment 2]
• [Accomplishment 3]

I'm particularly drawn to [Company Name] because of [specific reason, e.g., company values, projects, etc.]. I've attached my resume for your review and would welcome the opportunity to discuss how my skills align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`
  },
  
  init() {
    // Cache DOM elements
    this.editLinksButton = document.getElementById('edit-links-button');
    this.editTemplatesButton = document.getElementById('edit-templates-button');
    this.saveLinksButton = document.getElementById('save-links-button');
    this.cancelLinksButton = document.getElementById('cancel-links-button');
    this.saveTemplatesButton = document.getElementById('save-templates-button');
    this.cancelTemplatesButton = document.getElementById('cancel-templates-button');
    
    this.linksDisplayDiv = document.querySelector('.links-display');
    this.quickLinksEditDiv = document.querySelector('.quick-links-edit');
    this.templatesEditDiv = document.querySelector('.templates-edit');
    
    this.linkedinEditInput = document.getElementById('linkedin-edit');
    this.websiteEditInput = document.getElementById('website-edit');
    this.githubEditInput = document.getElementById('github-edit');
    this.followUpEditInput = document.getElementById('follow-up-edit');
    this.introductionEditInput = document.getElementById('introduction-edit');
    this.linkItems = document.querySelectorAll('.link-item');
    this.templateItems = document.querySelectorAll('.email-template-item');
    
    // Bind methods to preserve context
    this.enterQuickLinksEditMode = this.enterQuickLinksEditMode.bind(this);
    this.enterTemplatesEditMode = this.enterTemplatesEditMode.bind(this);
    this.exitQuickLinksEditMode = this.exitQuickLinksEditMode.bind(this);
    this.exitTemplatesEditMode = this.exitTemplatesEditMode.bind(this);
    this.saveQuickLinks = this.saveQuickLinks.bind(this);
    this.saveTemplates = this.saveTemplates.bind(this);
    this.showTemplateModal = this.showTemplateModal.bind(this);
    
    // Set up event listeners
    this.editLinksButton.addEventListener('click', this.enterQuickLinksEditMode);
    this.editTemplatesButton.addEventListener('click', this.enterTemplatesEditMode);
    this.cancelLinksButton.addEventListener('click', this.exitQuickLinksEditMode);
    this.cancelTemplatesButton.addEventListener('click', this.exitTemplatesEditMode);
    this.saveLinksButton.addEventListener('click', this.saveQuickLinks);
    this.saveTemplatesButton.addEventListener('click', this.saveTemplates);
    
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
    
    // Set up click handlers for email template items
    this.templateItems.forEach(item => {
      item.addEventListener('click', (event) => {
        const key = item.dataset.templateKey;
        const templateText = this.currentTemplates[key];
        if (templateText) {
          this.showTemplateModal(key, templateText, item);
        } else {
          alert(`${item.querySelector('.link-title').textContent} is not set. Click Edit to add it.`);
        }
      });
    });
    
    // Load stored links and templates
    this.loadQuickLinks();
    this.loadEmailTemplates();
    
    // Create modal elements for templates
    this.createTemplateModal();
  },
  
  async loadQuickLinks() {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    this.currentLinks = result[this.STORAGE_KEY] || { ...this.defaultLinks };
    this.updateLinkItems();
  },
  
  async loadEmailTemplates() {
    const result = await chrome.storage.local.get(this.TEMPLATES_KEY);
    this.currentTemplates = result[this.TEMPLATES_KEY] || { ...this.defaultTemplates };
    this.updateTemplateItems();
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
  
  updateTemplateItems() {
    this.templateItems.forEach(item => {
      const key = item.dataset.templateKey;
      const previewSpan = item.querySelector('.template-preview');
      if (previewSpan && this.currentTemplates[key]) {
        // Create a preview of the template (first 30 characters)
        const templateText = this.currentTemplates[key];
        const previewText = templateText.substring(0, 30) + (templateText.length > 30 ? '...' : '');
        previewSpan.textContent = previewText;
      }
    });
  },
  
  createTemplateModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'template-modal-overlay';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'template-modal';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'template-modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'template-modal-title';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'template-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.closeTemplateModal());
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'template-modal-body';
    
    const templateContent = document.createElement('div');
    templateContent.className = 'template-content';
    
    modalBody.appendChild(templateContent);
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'template-modal-footer';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-template-button';
    copyButton.textContent = 'Copy to Clipboard';
    
    modalFooter.appendChild(copyButton);
    
    // Assemble the modal
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    modalOverlay.appendChild(modal);
    
    // Add to document
    document.body.appendChild(modalOverlay);
    
    // Store references
    this.templateModal = {
      overlay: modalOverlay,
      container: modal,
      title: modalTitle,
      content: templateContent,
      copyButton: copyButton
    };
  },
  
  showTemplateModal(key, text, item) {
    // Set the title and content
    const title = item.querySelector('.link-title').textContent;
    this.templateModal.title.textContent = title;
    this.templateModal.content.textContent = text;
    
    // Set up the copy button
    const copyButton = this.templateModal.copyButton;
    const self = this;
    copyButton.onclick = function() {
      self.copyToClipboard(text, item);
      self.closeTemplateModal();
    };
    
    // Show the modal
    this.templateModal.overlay.classList.add('show');
    
    // Add event listener to close on outside click
    const handleOutsideClick = (event) => {
      if (event.target === this.templateModal.overlay) {
        this.closeTemplateModal();
        this.templateModal.overlay.removeEventListener('click', handleOutsideClick);
      }
    };
    this.templateModal.overlay.addEventListener('click', handleOutsideClick);
  },
  
  closeTemplateModal() {
    this.templateModal.overlay.classList.remove('show');
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
  
  enterQuickLinksEditMode() {
    // Populate inputs with current values
    this.linkedinEditInput.value = this.currentLinks.linkedin || '';
    this.websiteEditInput.value = this.currentLinks.website || '';
    this.githubEditInput.value = this.currentLinks.github || '';

    // Toggle visibility
    document.body.classList.add('editing-quicklinks');
    this.linksDisplayDiv.style.display = 'none';
    this.quickLinksEditDiv.style.display = 'block';
  },
  
  enterTemplatesEditMode() {
    // Populate email template inputs
    this.followUpEditInput.value = this.currentTemplates['follow-up'] || '';
    this.introductionEditInput.value = this.currentTemplates['introduction'] || '';

    // Toggle visibility
    document.body.classList.add('editing-templates');
    this.linksDisplayDiv.style.display = 'none';
    this.templatesEditDiv.style.display = 'block';
  },
  
  exitQuickLinksEditMode() {
    document.body.classList.remove('editing-quicklinks');
    this.quickLinksEditDiv.style.display = 'none';
    this.linksDisplayDiv.style.display = 'block';
  },
  
  exitTemplatesEditMode() {
    document.body.classList.remove('editing-templates');
    this.templatesEditDiv.style.display = 'none';
    this.linksDisplayDiv.style.display = 'block';
  },
  
  async saveQuickLinks() {
    const newLinks = {
      linkedin: this.linkedinEditInput.value.trim(),
      website: this.websiteEditInput.value.trim(),
      github: this.githubEditInput.value.trim()
    };

    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: newLinks });
      
      this.currentLinks = newLinks;
      this.updateLinkItems();
      this.exitQuickLinksEditMode();
      
      // Show a success message
      this.showToast('Quick links saved successfully!');
      
    } catch (error) {
      console.error("Error saving links:", error);
      alert("Failed to save links. See console for details.");
    }
  },
  
  async saveTemplates() {
    const newTemplates = {
      'follow-up': this.followUpEditInput.value.trim(),
      'introduction': this.introductionEditInput.value.trim()
    };

    try {
      await chrome.storage.local.set({ [this.TEMPLATES_KEY]: newTemplates });
      
      this.currentTemplates = newTemplates;
      this.updateTemplateItems();
      this.exitTemplatesEditMode();
      
      // Show a success message
      this.showToast('Email templates saved successfully!');
      
    } catch (error) {
      console.error("Error saving templates:", error);
      alert("Failed to save templates. See console for details.");
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