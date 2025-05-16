/**
 * Displays an input error message and adds error styling to the input element.
 * @param {HTMLElement} inputElement - The input element to show the error for.
 * @param {string} message - The error message to display.
 */
export function showInputError(inputElement, message) {
  // Add error class to the input
  inputElement.classList.add('input-error');

  // Create or update error message
  let errorMessage = inputElement.parentNode.querySelector('.error-message');

  if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      inputElement.parentNode.appendChild(errorMessage);
  }

  errorMessage.textContent = message;
  errorMessage.style.color = '#e74c3c';
  errorMessage.style.fontSize = '12px';
  errorMessage.style.marginTop = '4px';

  // Add input event listener to clear error when user types
  inputElement.addEventListener(
      'input',
      function clearError() {
          inputElement.classList.remove('input-error');
          if (errorMessage) {
              errorMessage.remove();
          }
          // Remove this listener after it executes once
          inputElement.removeEventListener('input', clearError);
      },
      { once: true }
  );
}