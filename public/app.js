// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('fh_cart')) || [];
let token = localStorage.getItem('fh_token') || null;
let user = JSON.parse(localStorage.getItem('fh_user')) || null;
let wishlist = JSON.parse(localStorage.getItem('fh_wishlist')) || [];
let activeGenderFilter = 'all';
let activeCategoryFilter = '';
let activeSearchQuery = '';

// DOM Elements
const body = document.body;
const toastNotification = document.getElementById('toastNotification');
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = darkModeToggle.querySelector('.sun-icon');
const moonIcon = darkModeToggle.querySelector('.moon-icon');

// Auth DOM
const authModal = document.getElementById('authModal');
const profileBtn = document.getElementById('profileBtn');
const wishlistNavBtn = document.getElementById('wishlistNavBtn');
const userStatusBadge = document.getElementById('userStatusBadge');
const wishlistCount = document.getElementById('wishlistCount');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const toSignupLink = document.getElementById('toSignupLink');
const toLoginLink = document.getElementById('toLoginLink');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');

// Cart Drawer DOM
const cartDrawer = document.getElementById('cartDrawer');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotal = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const backToCartBtn = document.getElementById('backToCartBtn');
const checkoutFormContainer = document.getElementById('checkoutFormContainer');
const checkoutForm = document.getElementById('checkoutForm');
const customerNameInput = document.getElementById('customerName');
const shippingAddressInput = document.getElementById('shippingAddress');

// Search DOM
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');

// Product Detail Modal DOM
const productDetailModal = document.getElementById('productDetailModal');
const closeProductDetailModal = document.getElementById('closeProductDetailModal');
const modalProductImage = document.getElementById('modalProductImage');
const modalProductGender = document.getElementById('modalProductGender');
const modalProductName = document.getElementById('modalProductName');
const modalProductBrand = document.getElementById('modalProductBrand');
const modalProductSku = document.getElementById('modalProductSku');
const modalProductAvailability = document.getElementById('modalProductAvailability');
const modalProductRatingStars = document.getElementById('modalProductRatingStars');
const modalProductRatingCount = document.getElementById('modalProductRatingCount');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductOriginalPrice = document.getElementById('modalProductOriginalPrice');
const modalProductDiscount = document.getElementById('modalProductDiscount');
const modalProductDescription = document.getElementById('modalProductDescription');
const modalProductStock = document.getElementById('modalProductStock');
const modalProductRawCategory = document.getElementById('modalProductRawCategory');
const modalProductSubCategory = document.getElementById('modalProductSubCategory');
const modalProductSizes = document.getElementById('modalProductSizes');
const modalProductColors = document.getElementById('modalProductColors');
const modalProductSpecs = document.getElementById('modalProductSpecs');
const modalProductTags = document.getElementById('modalProductTags');
const modalAddToBagBtn = document.getElementById('modalAddToBagBtn');
const modalWishlistBtn = document.getElementById('modalWishlistBtn');
let currentDetailProduct = null;
let selectedSize = '';
let selectedColor = '';
let selectedVariant = null;

// Page Navigation Elements
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');

// Toast Alert
function showToast(message, duration = 3000) {
  toastNotification.textContent = message;
  toastNotification.removeAttribute('hidden');
  setTimeout(() => {
    toastNotification.setAttribute('hidden', '');
  }, duration);
}

