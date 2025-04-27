document.addEventListener('DOMContentLoaded', function() {
  // --- Tab Switching Logic ---
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

  // --- Quick Links Logic ---
  const quickLinksSection = document.getElementById('quick-links');
  const editLinksButton = document.getElementById('edit-links-button');
  const saveLinksButton = document.getElementById('save-links-button');
  const cancelEditLinksButton = document.getElementById('cancel-edit-links-button');
  const linksDisplayDiv = quickLinksSection.querySelector('.links-display');
  const linksEditDiv = quickLinksSection.querySelector('.links-edit');

  // Get references to the new link item containers
  const linkItems = linksDisplayDiv.querySelectorAll('.link-item');

  const linkedinEditInput = document.getElementById('linkedin-edit');
  const websiteEditInput = document.getElementById('website-edit');
  const githubEditInput = document.getElementById('github-edit');

  const QUICK_LINKS_STORAGE_KEY = 'jobAppHelperQuickLinks';
  let currentLinks = {}; // To store loaded links

  // Default links (if nothing is stored)
  const defaultLinks = {
    linkedin: 'https://www.linkedin.com/in/mab-malik/',
    website: 'https://abdullahmalik.me/',
    github: 'https://github.com/Abdullah-Malik'
  };

  // --- Load Links --- 
  async function loadQuickLinks() {
    const result = await chrome.storage.local.get(QUICK_LINKS_STORAGE_KEY);
    currentLinks = result[QUICK_LINKS_STORAGE_KEY] || { ...defaultLinks }; // Use defaults if empty
    updateLinkItems(); // Call the updated function
  }

  // --- Update Display Items (Replaces updateLinkButtons) --- 
  function updateLinkItems() {
    linkItems.forEach(item => {
      const key = item.dataset.linkKey;
      const urlSpan = item.querySelector('.link-url');
      if (urlSpan) {
        urlSpan.textContent = currentLinks[key] || '(Not Set)';
      }
      // Ensure logo and title are always visible
      const logo = item.querySelector('.link-logo');
      const title = item.querySelector('.link-title');
      if (logo) logo.style.display = '';
      if (title) title.style.display = '';
    });
  }

  // --- Copy Logic (Adjusted for link items) --- 
  function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
      // Add copied-feedback class for animation
      element.classList.add('copied-feedback');
      
      // Apply scale animation
      element.style.animation = 'copiedAnimation 0.5s';
      
      // Change background to provide visual feedback
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = 'var(--background)';
      
      // Remove animation and class after animations complete
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
        element.style.animation = '';
        
        // Remove the class after the animation completes
        setTimeout(() => {
          element.classList.remove('copied-feedback');
        }, 1200); // Match fadeInOut animation duration
      }, 750);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      const originalBorder = element.style.borderColor; 
      element.style.border = '1px solid var(--danger)';
       setTimeout(() => {
        element.style.border = originalBorder || 'none'; // Revert border
      }, 1500);
    });
  }

  // --- Add Event Listeners to Link Items --- 
  linkItems.forEach(item => {
    item.addEventListener('click', (event) => {
      const key = item.dataset.linkKey;
      const urlToCopy = currentLinks[key];
      if (urlToCopy) {
        copyToClipboard(urlToCopy, item); // Pass the item element for feedback
      } else {
        alert(`${item.querySelector('.link-title').textContent} link is not set. Click Edit to add it.`);
      }
    });
  });

  // --- Edit Mode Logic --- 
  function enterEditMode() {
    // Populate inputs with current values
    linkedinEditInput.value = currentLinks.linkedin || '';
    websiteEditInput.value = currentLinks.website || '';
    githubEditInput.value = currentLinks.github || '';

    // Toggle visibility using body class
    document.body.classList.add('editing-links');
  }

  function exitEditMode() {
    console.log("Exiting edit mode, removing 'editing-links' class."); // Add log
    document.body.classList.remove('editing-links');
  }

  editLinksButton.addEventListener('click', enterEditMode);

  cancelEditLinksButton.addEventListener('click', exitEditMode);

  // --- Save Links Logic --- 
  saveLinksButton.addEventListener('click', async () => {
    const newLinks = {
      linkedin: linkedinEditInput.value.trim(),
      website: websiteEditInput.value.trim(),
      github: githubEditInput.value.trim()
    };

    try {
      await chrome.storage.local.set({ [QUICK_LINKS_STORAGE_KEY]: newLinks });
      currentLinks = newLinks;
      updateLinkItems(); // Call the updated function
      exitEditMode();

    } catch (error) {
        console.error("Error saving links:", error);
        alert("Failed to save links. See console for details.");
    }
  });

  // --- Contacts Logic ---
  const showAddContactFormButton = document.getElementById('show-add-contact-form');
  const addContactFormDiv = document.getElementById('add-contact-form');
  const saveContactButton = document.getElementById('save-contact-button'); // Renamed from addContactButton
  const contactNameInput = document.getElementById('contact-name');
  const contactEmailInput = document.getElementById('contact-email');
  // Add references for the other input fields
  const contactEmployerInput = document.getElementById('contact-employer');
  const contactUrlInput = document.getElementById('contact-url');
  const contactsListDiv = document.getElementById('contacts-list');
  const CONTACTS_STORAGE_KEY = 'jobAppHelperContacts';

  // --- Show/Hide Add Contact Form Logic ---
  showAddContactFormButton.addEventListener('click', async () => { // Make the listener async
    // Get the current active tab
    try { // Add error handling for the async operation
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        // Check if the URL looks like a LinkedIn profile URL
        if (tab.url.startsWith('https://www.linkedin.com/in/')) {
          contactUrlInput.value = tab.url; // Pre-fill the URL field
        } else {
          contactUrlInput.value = ''; // Clear if not a LinkedIn URL
        }
      } else {
        contactUrlInput.value = ''; // Clear if no tab or URL found
      }
    } catch (error) {
        console.error("Error getting current tab:", error);
        contactUrlInput.value = ''; // Clear on error
    }

    addContactFormDiv.style.display = 'block'; // Show the form
    showAddContactFormButton.style.display = 'none'; // Hide the 'Add New Contact' button
  });

  // Load contacts from storage
  async function loadContacts() {
    const result = await chrome.storage.local.get(CONTACTS_STORAGE_KEY);
    const savedContacts = result[CONTACTS_STORAGE_KEY] || []; // Default to empty array if not found
    contactsListDiv.innerHTML = ''; // Clear existing list
    if (savedContacts.length === 0) {
        contactsListDiv.innerHTML = '<p style=\"color: var(--medium-grey); font-style: italic;\">No contacts saved yet.</p>';
    }
    savedContacts.forEach(contact => {
      // Pass employer and url to displayContact
      displayContact(contact.name, contact.email, contact.employer, contact.url);
    });
  }

  // Display a single contact in the list
  function displayContact(name, email, employer, url) {
     // Remove the "No contacts" message if it exists
     const noContactsMsg = contactsListDiv.querySelector('p');
     if (noContactsMsg && noContactsMsg.textContent.includes('No contacts')) {
         contactsListDiv.innerHTML = '';
     }

     const contactDiv = document.createElement('div');
     contactDiv.setAttribute('data-contact-email', email);
     // Update innerHTML to match our new design
     contactDiv.innerHTML = `
        <span class="contact-info">
            <strong>${name}</strong>
            <span>${email}</span>
            ${employer ? `<span class="contact-employer">Employer: ${employer}</span>` : ''}
            ${url ? `<a href="${url}" target="_blank" class="contact-url">View Profile</a>` : ''}
        </span>
        <div class="contact-actions">
            <button class="email-button" data-email="${email}" title="Email ${name}">Email</button>
            <button class="delete-button" data-email="${email}" title="Delete ${name}">Delete</button>
        </div>
     `;

     // Email button listener
     contactDiv.querySelector('.email-button').addEventListener('click', (e) => {
        const mailtoEmail = e.target.getAttribute('data-email');
        window.open(`mailto:${mailtoEmail}`);
     });

     // Delete button listener
     contactDiv.querySelector('.delete-button').addEventListener('click', (e) => {
        const emailToDelete = e.target.getAttribute('data-email');
        deleteContact(emailToDelete);
     });

     contactsListDiv.appendChild(contactDiv);
  }

  // Save contact to storage
  async function saveContact(name, email, employer, url) { // Add employer and url parameters
    const result = await chrome.storage.local.get(CONTACTS_STORAGE_KEY);
    const contacts = result[CONTACTS_STORAGE_KEY] || [];

    // Check if email already exists
    if (contacts.some(contact => contact.email === email)) {
        alert('A contact with this email already exists.');
        return false; // Indicate failure
    }

    contacts.push({ name, email, employer, url }); // Add employer and url to the saved object
    await chrome.storage.local.set({ [CONTACTS_STORAGE_KEY]: contacts });
    return true; // Indicate success
  }

  // Delete contact from storage
  async function deleteContact(emailToDelete) {
    const result = await chrome.storage.local.get(CONTACTS_STORAGE_KEY);
    let contacts = result[CONTACTS_STORAGE_KEY] || [];
    contacts = contacts.filter(contact => contact.email !== emailToDelete);
    await chrome.storage.local.set({ [CONTACTS_STORAGE_KEY]: contacts });
    loadContacts(); // Reload the list in the UI
  }

  // Add listener for the Delete All button
  const deleteAllContactsButton = document.getElementById('delete-all-contacts');
  if (deleteAllContactsButton) { // Check if the button exists
      deleteAllContactsButton.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete ALL contacts? This cannot be undone.')) {
              await chrome.storage.local.remove(CONTACTS_STORAGE_KEY); // Remove the key entirely
              loadContacts(); // Reload the (now empty) list
          }
      });
  }

   // Function to handle adding a contact (extracted for reuse)
   async function handleAddContact() {
        const name = contactNameInput.value.trim();
        const email = contactEmailInput.value.trim();
        const employer = contactEmployerInput.value.trim(); // Use the reference
        const url = contactUrlInput.value.trim(); // Use the reference

        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
            alert('Please enter a valid email address.');
            return;
        }

        if (name && email) {
            const saved = await saveContact(name, email, employer, url);
            if (saved) {
                displayContact(name, email, employer, url);
                contactNameInput.value = '';
                contactEmailInput.value = '';
                contactEmployerInput.value = ''; // Clear using reference
                contactUrlInput.value = ''; // Clear using reference

                // Hide the form and show the button again after saving
                addContactFormDiv.style.display = 'none';
                showAddContactFormButton.style.display = 'block';
            }
        } else {
            alert('Please enter both name and email.');
        }
   }

   // Add contact button listener (now the Save button)
   saveContactButton.addEventListener('click', handleAddContact);

   // Add keydown listener to input fields for Enter key
   const contactInputs = [contactNameInput, contactEmailInput, contactEmployerInput, contactUrlInput];
   contactInputs.forEach(input => {
       input.addEventListener('keydown', (event) => {
           if (event.key === 'Enter') {
               event.preventDefault(); // Prevent potential default form submission
               handleAddContact(); // Call the shared add contact function
           }
       });
   });

   // --- Initial Load ---
   loadQuickLinks();
   loadContacts();
});
