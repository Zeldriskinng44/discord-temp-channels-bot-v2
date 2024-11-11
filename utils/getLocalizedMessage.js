/**
 * @param {object} locale - The locale object.
 * @param {string} key - The key path to the message (e.g., 'addUser.addedSuccessfully').
 * @param {object} replacements - An object of placeholders and their replacements (e.g., { user: 'John' }).
 * @returns {string} - The formatted message.
 */
const getLocalizedMessage = (locale, key, replacements = {}) => {
    const keys = key.split('.');
    let message = locale;
  
    for (const k of keys) {
      if (message[k]) {
        message = message[k];
      } else {
        console.warn(`Missing localization key: ${key}`);
        return '❓ Unknown message key.';
      }
    }
  
    for (const [placeholder, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      message = message.replace(regex, value);
    }
  
    return message;
  };
  
  module.exports = getLocalizedMessage;
  