// ==========================================
// 1. SPA ROUTING
// ==========================================
function handleRoute() {
  const hash = window.location.hash || '#home';
  const legalAnchor = document.querySelector(hash);

  if (hash === '#mainContent') {
    document.getElementById('mainContent')?.focus();
    return;
  }

  // Hide all sections
  pageSections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });

  // Remove active class from nav links
  navLinks.forEach(link => link.classList.remove('active'));

  // Route matches
  if (hash.startsWith('#products')) {
    const targetSection = document.getElementById('page-products');
    if (!targetSection) return;
    showSection(targetSection);

    // Read parameters from link context if applicable
    const activeLink = document.querySelector(`.nav-link[href="#products"][data-gender="${activeGenderFilter}"]`)
      || document.querySelector(`.nav-link[href="#products"]`);
    if (activeLink) activeLink.classList.add('active');

    loadProductsPage();
  } else if (hash === '#offers') {
    const targetSection = document.getElementById('page-offers');
    if (!targetSection) return;
    showSection(targetSection);
    document.querySelector('.nav-link[href="#offers"]')?.classList.add('active');
  } else if (hash === '#about') {
    const targetSection = document.getElementById('page-about');
    if (!targetSection) return;
    showSection(targetSection);
    document.querySelector('.nav-link[href="#about"]')?.classList.add('active');
  } else if (hash === '#contact') {
    const targetSection = document.getElementById('page-contact');
    if (!targetSection) return;
    showSection(targetSection);
    document.querySelector('.nav-link[href="#contact"]')?.classList.add('active');
  } else if (hash === '#profile') {
    if (!token) {
      window.location.hash = '#home';
      openAuth('login');
      showToast('Please sign in to view your profile.');
      return;
    }
    const targetSection = document.getElementById('page-profile');
    if (!targetSection) return;
    showSection(targetSection);
    loadProfilePage();
  } else if (hash === '#cart') {
    const targetSection = document.getElementById('page-home');
    if (targetSection) showSection(targetSection);
    document.querySelector('.nav-link[href="#home"]')?.classList.add('active');
    renderHomeCarousel();
    openCartDrawer();
  } else if (hash === '#privacy') {
    const targetSection = document.getElementById('page-privacy');
    if (!targetSection) return;
    showSection(targetSection);
  } else if (hash === '#terms') {
    const targetSection = document.getElementById('page-terms');
    if (!targetSection) return;
    showSection(targetSection);
  } else if (hash === '#cookies') {
    const targetSection = document.getElementById('page-cookies');
    if (!targetSection) return;
    showSection(targetSection);
    initCookiePreferences();
  } else if (hash === '#accessibility') {
    const targetSection = document.getElementById('page-accessibility');
    if (!targetSection) return;
    showSection(targetSection);
  } else if (legalAnchor && hash.startsWith('#priv-')) {
    const targetSection = document.getElementById('page-privacy');
    if (!targetSection) return;
    showSection(targetSection);
    legalAnchor.scrollIntoView();
    return;
  } else if (legalAnchor && hash.startsWith('#terms-')) {
    const targetSection = document.getElementById('page-terms');
    if (!targetSection) return;
    showSection(targetSection);
    legalAnchor.scrollIntoView();
    return;
  } else {
    // Default Home
    const targetSection = document.getElementById('page-home');
    if (!targetSection) return;
    showSection(targetSection);
    document.querySelector('.nav-link[href="#home"]')?.classList.add('active');
    renderHomeCarousel();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function showSection(section) {
  section.style.display = 'block';
  section.classList.add('active');
}

function truncateText(text, maxLength) {
  const value = String(text || '');
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function escapeAttribute(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(text) {
  return escapeAttribute(text).replace(/'/g, '&#39;');
}

function escapeStyleUrl(text) {
  return escapeAttribute(text).replace(/'/g, '%27').replace(/\)/g, '%29');
}

function getUserInitials(name = '', email = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const fallback = words[0] || String(email).split('@')[0] || 'U';
  return fallback.slice(0, 2).toUpperCase();
}

function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add('is-loading');
    button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span>${loadingText}`;
  } else {
    button.disabled = false;
    button.classList.remove('is-loading');
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

function renderLoadingCards(container, count = 4, cardClass = 'skeleton-card') {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="${cardClass}">
      <span class="skeleton-media"></span>
      <span class="skeleton-line wide"></span>
      <span class="skeleton-line"></span>
      <span class="skeleton-line short"></span>
    </div>
  `).join('');
}

function formatMoney(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', () => {
  initApp();
  handleRoute();
});

// Click handlers for nav links (gender filters)
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const page = link.getAttribute('data-page');
    if (page === 'products') {
      const gender = link.getAttribute('data-gender');
      activeGenderFilter = gender || 'all';
      activeCategoryFilter = '';

      // Update filter buttons on products page if already active
      const filterBtn = document.querySelector(`.filter-tab[data-filter-gender="${activeGenderFilter}"]`);
      if (filterBtn) {
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        filterBtn.classList.add('active');
      }
    }
  });
});

document.querySelectorAll('a[data-gender][href="#products"]').forEach(link => {
  link.addEventListener('click', () => {
    activeGenderFilter = link.getAttribute('data-gender') || 'all';
    activeCategoryFilter = '';

    if (window.location.hash === '#products') {
      handleRoute();
    }
  });
});

// Contact Form Handler
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you! Your inquiry has been sent to client services.');
    contactForm.reset();
  });
}

// ==========================================
// 2. DARK MODE
// ==========================================
const savedTheme = localStorage.getItem('fh_theme') || 'light';
if (savedTheme === 'dark') {
  body.classList.add('dark-mode');
  sunIcon.style.display = 'none';
  moonIcon.style.display = 'block';
}

darkModeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');

  if (isDark) {
    localStorage.setItem('fh_theme', 'dark');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    localStorage.setItem('fh_theme', 'light');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
});

// ==========================================
// 3. AUTHENTICATION
// ==========================================
function updateAuthUI() {
  if (token && user) {
    userStatusBadge.removeAttribute('hidden');
    const avatar = document.getElementById('profileAvatar');
    if (avatar) {
      avatar.textContent = getUserInitials(user.name, user.email);
      avatar.setAttribute('aria-label', `${user.name || 'User'} profile picture`);
    }
    document.getElementById('profileUserName').textContent = user.name || 'Client Profile';
    document.getElementById('profileUserEmail').textContent = user.email || '';
    customerNameInput.value = user.name || '';
  } else {
    userStatusBadge.setAttribute('hidden', '');
    customerNameInput.value = '';
  }
  updateWishlistBadge();
}

function openAuth(card = 'login') {
  authModal.removeAttribute('hidden');
  if (card === 'login') {
    loginCard.style.display = 'block';
    signupCard.style.display = 'none';
  } else {
    loginCard.style.display = 'none';
    signupCard.style.display = 'block';
  }
}

profileBtn.addEventListener('click', () => {
  if (token) {
    window.location.hash = '#profile';
  } else {
    openAuth('login');
  }
});

