/**
 * Generiert das HTML-Template für ein Contact-Listen-Element
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
 * Generiert das HTML-Template für die Contact-Detailansicht (Mobil)
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
        <span>Kontakt Information</span>
    </div>

    <div class="info-label">Email</div>
    <a href="mailto:${contact.email}" class="info-value-email">${contact.email}</a>

    <div class="info-label">Telefon</div>
    <div class="info-value">${contact.phone}</div>

    <div class="mobile-menu-btn" onclick="toggleContactMenu(event)">
        <img src="./assets/icons/more_vert.svg">
        <div id="contact-menu-box" class="contact-menu-box" onclick="event.stopPropagation()">
            <div class="menu-item" onclick="openEditContactDialog(${contact.id})">
                <img src="./assets/icons/edit.svg" alt="Edit"> Bearbeiten
            </div>
            <div class="menu-item" onclick="deleteContact(${contact.id}); closeContactDetails();">
                <img src="./assets/icons/delete.svg" alt="Delete"> Löschen
            </div>
        </div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für den Add-Contact-Dialog (Mobile optimiert)
 */
function getAddContactDialogTemplate() {
  return `
    <div class="edit-contact-mobile-overlay" onclick="event.stopPropagation()">
      <div class="dialog-header-blue">
        <div class="close-btn-container-mobile">
            <button onclick="closeAddContactDialog()" class="btn-close-white">✕</button>
        </div>
        <h1 class="dialog-title-white">Add contact</h1>
        <p style="color: white; font-size: 20px; margin-top: 8px;">Tasks are better with a team!</p>
        <div class="blue-line-horizontal"></div>
      </div>
      
      <div class="dialog-content-white">
        <div class="contact-form-avatar-center" style="background-color: #D1D1D1;">
          <img src="./assets/login-screen/person.svg" alt="" style="width: 64px; height: 64px; filter: invert(1);">
        </div>
        
        <form onsubmit="createContact(event)" class="edit-form-mobile">
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
            <img src="./assets/icons/phone.svg" class="input-icon">
          </div>
          
          <div class="form-actions-mobile">
            <button type="submit" class="btn-save-dark" style="width: 200px;">Kontakt erstellen</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Generiert das HTML-Template für den Edit-Contact-Dialog (Mobile optimiert)
 */
function getEditContactDialogTemplate(contact) {
  return `
    <div class="edit-contact-mobile-overlay" onclick="event.stopPropagation()">
      <div class="dialog-header-blue">
        <div class="close-btn-container-mobile">
            <button onclick="closeAddContactDialog()" class="btn-close-white">✕</button>
        </div>
        <h1 class="dialog-title-white">Edit contact</h1>
        <div class="blue-line-horizontal"></div>
      </div>
      
      <div class="dialog-content-white">
        <div class="contact-form-avatar-center" style="background-color: ${contact.color}">
          ${contact.initials}
        </div>
        
        <form onsubmit="saveContact(event, ${contact.id})" class="edit-form-mobile">
          <div class="input-group">
            <input type="text" value="${contact.name}" required id="edit-contact-name" placeholder="Name">
            <img src="./assets/login-screen/person.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="email" value="${contact.email}" required id="edit-contact-email" placeholder="Email">
            <img src="./assets/login-screen/mail.svg" class="input-icon">
          </div>
          <div class="input-group">
            <input type="tel" value="${contact.phone}" required id="edit-contact-phone" placeholder="Phone">
            <img src="./assets/icons/phone.svg" class="input-icon">
          </div>
          
          <div class="form-actions-mobile">
            <button type="button" class="btn-delete-outline" onclick="deleteContact(${contact.id}); closeAddContactDialog();">Löschen</button>
            <button type="submit" class="btn-save-dark">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function getContactGroupLetterTemplate(letter) {
  return `<div class="contact-group-letter">${letter}</div>`;
}

function getSeparatorLineTemplate() {
  return `<div class="separator-line" style="border-bottom: 1px solid #D1D1D1; margin: 0 24px 10px 24px;"></div>`;
}
