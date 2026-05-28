// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('fh_cart')) || [];
let token = localStorage.getItem('fh_token') || null;
let user = JSON.parse(localStorage.getItem('fh_user')) || null;
let activeGenderFilter = 'all';
let activeCategoryFilter = '';
let activeSearchQuery = '';
import dns from "dns";
// Force Node.js to use reliable public DNS servers
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// DOM Elements
const body = document.body;
const toastNotification = document.getElementById('toastNotification');
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = darkModeToggle.querySelector('.sun-icon');
const moonIcon = darkModeToggle.querySelector('.moon-icon');

// Auth DOM
const authModal = document.getElementById('authModal');
const profileBtn = document.getElementById('profileBtn');
const userStatusBadge = document.getElementById('userStatusBadge');
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
const modalProductRatingStars = document.getElementById('modalProductRatingStars');
const modalProductRatingCount = document.getElementById('modalProductRatingCount');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductDescription = document.getElementById('modalProductDescription');
const modalProductSizes = document.getElementById('modalProductSizes');
const modalProductColors = document.getElementById('modalProductColors');
const modalAddToBagBtn = document.getElementById('modalAddToBagBtn');
let currentDetailProduct = null;
let selectedSize = '';
let selectedColor = '';

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
    targetSection.style.display = 'block';
    targetSection.classList.add('active');

    // Read parameters from link context if applicable
    const activeLink = document.querySelector(`.nav-link[href="#products"]`);
    if (activeLink) activeLink.classList.add('active');

    loadProductsPage();
  } else if (hash === '#offers') {
    const targetSection = document.getElementById('page-offers');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    document.querySelector('.nav-link[href="#offers"]').classList.add('active');
  } else if (hash === '#about') {
    const targetSection = document.getElementById('page-about');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    document.querySelector('.nav-link[href="#about"]').classList.add('active');
  } else if (hash === '#contact') {
    const targetSection = document.getElementById('page-contact');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    document.querySelector('.nav-link[href="#contact"]').classList.add('active');
  } else if (hash === '#profile') {
    if (!token) {
      window.location.hash = '#home';
      openAuth('login');
      showToast('Please sign in to view your profile.');
      return;
    }
    const targetSection = document.getElementById('page-profile');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    loadProfilePage();
  } else if (hash === '#privacy') {
    const targetSection = document.getElementById('page-privacy');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
  } else if (hash === '#terms') {
    const targetSection = document.getElementById('page-terms');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
  } else if (hash === '#cookies') {
    const targetSection = document.getElementById('page-cookies');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    initCookiePreferences();
  } else if (hash === '#accessibility') {
    const targetSection = document.getElementById('page-accessibility');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
  } else {
    // Default Home
    const targetSection = document.getElementById('page-home');
    targetSection.style.display = 'block';
    targetSection.classList.add('active');
    document.querySelector('.nav-link[href="#home"]').classList.add('active');
    renderHomeCarousel();
  }

  // Scroll to top
  window.scrollTo(0, 0);
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
      avatar.textContent = user.name ? user.name[0].toUpperCase() : 'U';
    }
    document.getElementById('profileUserName').textContent = user.name || 'Client Profile';
    document.getElementById('profileUserEmail').textContent = user.email || '';
    customerNameInput.value = user.name || '';
  } else {
    userStatusBadge.setAttribute('hidden', '');
    customerNameInput.value = '';
  }
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

// Bind triggers for auth toggling
closeAuthModal.addEventListener('click', () => authModal.setAttribute('hidden', ''));
toSignupLink.addEventListener('click', (e) => { e.preventDefault(); openAuth('signup'); });
toLoginLink.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); });

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

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
  }
});

// Signup Form Submit
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

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

    authModal.setAttribute('hidden', '');
    signupForm.reset();
    updateAuthUI();
    showToast(`Account created! Welcome, ${user.name}!`);

    window.location.hash = '#profile';
  } catch (error) {
    showToast('Server error. Please try again.');
  }
});

