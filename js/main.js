import { ContactManager } from './contact-manager.js';
import { QuickLinks } from './quick-links.js';
import { TabManager } from './tab-manager.js';

// Main entry point for the extension
document.addEventListener('DOMContentLoaded', function() {
  // Initialize modules
  TabManager.init();
  QuickLinks.init();
  ContactManager.init();
});