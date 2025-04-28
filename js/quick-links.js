// Quick Links Module
const QuickLinks = {
  STORAGE_KEY: 'jobAppHelperQuickLinks',
  TEMPLATES_KEY: 'jobAppHelperEmailTemplates',
  currentLinks: [],
  currentTemplates: {},
  defaultLinks: [
    { id: 'link-1', type: 'linkedin', url: 'https://www.linkedin.com/in/mab-malik/', title: 'LinkedIn' },
    { id: 'link-2', type: 'website', url: 'https://abdullahmalik.me/', title: 'Personal Website' },
    { id: 'link-3', type: 'github', url: 'https://github.com/Abdullah-Malik', title: 'GitHub' }
  ],
  linkIcons: {
    linkedin: 'linkedin.svg',
    github: 'github.svg',
    website: 'globe-americas.svg',
    other: 'bi-link-45deg'
  },
  defaultTemplates: {
    'follow-up': {
      subject: 'Following up on [Position] interview at [Company]',
      body: `Dear [Hiring Manager's Name],

Thank you for the opportunity to interview for the [Position] role at [Company Name]. I enjoyed our conversation and learning more about the team and position.

I'm writing to follow up on our discussion about [specific topic discussed]. As I mentioned during the interview, my experience with [relevant skill/project] has prepared me well for this role.

Please let me know if you need any additional information from me. I'm excited about the possibility of joining [Company Name] and contributing to [specific goal or project].

Best regards,
[Your Name]`
    },
    'introduction': {
      subject: '[Your Name] - Application for [Position] at [Company]',
      body: `Dear [Hiring Manager's Name],

I'm reaching out to express my interest in the [Position] role at [Company Name]. With [number] years of experience in [relevant field] and a background in [relevant background], I believe I would be a great fit for this position.

My key accomplishments include:
• [Accomplishment 1]
• [Accomplishment 2]
• [Accomplishment 3]

I'm particularly drawn to [Company Name] because of [specific reason, e.g., company values, projects, etc.]. I've attached my resume for your review and would welcome the opportunity to discuss how my skills align with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`
    }
  },
  
  init() {
    // Cache DOM elements
    this.editLinksButton = document.getElementById('edit-links-button');
    this.editTemplatesButton = document.getElementById('edit-templates-button');
    this.saveLinksButton = document.getElementById('save-links-button');
    this.cancelLinksButton = document.getElementById('cancel-links-button');
    this.saveTemplatesButton = document.getElementById('save-templates-button');
    this.cancelTemplatesButton = document.getElementById('cancel-templates-button');
    this.addLinkButton = document.getElementById('add-link-button');
    
    this.linksDisplayDiv = document.querySelector('.links-display');
    this.quickLinksEditDiv = document.querySelector('.quick-links-edit');
    this.templatesEditDiv = document.querySelector('.templates-edit');
    this.dynamicLinksContainer = document.getElementById('dynamic-links-container');
    this.dynamicLinksList = document.getElementById('dynamic-links-list');
    this.noLinksMessage = document.getElementById('no-links-message');
    
    this.followUpSubjectEditInput = document.getElementById('follow-up-subject-edit');
    this.followUpEditInput = document.getElementById('follow-up-edit');
    this.introductionSubjectEditInput = document.getElementById('introduction-subject-edit');
    this.introductionEditInput = document.getElementById('introduction-edit');
    
    this.templateItems = document.querySelectorAll('.email-template-item');
    
    // Bind methods to preserve context
    this.enterQuickLinksEditMode = this.enterQuickLinksEditMode.bind(this);
    this.enterTemplatesEditMode = this.enterTemplatesEditMode.bind(this);
    this.exitQuickLinksEditMode = this.exitQuickLinksEditMode.bind(this);
    this.exitTemplatesEditMode = this.exitTemplatesEditMode.bind(this);
    this.saveQuickLinks = this.saveQuickLinks.bind(this);
    this.saveTemplates = this.saveTemplates.bind(this);
    this.showTemplateModal = this.showTemplateModal.bind(this);
    this.addNewLinkInput = this.addNewLinkInput.bind(this);
    
    // Set up event listeners
    this.editLinksButton.addEventListener('click', this.enterQuickLinksEditMode);
    this.editTemplatesButton.addEventListener('click', this.enterTemplatesEditMode);
    this.cancelLinksButton.addEventListener('click', this.exitQuickLinksEditMode);
    this.cancelTemplatesButton.addEventListener('click', this.exitTemplatesEditMode);
    this.saveLinksButton.addEventListener('click', this.saveQuickLinks);
    this.saveTemplatesButton.addEventListener('click', this.saveTemplates);
    this.addLinkButton.addEventListener('click', this.addNewLinkInput);
    
    // Set up click handlers for email template items
    this.templateItems.forEach(item => {
      item.addEventListener('click', (event) => {
        const key = item.dataset.templateKey;
        const template = this.currentTemplates[key];
        if (template) {
          this.showTemplateModal(key, template, item);
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
    
    // Check if we have stored links and if it's an array
    if (result[this.STORAGE_KEY] && Array.isArray(result[this.STORAGE_KEY])) {
      this.currentLinks = result[this.STORAGE_KEY];
    } 
    // Handle migration from old object format to new array format
    else if (result[this.STORAGE_KEY] && typeof result[this.STORAGE_KEY] === 'object') {
      const oldLinks = result[this.STORAGE_KEY];
      this.currentLinks = [
        { id: 'link-1', type: 'linkedin', url: oldLinks.linkedin || '', title: 'LinkedIn' },
        { id: 'link-2', type: 'website', url: oldLinks.website || '', title: 'Personal Website' },
        { id: 'link-3', type: 'github', url: oldLinks.github || '', title: 'GitHub' }
      ].filter(link => link.url); // Only keep links that have URLs
    } 
    // Otherwise use default links
    else {
      this.currentLinks = [...this.defaultLinks];
    }
    
    this.renderLinkItems();
  },
  
  async loadEmailTemplates() {
    const result = await chrome.storage.local.get(this.TEMPLATES_KEY);
    this.currentTemplates = result[this.TEMPLATES_KEY] || { ...this.defaultTemplates };
    
    // Handle migration from old format to new format with subjects
    Object.keys(this.currentTemplates).forEach(key => {
      if (typeof this.currentTemplates[key] === 'string') {
        // Convert old format (string) to new format (object with subject and body)
        this.currentTemplates[key] = {
          subject: key === 'follow-up' ? 'Following up on interview' : 'Application for position',
          body: this.currentTemplates[key]
        };
      }
    });
    
    this.updateTemplateItems();
  },
  
  renderLinkItems() {
    // Clear existing links
    this.dynamicLinksContainer.innerHTML = '';
    
    // Check if we have any links to display
    if (this.currentLinks.length === 0) {
      this.noLinksMessage.style.display = 'block';
      this.dynamicLinksContainer.appendChild(this.noLinksMessage);
      return;
    }
    
    // Hide the no-links message if we have links
    this.noLinksMessage.style.display = 'none';
    
    // Render each link
    this.currentLinks.forEach(link => {
      const linkItem = this.createLinkItemElement(link);
      this.dynamicLinksContainer.appendChild(linkItem);
      
      // Add click handler to copy link URL
      linkItem.addEventListener('click', () => {
        if (link.url) {
          this.copyToClipboard(link.url, linkItem);
        } else {
          alert(`${link.title} link is not set. Click Edit to add it.`);
        }
      });
    });
  },
  
  createLinkItemElement(link) {
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.dataset.linkId = link.id;
    
    // Determine the correct icon to use
    let iconHtml;
    if (link.type === 'other') {
      // Use the link-45deg.svg file instead of inline SVG
      iconHtml = `<img src="link-45deg.svg" alt="Other Link" class="link-logo">`;
    } else {
      // Use an external SVG file
      const iconFile = this.linkIcons[link.type] || this.linkIcons.other;
      iconHtml = `<img src="${iconFile}" alt="${link.type} Logo" class="link-logo">`;
    }
    
    linkItem.innerHTML = `
      ${iconHtml}
      <div class="link-text">
        <span class="link-title">${link.title}</span>
        <span class="link-url">${link.url || '(Not Set)'}</span>
      </div>
    `;
    
    return linkItem;
  },
  
  updateTemplateItems() {
    this.templateItems.forEach(item => {
      const key = item.dataset.templateKey;
      const template = this.currentTemplates[key];
      
      const subjectSpan = item.querySelector('.template-subject');
      const previewSpan = item.querySelector('.template-preview');
      
      if (template) {
        // Update subject
        if (subjectSpan) {
          subjectSpan.textContent = `Subject: ${template.subject}`;
        }
        
        // Update preview of body
        if (previewSpan) {
          const templateBody = template.body;
          const previewText = templateBody.substring(0, 30) + (templateBody.length > 30 ? '...' : '');
          previewSpan.textContent = previewText;
        }
      }
    });
  },
  
  addNewLinkInput() {
    const linkId = `link-${Date.now()}`; // Create a unique ID
    const linkInputRow = this.createLinkInputRow({ id: linkId, type: 'linkedin', url: '', title: '' });
    this.dynamicLinksList.appendChild(linkInputRow);
    
    // Focus on the title input of the newly added link
    const titleInput = linkInputRow.querySelector('.link-title-input');
    if (titleInput) {
      titleInput.focus();
    }
  },
  
  createLinkInputRow(link = {}) {
    const container = document.createElement('div');
    container.className = 'link-input-container';
    container.dataset.linkId = link.id;
    
    // Create link type dropdown
    const typeSelect = document.createElement('select');
    typeSelect.className = 'link-type-select';
    typeSelect.innerHTML = `
      <option value="linkedin" ${link.type === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
      <option value="github" ${link.type === 'github' ? 'selected' : ''}>GitHub</option>
      <option value="website" ${link.type === 'website' ? 'selected' : ''}>Website</option>
      <option value="other" ${link.type === 'other' ? 'selected' : ''}>Other</option>
    `;
    
    // Create title input group
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'link-title-input';
    titleInput.placeholder = 'Link Title';
    titleInput.value = link.title || '';
    titleGroup.appendChild(titleInput);
    
    // Create URL input group
    const urlGroup = document.createElement('div');
    urlGroup.className = 'form-group';
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'link-url-input';
    urlInput.placeholder = 'https://...';
    urlInput.value = link.url || '';
    urlGroup.appendChild(urlInput);
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-link-button';
    deleteButton.innerHTML = '&times;';
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      container.remove();
    });
    
    // Assemble the row
    container.appendChild(typeSelect);
    container.appendChild(titleGroup);
    container.appendChild(urlGroup);
    container.appendChild(deleteButton);
    
    return container;
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
    
    // Create subject section
    const subjectSection = document.createElement('div');
    subjectSection.className = 'template-subject-section';
    
    const subjectLabel = document.createElement('div');
    subjectLabel.className = 'template-label';
    subjectLabel.textContent = 'Subject:';
    
    const subjectContent = document.createElement('div');
    subjectContent.className = 'template-subject-content';
    
    subjectSection.appendChild(subjectLabel);
    subjectSection.appendChild(subjectContent);
    
    // Create body section
    const bodySection = document.createElement('div');
    bodySection.className = 'template-body-section';
    
    const bodyLabel = document.createElement('div');
    bodyLabel.className = 'template-label';
    bodyLabel.textContent = 'Body:';
    
    const bodyContent = document.createElement('div');
    bodyContent.className = 'template-content';
    
    bodySection.appendChild(bodyLabel);
    bodySection.appendChild(bodyContent);
    
    modalBody.appendChild(subjectSection);
    modalBody.appendChild(bodySection);
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'template-modal-footer';
    
    const copySubjectButton = document.createElement('button');
    copySubjectButton.className = 'copy-template-button';
    copySubjectButton.textContent = 'Copy Subject';
    
    const copyBodyButton = document.createElement('button');
    copyBodyButton.className = 'copy-template-button';
    copyBodyButton.textContent = 'Copy Body';
    
    modalFooter.appendChild(copySubjectButton);
    modalFooter.appendChild(copyBodyButton);
    
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
      subjectContent: subjectContent,
      bodyContent: bodyContent,
      copySubjectButton: copySubjectButton,
      copyBodyButton: copyBodyButton
    };
  },
  
  showTemplateModal(key, template, item) {
    if (!this.templateModal) {
      console.error("Template modal not initialized");
      return;
    }
    
    // Set the title and content
    const title = item.querySelector('.link-title').textContent;
    this.templateModal.title.textContent = title;
    this.templateModal.subjectContent.textContent = template.subject;
    this.templateModal.bodyContent.textContent = template.body;
    
    // Set up the copy buttons
    const self = this;
    
    this.templateModal.copySubjectButton.onclick = function() {
      self.copyToClipboard(template.subject, null);
      self.closeTemplateModal();
      self.showToast('Subject copied to clipboard!');
    };
    
    this.templateModal.copyBodyButton.onclick = function() {
      self.copyToClipboard(template.body, null);
      self.closeTemplateModal();
      self.showToast('Body copied to clipboard!');
    };
    
    // Show the modal with animation
    document.body.style.overflow = 'hidden'; // Prevent scrolling
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
    document.body.style.overflow = ''; // Re-enable scrolling
  },
  
  copyToClipboard(text, element) {
    // Clear any existing copy feedback
    const existingFeedback = document.querySelectorAll('.copy-feedback-label');
    existingFeedback.forEach(el => el.remove());
    
    navigator.clipboard.writeText(text).then(() => {
      if (!element) {
        return; // If no element is provided, just copy silently
      }
      
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
      if (element) {
        const originalBorder = element.style.borderColor; 
        element.style.border = '1px solid var(--danger-red)';
        setTimeout(() => {
          element.style.border = originalBorder || 'none'; // Revert border
        }, 1500);
      }
    });
  },
  
  enterQuickLinksEditMode() {
    // Clear existing link inputs
    this.dynamicLinksList.innerHTML = '';
    
    // Create inputs for existing links
    this.currentLinks.forEach(link => {
      const linkInputRow = this.createLinkInputRow(link);
      this.dynamicLinksList.appendChild(linkInputRow);
    });
    
    // If no links exist, add a blank one
    if (this.currentLinks.length === 0) {
      this.addNewLinkInput();
    }

    // Toggle visibility
    document.body.classList.add('editing-quicklinks');
    this.linksDisplayDiv.style.display = 'none';
    this.quickLinksEditDiv.style.display = 'block';
  },
  
  enterTemplatesEditMode() {
    // Populate email template inputs
    const followUpTemplate = this.currentTemplates['follow-up'];
    const introTemplate = this.currentTemplates['introduction'];
    
    this.followUpSubjectEditInput.value = followUpTemplate.subject || '';
    this.followUpEditInput.value = followUpTemplate.body || '';
    this.introductionSubjectEditInput.value = introTemplate.subject || '';
    this.introductionEditInput.value = introTemplate.body || '';

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
    const newLinks = [];
    
    // Get all link input containers
    const linkContainers = this.dynamicLinksList.querySelectorAll('.link-input-container');
    
    // Process each link input
    linkContainers.forEach(container => {
      const id = container.dataset.linkId;
      const typeSelect = container.querySelector('.link-type-select');
      const titleInput = container.querySelector('.link-title-input');
      const urlInput = container.querySelector('.link-url-input');
      
      // Only add links that have at least a title or URL
      if (titleInput.value.trim() || urlInput.value.trim()) {
        const type = typeSelect.value;
        
        // Set a default title based on type if no title is provided
        let title = titleInput.value.trim();
        if (!title) {
          switch (type) {
            case 'linkedin':
              title = 'LinkedIn';
              break;
            case 'github':
              title = 'GitHub';
              break;
            case 'website':
              title = 'Personal Website';
              break;
            case 'other':
              title = 'Link';
              break;
            default:
              title = 'Link';
          }
        }
        
        newLinks.push({
          id,
          type,
          title,
          url: urlInput.value.trim()
        });
      }
    });

    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: newLinks });
      
      this.currentLinks = newLinks;
      this.renderLinkItems();
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
      'follow-up': {
        subject: this.followUpSubjectEditInput.value.trim(),
        body: this.followUpEditInput.value.trim()
      },
      'introduction': {
        subject: this.introductionSubjectEditInput.value.trim(),
        body: this.introductionEditInput.value.trim()
      }
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
    // Empty implementation to remove toast notifications
    return;
    
    // Original implementation commented out
    /*
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
    */
  }
};