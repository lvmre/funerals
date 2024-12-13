let listingsData = [];
let editingListingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadListings();
  renderListings();
  
  document.getElementById('searchBtn').addEventListener('click', handleSearch);
  document.getElementById('filterCategory').addEventListener('change', handleSearch);
  document.getElementById('addListingBtn').addEventListener('click', openModalToAdd);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('listingForm').addEventListener('submit', handleFormSubmit);
  
  // Placeholder login/logout handling
  document.getElementById('loginBtn').addEventListener('click', loginUser);
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);
  
  // Placeholder for loading the map
  loadMap();
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
      <button onclick="editListing('${listing.id}')">Edit</button>
      <button onclick="deleteListing('${listing.id}')">Delete</button>
    `;
    container.appendChild(div);
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
  // In a real app, also send a delete request to the backend
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
    // Edit existing
    const index = listingsData.findIndex(l => l.id === editingListingId);
    if (index > -1) listingsData[index] = newListing;
  } else {
    // Add new
    listingsData.push(newListing);
  }
  
  closeModal();
  renderListings();
  // In real-world scenario, make POST/PUT request to backend
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
  // Stubbed login: In a real scenario, show a login form and handle OAuth or email/password auth.
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

function logoutUser() {
  document.getElementById('loginBtn').style.display = 'inline-block';
  document.getElementById('logoutBtn').style.display = 'none';
}

// Placeholder map function
function loadMap() {
  // Here you would load a map from e.g. Google Maps or Mapbox
  // and mark funeral locations. This is a placeholder.
  document.getElementById('mapContainer').textContent = 'Map would be displayed here.';
}