wishlistNavBtn.addEventListener('click', () => {
  if (token) {
    window.location.hash = '#profile';
  } else {
    openAuth('login');
    showToast('Please sign in to save favorites.');
  }
});

// Bind triggers for auth toggling
closeAuthModal.addEventListener('click', () => authModal.setAttribute('hidden', ''));
toSignupLink.addEventListener('click', (e) => { e.preventDefault(); openAuth('signup'); });
toLoginLink.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, 'Signing in...');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      showToast(data.error || 'Failed to sign in.');
      return;
    }

    token = data.token;
    user = data.user;
    localStorage.setItem('fh_token', token);
    localStorage.setItem('fh_user', JSON.stringify(user));
    await loadWishlist();

    authModal.setAttribute('hidden', '');
    loginForm.reset();
    updateAuthUI();
    showToast(`Welcome back, ${user.name}!`);

    // Redirect to profile or continue cart flow
    if (window.location.hash === '#home') {
      window.location.hash = '#profile';
    }
  } catch (error) {
    showToast('Server unavailable. Please try again later.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// Signup Form Submit
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true, 'Creating...');

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      showToast(data.error || 'Failed to create account.');
      return;
    }

    token = data.token;
    user = data.user;
    localStorage.setItem('fh_token', token);
    localStorage.setItem('fh_user', JSON.stringify(user));
    await loadWishlist();

    authModal.setAttribute('hidden', '');
    signupForm.reset();
    updateAuthUI();
    showToast(`Account created! Welcome, ${user.name}!`);

    window.location.hash = '#profile';
  } catch (error) {
    showToast('Server error. Please try again.');
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// Log Out
logoutBtn.addEventListener('click', () => {
  token = null;
  user = null;
  wishlist = [];
  localStorage.removeItem('fh_token');
  localStorage.removeItem('fh_user');
  localStorage.removeItem('fh_wishlist');
  updateAuthUI();
  renderHomeCarousel();
  renderCatalogGrid();
  window.location.hash = '#home';
  showToast('Logged out successfully.');
});

// Trigger auth modal from custom links
document.querySelectorAll('.to-auth-trigger').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    openAuth('signup');
  });
});

// ==========================================
// 4. DATA LOADING & CATALOG
// ==========================================
function updateWishlistBadge() {
  if (!wishlistCount) return;
  wishlistCount.textContent = wishlist.length;
  wishlistCount.hidden = wishlist.length === 0;
}

function isWishlisted(productId) {
  return wishlist.includes(productId);
}

async function loadWishlist() {
  if (!token) {
    wishlist = [];
    localStorage.removeItem('fh_wishlist');
    updateWishlistBadge();
    return wishlist;
  }

  try {
    const response = await fetch('/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to load wishlist');
    }

    wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
    localStorage.setItem('fh_wishlist', JSON.stringify(wishlist));
  } catch (error) {
    console.error('Failed to load wishlist:', error);
    showToast('Wishlist is unavailable right now.');
  }

  updateWishlistBadge();
  updateWishlistButtons();
  return wishlist;
}

async function toggleWishlist(productId, button = null) {
  if (!token) {
    openAuth('login');
    showToast('Please sign in to save favorites.');
    return;
  }

  const product = products.find(p => p.id === productId);
  if (!product) return;

  const shouldRemove = isWishlisted(productId);
  if (button) button.classList.add('is-busy');

  try {
    const response = await fetch('/api/wishlist', {
      method: shouldRemove ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to update wishlist');
    }

    wishlist = Array.isArray(data.wishlist) ? data.wishlist : [];
    localStorage.setItem('fh_wishlist', JSON.stringify(wishlist));
    updateWishlistBadge();
    updateWishlistButtons(productId);
    renderProfileWishlist();
    showToast(shouldRemove ? 'Removed from wishlist.' : `"${product.name}" saved to wishlist.`);
  } catch (error) {
    console.error('Wishlist update failed:', error);
    showToast('Could not update wishlist. Please try again.');
  } finally {
    if (button) button.classList.remove('is-busy');
  }
}

function updateWishlistButtons(productId = null) {
  document.querySelectorAll('[data-wishlist-product]').forEach(button => {
    const id = button.getAttribute('data-wishlist-product');
    if (productId && id !== productId) return;
    const active = isWishlisted(id);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Remove from Wishlist' : 'Add to Wishlist');
    const icon = button.querySelector('.heart-icon');
    if (icon) icon.textContent = active ? '♥' : '♡';
  });
}

function renderWishlistButton(productId, className = 'wishlist-card-btn') {
  const active = isWishlisted(productId);
  return `
    <button
      class="${className}${active ? ' active' : ''}"
      data-wishlist-product="${escapeAttribute(productId)}"
      aria-label="${active ? 'Remove from Wishlist' : 'Add to Wishlist'}"
      aria-pressed="${active}"
      onclick="event.stopPropagation(); toggleWishlist('${escapeAttribute(productId)}', this)"
      type="button">
      <span class="heart-icon">${active ? '♥' : '♡'}</span>
    </button>
  `;
}

window.toggleWishlist = toggleWishlist;

async function initApp() {
  updateAuthUI();
  updateCartBadge();
  updateWishlistBadge();
  renderLoadingCards(document.getElementById('carouselTrack'), 4, 'skeleton-card carousel-skeleton');
  renderLoadingCards(document.getElementById('productsGrid'), 6, 'skeleton-card product-skeleton');
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`Products API returned ${response.status}`);
    }
    products = await response.json();
    if (token) {
      await loadWishlist();
    }
    renderHomeCarousel();
    if (window.location.hash.startsWith('#products')) renderCatalogGrid();
  } catch (error) {
    console.error('Failed to load products:', error);
    products = [];
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = `<p class="empty-cart-msg">Unable to load products. Please check the server and try again.</p>`;
    }
  }
}

function renderHomeCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track || products.length === 0) return;

  // Filter featured products or just select higher priced ones
  const featured = products.filter(p => p.featured || p.price > 45);

  track.innerHTML = featured.map(product => `
    <div class="carousel-card" onclick="viewProductDetail('${product.id}')">
      ${renderWishlistButton(product.id, 'wishlist-card-btn carousel-wishlist-btn')}
      <div class="carousel-card-image" style="${product.image ? `background-image: url('${escapeStyleUrl(product.image)}')` : ''}">${escapeHtml(truncateText(product.name, 42))}</div>
      <h3 title="${escapeAttribute(product.name)}">${truncateText(product.name, 34)}</h3>
      <p title="${escapeAttribute(product.description)}">${escapeHtml(truncateText(product.description || '', 96))}</p>
      <div class="carousel-card-footer">
        <span class="carousel-card-price">${formatMoney(product.price, product.currency)}</span>
        <button class="carousel-card-btn" onclick="event.stopPropagation(); viewProductDetail('${product.id}')">+</button>
      </div>
    </div>
  `).join('');
}

// Carousel Scroll Navigation
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const scrollAmount = 290;

if (carouselPrev && carouselNext && carouselTrack) {
  carouselPrev.addEventListener('click', () => {
    carouselTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  carouselNext.addEventListener('click', () => {
    carouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
}

function loadProductsPage() {
  renderCatalogGrid();

  // Setup filters
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    // Reset active
    tab.classList.remove('active');
    const gender = tab.getAttribute('data-filter-gender');
    const category = tab.getAttribute('data-filter-category');

    if (gender === activeGenderFilter && !category) {
      tab.classList.add('active');
    } else if (category === activeCategoryFilter && !gender) {
      tab.classList.add('active');
    }
  });
}

function renderCatalogGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Filter logic
  let filtered = [...products];

  if (activeGenderFilter && activeGenderFilter !== 'all') {
    filtered = filtered.filter(p => !p.gender || p.gender === activeGenderFilter);
    document.getElementById('catalogTitle').textContent = `${activeGenderFilter}`;
  } else {
    document.getElementById('catalogTitle').textContent = 'Shop All Gear';
  }

  if (activeCategoryFilter) {
    filtered = filtered.filter(p => !p.category || p.category === activeCategoryFilter);
    document.getElementById('catalogTitle').textContent = `${activeCategoryFilter} Collection`;
  }

  if (activeSearchQuery) {
    const q = activeSearchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  }

  // Sort logic
  const sortBy = document.getElementById('sortBySelect').value;
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
  } else {
    // Featured (fallback order or set featured flag)
    filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-cart-msg">No premium skateboard gear matches your filters.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="viewProductDetail('${product.id}')">
      ${renderWishlistButton(product.id)}
      <div class="product-card-image" style="${product.image ? `background-image: url('${escapeStyleUrl(product.image)}')` : ''}">
        ${escapeHtml(product.name)}
      </div>
      <span class="product-card-badge">${escapeHtml((product.category || 'Gear').toUpperCase())}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p class="product-card-desc">${escapeHtml(product.description || '')}</p>
      <div class="product-card-meta">
        <span class="product-card-price">${formatMoney(product.price, product.currency)}</span>
        <span class="product-card-rating">★ ${product.rating?.rate || '4.5'}</span>
      </div>
    </div>
  `).join('');
}

// Catalog filters bind
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const gender = tab.getAttribute('data-filter-gender');
    const category = tab.getAttribute('data-filter-category');

    if (gender) {
      activeGenderFilter = gender;
      activeCategoryFilter = '';
    } else if (category) {
      activeCategoryFilter = category;
      activeGenderFilter = 'all';
    }

    renderCatalogGrid();
  });
});

const sortBySelect = document.getElementById('sortBySelect');
if (sortBySelect) {
  sortBySelect.addEventListener('change', renderCatalogGrid);
}

// ==========================================
// 5. SEARCH SYSTEM
// ==========================================
searchBtn.addEventListener('click', () => {
  searchModal.removeAttribute('hidden');
  searchInput.focus();
});

closeSearch.addEventListener('click', () => {
  searchModal.setAttribute('hidden', '');
  searchInput.value = '';
  activeSearchQuery = '';
  if (window.location.hash.startsWith('#products')) {
    renderCatalogGrid();
  }
});

searchInput.addEventListener('input', (e) => {
  activeSearchQuery = e.target.value;
  if (!window.location.hash.startsWith('#products')) {
    window.location.hash = '#products';
  } else {
    renderCatalogGrid();
  }
});

// ==========================================
// 6. PRODUCT DETAILS & MODAL
// ==========================================
function viewProductDetail(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  currentDetailProduct = product;
  selectedVariant = getInitialVariant(product);
  selectedSize = selectedVariant?.size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M');
  selectedColor = selectedVariant?.color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard');

  modalProductName.textContent = product.name;
  modalProductGender.textContent = `${(product.category || 'Gear').toUpperCase()}`;
  modalProductBrand.textContent = product.brand?.name || 'Independent brand';
  modalProductSku.textContent = product.sku ? `SKU ${product.sku}` : `ID ${product.productId || product.id}`;
  modalProductDescription.textContent = product.fullDescription || product.description || 'Crafted with premium materials for maximum performance, pop, and durability.';
  modalWishlistBtn.setAttribute('data-wishlist-product', product.id);
  const ratingValue = Math.max(0, Math.min(5, Math.round(product.rating?.rate || product.rating?.average || 4.5)));
  modalProductRatingStars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
  modalProductRatingCount.textContent = `(${product.rating?.count || 24} client reviews)`;
  modalProductRawCategory.textContent = product.rawCategory || product.category || 'Gear';
  modalProductSubCategory.textContent = product.subCategory || 'General';

  if (product.image) {
    modalProductImage.style.backgroundImage = `url('${product.image}')`;
    modalProductImage.textContent = product.name;
  } else {
    modalProductImage.style.backgroundImage = 'none';
    modalProductImage.textContent = product.name;
  }

  const sizeList = product.sizes || ['S', 'M', 'L', 'XL'];
  const colorList = product.colors || ['Black', 'White', 'Navy'];

  renderChoiceChips(modalProductSizes, sizeList, selectedSize, 'size-chip', (size) => {
    selectedSize = size;
    syncSelectedVariant();
  });

  renderChoiceChips(modalProductColors, colorList, selectedColor, 'color-chip', (color) => {
    selectedColor = color;
    syncSelectedVariant();
  });

  renderProductSpecs(product.specifications || {});
  renderProductTags(product.tags || []);

  syncSelectedVariant();
  updateWishlistButtons(product.id);
  productDetailModal.removeAttribute('hidden');
}

function renderProductSpecs(specifications) {
  const entries = Object.entries(specifications || {}).filter(([, value]) => value != null && value !== '');
  if (entries.length === 0) {
    modalProductSpecs.innerHTML = '<div class="empty-detail-note">No specifications listed.</div>';
    return;
  }

  modalProductSpecs.innerHTML = entries.map(([key, value]) => `
    <div class="spec-row">
      <dt>${escapeHtml(key.replace(/([A-Z])/g, ' $1').trim())}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `).join('');
}

function renderProductTags(tags) {
  if (!tags.length) {
    modalProductTags.innerHTML = '<span class="empty-detail-note">No tags listed.</span>';
    return;
  }

  modalProductTags.innerHTML = tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
}

function renderChoiceChips(container, values, selectedValue, className, onSelect) {
  container.innerHTML = '';

  values.forEach((value) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `${className}${value === selectedValue ? ' selected' : ''}`;
    chip.textContent = value;
    chip.addEventListener('click', () => {
      onSelect(value);
      container.querySelectorAll(`.${className}`).forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
    container.appendChild(chip);
  });
}

function getInitialVariant(product) {
  return Array.isArray(product.variants) && product.variants.length ? product.variants[0] : null;
}

function getVariantPrice(variant, product) {
  return Number(variant?.salePrice ?? variant?.price ?? product.price ?? 0);
}

function findMatchingVariant(product, size = selectedSize, color = selectedColor) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!variants.length) return null;

  return variants.find(variant => variant.size === size && variant.color === color)
    || variants.find(variant => variant.size === size)
    || variants.find(variant => variant.color === color)
    || variants[0];
}

function refreshSelectedChips() {
  modalProductSizes.querySelectorAll('.size-chip').forEach(c => {
    c.classList.toggle('selected', c.textContent === selectedSize);
  });
  modalProductColors.querySelectorAll('.color-chip').forEach(c => {
    c.classList.toggle('selected', c.textContent === selectedColor);
  });
}

function updateDetailPrice(product, variant) {
  const price = getVariantPrice(variant, product);
  const originalPrice = Number(variant?.originalPrice ?? product.originalPrice ?? product.price ?? price);
  const discountPercentage = variant?.discountPercentage ?? product.discountPercentage;

  modalProductPrice.textContent = formatMoney(price, product.currency);
  if (originalPrice > price) {
    modalProductOriginalPrice.textContent = formatMoney(originalPrice, product.currency);
    modalProductDiscount.hidden = false;
    modalProductDiscount.textContent = discountPercentage ? `${discountPercentage}% off` : 'Sale';
  } else {
    modalProductOriginalPrice.textContent = '';
    modalProductDiscount.hidden = true;
  }
}

function updateDetailAvailability(product, variant) {
  const stock = variant?.stock ?? product.availableStock ?? product.inventory ?? 0;
  const availability = Number(stock) > 0 ? (product.availability || 'in-stock') : 'out-of-stock';

  modalProductStock.textContent = `${stock}`;
  modalProductAvailability.textContent = availability.replace(/-/g, ' ');
  modalProductAvailability.className = `availability-pill ${availability.toLowerCase()}`;
}

function syncSelectedVariant() {
  if (!currentDetailProduct) return;

  selectedVariant = findMatchingVariant(currentDetailProduct);
  if (selectedVariant) {
    selectedSize = selectedVariant.size || selectedSize;
    selectedColor = selectedVariant.color || selectedColor;
  }

  refreshSelectedChips();
  updateDetailPrice(currentDetailProduct, selectedVariant);
  updateDetailAvailability(currentDetailProduct, selectedVariant);
}

window.selectProductSize = (size) => {
  selectedSize = size;
  syncSelectedVariant();
};

window.selectProductColor = (color) => {
  selectedColor = color;
  syncSelectedVariant();
};

modalWishlistBtn.addEventListener('click', () => {
  if (!currentDetailProduct) return;
  toggleWishlist(currentDetailProduct.id, modalWishlistBtn);
});

closeProductDetailModal.addEventListener('click', () => {
  productDetailModal.setAttribute('hidden', '');
  currentDetailProduct = null;
  selectedVariant = null;
});

// Add to Bag Button
modalAddToBagBtn.addEventListener('click', () => {
  if (!currentDetailProduct) return;

  const itemIndex = cart.findIndex(item =>
    item.id === currentDetailProduct.id &&
    item.variantId === (selectedVariant?.variantId || '') &&
    item.size === selectedSize &&
    item.color === selectedColor
  );

  if (itemIndex > -1) {
    cart[itemIndex].quantity += 1;
  } else {
    const itemPrice = getVariantPrice(selectedVariant, currentDetailProduct);
    cart.push({
      id: currentDetailProduct.id,
      variantId: selectedVariant?.variantId || '',
      name: currentDetailProduct.name,
      price: itemPrice,
      currency: currentDetailProduct.currency,
      image: currentDetailProduct.image,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });
  }

  localStorage.setItem('fh_cart', JSON.stringify(cart));
  updateCartBadge();
  productDetailModal.setAttribute('hidden', '');
  showToast(`"${currentDetailProduct.name}" added to your bag.`);
  openCartDrawer();
});

// ==========================================
// 7. SHOPPING CART DRAWER
// ==========================================
function updateCartBadge() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
  if (count === 0) {
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
  }
}

function openCartDrawer() {
  renderCartDrawer();
  cartDrawer.removeAttribute('hidden');
}

cartBtn.addEventListener('click', openCartDrawer);
closeCartBtn.addEventListener('click', () => {
  cartDrawer.setAttribute('hidden', '');
  resetCheckoutViewState();
});

// Reset checkout forms/displays in drawer
function resetCheckoutViewState() {
  checkoutFormContainer.style.display = 'none';
  cartItemsContainer.style.display = 'block';
  checkoutBtn.style.display = 'block';
  placeOrderBtn.style.display = 'none';
  backToCartBtn.style.display = 'none';
}

function renderCartDrawer() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Your bag is empty.</p>`;
    cartSubtotal.textContent = formatMoney(0, 'INR');
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  let total = 0;
  const currency = cart[0]?.currency || 'INR';
  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-img" style="background-image: url('${item.image || ''}')">
          ${!item.image ? item.name : ''}
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <span class="cart-item-meta">Size: ${item.size} / Color: ${item.color}</span>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeCartItem(${index})">Remove</button>
          </div>
        </div>
        <span class="cart-item-price">${formatMoney(itemTotal, item.currency || currency)}</span>
      </div>
    `;
  }).join('');

  cartSubtotal.textContent = formatMoney(total, currency);
}

window.updateCartQty = (index, change) => {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem('fh_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
};

window.removeCartItem = (index) => {
  cart.splice(index, 1);
  localStorage.setItem('fh_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
};

// ==========================================
// 8. CHECKOUT & RAZORPAY PAYMENT
// ==========================================
checkoutBtn.addEventListener('click', () => {
  if (!token) {
    cartDrawer.setAttribute('hidden', '');
    openAuth('login');
    showToast('Please sign in to proceed with checkout.');
    return;
  }

  // Switch to shipping details view inside the drawer
  cartItemsContainer.style.display = 'none';
  checkoutFormContainer.style.display = 'block';
  checkoutBtn.style.display = 'none';
  placeOrderBtn.style.display = 'block';
  backToCartBtn.style.display = 'block';
});

backToCartBtn.addEventListener('click', resetCheckoutViewState);

placeOrderBtn.addEventListener('click', async () => {
  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    return;
  }

  const name = customerNameInput.value;
  const address = shippingAddressInput.value;

  if (cart.length === 0) return;

  // Disable button during api calls
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Processing...';

  try {
    // For single product-endpoint backend, checkout the first item in cart
    const primaryItem = cart[0];

    const orderPayload = {
      productId: primaryItem.id,
      quantity: primaryItem.quantity,
      customerName: name,
      shippingAddress: address,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      showToast(data.error || 'Failed to place order.');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Pay Now';
      return;
    }

    const { order, razorpayOrder } = data;

    if (razorpayOrder) {
      // Trigger actual Razorpay Checkout SDK
      const options = {
        key: razorpayOrder.key || 'rzp_test_mockkey', // In case key is passed
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Skateboard Store',
        description: `Order Purchase - ${primaryItem.name}`,
        order_id: razorpayOrder.id,
        handler: async function (rzpResponse) {
          // Verification
          await verifyPayment(order.orderId, rzpResponse);
        },
        prefill: {
          name: name,
          email: user.email,
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function () {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<span class="rzp-logo-text">Razorpay</span> Secure Checkout';
            showToast('Payment window closed.');
          }
        }
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
    } else {
      // Bypass / Sandbox mode when Razorpay credentials are not configured on server
      showToast('No payment gateway keys configured. Simulating secure payment...');
      setTimeout(async () => {
        const dummyRzpDetails = {
          orderId: order.orderId,
          razorpay_order_id: `fake_rzp_order_${Date.now()}`,
          razorpay_payment_id: `fake_rzp_pay_${Date.now()}`,
          isBypass: true
        };
        await verifyPayment(order.orderId, dummyRzpDetails);
      }, 1500);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Failed to checkout. Server is not responding.');
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = '<span class="rzp-logo-text">Razorpay</span> Secure Checkout';
  }
});

async function verifyPayment(orderId, paymentDetails) {
  try {
    const payload = {
      orderId,
      razorpay_order_id: paymentDetails.razorpay_order_id,
      razorpay_payment_id: paymentDetails.razorpay_payment_id,
      razorpay_signature: paymentDetails.razorpay_signature || '',
      isBypass: paymentDetails.isBypass || false
    };

    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      showToast(data.error || 'Payment validation failed.');
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = '<span class="rzp-logo-text">Razorpay</span> Secure Checkout';
      return;
    }

    // Success! Clear cart, close drawer, and show success
    cart = [];
    localStorage.removeItem('fh_cart');
    updateCartBadge();

    cartDrawer.setAttribute('hidden', '');
    resetCheckoutViewState();

    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = '<span class="rzp-logo-text">Razorpay</span> Secure Checkout';

    showToast('Success! Your purchase is confirmed.');
    window.location.hash = '#profile';
  } catch (error) {
    console.error('Verification error:', error);
    showToast('Error verifying payment.');
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = '<span class="rzp-logo-text">Razorpay</span> Secure Checkout';
  }
}

// ==========================================
// 9. PROFILE & ORDER HISTORY
// ==========================================
async function loadProfilePage() {
  const list = document.getElementById('orderHistoryList');
  if (!list) return;

  updateAuthUI();
  renderLoadingCards(list, 2, 'skeleton-card order-skeleton');
  renderProfileWishlist(true);

  try {
    await loadWishlist();
    renderProfileWishlist();

    const response = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const ordersList = await response.json();

    if (!response.ok) {
      list.innerHTML = `<p class="empty-orders-msg">Failed to load order history: ${ordersList.error}</p>`;
      return;
    }

    if (ordersList.length === 0) {
      list.innerHTML = `<p class="empty-orders-msg">No purchases recorded yet.</p>`;
      return;
    }

    list.innerHTML = ordersList.map(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      return `
        <div class="order-card-item">
          <div class="order-card-header">
            <span>Placed: <strong>${dateStr}</strong></span>
            <span>ID: <strong>${order.orderId.slice(0, 8)}...</strong></span>
            <span>Client: <strong>${order.customerName}</strong></span>
          </div>
          <div class="order-card-body">
            <div class="order-prod-info">
              <h4>${order.productName || 'Organic Apparel'}</h4>
              <p>Qty: ${order.quantity} | Total paid: $${order.total.toFixed(2)}</p>
              <p style="font-size:0.7rem; color:var(--text-tertiary);">Address: ${order.shippingAddress}</p>
            </div>
            <div>
              <span class="order-status-badge ${order.status}">${order.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    list.innerHTML = `<p class="empty-orders-msg">Unable to reach the history database.</p>`;
  }
}

function renderProfileWishlist(isLoading = false) {
  const container = document.getElementById('profileWishlistList');
  if (!container) return;

  if (isLoading) {
    renderLoadingCards(container, 3, 'skeleton-card wishlist-skeleton');
    return;
  }

  const savedProducts = wishlist
    .map(productId => products.find(product => product.id === productId))
    .filter(Boolean);

  if (savedProducts.length === 0) {
    container.innerHTML = `<p class="empty-orders-msg">No saved favorites yet.</p>`;
    return;
  }

  container.innerHTML = savedProducts.map(product => `
    <div class="wishlist-profile-card" onclick="viewProductDetail('${product.id}')">
      <div class="wishlist-profile-image" style="${product.image ? `background-image: url('${escapeStyleUrl(product.image)}')` : ''}">
        ${escapeHtml(truncateText(product.name, 32))}
      </div>
      <div class="wishlist-profile-info">
        <span>${escapeHtml((product.category || 'Gear').toUpperCase())}</span>
        <h3 title="${escapeAttribute(product.name)}">${escapeHtml(truncateText(product.name, 40))}</h3>
        <p>${formatMoney(product.price, product.currency)}</p>
      </div>
      <button class="remove-wishlist-btn" type="button" onclick="event.stopPropagation(); toggleWishlist('${product.id}', this)">Remove</button>
    </div>
  `).join('');
}

// ==========================================
// 10. COOKIE PREFERENCES
// ==========================================
function initCookiePreferences() {
  // Load saved preferences from localStorage
  const savedPrefs = JSON.parse(localStorage.getItem('fh_cookiePrefs')) || {
    performance: true,
    marketing: true,
    analytics: true
  };

  // Set initial toggle states
  const performanceToggle = document.getElementById('performanceCookiesToggle');
  const marketingToggle = document.getElementById('marketingCookiesToggle');
  const analyticsToggle = document.getElementById('analyticsCookiesToggle');

  if (performanceToggle) performanceToggle.checked = savedPrefs.performance;
  if (marketingToggle) marketingToggle.checked = savedPrefs.marketing;
  if (analyticsToggle) analyticsToggle.checked = savedPrefs.analytics;

  // Save Preferences Button
  const savePreferencesBtn = document.getElementById('savePreferencesBtn');
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', () => {
      const prefs = {
        performance: performanceToggle ? performanceToggle.checked : true,
        marketing: marketingToggle ? marketingToggle.checked : true,
        analytics: analyticsToggle ? analyticsToggle.checked : true
      };
      localStorage.setItem('fh_cookiePrefs', JSON.stringify(prefs));
      showToast('Cookie preferences saved successfully.');
    });
  }

  // Reject Non-Essential Button
  const rejectAllBtn = document.getElementById('rejectAllBtn');
  if (rejectAllBtn) {
    rejectAllBtn.addEventListener('click', () => {
      if (performanceToggle) performanceToggle.checked = false;
      if (marketingToggle) marketingToggle.checked = false;
      if (analyticsToggle) analyticsToggle.checked = false;

      const prefs = {
        performance: false,
        marketing: false,
        analytics: false
      };
      localStorage.setItem('fh_cookiePrefs', JSON.stringify(prefs));
      showToast('Non-essential cookies disabled.');
    });
  }

  // Accept All Button
  const acceptAllBtn = document.getElementById('acceptAllBtn');
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', () => {
      if (performanceToggle) performanceToggle.checked = true;
      if (marketingToggle) marketingToggle.checked = true;
      if (analyticsToggle) analyticsToggle.checked = true;

      const prefs = {
        performance: true,
        marketing: true,
        analytics: true
      };
      localStorage.setItem('fh_cookiePrefs', JSON.stringify(prefs));
      showToast('All cookies enabled.');
    });
  }
}

