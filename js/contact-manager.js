// Contact Manager Module
const ContactManager = {
  STORAGE_KEY: 'jobAppHelperContacts',
  
  init() {
    // Cache DOM elements
    this.showAddContactFormButton = document.getElementById('show-add-contact-form');
    this.addContactFormDiv = document.getElementById('add-contact-form');
    this.saveContactButton = document.getElementById('save-contact-button');
    this.cancelContactButton = document.getElementById('cancel-contact-button');
    this.contactNameInput = document.getElementById('contact-name');
    this.contactEmailInput = document.getElementById('contact-email');
    this.contactEmployerInput = document.getElementById('contact-employer');
    this.contactUrlInput = document.getElementById('contact-url');
    this.contactsListDiv = document.getElementById('contacts-list');
    this.deleteAllContactsButton = document.getElementById('delete-all-contacts');
    
    // Bind methods to preserve context
    this.handleAddContact = this.handleAddContact.bind(this);
    this.showAddContactForm = this.showAddContactForm.bind(this);
    this.handleDeleteAll = this.handleDeleteAll.bind(this);
    this.handleCancelContact = this.handleCancelContact.bind(this);
    
    // Set up event listeners
    this.showAddContactFormButton.addEventListener('click', this.showAddContactForm);
    this.saveContactButton.addEventListener('click', this.handleAddContact);
    this.deleteAllContactsButton.addEventListener('click', this.handleDeleteAll);
    this.cancelContactButton.addEventListener('click', this.handleCancelContact);
    
    // Add keydown listeners for Enter key in inputs
    const contactInputs = [
      this.contactNameInput,
      this.contactEmailInput, 
      this.contactEmployerInput, 
      this.contactUrlInput
    ];
    
    contactInputs.forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.handleAddContact();
        }
      });
    });
    
    // Load stored contacts
    this.loadContacts();
  },
  
  async loadContacts() {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    const savedContacts = result[this.STORAGE_KEY] || [];
    this.contactsListDiv.innerHTML = '';
    
    if (savedContacts.length === 0) {
      this.contactsListDiv.innerHTML = '<p>No contacts saved yet.</p>';
      return;
    }
    
    savedContacts.forEach(contact => {
      this.displayContact(contact.name, contact.email, contact.employer, contact.url);
    });
  },
  
  displayContact(name, email, employer, url) {
    // Remove the "No contacts" message if it exists
    const noContactsMsg = this.contactsListDiv.querySelector('p');
    if (noContactsMsg && noContactsMsg.textContent.includes('No contacts')) {
      this.contactsListDiv.innerHTML = '';
    }

    const contactDiv = document.createElement('div');
    contactDiv.setAttribute('data-contact-email', email);
    
    // Add inline styles to ensure no border or shadow appears, with a light background color
    contactDiv.style.padding = '16px';
    contactDiv.style.marginBottom = '12px';
    contactDiv.style.borderRadius = '10px';
    contactDiv.style.backgroundColor = '#f9f5ff'; // Light purple background for better visibility
    contactDiv.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.05)';
    contactDiv.style.border = 'none';
    
    contactDiv.innerHTML = `
      <strong class="contact-name">${name}</strong>
      <span class="contact-email clickable-email" data-email="${email}" style="cursor: pointer; text-decoration: none;">${email}</span>
      ${employer ? `<span class="contact-employer">Employer: ${employer}</span>` : ''}
      ${url ? `<span class="copyable-url" data-url="${url}" style="cursor: pointer; color: var(--primary); font-size: 12px; display: block; margin-top: 4px; margin-bottom: 4px; width: 100%; overflow: hidden; text-overflow: ellipsis; text-decoration: none; transition: all 0.2s ease;">${url}</span>` : ''}
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
      const emailToDelete = e.target.getAttribute('data-email');
      this.deleteContact(emailToDelete);
    });

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
  
  async saveContact(name, email, employer, url) {
    const result = await chrome.storage.local.get(this.STORAGE_KEY);
    const contacts = result[this.STORAGE_KEY] || [];

    // Check if email already exists
    if (contacts.some(contact => contact.email === email)) {
      this.showToast('A contact with this email already exists.', 'error');
      return false;
    }

    contacts.push({ name, email, employer, url });
    await chrome.storage.local.set({ [this.STORAGE_KEY]: contacts });
    this.showToast('Contact saved successfully!');
    return true;
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
  
  async showAddContactForm() {
    try {
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
                    // Add more fallbacks if needed:
                    // const nameElement = document.querySelector('h1.text-heading-xlarge') || document.querySelector('h1') || document.querySelector('.pv-text-details__left-panel h1') || document.querySelector('.top-card-layout__title');
                    
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
              
              // Assign Person Name (assuming 'this.contactNameInput' is correct)
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
    } catch (error) {
      console.error("Error in showAddContactForm:", error);
      // Clear fields on outer error
      this.contactUrlInput.value = '';
      this.contactNameInput.value = '';
      this.contactEmployerInput.value = '';
    }

    // Show the form and hide the button (existing logic)
    this.addContactFormDiv.style.display = 'block';
    this.showAddContactFormButton.style.display = 'none';
    
    // Set focus to the name field (existing logic)
    this.contactNameInput.focus();
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
      this.displayContact(name, email, employer, url);
      
      // Clear form fields
      this.contactNameInput.value = '';
      this.contactEmailInput.value = '';
      this.contactEmployerInput.value = '';
      this.contactUrlInput.value = '';

      // Hide form and show add button
      this.addContactFormDiv.style.display = 'none';
      this.showAddContactFormButton.style.display = 'block';
      
      // Show the contact saved animation
      this.showContactSavedAnimation();
    }
  },
  
  async handleDeleteAll() {
    if (confirm('Are you sure you want to delete ALL contacts? This cannot be undone.')) {
      await chrome.storage.local.remove(this.STORAGE_KEY);
      
      // Show the contact deleted animation instead of the toast
      this.showContactDeletedAnimation();
      
      this.loadContacts();
    }
  },
  
  handleCancelContact() {
    // Clear form fields
    this.contactNameInput.value = '';
    this.contactEmailInput.value = '';
    this.contactEmployerInput.value = '';
    this.contactUrlInput.value = '';

    // Hide form and show add button
    this.addContactFormDiv.style.display = 'none';
    this.showAddContactFormButton.style.display = 'block';
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

  // Helper for showing toast messages - disabled as requested
  showToast(message, type = 'success') {
    // Empty implementation to remove toast notifications
    return;
  }
};