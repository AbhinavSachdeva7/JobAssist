// Contact Manager Module
const ContactManager = {
  STORAGE_KEY: 'jobAppHelperContacts',
  
  init() {
    // Cache DOM elements
    this.showAddContactFormButton = document.getElementById('show-add-contact-form');
    this.addContactFormDiv = document.getElementById('add-contact-form');
    this.saveContactButton = document.getElementById('save-contact-button');
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
    
    // Set up event listeners
    this.showAddContactFormButton.addEventListener('click', this.showAddContactForm);
    this.saveContactButton.addEventListener('click', this.handleAddContact);
    this.deleteAllContactsButton.addEventListener('click', this.handleDeleteAll);
    
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
    this.showToast('Contact deleted');
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
    }
  },
  
  async handleDeleteAll() {
    if (confirm('Are you sure you want to delete ALL contacts? This cannot be undone.')) {
      await chrome.storage.local.remove(this.STORAGE_KEY);
      this.showToast('All contacts deleted');
      this.loadContacts();
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