let listingsData = [];
let editingListingId = null;

// Helper function to get nested properties from JSON using dot notation keys
function getNestedProperty(obj, keyString) {
  return keyString.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load language file first
  let lang;
  try {
    const response = await fetch('en.json');
    if (!response.ok) throw new Error('Failed to fetch language file');
    lang = await response.json();
  } catch (err) {
    console.error('Error loading language file:', err);
  }

  if (lang) {
    applyLanguage(lang);
    initDynamicFunctions(lang);
  }

  // Load listings
  try {
    await loadListings();
    renderListings();
  } catch (err) {
    console.error('Error loading listings:', err);
    renderListings(); // Render with empty data to show "No listings found."
  }

  // Set up event listeners for listings functionality
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('filterCategory').addEventListener('change', handleSearch);
  document.getElementById('addListingBtn').addEventListener('click', openModalToAdd);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('listingForm').addEventListener('submit', handleFormSubmit);

  // Placeholder auth
  document.getElementById('loginBtn').addEventListener('click', loginUser);
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);

  // Initialize the map
  initMap();
});

// Load listings from JSON file
async function loadListings() {
  const response = await fetch('listings.json');
  if (!response.ok) throw new Error('Failed to fetch listings');
  listingsData = await response.json();
}

// Render listings based on current data
function renderListings(filteredData = null) {
  const container = document.getElementById('listingsContainer');
  container.innerHTML = '';
  const data = filteredData || listingsData;

  if (data.length === 0) {
    container.innerHTML = '<p>No listings found.</p>';
    return;
  }

  data.forEach(listing => {
    const article = document.createElement('article');
    article.className = 'listing hidden-on-load';
    article.innerHTML = `
      <header>
        <h3 class="deceased-name">${sanitizeHTML(listing.deceasedName)}</h3>
        <p class="funeral-home"><strong>Funeral Home:</strong> ${sanitizeHTML(listing.funeralHome)}</p>
        <p class="location"><strong>Location:</strong> ${sanitizeHTML(listing.serviceLocation)}</p>
      </header>
      <section class="details">
        <p class="category"><strong>Category:</strong> ${sanitizeHTML(listing.category)}</p>
        <p class="obituary"><strong>Obituary:</strong> ${sanitizeHTML(listing.obituary)}</p>
      </section>
      <footer class="actions">
        <button data-id="${sanitizeHTML(listing.id)}" class="edit-btn"><i class="fa-solid fa-edit"></i> Edit</button>
        <button data-id="${sanitizeHTML(listing.id)}" class="delete-btn"><i class="fa-solid fa-trash"></i> Delete</button>
      </footer>
    `;
    container.appendChild(article);
  });

  // Add event listeners for edit/delete dynamically
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editListing(btn.getAttribute('data-id')));
  });
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteListing(btn.getAttribute('data-id')));
  });
}

// Handle search and filtering
function handleSearch() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();
  const categoryFilter = document.getElementById('filterCategory').value;

  const filtered = listingsData.filter(listing => {
    const matchesSearch =
      listing.deceasedName.toLowerCase().includes(searchValue) ||
      listing.funeralHome.toLowerCase().includes(searchValue) ||
      listing.serviceLocation.toLowerCase().includes(searchValue);
    const matchesCategory = categoryFilter ? listing.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  renderListings(filtered);
}

// Open modal to add a new listing
function openModalToAdd() {
  editingListingId = null;
  document.getElementById('modalTitle').textContent = 'Add a Funeral Listing';
  document.getElementById('listingForm').reset();
  openModal();
}

// Open modal to edit a listing
function editListing(id) {
  editingListingId = id;
  const listing = listingsData.find(l => l.id === id);
  if (!listing) return;

  document.getElementById('modalTitle').textContent = 'Edit Funeral Listing';
  document.getElementById('deceasedName').value = listing.deceasedName;
  document.getElementById('funeralHome').value = listing.funeralHome;
  document.getElementById('serviceLocation').value = listing.serviceLocation;
  document.getElementById('programDetails').value = listing.programDetails;
  document.getElementById('poems').value = listing.poems;
  document.getElementById('obituary').value = listing.obituary;
  document.getElementById('category').value = listing.category;

  openModal();
}

// Delete a listing with confirmation
function deleteListing(id) {
  if (confirm('Are you sure you want to delete this listing?')) {
    listingsData = listingsData.filter(l => l.id !== id);
    renderListings();
  }
}

// Handle form submission for add/edit
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const newListing = {
    id: editingListingId || Date.now().toString(),
    deceasedName: form.deceasedName.value.trim(),
    funeralHome: form.funeralHome.value.trim(),
    serviceLocation: form.serviceLocation.value.trim(),
    programDetails: form.programDetails.value.trim(),
    poems: form.poems.value.trim(),
    obituary: form.obituary.value.trim(),
    category: form.category.value
  };

  if (editingListingId) {
    const index = listingsData.findIndex(l => l.id === editingListingId);
    if (index > -1) listingsData[index] = newListing;
  } else {
    listingsData.push(newListing);
  }

  closeModal();
  renderListings();
}

