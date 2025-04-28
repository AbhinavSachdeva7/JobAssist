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
      <span class="contact-email">${email}</span>
      ${employer ? `<span class="contact-employer">Employer: ${employer}</span>` : ''}
      ${url ? `<span class="copyable-url" data-url="${url}" style="cursor: pointer; color: var(--primary); font-size: 12px; display: block; margin-top: 4px; margin-bottom: 4px; width: 100%; overflow: hidden; text-overflow: ellipsis; text-decoration: none; transition: all 0.2s ease;">${url}</span>` : ''}
      <div style="display: flex; gap: 10px; margin-top: 10px; border: none; background: transparent; box-shadow: none; padding: 0;">
        <button class="email-button" data-email="${email}" title="Email ${name}" style="flex: 1;">Email</button>
        <button class="delete-button" data-email="${email}" title="Delete ${name}" style="flex: 1;">Delete</button>
      </div>
    `;

    // Set up email button listener
    contactDiv.querySelector('.email-button').addEventListener('click', (e) => {
      const mailtoEmail = e.target.getAttribute('data-email');
      window.open(`mailto:${mailtoEmail}`);
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
          try {
            console.log("Attempting to find company name span and process text...");
            // Execute script in the LinkedIn tab
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                
                // --- Steps 1-4: Find the listContainerDiv (Kept as context is needed) ---
                let experienceHeader = null;
                const potentialHeaderSelectors = ['h2', 'h3', 'span', 'div']; 
                for (const selector of potentialHeaderSelectors) { /* ... find header ... */ 
                  const elements = document.querySelectorAll(selector);
                  for (const element of elements) {
                    if (element.innerText && element.innerText.trim().split('\n')[0] === 'Experience') { 
                      experienceHeader = element;
                      break; 
                    }
                  }
                  if (experienceHeader) break; 
                }
                if (!experienceHeader) { console.log("DEBUG: Could not find 'Experience' header."); return ''; } // Return empty string
                
                const experienceSection = experienceHeader.closest(/* ... section selectors ... */
                  'section.artdeco-card, section[data-section="experience"], div[data-view-name="profile-card-layout"], #experience-section, #experience, section'
                );
                if (!experienceSection) { console.log("DEBUG: Could not find parent section."); return ''; }
                
                const headerContainerDiv = experienceHeader.closest('section > div'); 
                if (!headerContainerDiv) { console.log("DEBUG: Could not find header container div."); return ''; }
                
                let listContainerDiv = headerContainerDiv.nextElementSibling;
                while (listContainerDiv && listContainerDiv.tagName !== 'DIV') {
                  listContainerDiv = listContainerDiv.nextElementSibling;
                }
                if (!listContainerDiv) { console.log("DEBUG: Could not find the list container div."); return ''; }
                console.log("DEBUG: Found list container div:", listContainerDiv);
          
                // --- Step 5: Find the *first* SPAN using the BROAD XPath ---
                let companyInfoSpan = null;
                try {
                    const middleDot = '\u00B7'; // Unicode escape
                    // Using the BROAD XPath relative to listContainerDiv
                    const xpathExpression = `.//span[contains(., '${middleDot}')]`; 
                    console.log("DEBUG: Executing BROAD XPath:", xpathExpression);
          
                    const xpathResult = document.evaluate(
                        xpathExpression,
                        listContainerDiv,           // Context Node
                        null,                       // Namespace Resolver
                        XPathResult.FIRST_ORDERED_NODE_TYPE, 
                        null                        
                    );
                    companyInfoSpan = xpathResult.singleNodeValue; 
                } catch (e) {
                    console.error("DEBUG: Error executing XPath:", e);
                    return ''; // Return empty string on error
                }
                
                // --- Step 6: Process the found span using indexOf and substring ---
                if (companyInfoSpan) { 
                    console.log("DEBUG: Found target span element (broad XPath):", companyInfoSpan);
                    // Ensure innerText exists before trimming
                    const rawText = companyInfoSpan.innerText ? companyInfoSpan.innerText.trim() : '';
                    console.log("DEBUG: Raw innerText:", rawText);

                    const middleDot = '\u00B7';
                    // Find the index of the FIRST middle dot (use literal or escape)
                    const firstDotIndex = rawText.indexOf(`${middleDot}`); // Using the literal
                    // Or safer: const firstDotIndex = rawText.indexOf('\u00B7');
          
                    let companyName = ''; // Default to empty
          
                    if (firstDotIndex !== -1) {
                        // If a dot is found, take the substring from the start up to the dot
                        companyName = rawText.substring(0, firstDotIndex).trim();
                        console.log("DEBUG: Extracted company name (using indexOf/substring):", companyName);
                    } else {
                        // If no middle dot is found in the text, we might have the wrong span entirely.
                        // Decide whether to return the raw text or nothing. Returning nothing is safer.
                        console.log(`DEBUG: Middle dot ('·') not found in raw text: "${rawText}". Cannot extract company name reliably.`);
                        companyName = ''; // Keep it empty
                    }
          
                    return companyName; // Return the extracted name or empty string
          
                } else {
                    console.log("DEBUG: Could not find any span containing '\\u00B7' using broad XPath.");
                    return ''; // Return empty string if not found
                }
              } // end of func
            }); // end of executeScript
          
            // --- Update Input Field ---
            // Check if the script returned a non-null result (empty string is valid)
            if (results && results[0] && results[0].result !== null) {
              const extractedCompanyName = results[0].result;
              // Log the result, even if it's an empty string
              console.log("Script executed, extracted company name:", extractedCompanyName); 
              // Assign the potentially empty string to the input field
              this.contactEmployerInput.value = extractedCompanyName; 
            } else {
              console.log("Script execution failed or did not return a result (returned null).");
              this.contactEmployerInput.value = ''; // Clear the field
            }
          
          } catch (err) {
            // Log errors related to injecting the script itself
            console.error("Error injecting script or processing results:", err);
            this.contactEmployerInput.value = ''; // Clear the field on error
          }
        } else {
          this.contactUrlInput.value = '';
        }
      }
    } catch (error) {
      console.error("Error getting current tab:", error);
      this.contactUrlInput.value = '';
    }

    this.addContactFormDiv.style.display = 'block';
    this.showAddContactFormButton.style.display = 'none';
    
    // Set focus to the name field
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