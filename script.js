const demoProducts = [
  {
    id: "p1",
    name: "Blush Satin Midi Dress",
    category: "outfits",
    description: "A soft occasion dress with an expensive-looking drape.",
    price: "$42.00",
    image: "assets/images/dress.jpg",
    link: "#",
    images: [],
    badge: "NEW"
  },
  {
    id: "p2",
    name: "Cream Quilted Shoulder Bag",
    category: "handbags",
    description: "Polished structure, gold-tone detail and everyday space.",
    price: "$34.99",
    image: "assets/images/handbag.jpg",
    link: "#",
    images: [],
    badge: "BESTSELLER"
  },
  {
    id: "p3",
    name: "Pearl Detail Ballet Flats",
    category: "shoes",
    description: "Pretty flats for denim, dresses and coffee-date outfits.",
    price: "$29.50",
    image: "assets/images/shoes.jpg",
    link: "#",
    images: [],
    badge: "NEW"
  },
  {
    id: "p4",
    name: "Dainty Layered Necklace Set",
    category: "jewelry",
    description: "Delicate gold layers that make basics feel intentional.",
    price: "$18.99",
    image: "assets/images/jewelry.jpg",
    link: "#",
    images: [],
    badge: ""
  },
  {
    id: "p5",
    name: "Soft Knit Matching Set",
    category: "outfits",
    description: "Cozy, feminine and styled in seconds for off-duty days.",
    price: "$49.00",
    image: "assets/images/knit-set.jpg",
    link: "#",
    images: [],
    badge: "BESTSELLER"
  },
  {
    id: "p6",
    name: "Rose Gold Hoop Earrings",
    category: "jewelry",
    description: "Lightweight shine with a romantic everyday finish.",
    price: "$14.99",
    image: "assets/images/jewelry.jpg",
    link: "#",
    images: [],
    badge: ""
  },
  {
    id: "p7",
    name: "Minimal Beige Crossbody",
    category: "handbags",
    description: "Clean lines and neutral color for every weekly outfit.",
    price: "$31.00",
    image: "assets/images/hero.jpg",
    link: "#",
    images: [],
    badge: "NEW"
  },
  {
    id: "p8",
    name: "Silky Hair Bow Clip",
    category: "accessories",
    description: "A soft finishing piece for ponytails, waves and buns.",
    price: "$9.99",
    image: "assets/images/outfit.jpg",
    link: "#",
    images: [],
    badge: ""
  }
];

const productGrid = document.querySelector("#productGrid");
const filterButtons = document.querySelectorAll(".filter");
const menuToggle = document.querySelector(".menu-toggle");
const mobilePanel = document.querySelector("#mobilePanel");
const searchModal = document.querySelector("#searchModal");
const searchOpen = document.querySelector("#searchOpen");
const searchClose = document.querySelector("#searchClose");
const searchInput = document.querySelector("#searchInput");
const searchResults = document.querySelector("#searchResults");
const newsletterForm = document.querySelector("#newsletterForm");
const formMessage = document.querySelector("#formMessage");

let currentFilter = "all";
let products = loadProducts();
let wishlist = JSON.parse(localStorage.getItem("chicmuse-wishlist") || "[]");

function loadProducts() {
  const saved = localStorage.getItem("chicmuse-products");
  return saved ? JSON.parse(saved) : demoProducts;
}

function saveProducts() {
  localStorage.setItem("chicmuse-products", JSON.stringify(products));
}

async function loadProductsForPublicSite() {
  try {
    products = await fetchProductsFromSupabase();
    localStorage.setItem("chicmuse-products", JSON.stringify(products));
  } catch (error) {
    console.warn("Using demo products until Supabase setup is complete.", error);
  }
  renderProducts();
}

function saveWishlist() {
  localStorage.setItem("chicmuse-wishlist", JSON.stringify(wishlist));
}

function categoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// SEO: keep alt text descriptive and under 125 characters.
function altText(value) {
  const text = String(value || "ChicMuse fashion find");
  return text.length > 125 ? text.slice(0, 125).replace(/\s+\S*$/, "") : text;
}

function productCard(product) {
  const liked = wishlist.includes(product.id) ? "active" : "";
  const badge = product.badge ? `<span class="badge">${product.badge}</span>` : "";
  const detailLink = `product.html?id=${encodeURIComponent(product.id)}`;
  // Fall back to the product detail page when no affiliate link exists yet.
  const productLink = product.link && product.link !== "#" ? product.link : detailLink;
  return `
    <article class="product-card">
      <div class="product-image">
        ${badge}
        <button class="heart-btn ${liked}" type="button" data-heart="${product.id}" aria-label="Save ${product.name} to wishlist">♡</button>
        <a href="${detailLink}" target="_blank" rel="noopener" aria-label="Open ${product.name} details">
          <img loading="lazy" src="${product.image}" alt="${altText(product.name)}" />
        </a>
      </div>
      <div class="product-body">
        <h3><a href="${detailLink}" target="_blank" rel="noopener">${product.name}</a></h3>
        <p>${product.description}</p>
        <span class="price">${product.price}</span>
        <a class="shop-now" href="${productLink}" target="_blank" rel="nofollow sponsored noopener" data-affiliate-ready="true">SHOP NOW →</a>
      </div>
    </article>
  `;
}

function renderProducts() {
  const visible = currentFilter === "all" ? products : products.filter((product) => product.category === currentFilter);
  productGrid.innerHTML = visible.map(productCard).join("");
  productGrid.querySelectorAll("[data-heart]").forEach((button) => {
    button.addEventListener("click", () => toggleWishlist(button.dataset.heart));
  });
}

function toggleWishlist(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter((item) => item !== id) : [...wishlist, id];
  saveWishlist();
  renderProducts();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderProducts();
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = mobilePanel.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobilePanel.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobilePanel.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

function openSearch() {
  searchModal.hidden = false;
  searchInput.focus();
  renderSearch("");
}

function closeSearch() {
  searchModal.hidden = true;
  searchInput.value = "";
}

function renderSearch(query) {
  const cleanQuery = query.trim().toLowerCase();
  const matches = products.filter((product) => {
    const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return !cleanQuery || haystack.includes(cleanQuery);
  }).slice(0, 6);

  searchResults.innerHTML = matches.length
    ? matches.map((product) => `
      <a class="search-result" href="product.html?id=${encodeURIComponent(product.id)}">
        <strong>${product.name}</strong>
        <span>${categoryLabel(product.category)} - ${product.price}</span>
      </a>
    `).join("")
    : "<p>No finds yet. Try another style word.</p>";
}

searchOpen.addEventListener("click", openSearch);
searchClose.addEventListener("click", closeSearch);
searchModal.addEventListener("click", (event) => {
  if (event.target === searchModal) closeSearch();
});
searchInput.addEventListener("input", () => renderSearch(searchInput.value));

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "You're in. Pretty finds are coming soon.";
  newsletterForm.reset();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearch();
  }
});

loadProductsForPublicSite();
