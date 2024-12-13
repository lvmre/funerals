let listingsData = [];
let editingListingId = null;

// Helper function to get nested properties from JSON using dot notation keys
function getNestedProperty(obj, keyString) {
  return keyString.split('.').reduce((o, k) => o?.[k], obj);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Load language file first
  let lang;
  try {
    const response = await fetch('en.json');
    lang = await response.json();
  } catch (err) {
    console.error('Error loading language file', err);
  }

  if (lang) {
    applyLanguage(lang);
    initDynamicFunctions(lang);
  }

  // After language and dynamic functions are set, load listings
  await loadListings();
  renderListings();

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

// Load listings from JSON file (simulating fetching from backend)
async function loadListings() {
  const response = await fetch('listings.json');
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
    const div = document.createElement('div');
    div.className = 'listing';
    div.innerHTML = `
      <h3>${listing.deceasedName}</h3>
      <p><strong>Funeral Home:</strong> ${listing.funeralHome}</p>
      <p><strong>Location:</strong> ${listing.serviceLocation}</p>
      <p><strong>Category:</strong> ${listing.category}</p>
      <p><strong>Obituary:</strong> ${listing.obituary}</p>
      <button data-id="${listing.id}" class="edit-btn">Edit</button>
      <button data-id="${listing.id}" class="delete-btn">Delete</button>
    `;
    container.appendChild(div);
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
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('filterCategory').value;

  const filtered = listingsData.filter(listing => {
    const matchesSearch = listing.deceasedName.toLowerCase().includes(searchValue) ||
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

// Delete a listing
function deleteListing(id) {
  listingsData = listingsData.filter(l => l.id !== id);
  renderListings();
}

// Handle form submission for add/edit
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const newListing = {
    id: editingListingId || Date.now().toString(),
    deceasedName: form.deceasedName.value,
    funeralHome: form.funeralHome.value,
    serviceLocation: form.serviceLocation.value,
    programDetails: form.programDetails.value,
    poems: form.poems.value,
    obituary: form.obituary.value,
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
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

function logoutUser() {
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
  lang.featuresSection.features.forEach((feature, i) => {
    const div = document.createElement('div');
    div.className = 'feature-card hidden-on-load';
    // Using icons from the language file would be ideal, but here we assume icons are static or chosen in HTML.
    // If needed, you can modify to integrate icons dynamically.
    div.innerHTML = `
      <i class="fa-solid fa-star fa-2x"></i>
      <h3>${feature.title}</h3>
      <p>${feature.description}</p>
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
      <img src="images/step${i+1}.png" alt="${step.imgAlt}">
      <h4>${step.stepTitle}</h4>
      <p>${step.description}</p>
    `;
    stepsList.appendChild(li);
  });
}

function initDynamicFunctions(lang) {
  // Testimonials carousel
  const testimonials = lang.testimonialsSection.testimonials;
  let currentTestimonialIndex = 0;
  const testimonialCard = document.getElementById('testimonialCard');

  function showTestimonial(index) {
    testimonialCard.innerHTML = `
      <blockquote>"${testimonials[index].quote}"</blockquote>
      <cite>${testimonials[index].author}</cite>
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
      }
    });
  }, { threshold: 0.1 });

  hiddenElements.forEach(el => observer.observe(el));

  // Fake Search Suggestions for hero
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
    const query = heroSearchInput.value.toLowerCase();
    if (!query) {
      searchSuggestions.style.display = 'none';
      return;
    }

    const filtered = suggestionList.filter(item => item.toLowerCase().includes(query));
    if (filtered.length > 0) {
      searchSuggestions.innerHTML = filtered.map(item => `<li>${item}</li>`).join('');
      searchSuggestions.style.display = 'block';
    } else {
      searchSuggestions.style.display = 'none';
    }
  });

  searchSuggestions.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      heroSearchInput.value = e.target.textContent;
      searchSuggestions.style.display = 'none';
    }
  });
}

function initMap() {
  const defaultLat = -33.9249;
  const defaultLng = 18.4241;
  const defaultZoom = 13;

  const map = L.map('mapContainer').setView([defaultLat, defaultLng], defaultZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const marker = L.marker([40.7128, -74.0060]).addTo(map);
  marker.bindPopup("<b>Sample Funeral Home</b><br>123 Main St, New York, NY").openPopup();
}
