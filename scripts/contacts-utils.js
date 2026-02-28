function loadContactsFromFirestoreAsync(currentUser) {
  return (async function () {
    try {
      const contactsRef = getContactsReference(currentUser);
      const snapshot = await window.fbGetDocs(contactsRef);
      populateContactsFromSnapshot(snapshot);
    } catch (error) {
      console.error("Error loading contacts:", error);
      contacts = [];
    }
  })();
}

function getContactsReference(currentUser) {
  return window.fbCollection(
    window.firebaseDb,
    "users",
    currentUser.id,
    "contacts",
  );
}

function saveNewContactToFirestore(currentUser, newContact) {
  return (async function () {
    try {
      await saveContactToFirestoreDb(currentUser, newContact);
      finalizeContactCreation(newContact);
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  })();
}

function saveContactToFirestoreDb(currentUser, newContact) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      newContact.id,
    );
    await window.fbSetDoc(contactRef, newContact);
  })();
}

function persistContactToFirestore(currentUser, contact, id) {
  return (async function () {
    try {
      await updateContactInFirestoreDb(currentUser, contact, id);
      finalizeContactUpdate(contact);
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  })();
}

function updateContactInFirestoreDb(currentUser, contact, id) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbSetDoc(contactRef, contact);
  })();
}

function removeContactFromFirestore(currentUser, id) {
  return (async function () {
    try {
      await deleteContactFromFirestoreDb(currentUser, id);
      finalizeContactDeletion(id);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  })();
}

function deleteContactFromFirestoreDb(currentUser, id) {
  return (async function () {
    const contactRef = window.fbDoc(
      window.firebaseDb,
      "users",
      currentUser.id,
      "contacts",
      String(id),
    );
    await window.fbDeleteDoc(contactRef);
  })();
}

function showSuccessAlert() {
  const alert = document.createElement("div");
  alert.className = "success-alert";
  alert.innerText = "Kontakt erfolgreich erstellt!";
  document.body.appendChild(alert);
  showAlertWithDelay(alert);
}

function showAlertWithDelay(alert) {
  setTimeout(function () {
    alert.classList.add("show");
  }, 50);
  setTimeout(function () {
    hideAndRemoveAlert(alert);
  }, 800);
}

function hideAndRemoveAlert(alert) {
  alert.classList.remove("show");
  setTimeout(function () {
    alert.remove();
  }, 500);
}