// Modal helper functions
function openModal() {
  document.getElementById('listingModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('listingModal').style.display = 'none';
  editingListingId = null;
}

// Placeholder auth functions
function loginUser() {
  // Implement actual authentication logic here
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

function logoutUser() {
  // Implement actual logout logic here
  document.getElementById('loginBtn').style.display = 'inline-block';
  document.getElementById('logoutBtn').style.display = 'none';
}

// Language application
function applyLanguage(lang) {
  // Apply text to elements with data-key
  document.querySelectorAll('[data-key]').forEach(elem => {
    const key = elem.getAttribute('data-key');
    const text = getNestedProperty(lang, key);
    if (text) {
      elem.textContent = text;
    }
  });

  // Apply placeholders
  document.querySelectorAll('[data-placeholder-key]').forEach(elem => {
    const key = elem.getAttribute('data-placeholder-key');
    const text = getNestedProperty(lang, key);
    if (text) {
      elem.setAttribute('placeholder', text);
    }
  });

  // Features
  const featureGrid = document.getElementById('featureGrid');
  featureGrid.innerHTML = '';
  lang.featuresSection.features.forEach(feature => {
    const div = document.createElement('div');
    div.className = 'feature-card hidden-on-load';
    div.innerHTML = `
      <i class="${sanitizeHTML(feature.iconClass)} fa-2x"></i>
      <h3>${sanitizeHTML(feature.title)}</h3>
      <p>${sanitizeHTML(feature.description)}</p>
    `;
    featureGrid.appendChild(div);
  });

  // Steps
  const stepsList = document.getElementById('stepsList');
  stepsList.innerHTML = '';
  lang.howItWorks.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.className = 'hidden-on-load';
    li.innerHTML = `
      <img src="images/step${i + 1}.png" alt="${sanitizeHTML(step.imgAlt)}">
      <h4>${sanitizeHTML(step.stepTitle)}</h4>
      <p>${sanitizeHTML(step.description)}</p>
    `;
    stepsList.appendChild(li);
  });
}

// Initialize dynamic functions after language is applied
function initDynamicFunctions(lang) {
  // Testimonials carousel
  const testimonials = lang.testimonialsSection.testimonials;
  let currentTestimonialIndex = 0;
  const testimonialCard = document.getElementById('testimonialCard');

  function showTestimonial(index) {
    testimonialCard.innerHTML = `
      <blockquote>"${sanitizeHTML(testimonials[index].quote)}"</blockquote>
      <cite>${sanitizeHTML(testimonials[index].author)}</cite>
    `;
  }

  showTestimonial(currentTestimonialIndex);
  setInterval(() => {
    currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
    showTestimonial(currentTestimonialIndex);
  }, 5000);

  // Intersection Observer for reveal animations
  const hiddenElements = document.querySelectorAll('.hidden-on-load');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing after it becomes visible
      }
    });
  }, { threshold: 0.1 });

  hiddenElements.forEach(el => observer.observe(el));

  // Search Suggestions for hero
  const heroSearchInput = document.getElementById('heroSearchInput');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const suggestionList = [
    "John Doe - St. Mary's Church",
    "Memorial Gardens - Jane Smith",
    "Celebration of Life - Anderson Family",
    "Greenwood Funeral Home",
    "Local Services Near You"
  ];

  heroSearchInput.addEventListener('input', () => {
    const query = heroSearchInput.value.toLowerCase().trim();
    if (!query) {
      searchSuggestions.style.display = 'none';
      searchSuggestions.innerHTML = '';
      return;
    }

    const filtered = suggestionList.filter(item => item.toLowerCase().includes(query));
    if (filtered.length > 0) {
      searchSuggestions.innerHTML = filtered.map(item => `<li>${sanitizeHTML(item)}</li>`).join('');
      searchSuggestions.style.display = 'block';
    } else {
      searchSuggestions.style.display = 'none';
      searchSuggestions.innerHTML = '';
    }
  });

  searchSuggestions.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      heroSearchInput.value = e.target.textContent;
      searchSuggestions.style.display = 'none';
      searchSuggestions.innerHTML = '';
    }
  });

  // Close search suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!heroSearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.style.display = 'none';
      searchSuggestions.innerHTML = '';
    }
  });
}

// Initialize the map centered on South Africa
function initMap() {
  const defaultLat = -33.9249; // Cape Town, South Africa
  const defaultLng = 18.4241;
  const defaultZoom = 5;

  const map = L.map('mapContainer').setView([defaultLat, defaultLng], defaultZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Sample marker in Cape Town
  L.marker([defaultLat, defaultLng]).addTo(map)
    .bindPopup("<b>Sample Funeral Home</b><br>Cape Town, South Africa").openPopup();
}
