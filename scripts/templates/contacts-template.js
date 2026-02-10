/**
 * Generiert das HTML-Template für ein Contact-Listen-Element
 * @param {Object} contact - Das Contact-Objekt mit allen Eigenschaften
 * @returns {string} Das HTML-Template für das Contact-Element
 */
function getContactItemTemplate(contact) {
  return `
    <div class="contact-item" onclick="showContactDetails(${contact.id})" data-id="${contact.id}">
      <div class="contact-avatar" style="background-color: ${contact.color};">
        ${contact.initials}
      </div>
      <div class="contact-info-list">
        <span class="contact-name-list">${contact.name}</span>
        <span class="contact-email-list">${contact.email}</span>
      </div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für die Contact-Detailansicht
 * @param {Object} contact - Das Contact-Objekt mit allen Eigenschaften
 * @returns {string} Das HTML-Template für die Contact-Details
 */
function getContactDetailsTemplate(contact) {
  return `
        <div class="details-header-mobile">
            <div>
                <h1>Contacts</h1>
                <p>Better with a team</p>
                <div class="blue-line-horizontal"></div>
            </div>
            <img src="./assets/login-screen/arrow-left.svg" class="back-arrow-mobile" onclick="closeContactDetails()">
        </div>

        <div class="contact-view-title">
            <div class="initials-large" style="background-color: ${contact.color}">
                ${contact.initials}
            </div>
            <div class="contact-name-large">${contact.name}</div>
        </div>

        <div class="info-headline-container">
            <span>Contact Information</span>
        </div>

        <div class="info-label">Email</div>
        <a href="mailto:${contact.email}" class="info-value-email">${contact.email}</a>

        <div class="info-label">Phone</div>
        <div class="info-value">${contact.phone}</div>

        <div class="mobile-menu-btn">
            <img src="./assets/icons/more_vert.svg">
        </div>
    `;
}

/**
 * Generiert das HTML-Template für den Add-Contact-Dialog
 * @returns {string} Das HTML-Template für den Add-Contact-Dialog
 */
function getAddContactDialogTemplate() {
  return `
    <div class="slide-in-dialog" onclick="event.stopPropagation()">
      <div class="dialog-left">
        <img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" style="width: 55px; margin-bottom: 24px;">
        <h1 style="font-size: 61px; font-weight: 700; margin: 0;">Add contact</h1>
        <p style="font-size: 27px; margin-top: 16px;">Tasks are better with a team!</p>
        <div style="width: 90px; height: 3px; background-color: #29ABE2; margin-top: 16px;"></div>
      </div>
      <div class="dialog-right">
        <div class="close-btn-container">
          <button onclick="closeAddContactDialog()" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 10.6L17.4 5.2C17.8 4.8 18.4 4.8 18.8 5.2C19.2 5.6 19.2 6.2 18.8 6.6L13.4 12L18.8 17.4C19.2 17.8 19.2 18.4 18.8 18.8C18.4 19.2 17.8 19.2 17.4 18.8L12 13.4L6.6 18.8C6.2 19.2 5.6 19.2 5.2 18.8C4.8 18.4 4.8 17.8 5.2 17.4L10.6 12L5.2 6.6C4.8 6.2 4.8 5.6 5.2 5.2C5.6 4.8 6.2 4.8 6.6 5.2L12 10.6Z" fill="#2A3647"/>
            </svg>
          </button>
        </div>
        <div class="contact-form-avatar">
          <img src="./assets/login-screen/person.svg" alt="" style="width: 64px; height: 64px; filter: invert(0.8);">
        </div>
        <form onsubmit="createContact(event)">
          <div class="input-group">
            <input type="text" placeholder="Name" required id="new-contact-name">
            <img src="./assets/login-screen/person.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="email" placeholder="Email" required id="new-contact-email">
            <img src="./assets/login-screen/mail.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="tel" placeholder="Phone" required id="new-contact-phone">
            <svg class="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.402C21.1468 21.5902 20.9046 21.7336 20.6407 21.8228C20.3769 21.912 20.0974 21.9452 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.82C8.77382 17.2255 6.72533 15.177 5.13 12.76C3.4158 10.163 2.36433 7.20723 2.03 4.13C2.00481 3.85263 2.03798 3.57312 2.12718 3.30927C2.21638 3.04542 2.35985 2.80321 2.5481 2.59797C2.73636 2.39273 2.96548 2.22914 3.22066 2.11757C3.47585 2.006 3.75145 1.94896 4.03 1.95H7.03C7.50291 1.94723 7.96131 2.11475 8.32431 2.42278C8.68731 2.73081 8.93175 3.15962 9.01 3.63C9.15654 4.74052 9.42852 5.82903 9.82 6.88C9.92723 7.1654 9.95078 7.47293 9.8885 7.77443C9.82622 8.07593 9.68007 8.35626 9.463 8.59L7.69 10.36C9.68097 13.8569 12.5931 16.769 16.09 18.76L17.86 16.99C18.0937 16.7729 18.3741 16.6268 18.6756 16.5645C18.9771 16.5022 19.2846 16.5258 19.57 16.633C20.621 17.0245 21.7095 17.2965 22.82 17.443C23.2952 17.5218 23.7276 17.7696 24.0366 18.1368C24.3456 18.5039 24.5103 18.9657 24.5 19.44" stroke="#D1D1D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="form-actions-dialog">
            <button type="button" class="btn-cancel" onclick="closeAddContactDialog()">Cancel ✕</button>
            <button type="submit" class="btn-create-submit">Create contact ✓</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für den Edit-Contact-Dialog
 * @param {Object} contact - Das Contact-Objekt mit allen Eigenschaften
 * @returns {string} Das HTML-Template für den Edit-Contact-Dialog
 */
function getEditContactDialogTemplate(contact) {
  return `
    <div class="slide-in-dialog active" onclick="event.stopPropagation()">
      <div class="dialog-left">
        <img src="./assets/main-page/join-logo-white.svg" alt="Join Logo" style="width: 55px; margin-bottom: 24px;">
        <h1 style="font-size: 61px; font-weight: 700; margin: 0;">Edit contact</h1>
        <div style="width: 90px; height: 3px; background-color: #29ABE2; margin-top: 16px;"></div>
      </div>
      <div class="dialog-right">
        <div class="close-btn-container">
          <button onclick="closeAddContactDialog()" class="btn-close">✕</button>
        </div>
        <div class="contact-form-avatar" style="background-color: ${contact.color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          ${contact.initials}
        </div>
        <form onsubmit="saveContact(event, ${contact.id})">
          <div class="input-group">
            <input type="text" value="${contact.name}" required id="edit-contact-name">
            <img src="./assets/login-screen/person.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="email" value="${contact.email}" required id="edit-contact-email">
            <img src="./assets/login-screen/mail.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="tel" value="${contact.phone}" required id="edit-contact-phone">
            <svg class="input-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.402C21.1468 21.5902 20.9046 21.7336 20.6407 21.8228C20.3769 21.912 20.0974 21.9452 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.82C8.77382 17.2255 6.72533 15.177 5.13 12.76C3.4158 10.163 2.36433 7.20723 2.03 4.13C2.00481 3.85263 2.03798 3.57312 2.12718 3.30927C2.21638 3.04542 2.35985 2.80321 2.5481 2.59797C2.73636 2.39273 2.96548 2.22914 3.22066 2.11757C3.47585 2.006 3.75145 1.94896 4.03 1.95H7.03C7.50291 1.94723 7.96131 2.11475 8.32431 2.42278C8.68731 2.73081 8.93175 3.15962 9.01 3.63C9.15654 4.74052 9.42852 5.82903 9.82 6.88C9.92723 7.1654 9.95078 7.47293 9.8885 7.77443C9.82622 8.07593 9.68007 8.35626 9.463 8.59L7.69 10.36C9.68097 13.8569 12.5931 16.769 16.09 18.76L17.86 16.99C18.0937 16.7729 18.3741 16.6268 18.6756 16.5645C18.9771 16.5022 19.2846 16.5258 19.57 16.633C20.621 17.0245 21.7095 17.2965 22.82 17.443C23.2952 17.5218 23.7276 17.7696 24.0366 18.1368C24.3456 18.5039 24.5103 18.9657 24.5 19.44" stroke="#D1D1D1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="form-actions-dialog">
            <button type="button" class="btn-delete" onclick="deleteContact(${contact.id}); closeAddContactDialog();">Delete</button>
            <button type="submit" class="btn-create-submit">Save ✓</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für einen Contact-Gruppen-Buchstaben
 * @param {string} letter - Der anzuzeigende Buchstabe
 * @returns {string} Das HTML-Template für den Gruppen-Buchstaben
 */
function getContactGroupLetterTemplate(letter) {
  return `<div class="contact-group-letter">${letter}</div>`;
}

/**
 * Generiert das HTML-Template für eine Trennlinie
 * @returns {string} Das HTML-Template für die Trennlinie
 */
function getSeparatorLineTemplate() {
  return `<div class="separator-line" style="border-bottom: 1px solid #D1D1D1; margin: 0 35px 0 35px; display: none;"></div>`;
}