// ==========================================
// 11. COOKIE CONSENT BANNER
// ==========================================
const cookieBanner = document.getElementById('cookieBanner');
const cookieManageBtn = document.getElementById('cookieManageBtn');
const cookieRejectBtn = document.getElementById('cookieRejectBtn');
const cookieAcceptAllBtn = document.getElementById('cookieAcceptAllBtn');

// Show banner on first visit or if preferences not set
if (cookieBanner) {
  const hasConsented = localStorage.getItem('fh_cookieConsent');
  if (!hasConsented) {
    setTimeout(() => {
      cookieBanner.removeAttribute('hidden');
    }, 1500);
  }
}

if (cookieManageBtn) {
  cookieManageBtn.addEventListener('click', () => {
    cookieBanner.setAttribute('hidden', '');
    window.location.hash = '#cookies';
  });
}

if (cookieRejectBtn) {
  cookieRejectBtn.addEventListener('click', () => {
    const prefs = {
      performance: false,
      marketing: false,
      analytics: false
    };
    localStorage.setItem('fh_cookiePrefs', JSON.stringify(prefs));
    localStorage.setItem('fh_cookieConsent', 'true');
    cookieBanner.setAttribute('hidden', '');
    showToast('Non-essential cookies disabled.');
  });
}

if (cookieAcceptAllBtn) {
  cookieAcceptAllBtn.addEventListener('click', () => {
    const prefs = {
      performance: true,
      marketing: true,
      analytics: true
    };
    localStorage.setItem('fh_cookiePrefs', JSON.stringify(prefs));
    localStorage.setItem('fh_cookieConsent', 'true');
    cookieBanner.setAttribute('hidden', '');
    showToast('All cookies enabled.');
  });
}

// ==========================================
// 12. VIDEO CINEMATIC OVERLAY
// ==========================================
const playVideoButton = document.getElementById('playVideoButton');
const videoModal = document.getElementById('videoModal');
const closeVideoModal = document.getElementById('closeVideoModal');
const cinematicVideo = document.getElementById('cinematicVideo');

if (playVideoButton && videoModal && closeVideoModal && cinematicVideo) {
  playVideoButton.addEventListener('click', () => {
    videoModal.removeAttribute('hidden');
    cinematicVideo.play().catch(e => console.log('Autoplay blocked:', e));
  });

  closeVideoModal.addEventListener('click', () => {
    videoModal.setAttribute('hidden', '');
    cinematicVideo.pause();
    cinematicVideo.currentTime = 0;
  });
}
