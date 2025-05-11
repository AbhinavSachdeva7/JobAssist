// Quick Links Module
const QuickLinks = {
  STORAGE_KEY: 'jobAppHelperQuickLinks',
  TEMPLATES_KEY: 'jobAppHelperEmailTemplates',
  JOBS_KEY: 'jobAppHelperSavedJobs',
  currentLinks: [],
  currentTemplates: {},
  currentJobs: [],
  defaultLinks: [
    { id: 'link-1', type: 'linkedin', url: 'https://www.linkedin.com/in/example/', title: 'LinkedIn' },
    { id: 'link-2', type: 'website', url: 'https://example.com/', title: 'Personal Website' },
    { id: 'link-3', type: 'github', url: 'https://github.com/example', title: 'GitHub' }
  ],
  linkIcons: {
    linkedin: '../images/linkedin.svg',
    github: '../images/github.svg',
    website: '../images/globe-americas.svg',
    other: '../images/link-45deg.svg'
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
    this.addJobButton = document.getElementById('add-job-button');
    this.downloadJobsButton = document.getElementById('download-jobs-button');
    
    this.linksDisplayDiv = document.querySelector('.links-display');
    this.quickLinksEditDiv = document.querySelector('.quick-links-edit');
    this.templatesEditDiv = document.querySelector('.templates-edit');
    this.dynamicLinksContainer = document.getElementById('dynamic-links-container');
    this.dynamicLinksList = document.getElementById('dynamic-links-list');
    this.noLinksMessage = document.getElementById('no-links-message');
    
    this.jobsContainer = document.getElementById('jobs-container');
    this.noJobsMessage = document.getElementById('no-jobs-message');
    
    // Job sorting elements
    this.sortJobsButton = document.getElementById('sort-jobs-button');
    this.sortJobsMenu = document.getElementById('sort-jobs-menu');
    this.sortJobOptions = this.sortJobsMenu ? this.sortJobsMenu.querySelectorAll('.sort-option') : [];
    
    this.jobModalOverlay = document.getElementById('job-modal-overlay');
    this.jobTitleInput = document.getElementById('job-title-input');
    this.jobEmployerInput = document.getElementById('job-employer-input');
    this.jobUrlInput = document.getElementById('job-url-input');
    this.jobDateAppliedInput = document.getElementById('job-date-applied-input');
    this.jobModalClose = document.getElementById('job-modal-close');
    this.jobCancelButton = document.getElementById('job-cancel-button');
    this.jobSaveButton = document.getElementById('job-save-button');
    
    this.followUpSubjectEditInput = document.getElementById('follow-up-subject-edit');
    this.followUpEditInput = document.getElementById('follow-up-edit');
    this.introductionSubjectEditInput = document.getElementById('introduction-subject-edit');
    this.introductionEditInput = document.getElementById('introduction-edit');
    
    this.templateItems = document.querySelectorAll('.email-template-item');
    
    // Current sort option (default to most recent)
    this.currentJobSortOption = 'recent';
    
    // Bind methods to preserve context
    this.enterQuickLinksEditMode = this.enterQuickLinksEditMode.bind(this);
    this.enterTemplatesEditMode = this.enterTemplatesEditMode.bind(this);
    this.exitQuickLinksEditMode = this.exitQuickLinksEditMode.bind(this);
    this.exitTemplatesEditMode = this.exitTemplatesEditMode.bind(this);
    this.saveQuickLinks = this.saveQuickLinks.bind(this);
    this.saveTemplates = this.saveTemplates.bind(this);
    this.showTemplateModal = this.showTemplateModal.bind(this);
    this.addNewLinkInput = this.addNewLinkInput.bind(this);
    
    // Job-related methods binding
    this.openJobModal = this.openJobModal.bind(this);
    this.closeJobModal = this.closeJobModal.bind(this);
    this.saveJob = this.saveJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
    
    // Job sorting related bindings
    this.toggleJobSortMenu = this.toggleJobSortMenu.bind(this);
    this.handleJobSortOptionClick = this.handleJobSortOptionClick.bind(this);
    this.handleJobClickOutside = this.handleJobClickOutside.bind(this);
    
    // Set up event listeners
    this.editLinksButton.addEventListener('click', this.enterQuickLinksEditMode);
    this.editTemplatesButton.addEventListener('click', this.enterTemplatesEditMode);
    this.cancelLinksButton.addEventListener('click', this.exitQuickLinksEditMode);
    this.cancelTemplatesButton.addEventListener('click', this.exitTemplatesEditMode);
    this.saveLinksButton.addEventListener('click', this.saveQuickLinks);
    this.saveTemplatesButton.addEventListener('click', this.saveTemplates);
    this.addLinkButton.addEventListener('click', this.addNewLinkInput);
    
    // Job modal event listeners
    this.addJobButton.addEventListener('click', this.openJobModal);
    this.jobModalClose.addEventListener('click', this.closeJobModal);
    this.jobCancelButton.addEventListener('click', this.closeJobModal);
    this.jobSaveButton.addEventListener('click', this.saveJob);
    
    // Add keyboard event listeners for job modal
    this.jobTitleInput.addEventListener('keydown', this.handleJobModalKeydown.bind(this));
    this.jobEmployerInput.addEventListener('keydown', this.handleJobModalKeydown.bind(this));
    this.jobUrlInput.addEventListener('keydown', this.handleJobModalKeydown.bind(this));
    
    // Set up sort jobs button and options
    if (this.sortJobsButton) {
      this.sortJobsButton.addEventListener('click', this.toggleJobSortMenu);
    }
    
    // Add click listeners for sort options
    if (this.sortJobOptions) {
      this.sortJobOptions.forEach(option => {
        option.addEventListener('click', () => {
          const sortValue = option.getAttribute('data-sort');
          this.handleJobSortOptionClick(sortValue);
        });
      });
    }
    
    // Add global click listener to close the sort menu when clicking outside
    document.addEventListener('click', this.handleJobClickOutside);
    
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
    
    // Download jobs button event listener
    if (this.downloadJobsButton) {
      this.downloadJobsButton.addEventListener('click', this.downloadJobsData);
    }
    
    // Load stored links and templates
    this.loadQuickLinks();
    this.loadEmailTemplates();
    this.loadJobs();
    
    // Create modal elements for templates
    this.createTemplateModal();
    
    // Add event listener to close job modal on outside click
    this.jobModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.jobModalOverlay) {
        this.closeJobModal();
      }
    });
    
    // Set up Chrome runtime message listener for current tab URL
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getCurrentTabUrl') {
        this.jobUrlInput.value = request.url;
      }
    });
    
    // Automatically query for the current tab URL
    this.getCurrentTabUrl();
  },
  
  // Get the current tab URL
  getCurrentTabUrl() {
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          const url = tabs[0].url;
          // Store the URL temporarily
          this._currentTabUrl = url;
          
          // If the job URL input is already in the DOM, set its value
          if (this.jobUrlInput) {
            this.jobUrlInput.value = url;
          }
          
          resolve(url);
        } else {
          resolve('');
        }
      });
    });
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
  
  async loadJobs() {
    const result = await chrome.storage.local.get(this.JOBS_KEY);
    this.currentJobs = result[this.JOBS_KEY] || [];
    this.renderJobItems();
  },
  
  // Render all job items in the jobs container
  renderJobItems() {
    // Clear existing jobs except the no-jobs message
    const children = Array.from(this.jobsContainer.children);
    for (const child of children) {
      if (child.id !== 'no-jobs-message') {
        this.jobsContainer.removeChild(child);
      }
    }
    
    // Show or hide the no-jobs message based on jobs count
    if (this.currentJobs.length === 0) {
      this.noJobsMessage.style.display = 'block';
    } else {
      this.noJobsMessage.style.display = 'none';
      
      // Render each job
      this.currentJobs.forEach(job => {
        const jobElement = this.createJobElement(job);
        this.jobsContainer.appendChild(jobElement);
      });
    }
  },
  
  // Create a job DOM element
  createJobElement(job) {
    const jobElement = document.createElement('div');
    jobElement.className = 'job-item';
    jobElement.dataset.jobId = job.id;
    
    // Create HTML for job item with employer
    let jobHTML = `
      <div class="job-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="job-logo" viewBox="0 0 16 16">
          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5"/>
        </svg>
      </div>
      <div class="job-text">
        <span class="job-title copyable-job-field" data-copy-content="${job.employer}">${job.employer}</span>`;
        
    // Only add employer if it exists
    if (job.employer) {
      jobHTML += `<span class="job-employer copyable-job-field" data-copy-content="${job.title}">${job.title}</span>`;
    }
    
    jobHTML += `<span class="job-url copyable-job-field" data-copy-content="${job.url}">${job.url}</span>`;
    
    // Add Date Applied if it exists
    if (job.dateApplied) {
      // Format the date manually to avoid timezone issues
      let displayDate = "";
      
      try {
        // Parse the date string directly (format is YYYY-MM-DD)
        const [year, month, day] = job.dateApplied.split('-');
        
        // Create a readable date string using the month name
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        // Format as "Month Day, Year" - using parseInt to remove leading zeros
        const monthIndex = parseInt(month, 10) - 1;
        const formattedDay = parseInt(day, 10);
        displayDate = `${monthNames[monthIndex]} ${formattedDay}, ${year}`;
      } catch (e) {
        console.error("Error formatting date:", e);
        // Fallback to the raw date string if formatting fails
        displayDate = job.dateApplied;
      }
      
      jobHTML += `<span class="job-date-applied copyable-job-field" data-copy-content="${job.dateApplied}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 4px;">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
        </svg>
        Applied: ${displayDate}
      </span>`;
    }
    
    jobHTML += `
      </div>
      <div class="job-actions">
        <button class="job-delete-button" title="Delete Job">&times;</button>
      </div>
    `;
    
    jobElement.innerHTML = jobHTML;
    
    // Add click handlers for copyable fields
    const copyableFields = jobElement.querySelectorAll('.copyable-job-field');
    copyableFields.forEach(field => {
      field.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = field.dataset.copyContent;
        this.copyJobFieldToClipboard(content, field);
      });
    });
    
    // Add delete button handler
    const deleteButton = jobElement.querySelector('.job-delete-button');
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteJob(job.id);
    });
    
    return jobElement;
  },
  
  // Method to copy job field content to clipboard with visual feedback
  copyJobFieldToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
      // Store original text and styling
      const originalText = element.textContent;
      const originalColor = element.style.color;
      const originalFontWeight = element.style.fontWeight;
      
      // Show feedback
      element.textContent = 'Copied!';
      element.style.color = 'var(--primary)';
      element.style.fontWeight = '600';
      
      // Reset after delay
      setTimeout(() => {
        element.textContent = originalText;
        element.style.color = originalColor;
        element.style.fontWeight = originalFontWeight;
      }, 1000);
      
    }).catch(error => {
      console.error('Failed to copy text: ', error);
    });
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
      // Use the link-45deg.svg file with correct path
      iconHtml = `<img src="../images/link-45deg.svg" alt="Other Link" class="link-logo">`;
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
  
  // Job-related methods
  async openJobModal() {
    // Reset form fields
    this.jobTitleInput.value = '';
    this.jobEmployerInput.value = ''; // Ensure employer field is empty
    
    // Set today's date as default for date applied
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.jobDateAppliedInput.value = `${year}-${month}-${day}`;
    
    // Always get the current tab URL when opening the modal
    const currentUrl = await this.getCurrentTabUrl();
    this.jobUrlInput.value = currentUrl || '';
    
    // Check if this is a LinkedIn job page and extract job title and employer if it is
    if (currentUrl && currentUrl.includes('linkedin.com/jobs/view')) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          // Execute script to extract job title and employer from LinkedIn page
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              let jobTitle = '';
              let companyName = '';
              
              // Extract job title
              try {
                const titleElement = document.querySelector('h1.t-24, h1.job-title, h1[data-test-job-title], h1');
                if (titleElement && titleElement.textContent) {
                  jobTitle = titleElement.textContent.trim();
                  console.log("Found job title:", jobTitle);
                }
              } catch(titleError) {
                console.error("Error finding job title:", titleError);
              }
              
              // Extract company name - improved to handle more LinkedIn layouts
              try {
                // Try multiple possible selectors for company name with detailed logging
                const companySelectors = [
                  // New LinkedIn selectors
                  'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
                  'span.jobs-unified-top-card__company-name',
                  'a.jobs-unified-top-card__company-name',
                  
                  // Traditional selectors
                  'a.company-name',
                  'a[data-test-company-name]',
                  'span.company-name',
                  'span[data-test-company-name]',
                  'div.company-name',
                  'div[data-test-company-name]',
                  
                  // General fallback selectors that might contain company name
                  '.jobs-unified-top-card__subtitle-primary-grouping a',
                  '.jobs-unified-top-card__company-name a',
                  '.job-details-jobs-unified-top-card__company-name'
                ];
                
                console.log("Looking for company name with various selectors...");
                let companyElement = null;
                
                for (const selector of companySelectors) {
                  companyElement = document.querySelector(selector);
                  if (companyElement && companyElement.textContent) {
                    console.log(`Found company element with selector: ${selector}`);
                    break;
                  }
                }
                
                // If we still don't have it, try a more aggressive approach
                if (!companyElement || !companyElement.textContent.trim()) {
                  console.log("Trying secondary approach for company name...");
                  
                  // Look for elements in the subtitle area that might contain the company name
                  const subtitleElements = document.querySelectorAll('.jobs-unified-top-card__subtitle-primary-grouping a, .job-details-jobs-unified-top-card__primary-description-container a');
                  for (let i = 0; i < subtitleElements.length; i++) {
                    const element = subtitleElements[i];
                    // Typically the company name is the first link in these sections
                    if (element && element.textContent && !element.textContent.includes('followers') && !element.textContent.includes('reviews')) {
                      companyElement = element;
                      console.log("Found company name in subtitle element:", companyElement.textContent.trim());
                      break;
                    }
                  }
                }
                
                if (companyElement && companyElement.textContent) {
                  companyName = companyElement.textContent.trim();
                  // Clean up common patterns in LinkedIn company names
                  companyName = companyName.replace(/\s*\([^)]*\)/, ''); // Remove content in parentheses
                  companyName = companyName.replace(/\d+,?\d*\s*followers/, ''); // Remove "X followers"
                  companyName = companyName.trim();
                  console.log("Found company name:", companyName);
                } else {
                  console.log("Could not find company name with any selector");
                }
              } catch(companyError) {
                console.error("Error finding company name:", companyError);
              }
              
              return { jobTitle, companyName };
            }
          });
          
          // Update form fields if data was extracted
          if (results && results[0] && results[0].result) {
            const { jobTitle, companyName } = results[0].result;
            
            if (jobTitle) {
              this.jobTitleInput.value = jobTitle;
              console.log("Populated job title:", jobTitle);
            }
            
            if (companyName) {
              this.jobEmployerInput.value = companyName;
              console.log("Populated employer name:", companyName);
            } else {
              console.log("Failed to extract company name");
            }
          } else {
            console.log("No data extracted from LinkedIn page");
          }
        }
      } catch(error) {
        console.error("Error extracting job data from LinkedIn:", error);
      }
    }
    
    // Show modal
    this.jobModalOverlay.classList.add('show');
    
    // Focus on title field
    setTimeout(() => this.jobTitleInput.focus(), 100);
  },
  
  closeJobModal() {
    this.jobModalOverlay.classList.remove('show');
    
    // Clear form fields
    this.jobTitleInput.value = '';
    this.jobEmployerInput.value = '';
    this.jobUrlInput.value = '';
    this.jobDateAppliedInput.value = '';
  },
  
  async saveJob() {
    const title = this.jobTitleInput.value.trim();
    const employer = this.jobEmployerInput.value.trim();
    const url = this.jobUrlInput.value.trim();
    const dateApplied = this.jobDateAppliedInput.value.trim();
    
    if (!title) {
      alert('Please enter a job title.');
      return;
    }
    
    if (!url) {
      alert('Please enter a job URL.');
      return;
    }
    
    const newJob = {
      id: `job-${Date.now()}`,
      title,
      employer,
      url,
      dateApplied,
      dateAdded: new Date().toISOString()
    };
    
    // Add new job to the beginning of the array instead of the end
    this.currentJobs.unshift(newJob);
    
    try {
      await chrome.storage.local.set({ [this.JOBS_KEY]: this.currentJobs });
      this.renderJobItems();
      this.closeJobModal();
      this.showToast('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. See console for details.');
    }
  },
  
  async deleteJob(jobId) {
    // Remove the job without confirmation
    this.currentJobs = this.currentJobs.filter(job => job.id !== jobId);
    
    try {
      await chrome.storage.local.set({ [this.JOBS_KEY]: this.currentJobs });
      this.renderJobItems();
      this.showToast('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. See console for details.');
    }
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
  
  // Download Jobs data as CSV
  downloadJobsData() {
    if (this.currentJobs.length === 0) {
      this.showToast('No jobs data to download', 'error');
      return;
    }
    
    // Define CSV headers
    const headers = ['Job Title', 'Employer', 'URL', 'Date Applied', 'Date Added'];
    
    // Create CSV content with headers
    let csvContent = headers.join(',') + '\n';
    
    // Add job data rows
    this.currentJobs.forEach(job => {
      // Format the values and handle commas by wrapping in quotes if needed
      const title = job.title ? `"${job.title.replace(/"/g, '""')}"` : '""';
      const employer = job.employer ? `"${job.employer.replace(/"/g, '""')}"` : '""';
      const url = job.url ? `"${job.url.replace(/"/g, '""')}"` : '""';
      const dateApplied = job.dateApplied || '';
      const dateAdded = job.dateAdded ? new Date(job.dateAdded).toLocaleDateString() : '';
      
      // Add the row to CSV content
      csvContent += `${title},${employer},${url},${dateApplied},${dateAdded}\n`;
    });
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `jobs_data_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Jobs data downloaded successfully!');
  },
  
  // Helper for showing toast messages
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === 'success' ? 'var(--primary)' : 'var(--danger-red)';
    toast.style.color = 'white';
    toast.style.padding = '10px 16px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  },
  
  // Handle keyboard events in the job modal
  handleJobModalKeydown(e) {
    // If Enter key is pressed and not with modifier keys
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      this.saveJob();
    }
  },

  // Toggle job sort menu visibility
  toggleJobSortMenu(event) {
    event.stopPropagation();
    this.sortJobsMenu.classList.toggle('active');
    
    // Update active class on the current sort option
    this.updateActiveJobSortOption();
  },
  
  // Handle job sort option click
  handleJobSortOptionClick(sortValue) {
    // Set current sort option
    this.currentJobSortOption = sortValue;
    
    // Hide the menu
    this.sortJobsMenu.classList.remove('active');
    
    // Update active state on options
    this.updateActiveJobSortOption();
    
    // Sort and reload jobs with new sort order
    this.sortAndRenderJobs();
  },
  
  // Handle clicks outside the job sort menu
  handleJobClickOutside(event) {
    if (this.sortJobsMenu && this.sortJobsMenu.classList.contains('active') && 
        event.target !== this.sortJobsButton && 
        !this.sortJobsMenu.contains(event.target)) {
      this.sortJobsMenu.classList.remove('active');
    }
  },
  
  // Update which job sort option is marked as active
  updateActiveJobSortOption() {
    if (this.sortJobOptions) {
      this.sortJobOptions.forEach(option => {
        const sortValue = option.getAttribute('data-sort');
        if (sortValue === this.currentJobSortOption) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
  },

  // Sort jobs based on the selected option
  sortJobs(jobs, sortOption) {
    console.log("Sorting jobs by:", sortOption);
    switch(sortOption) {
      case 'employer':
        // Put jobs with no employer at the bottom
        return [...jobs].sort((a, b) => {
          if (!a.employer && !b.employer) return 0;
          if (!a.employer) return 1;
          if (!b.employer) return -1;
          return a.employer.localeCompare(b.employer);
        });
      case 'recent':
      default:
        // Sort by dateAdded (most recent first)
        return [...jobs].sort((a, b) => {
          if (a.dateAdded && b.dateAdded) {
            return new Date(b.dateAdded) - new Date(a.dateAdded);
          } else if (a.dateAdded) {
            return -1;
          } else if (b.dateAdded) {
            return 1;
          }
          return 0;
        });
    }
  },
  
  // Sort and render jobs
  sortAndRenderJobs() {
    // Sort jobs based on current sort option
    const sortedJobs = this.sortJobs(this.currentJobs, this.currentJobSortOption);
    this.currentJobs = sortedJobs;
    
    // Re-render the job list
    this.renderJobItems();
  },
};