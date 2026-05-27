const selectedProductElement = document.getElementById('selectedProduct');
const orderForm = document.getElementById('orderForm');
const orderButton = document.getElementById('orderButton');
const orderMessage = document.getElementById('orderMessage');
const productIdInput = document.getElementById('productId');
const customerNameInput = document.getElementById('customerName');
const shippingAddressInput = document.getElementById('shippingAddress');
const quantityInput = document.getElementById('quantity');

// Navigation hover and keyboard handling
const navItems = document.querySelectorAll('.nav-item');
const navLinks = document.querySelectorAll('.nav-link-with-menu');

// Close all submenus when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-item')) {
    navItems.forEach(item => {
      item.style.pointerEvents = 'auto';
    });
  }
});

// Keyboard navigation
navItems.forEach((item) => {
  const link = item.querySelector('a');
  const submenu = item.querySelector('.nav-submenu');

  if (link) {
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && submenu) {
        e.preventDefault();
        const firstLink = submenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
      if (e.key === 'Escape' && submenu) {
        item.style.pointerEvents = 'none';
        setTimeout(() => {
          item.style.pointerEvents = 'auto';
        }, 0);
      }
    });
  }
});

// Search functionality
const searchBtn = document.getElementById('searchBtn');
const closeSearch = document.getElementById('closeSearch');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', () => {
  searchModal.removeAttribute('hidden');
  searchInput.focus();
});

closeSearch.addEventListener('click', () => {
  searchModal.setAttribute('hidden', '');
});

searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) {
    searchModal.setAttribute('hidden', '');
  }
});

let products = [];
let selectedProduct = null;

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    products = await response.json();
    renderCarousel();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function renderCarousel() {
  const carouselTrack = document.getElementById('carouselTrack');
  carouselTrack.innerHTML = products
    .map(
      (product) => `
      <div class="carousel-card">
        <div class="carousel-card-image">${product.name}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="carousel-card-footer">
          <span class="carousel-card-price">$${product.price.toFixed(2)}</span>
          <button class="carousel-card-btn" onclick="selectProduct('${product.id}')">+</button>
        </div>
      </div>`
    )
    .join('');
}

// Carousel navigation
const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');

const scrollAmount = 270;

carouselPrev.addEventListener('click', () => {
  carouselTrack.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth',
  });
});

carouselNext.addEventListener('click', () => {
  carouselTrack.scrollBy({
    left: scrollAmount,
    behavior: 'smooth',
  });
});

// Update button states based on scroll position
function updateCarouselButtons() {
  const isAtStart = carouselTrack.scrollLeft === 0;
  const isAtEnd = carouselTrack.scrollLeft + carouselTrack.clientWidth >= carouselTrack.scrollWidth - 1;

  // Keep buttons always enabled but adjust opacity for visual feedback
  carouselPrev.style.opacity = isAtStart ? '0.6' : '1';
  carouselNext.style.opacity = isAtEnd ? '0.6' : '1';
}

carouselTrack.addEventListener('scroll', updateCarouselButtons);
window.addEventListener('resize', updateCarouselButtons);

// Initial button state
updateCarouselButtons();

window.selectProduct = (id) => {
  selectedProduct = products.find((product) => product.id === id);
  if (!selectedProduct) return;

  selectedProductElement.innerHTML = `
    <strong>${selectedProduct.name}</strong>
    <p>${selectedProduct.description}</p>
    <p><strong>$${selectedProduct.price.toFixed(2)}</strong></p>
  `;

  productIdInput.value = selectedProduct.id;
  orderButton.disabled = false;
  orderMessage.textContent = '';
  orderMessage.style.color = '';
};

orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedProduct) {
    orderMessage.textContent = 'Please select a product first.';
    orderMessage.style.color = '#ff3b30';
    return;
  }

  const orderData = {
    productId: productIdInput.value,
    customerName: customerNameInput.value,
    shippingAddress: shippingAddressInput.value,
    quantity: parseInt(quantityInput.value, 10),
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      orderMessage.textContent = error.error || 'Failed to place order.';
      orderMessage.style.color = '#ff3b30';
      return;
    }

    const order = await response.json();
    orderMessage.style.color = '#34c759';
    orderMessage.textContent = `Order confirmed! Order #${order.id.slice(0, 8)}…`;
    orderForm.reset();
    orderButton.disabled = true;
    selectedProductElement.innerHTML = 'Select a product to begin.';
    selectedProduct = null;
  } catch (error) {
    orderMessage.textContent = 'Unable to place order right now.';
    orderMessage.style.color = '#ff3b30';
  }
});

loadProducts();
