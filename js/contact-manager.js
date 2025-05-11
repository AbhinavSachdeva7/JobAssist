// Contact Manager Module
const ContactManager = {
  STORAGE_KEY: 'jobAppHelperContacts',
  
  init() {
    console.log("Initializing ContactManager...");
    // Cache DOM elements
    this.showAddContactFormButton = document.getElementById('show-add-contact-form');
    this.contactModalOverlay = document.getElementById('contact-modal-overlay');
    this.contactModalClose = document.getElementById('contact-modal-close');
    this.saveContactButton = document.getElementById('save-contact-button');
    this.cancelContactButton = document.getElementById('cancel-contact-button');
    this.contactNameInput = document.getElementById('contact-name');
    this.contactEmailInput = document.getElementById('contact-email');
    this.contactEmployerInput = document.getElementById('contact-employer');
    this.contactUrlInput = document.getElementById('contact-url');
    this.contactReachedOutInput = document.getElementById('contact-reached-out');
    this.contactsListDiv = document.getElementById('contacts-list');
    this.downloadContactsButton = document.getElementById('download-contacts-button');
    this.sortContactsButton = document.getElementById('sort-contacts-button');
    this.sortMenu = document.getElementById('sort-menu');
    this.sortOptions = document.querySelectorAll('.sort-option');
    
    // Log the DOM elements to debug
    console.log("DOM elements:", {
      addButton: this.showAddContactFormButton,
      modal: this.contactModalOverlay,
      closeBtn: this.contactModalClose,
      saveBtn: this.saveContactButton,
      cancelBtn: this.cancelContactButton,
      contactsList: this.contactsListDiv,
      downloadBtn: this.downloadContactsButton,
      sortBtn: this.sortContactsButton,
      sortMenu: this.sortMenu,
      sortOptions: this.sortOptions
    });
    
    // Current sort option (default to most recent)
    this.currentSortOption = 'recent';
    
    // Bind methods to preserve context
    this.handleAddContact = this.handleAddContact.bind(this);
    this.showContactModal = this.showContactModal.bind(this);
    this.closeContactModal = this.closeContactModal.bind(this);
    this.toggleReachedOutStatus = this.toggleReachedOutStatus.bind(this);
    this.downloadContactsData = this.downloadContactsData.bind(this);
    this.toggleSortMenu = this.toggleSortMenu.bind(this);
    this.handleSortOptionClick = this.handleSortOptionClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    // Removed handleCancelContact binding as we're using closeContactModal instead
    
    // Set up event listeners
    if (this.showAddContactFormButton) {
      this.showAddContactFormButton.addEventListener('click', () => {
        console.log("Add contact button clicked");
        this.showContactModal();
      });
    } else {
      console.error("Add contact button not found in the DOM");
    }
    
    if (this.contactModalClose) {
      this.contactModalClose.addEventListener('click', this.closeContactModal);
    }
    
    if (this.saveContactButton) {
      this.saveContactButton.addEventListener('click', this.handleAddContact);
    }
    
    if (this.cancelContactButton) {
      this.cancelContactButton.addEventListener('click', this.closeContactModal);
    }
    
    // Download contacts button event listener
    if (this.downloadContactsButton) {
      this.downloadContactsButton.addEventListener('click', this.downloadContactsData);
    }
    
    // Sort contacts button event listener
    if (this.sortContactsButton) {
      this.sortContactsButton.addEventListener('click', this.toggleSortMenu);
    }
    
    // Add click listeners for sort options
    if (this.sortOptions) {
      this.sortOptions.forEach(option => {
        option.addEventListener('click', () => {
          const sortValue = option.getAttribute('data-sort');
          this.handleSortOptionClick(sortValue);
        });
      });
    }
    
    // Add global click listener to close the sort menu when clicking outside
    document.addEventListener('click', this.handleClickOutside);
    
    // Add keydown listeners for Enter key in inputs
    const contactInputs = [
      this.contactNameInput,
      this.contactEmailInput, 
      this.contactEmployerInput, 
      this.contactUrlInput
    ].filter(input => input !== null); // Filter out null elements
    
    contactInputs.forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.handleAddContact();
        }
      });
    });

    // Add event listener to close contact modal on outside click
    // if (this.contactModalOverlay) {
    //   this.contactModalOverlay.addEventListener('click', (e) => {
    //     if (e.target === this.contactModalOverlay) {
    //       this.closeContactModal();
    //     }
    //   });
    // }
    
    // Load stored contacts
    this.loadContacts();
  },
  
  async loadContacts() {
    console.log("Loading contacts...");
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      let savedContacts = result[this.STORAGE_KEY] || [];
      console.log("Found contacts:", savedContacts);
      
      if (!this.contactsListDiv) {
        console.error("Contacts list div not found");
        return;
      }
      
      this.contactsListDiv.innerHTML = '';
      
      if (savedContacts.length === 0) {
        this.contactsListDiv.innerHTML = '<p>No contacts saved yet.</p>';
        return;
      }

      // Apply sorting based on the current selection
      savedContacts = this.sortContacts(savedContacts, this.currentSortOption);
      
      savedContacts.forEach(contact => {
        this.displayContact(contact.name, contact.email, contact.employer, contact.url, contact.reachedOut);
      });
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  },

  // Toggle sort menu visibility
  toggleSortMenu(event) {
    event.stopPropagation();
    this.sortMenu.classList.toggle('active');
    
    // Update active class on the current sort option
    this.updateActiveSortOption();
  },
  
  // Handle sort option click
  handleSortOptionClick(sortValue) {
    // Set current sort option
    this.currentSortOption = sortValue;
    
    // Hide the menu
    this.sortMenu.classList.remove('active');
    
    // Update active state on options
    this.updateActiveSortOption();
    
    // Reload contacts with new sort
    this.loadContacts();
  },
  
  // Handle clicks outside the sort menu
  handleClickOutside(event) {
    if (this.sortMenu && this.sortMenu.classList.contains('active') && 
        event.target !== this.sortContactsButton && 
        !this.sortMenu.contains(event.target)) {
      this.sortMenu.classList.remove('active');
    }
  },
  
  // Update which sort option is marked as active
  updateActiveSortOption() {
    this.sortOptions.forEach(option => {
      const sortValue = option.getAttribute('data-sort');
      if (sortValue === this.currentSortOption) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  },

  // Sort contacts based on the selected option
  sortContacts(contacts, sortOption) {
    console.log("Sorting contacts by:", sortOption);
    switch(sortOption) {
      case 'name':
        return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
      case 'employer':
        // Put contacts with no employer at the bottom
        return [...contacts].sort((a, b) => {
          if (!a.employer && !b.employer) return 0;
          if (!a.employer) return 1;
          if (!b.employer) return -1;
          return a.employer.localeCompare(b.employer);
        });
      case 'recent':
      default:
        // Sort by timestamp if available, otherwise keep original order
        return [...contacts].sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          } else if (a.timestamp) {
            return -1;
          } else if (b.timestamp) {
            return 1;
          }
          return 0;
        });
    }
  },
  
  displayContact(name, email, employer, url, reachedOut = false) {
    // Remove the "No contacts" message if it exists
    const noContactsMsg = this.contactsListDiv.querySelector('p');
    if (noContactsMsg && noContactsMsg.textContent.includes('No contacts')) {
      this.contactsListDiv.innerHTML = '';
    }

    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-item';
    contactDiv.setAttribute('data-contact-email', email);

    contactDiv.style.backgroundColor = "var(--background-light)";
    
    
    
    // Create reached out status HTML with appropriate styling based on status
    const reachedOutStatusHTML = `
      <span class="contact-status ${reachedOut ? 'reached-out-yes' : 'reached-out-no'}" data-email="${email}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          ${reachedOut 
            ? '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>'
            : '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>'
          }
        </svg>
        ${reachedOut ? 'Reached Out' : 'Not Contacted'}
      </span>
    `;

    contactDiv.innerHTML = `
      <strong class="contact-name">${name}</strong>
      <span class="contact-email clickable-email" data-email="${email}" style="cursor: pointer; text-decoration: none;">${email}</span>
      ${employer ? `<span class="contact-employer">Employer: ${employer}</span>` : ''}
      ${url ? `<span class="copyable-url" data-url="${url}" style="cursor: pointer; color: var(--primary); font-size: 12px; display: block; margin-top: 4px; margin-bottom: 4px; width: 100%; overflow: hidden; text-overflow: ellipsis; text-decoration: none; transition: all 0.2s ease;">${url}</span>` : ''}
      ${reachedOutStatusHTML}
      <div style="display: flex; gap: 10px; margin-top: 10px; border: none; background: transparent; box-shadow: none; padding: 0;">
        <button class="email-button" data-email="${email}" title="Email ${name}" style="flex: 1;">Email</button>
        <button class="delete-button" data-email="${email}" title="Delete ${name}" style="flex: 1;">Delete</button>
      </div>
    `;

    // Set up email button listener with mailto (original functionality)
    contactDiv.querySelector('.email-button').addEventListener('click', (e) => {
      const mailtoEmail = e.target.getAttribute('data-email');
      window.open(`mailto:${mailtoEmail}`);
    });

    // Set up clickable email listener with Gmail compose functionality
    contactDiv.querySelector('.clickable-email').addEventListener('click', (e) => {
      const email = e.target.getAttribute('data-email');
      this.openEmailCompose(email);
    });

    // Add hover effect to email text
    const emailElement = contactDiv.querySelector('.clickable-email');
    emailElement.addEventListener('mouseenter', (e) => {
      e.target.style.color = "var(--primary)";
      e.target.style.textDecoration = "underline";
    });
    
    emailElement.addEventListener('mouseleave', (e) => {
      e.target.style.color = "";
      e.target.style.textDecoration = "none";
    });

    // Set up delete button listener
    contactDiv.querySelector('.delete-button').addEventListener('click', (e) => {
      const emailToDelete = e.currentTarget.getAttribute('data-email');
      this.deleteContact(emailToDelete);
    });

    // Set up the toggle for reached out status
    const statusIndicator = contactDiv.querySelector('.contact-status');
    if (statusIndicator) {
      statusIndicator.addEventListener('click', (e) => {
        const email = e.currentTarget.getAttribute('data-email');
        this.toggleReachedOutStatus(email);
      });
    }

    // Set up URL copy functionality if URL exists
    if (url) {
      const urlElement = contactDiv.querySelector('.copyable-url');
      urlElement.addEventListener('click', (e) => {
        const urlToCopy = e.target.getAttribute('data-url');
        
        // Copy to clipboard
        navigator.clipboard.writeText(urlToCopy).then(() => {
          // Store original text and URL
          const originalText = e.target.textContent;
          
          // Simple swap with fade effect, maintaining left alignment
          e.target.style.transition = "all 0.2s ease";
          e.target.style.opacity = "0";
          
          setTimeout(() => {
            // Change text to "Copied!" with purple color to match theme
            e.target.textContent = "Copied!";
            e.target.style.color = "var(--primary)"; // Purple color from theme
            e.target.style.opacity = "1";
            
            // Revert back after 1.5 seconds
            setTimeout(() => {
              e.target.style.opacity = "0";
              
              setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.color = "";
                
                setTimeout(() => {
                  e.target.style.opacity = "1";
                }, 50);
              }, 200);
            }, 1300);
          }, 200);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
      
      // Add hover effect
      urlElement.addEventListener('mouseenter', (e) => {
        e.target.style.color = "var(--primary-dark)";
        e.target.style.textDecoration = "underline";
      });
      
      urlElement.addEventListener('mouseleave', (e) => {
        e.target.style.color = "var(--primary)";
        e.target.style.textDecoration = "none";
      });
    }

    this.contactsListDiv.appendChild(contactDiv);
  },

  // Keep the Gmail compose functionality for email text clicks
  async openEmailCompose(email) {
    try {
      // First check if Gmail is open in any tab
      const gmailTabs = await chrome.tabs.query({ url: 'https://mail.google.com/*' });
      
      if (gmailTabs.length > 0) {
        // Use the first Gmail tab found
        await chrome.tabs.update(gmailTabs[0].id, { active: true });
        
        // Send message to background script to open Gmail compose
        chrome.runtime.sendMessage({
          action: 'openGmailCompose',
          email: email
        });
      } else {
        // Fallback to mailto if Gmail is not open
        window.open(`mailto:${email}`);
      }
    } catch (error) {
      console.error('Error opening email compose:', error);
      // Fallback to mailto on error
      window.open(`mailto:${email}`);
    }
  },
  
  async saveContact(name, email, employer, url, reachedOut = false) {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    const contacts = result[this.STORAGE_KEY] || [];

    // Check if email already exists
    if (contacts.some(contact => contact.email === email)) {
      this.showToast('A contact with this email already exists.', 'error');
      return false;
    }

    // Get the reached out status from checkbox if available
    if (this.contactReachedOutInput) {
      reachedOut = this.contactReachedOutInput.checked;
    }

    // Add timestamp to track when contact was added
    const timestamp = Date.now();

    // Add new contact at the beginning of the array
    contacts.unshift({ name, email, employer, url, reachedOut, timestamp });
    await chrome.storage.local.set({ [this.STORAGE_KEY]: contacts });
    this.showToast('Contact saved successfully!');
    return true;
  },
  
  async toggleReachedOutStatus(email) {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    let contacts = result[this.STORAGE_KEY] || [];
    
    // Find the contact and toggle its reached out status
    const updatedContacts = contacts.map(contact => {
      if (contact.email === email) {
        return { ...contact, reachedOut: !contact.reachedOut };
      }
      return contact;
    });
    
    // Save the updated contacts
    await chrome.storage.local.set({ [this.STORAGE_KEY]: updatedContacts });
    
    // Refresh the contacts list to show updated status
    this.loadContacts();
  },
  
  async deleteContact(emailToDelete) {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    let contacts = result[this.STORAGE_KEY] || [];
    contacts = contacts.filter(contact => contact.email !== emailToDelete);
    
    await chrome.storage.local.set({ [this.STORAGE_KEY]: contacts });
    
    // Show the contact deleted animation instead of the toast
    this.showContactDeletedAnimation();
    
    this.loadContacts();
  },
  
  async showContactModal() {
    console.log("Opening contact modal");
    if (!this.contactModalOverlay) {
      console.error("Contact modal overlay not found in the DOM");
      return;
    }
    
    // Try to get the current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      // Pre-fill the URL field if it's a LinkedIn profile
      if (tab.url.startsWith('https://www.linkedin.com/in/')) {
        this.contactUrlInput.value = tab.url;

        // --- Try to extract Name and Employer ---
        try {
          console.log("Attempting to extract Name and Employer from LinkedIn page...");
          
          // Execute script in the LinkedIn tab to get details
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              
              let companyName = ''; // Initialize company name
              let personName = ''; // Initialize person name

              // --- Extract Person's Name ---
              try {
                  // Primary selector for name (usually H1)
                  const nameElement = document.querySelector('h1.text-heading-xlarge, h1'); // Prioritize specific class if known, fallback to generic h1
                  
                  if (nameElement && nameElement.innerText) {
                      personName = nameElement.innerText.trim();
                      console.log("DEBUG: Found person name:", personName);
                  } else {
                      console.log("DEBUG: Could not find person name element (h1).");
                  }
              } catch(nameError) {
                  console.error("DEBUG: Error finding person name:", nameError);
              }

              // --- Extract Employer Name (using previous logic) ---
              try {
                  // Steps 1-4: Find the listContainerDiv (Context for employer search)
                  let experienceHeader = null;
                  const potentialHeaderSelectors = ['h2', 'h3', 'span', 'div']; 
                  for (const selector of potentialHeaderSelectors) { 
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                      if (element.innerText && element.innerText.trim().split('\n')[0] === 'Experience') { 
                        experienceHeader = element;
                        break; 
                      }
                    }
                    if (experienceHeader) break; 
                  }
                  
                  if (experienceHeader) {
                      const experienceSection = experienceHeader.closest('section.artdeco-card, section[data-section="experience"], div[data-view-name="profile-card-layout"], #experience-section, #experience, section');
                      if (experienceSection) {
                          const headerContainerDiv = experienceHeader.closest('section > div'); 
                          if (headerContainerDiv) {
                              let listContainerDiv = headerContainerDiv.nextElementSibling;
                              while (listContainerDiv && listContainerDiv.tagName !== 'DIV') {
                                listContainerDiv = listContainerDiv.nextElementSibling;
                              }
                              
                              if (listContainerDiv) {
                                  // Step 5: Find the *first* SPAN using the BROAD XPath
                                  let companyInfoSpan = null;
                                  try {
                                      const middleDot = '\u00B7'; // Unicode escape
                                      const xpathExpression = `.//span[contains(., '${middleDot}')]`; 
                                      // console.log("DEBUG: Executing BROAD XPath for company:", xpathExpression); // Optional logging
                                      const xpathResult = document.evaluate(xpathExpression, listContainerDiv, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                                      companyInfoSpan = xpathResult.singleNodeValue; 
                                  } catch (e) {
                                      console.error("DEBUG: Error executing XPath for company:", e);
                                  }

                                  // Step 6: Process the found span
                                  if (companyInfoSpan) { 
                                      const rawText = companyInfoSpan.innerText ? companyInfoSpan.innerText.trim() : '';
                                      // console.log("DEBUG: Raw innerText for company:", rawText); // Optional logging
                                      const firstDotIndex = rawText.indexOf('\u00B7'); 
                                      if (firstDotIndex !== -1) {
                                          companyName = rawText.substring(0, firstDotIndex).trim();
                                          // console.log("DEBUG: Extracted company name:", companyName); // Optional logging
                                      } else {
                                           console.log(`DEBUG: Middle dot not found in company raw text: "${rawText}"`);
                                      }
                                  } else {
                                       console.log("DEBUG: Could not find company span using XPath.");
                                  }
                              } else { console.log("DEBUG: Could not find the list container div for company."); }
                          } else { console.log("DEBUG: Could not find header container div for company."); }
                      } else { console.log("DEBUG: Could not find parent section for company."); }
                  } else { console.log("DEBUG: Could not find 'Experience' header for company."); }
              } catch(companyError) {
                   console.error("DEBUG: Error finding company name:", companyError);
              }

              // --- Return both pieces of information ---
              return { 
                personName: personName, 
                companyName: companyName 
              };

            } // end of func
          }); // end of executeScript
        
          // --- Update Input Fields ---
          if (results && results[0] && results[0].result) {
            const extractedData = results[0].result;
            console.log("Script extracted data:", extractedData); 
            
            // Assign Person Name
            if (extractedData.personName) {
                this.contactNameInput.value = extractedData.personName;
                console.log("Populated Name field.");
            } else {
                 console.log("Could not populate Name field (name not found).");
                 this.contactNameInput.value = ''; // Clear if not found
            }

            // Assign Company Name
            if (extractedData.companyName) {
                this.contactEmployerInput.value = extractedData.companyName; 
                console.log("Populated Employer field.");
            } else {
                console.log("Could not populate Employer field (company name not found/extracted).");
                this.contactEmployerInput.value = ''; // Clear if not found
            }

          } else {
            console.log("Script execution failed or did not return a result object.");
            this.contactNameInput.value = '';    // Clear fields on failure
            this.contactEmployerInput.value = ''; 
          }
        
        } catch (scriptError) {
          // Log errors related to injecting the script or processing results
          console.error("Error executing script or processing results:", scriptError);
          this.contactNameInput.value = '';    // Clear fields on error
          this.contactEmployerInput.value = ''; 
        }
      // End: if (tab.url.startsWith('https://www.linkedin.com/in/'))
      } else { 
        // Not a LinkedIn profile URL, clear fields
        console.log("Not a LinkedIn profile URL.");
        this.contactUrlInput.value = tab.url || ''; // Show current URL or empty
        this.contactNameInput.value = '';
        this.contactEmployerInput.value = '';
      }
    // End: if (tab && tab.url)
    } else {
       console.log("Could not get active tab or URL.");
       // Clear fields if tab info is unavailable
       this.contactUrlInput.value = '';
       this.contactNameInput.value = '';
       this.contactEmployerInput.value = '';
    }

    // Show the contact modal
    this.contactModalOverlay.classList.add('show');
    
    // Set focus to the name field
    if (this.contactNameInput) {
      setTimeout(() => this.contactNameInput.focus(), 100);
    }
  },
  
  closeContactModal() {
    console.log("Closing contact modal");
    if (!this.contactModalOverlay) {
      console.error("Contact modal overlay not found in the DOM");
      return;
    }
    
    // Hide the contact modal
    this.contactModalOverlay.classList.remove('show');
    
    // Clear form fields
    if (this.contactNameInput) this.contactNameInput.value = '';
    if (this.contactEmailInput) this.contactEmailInput.value = '';
    if (this.contactEmployerInput) this.contactEmployerInput.value = '';
    if (this.contactUrlInput) this.contactUrlInput.value = '';
  },
  
  async handleAddContact() {
    const name = this.contactNameInput.value.trim();
    const email = this.contactEmailInput.value.trim();
    const employer = this.contactEmployerInput.value.trim();
    const url = this.contactUrlInput.value.trim();

    // Basic validation
    if (!name) {
      this.showToast('Please enter a name', 'error');
      this.contactNameInput.focus();
      return;
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      this.showToast('Please enter a valid email address', 'error');
      this.contactEmailInput.focus();
      return;
    }

    const saved = await this.saveContact(name, email, employer, url);
    if (saved) {
      // Close the modal
      this.closeContactModal();
      
      // Show the contact saved animation
      this.showContactSavedAnimation();

      // Reload contacts to show the newly added contact at the top (if sorted by recent)
      this.loadContacts();
    }
  },
  
  // Helper for showing contact deleted animation
  showContactDeletedAnimation() {
    const animationBar = document.getElementById('contact-deleted-animation');
    const feedbackPopup = document.getElementById('contact-deleted-feedback');
    
    // Show animation elements
    animationBar.classList.add('show');
    feedbackPopup.classList.add('show');
    
    // Hide animation elements after 2 seconds
    setTimeout(() => {
      animationBar.classList.remove('show');
      feedbackPopup.classList.remove('show');
    }, 2000);
  },

  // Helper for showing contact saved animation
  showContactSavedAnimation() {
    const animationBar = document.getElementById('contact-saved-animation');
    const feedbackPopup = document.getElementById('contact-saved-feedback');
    
    // Show animation elements
    animationBar.classList.add('show');
    feedbackPopup.classList.add('show');
    
    // Hide animation elements after 2 seconds
    setTimeout(() => {
      animationBar.classList.remove('show');
      feedbackPopup.classList.remove('show');
    }, 2000);
  },

  // Helper for showing toast messages
  showToast(message, type = 'success') {
    // Empty implementation to remove toast notifications
    return;
  },

  // Download Contacts data as CSV
  async downloadContactsData() {
    // Get contacts from storage
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    const contacts = result[this.STORAGE_KEY] || [];
    
    if (contacts.length === 0) {
      this.showToast('No contacts data to download', 'error');
      return;
    }
    
    // Define CSV headers
    const headers = ['Name', 'Email', 'Employer', 'URL', 'Reached Out'];
    
    // Create CSV content with headers
    let csvContent = headers.join(',') + '\n';
    
    // Add contact data rows
    contacts.forEach(contact => {
      // Format the values and handle commas by wrapping in quotes if needed
      const name = contact.name ? `"${contact.name.replace(/"/g, '""')}"` : '""';
      const email = contact.email ? `"${contact.email.replace(/"/g, '""')}"` : '""';
      const employer = contact.employer ? `"${contact.employer.replace(/"/g, '""')}"` : '""';
      const url = contact.url ? `"${contact.url.replace(/"/g, '""')}"` : '""';
      const reachedOut = contact.reachedOut ? 'Yes' : 'No';
      
      // Add the row to CSV content
      csvContent += `${name},${email},${employer},${url},${reachedOut}\n`;
    });
    
    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `contacts_data_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.display = 'none';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Contacts data downloaded successfully!');
  }
};