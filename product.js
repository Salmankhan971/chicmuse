const demoProducts = [
  { id: "p1", name: "Blush Satin Midi Dress", category: "outfits", description: "A soft occasion dress with an expensive-looking drape.", price: "$42.00", image: "assets/images/dress.jpg", link: "#", images: [], badge: "NEW" },
  { id: "p2", name: "Cream Quilted Shoulder Bag", category: "handbags", description: "Polished structure, gold-tone detail and everyday space.", price: "$34.99", image: "assets/images/handbag.jpg", link: "#", images: [], badge: "BESTSELLER" },
  { id: "p3", name: "Pearl Detail Ballet Flats", category: "shoes", description: "Pretty flats for denim, dresses and coffee-date outfits.", price: "$29.50", image: "assets/images/shoes.jpg", link: "#", images: [], badge: "NEW" },
  { id: "p4", name: "Dainty Layered Necklace Set", category: "jewelry", description: "Delicate gold layers that make basics feel intentional.", price: "$18.99", image: "assets/images/jewelry.jpg", link: "#", images: [], badge: "" },
  { id: "p5", name: "Soft Knit Matching Set", category: "outfits", description: "Cozy, feminine and styled in seconds for off-duty days.", price: "$49.00", image: "assets/images/knit-set.jpg", link: "#", images: [], badge: "BESTSELLER" },
  { id: "p6", name: "Rose Gold Hoop Earrings", category: "jewelry", description: "Lightweight shine with a romantic everyday finish.", price: "$14.99", image: "assets/images/jewelry.jpg", link: "#", images: [], badge: "" },
  { id: "p7", name: "Minimal Beige Crossbody", category: "handbags", description: "Clean lines and neutral color for every weekly outfit.", price: "$31.00", image: "assets/images/hero.jpg", link: "#", images: [], badge: "NEW" },
  { id: "p8", name: "Silky Hair Bow Clip", category: "accessories", description: "A soft finishing piece for ponytails, waves and buns.", price: "$9.99", image: "assets/images/outfit.jpg", link: "#", images: [], badge: "" }
];

const productDetail = document.querySelector("#productDetail");
const relatedList = document.querySelector("#relatedList");
const params = new URLSearchParams(window.location.search);
let products = JSON.parse(localStorage.getItem("chicmuse-products") || JSON.stringify(demoProducts));
let product = products.find((item) => item.id === params.get("id")) || products[0];

function categoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function renderProduct() {
  document.title = `${product.name} | ChicMuse Fashion Finds`;
  const affiliateLink = product.link || "#";
  const gallery = [product.image, ...(product.images || [])].filter(Boolean);

  productDetail.innerHTML = `
    <div class="detail-gallery">
      <img class="detail-main-image" src="${product.image}" alt="${product.name}" />
      ${gallery.length > 1 ? `<div class="detail-thumbs">${gallery.map((image) => `<img src="${image}" alt="${product.name} alternate view" />`).join("")}</div>` : ""}
    </div>
    <div class="detail-copy">
      ${product.badge ? `<span class="badge detail-badge">${product.badge}</span>` : ""}
      <p class="eyebrow">${categoryLabel(product.category)}</p>
      <h1>${product.name}</h1>
      <p>${product.description}</p>
      <strong class="detail-price">${product.price}</strong>
      <a class="primary-cta" href="${affiliateLink}" target="_blank" rel="nofollow sponsored noopener">VIEW DEAL →</a>
      <p class="affiliate-note">This button can point to Amazon or any affiliate product page.</p>
    </div>
  `;
}

function renderRelated() {
  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 6);
  const fallback = products.filter((item) => item.id !== product.id).slice(0, 6);
  const items = related.length ? related : fallback;

  relatedList.innerHTML = items.map((item) => `
    <article class="related-item">
      <a href="product.html?id=${encodeURIComponent(item.id)}" target="_blank" rel="noopener">
        <img src="${item.image}" alt="${item.name}" />
      </a>
      <div>
        <a href="product.html?id=${encodeURIComponent(item.id)}" target="_blank" rel="noopener"><strong>${item.name}</strong></a>
        <span>${categoryLabel(item.category)} - ${item.price}</span>
        <a class="shop-now" href="${item.link || "#"}" target="_blank" rel="nofollow sponsored noopener">SHOP NOW →</a>
      </div>
    </article>
  `).join("");
}

async function loadProductPage() {
  try {
    products = await fetchProductsFromSupabase();
    localStorage.setItem("chicmuse-products", JSON.stringify(products));
    product = products.find((item) => item.id === params.get("id")) || product || products[0];
  } catch (error) {
    console.warn("Using cached/demo products until Supabase setup is complete.", error);
  }

  renderProduct();
  renderRelated();
}

loadProductPage();