// Log Out
logoutBtn.addEventListener('click', () => {
  token = null;
  user = null;
  localStorage.removeItem('fh_token');
  localStorage.removeItem('fh_user');
  updateAuthUI();
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
async function initApp() {
  updateAuthUI();
  updateCartBadge();
  try {
    const response = await fetch('/api/products');
    products = await response.json();
    renderHomeCarousel();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function renderHomeCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track || products.length === 0) return;

  // Filter featured products or just select higher priced ones
  const featured = products.filter(p => p.featured || p.price > 45);

  track.innerHTML = featured.map(product => `
    <div class="carousel-card" onclick="viewProductDetail('${product.id}')">
      <div class="carousel-card-image" style="background-image: url('${product.image || ''}')">${!product.image ? product.name : ''}</div>
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <div class="carousel-card-footer">
        <span class="carousel-card-price">$${product.price.toFixed(2)}</span>
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
    filtered = filtered.filter(p => p.gender === activeGenderFilter);
    document.getElementById('catalogTitle').textContent = `${activeGenderFilter}'s Premium Essentials`;
  } else {
    document.getElementById('catalogTitle').textContent = 'Shop All Products';
  }

  if (activeCategoryFilter) {
    filtered = filtered.filter(p => p.category === activeCategoryFilter);
    document.getElementById('catalogTitle').textContent = `${activeCategoryFilter} Collection`;
  }

  if (activeSearchQuery) {
    const q = activeSearchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
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
    grid.innerHTML = `<p class="empty-cart-msg">No premium apparel matches your filters.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(product => `
    <div class="product-card" onclick="viewProductDetail('${product.id}')">
      <div class="product-card-image" style="background-image: url('${product.image || ''}')">
        ${!product.image ? product.name : ''}
      </div>
      <span class="product-card-badge">${product.gender.toUpperCase()} / ${product.category.toUpperCase()}</span>
      <h3>${product.name}</h3>
      <p class="product-card-desc">${product.description || ''}</p>
      <div class="product-card-meta">
        <span class="product-card-price">$${product.price.toFixed(2)}</span>
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
  selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
  selectedColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Standard';

  modalProductName.textContent = product.name;
  modalProductGender.textContent = `${product.gender.toUpperCase()} / ${product.category.toUpperCase()}`;
  modalProductPrice.textContent = `$${product.price.toFixed(2)}`;
  modalProductDescription.textContent = product.description || 'Crafted with premium materials for maximum durability and visual comfort.';
  modalProductRatingStars.textContent = '★'.repeat(Math.round(product.rating?.rate || 4.5)) + '☆'.repeat(5 - Math.round(product.rating?.rate || 4.5));
  modalProductRatingCount.textContent = `(${product.rating?.count || 24} client reviews)`;

  if (product.image) {
    modalProductImage.style.backgroundImage = `url('${product.image}')`;
    modalProductImage.textContent = '';
  } else {
    modalProductImage.style.backgroundImage = 'none';
    modalProductImage.textContent = product.name;
  }

  // Render Sizes
  const sizeList = product.sizes || ['S', 'M', 'L', 'XL'];
  modalProductSizes.innerHTML = sizeList.map(s => `
    <span class="size-chip ${s === selectedSize ? 'selected' : ''}" onclick="selectProductSize('${s}')">${s}</span>
  `).join('');

  // Render Colors
  const colorList = product.colors || ['Black', 'White', 'Navy'];
  modalProductColors.innerHTML = colorList.map(c => `
    <span class="color-chip ${c === selectedColor ? 'selected' : ''}" onclick="selectProductColor('${c}')">${c}</span>
  `).join('');

  productDetailModal.removeAttribute('hidden');
}

window.selectProductSize = (size) => {
  selectedSize = size;
  const chips = modalProductSizes.querySelectorAll('.size-chip');
  chips.forEach(c => {
    c.classList.remove('selected');
    if (c.textContent === size) c.classList.add('selected');
  });
};

window.selectProductColor = (color) => {
  selectedColor = color;
  const chips = modalProductColors.querySelectorAll('.color-chip');
  chips.forEach(c => {
    c.classList.remove('selected');
    if (c.textContent === color) c.classList.add('selected');
  });
};

closeProductDetailModal.addEventListener('click', () => {
  productDetailModal.setAttribute('hidden', '');
  currentDetailProduct = null;
});

// Add to Bag Button
modalAddToBagBtn.addEventListener('click', () => {
  if (!currentDetailProduct) return;

  const itemIndex = cart.findIndex(item =>
    item.id === currentDetailProduct.id &&
    item.size === selectedSize &&
    item.color === selectedColor
  );

  if (itemIndex > -1) {
    cart[itemIndex].quantity += 1;
  } else {
    cart.push({
      id: currentDetailProduct.id,
      name: currentDetailProduct.name,
      price: currentDetailProduct.price,
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
    cartSubtotal.textContent = '$0.00';
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  let total = 0;
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
        <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  cartSubtotal.textContent = `$${total.toFixed(2)}`;
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
        name: 'Fashion House',
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

  list.innerHTML = '<p class="empty-orders-msg">Loading client history...</p>';

  try {
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
