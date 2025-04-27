document.addEventListener('DOMContentLoaded', function() {
  // --- Existing Quick Links Logic ---
    const links = {
      linkedin: 'https://www.linkedin.com/in/mab-malik/', // Replace with your actual LinkedIn URL
      website: 'https://abdullahmalik.me/',   // Replace with your actual Website URL
      github: 'https://github.com/Abdullah-Malik'      // Replace with your actual GitHub URL
    };
  
    function copyToClipboard(text, element) {
      navigator.clipboard.writeText(text).then(() => {
        // Optional: Briefly show a confirmation message
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        setTimeout(() => {
          element.textContent = originalText;
        }, 750);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Optionally show an error message to the user
        element.textContent = 'Error copying';
         setTimeout(() => {
          element.textContent = originalText; // Revert text even on error
        }, 1500);
      });
    }
  
    document.getElementById('linkedin').addEventListener('click', (event) => {
      copyToClipboard(links.linkedin, event.target);
    });
  
    document.getElementById('website').addEventListener('click', (event) => {
      copyToClipboard(links.website, event.target);
    });
  
    document.getElementById('github').addEventListener('click', (event) => {
      copyToClipboard(links.github, event.target);
    });
  
    // --- Contacts Logic ---
    const addContactButton = document.getElementById('add-contact');
    const contactNameInput = document.getElementById('contact-name');
    const contactEmailInput = document.getElementById('contact-email');
    const contactsListDiv = document.getElementById('contacts-list');
    const CONTACTS_STORAGE_KEY = 'jobAppHelperContacts';

    // Load contacts from storage
    async function loadContacts() {
      const result = await chrome.storage.local.get(CONTACTS_STORAGE_KEY);
      const savedContacts = result[CONTACTS_STORAGE_KEY] || []; // Default to empty array if not found
      contactsListDiv.innerHTML = ''; // Clear existing list
      if (savedContacts.length === 0) {
          contactsListDiv.innerHTML = '<p style="color: var(--medium-grey); font-style: italic;">No contacts saved yet.</p>';
      }
      savedContacts.forEach(contact => {
        displayContact(contact.name, contact.email);
      });
    }

    // Display a single contact in the list
    function displayContact(name, email) {
       // Remove the "No contacts" message if it exists
       const noContactsMsg = contactsListDiv.querySelector('p');
       if (noContactsMsg && noContactsMsg.textContent.includes('No contacts')) {
           contactsListDiv.innerHTML = '';
       }

       const contactDiv = document.createElement('div');
       // Use email as a unique identifier for deletion
       contactDiv.setAttribute('data-contact-email', email);
       contactDiv.innerHTML = `
          <span class="contact-info"><strong>${name}</strong><br><span style="font-size: 0.9em; color: var(--medium-grey);">${email}</span></span>
          <div>
            <button class="email-button" data-email="${email}" title="Email ${name}">Email</button>
            <button class="delete-button" data-email="${email}" title="Delete ${name}">✕</button> 
          </div>
       `;

       // Email button listener
       contactDiv.querySelector('.email-button').addEventListener('click', (e) => {
          const mailtoEmail = e.target.getAttribute('data-email');
          window.open(`mailto:${mailtoEmail}`);
          // console.log(`Emailing ${name} at ${email}`);
       });

       // Delete button listener
       contactDiv.querySelector('.delete-button').addEventListener('click', async (e) => {
          const emailToDelete = e.target.getAttribute('data-email');
          if (confirm(`Are you sure you want to delete the contact for ${emailToDelete}?`)) {
              await deleteContact(emailToDelete);
          }
       });

       contactsListDiv.appendChild(contactDiv);
    }

    // Save contact to storage
    async function saveContact(name, email) {
      const result = await chrome.storage.local.get(CONTACTS_STORAGE_KEY);
      const contacts = result[CONTACTS_STORAGE_KEY] || [];

      // Check if email already exists
      if (contacts.some(contact => contact.email === email)) {
          alert('A contact with this email already exists.');
          return false; // Indicate failure
      }

      contacts.push({ name, email });
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

     // Add contact button listener
     addContactButton.addEventListener('click', async () => {
          const name = contactNameInput.value.trim();
          const email = contactEmailInput.value.trim();

          // Basic email validation
          if (!email.includes('@') || !email.includes('.')) {
              alert('Please enter a valid email address.');
              return;
          }

          if (name && email) {
              const saved = await saveContact(name, email);
              if (saved) {
                  displayContact(name, email); // Display immediately
                  // Clear inputs
                  contactNameInput.value = '';
                  contactEmailInput.value = '';
              }
          } else {
              alert('Please enter both name and email.');
          }
     });

     // Initial load of contacts when the popup opens
     loadContacts();
});
