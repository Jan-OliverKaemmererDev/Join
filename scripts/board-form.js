/**
 * Schaltet das Kategorie-Dropdown um
 */
function toggleCategoryDropdown() {
  const wrapper = document.getElementById("category-wrapper");
  const options = document.getElementById("category-options");
  wrapper.classList.toggle("open");
  options.classList.toggle("d-none");
}


/**
 * Wählt eine Kategorie aus und aktualisiert das versteckte Eingabefeld
 * @param {string} category - Die ausgewählte Kategorie
 * @param {Event} event - Das Klick-Event
 */
function selectCategory(category, event) {
  event.stopPropagation();
  document.getElementById("selected-category-text").textContent = category;
  document.getElementById("category").value = category;
  const wrapper = document.getElementById("category-wrapper");
  const options = document.getElementById("category-options");
  wrapper.classList.remove("open");
  options.classList.add("d-none");
  validateForm();
}


// Schließt das Kategorie-Dropdown bei Klick außerhalb
document.addEventListener("click", function (event) {
  const wrapper = document.getElementById("category-wrapper");
  if (wrapper && !wrapper.contains(event.target)) {
    wrapper.classList.remove("open");
    const options = document.getElementById("category-options");
    if (options) options.classList.add("d-none");
  }
});


/**
 * Setzt die Board-Dropdowns nach dem Schließen des Overlays zurück
 */
function resetBoardDropdowns() {
  const categoryText = document.getElementById("selected-category-text");
  if (categoryText) categoryText.textContent = "Select task category";
  const categoryInput = document.getElementById("category");
  if (categoryInput) categoryInput.value = "";
  const catWrapper = document.getElementById("category-wrapper");
  if (catWrapper) catWrapper.classList.remove("open");
  const catOptions = document.getElementById("category-options");
  if (catOptions) catOptions.classList.add("d-none");
  const assignedWrapper = document.getElementById("assigned-to-wrapper");
  if (assignedWrapper) assignedWrapper.classList.remove("open");
  const assignedOptions = document.getElementById("assigned-to-options");
  if (assignedOptions) assignedOptions.classList.add("d-none");
}
