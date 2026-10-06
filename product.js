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

// WebP responsive variants for bundled local images (TASK 19).
const WEBP_SRCSET = {
  "assets/images/hero.jpg": "assets/images/hero-400.webp 400w, assets/images/hero-800.webp 800w, assets/images/hero.webp 900w",
  "assets/images/dress.jpg": "assets/images/dress-400.webp 400w, assets/images/dress.webp 650w",
  "assets/images/outfit.jpg": "assets/images/outfit-400.webp 400w, assets/images/outfit.webp 650w",
  "assets/images/knit-set.jpg": "assets/images/knit-set-400.webp 400w, assets/images/knit-set.webp 650w",
  "assets/images/handbag.jpg": "assets/images/handbag-400.webp 400w, assets/images/handbag.webp 650w",
  "assets/images/shoes.jpg": "assets/images/shoes-400.webp 400w, assets/images/shoes.webp 650w",
  "assets/images/jewelry.jpg": "assets/images/jewelry-400.webp 400w, assets/images/jewelry.webp 650w"
};
function webpSrcsetAttrs(localPath, sizes) {
  const set = WEBP_SRCSET[localPath];
  return set ? ` srcset="${set}" sizes="${sizes}"` : "";
}

// SEO: clean product URL slug — must match tools/prerender.js productSlug() exactly.
function productSlug(p) {
  const name = String(p.name || "fashion-find").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "fashion-find";
  return `${name}-${String(p.id).slice(0, 8)}`;
}
function isUuid(id) {
  const s = String(id || "");
  return s.length >= 32 && s.includes("-");
}

// SEO: keep alt text descriptive and under 125 characters.
function altText(value) {
  const text = String(value || "ChicMuse fashion find");
  return text.length > 125 ? text.slice(0, 125).replace(/\s+\S*$/, "") : text;
}

// SEO: keep social share tags in sync with the displayed product.
function setSocialMeta(p, pageTitle, pageDesc) {
  const siteUrl = "https://chicmuse.saadsdam55.workers.dev";
  const productUrl = isUuid(p.id)
    ? `${siteUrl}/products/${productSlug(p)}`
    : `${siteUrl}/product.html?id=${encodeURIComponent(p.id)}`;
  const imgUrl = /^https?:\/\//i.test(p.image || "")
    ? p.image
    : `${siteUrl}/${p.image || "assets/images/og-default.jpg"}`;
  const set = (attr, name, content) => {
    const el = document.querySelector(`meta[${attr}="${name}"]`);
    if (el) el.setAttribute("content", content);
  };
  set("property", "og:title", pageTitle);
  set("property", "og:description", pageDesc);
  set("property", "og:url", productUrl);
  set("property", "og:image", imgUrl);
  set("name", "twitter:title", pageTitle);
  set("name", "twitter:description", pageDesc);
  set("name", "twitter:image", imgUrl);
  // SEO: dynamic Product JSON-LD for the legacy ?id= page (static pages have it baked in).
  const siteUrlLd = "https://chicmuse.saadsdam55.workers.dev";
  const ldImg = /^https?:\/\//i.test(p.image || "") ? p.image : `${siteUrlLd}/${p.image || "assets/images/og-default.jpg"}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: ldImg,
    description: pageDesc,
    brand: { "@type": "Brand", name: "ChicMuse" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: String(p.price || "").replace(/[^0-9.]/g, "") || "0",
      availability: "https://schema.org/InStock"
    }
  };
  let ldEl = document.querySelector('script[data-product-schema]');
  if (!ldEl) {
    ldEl = document.createElement("script");
    ldEl.type = "application/ld+json";
    ldEl.setAttribute("data-product-schema", "true");
    document.head.appendChild(ldEl);
  }
  ldEl.textContent = JSON.stringify(schema).replace(/<\/script/gi, "<\\/script");
}
// SEO: unique meta description per product, 140-160 chars, keyword + CTA.
function metaDescription(p) {
  const cta = "Shop now at ChicMuse.";
  let base = `${p.name || "Fashion find"} — ${p.description || ""}`.trim();
  if ((base + " " + cta).length < 140 && p.category) {
    base += ` Discover affordable ${categoryLabel(p.category).toLowerCase()} for women, curated for her.`;
  }
  const maxBase = 160 - cta.length - 1;
  if (base.length > maxBase) {
    base = base.slice(0, maxBase).replace(/\s+\S*$/, "");
  }
  return `${base} ${cta}`;
}

function renderProduct() {
  // SEO: unique title per product, 50-60 chars, keyword first, brand last.
  const brandSuffix = " | ChicMuse";
  const maxBaseLen = 60 - brandSuffix.length;
  let base = product.name || "Fashion Find";
  // Enrich short names with the category so the title reaches 50+ chars.
  if ((base + brandSuffix).length < 50 && product.category) {
    base = `${base} - ${categoryLabel(product.category)} for Women`;
  }
  if (base.length > maxBaseLen) {
    base = base.slice(0, maxBaseLen).replace(/\s+\S*$/, "").replace(/[^a-zA-Z0-9]+$/, "");
  }
  document.title = `${base}${brandSuffix}`;
  const canonicalUrl = isUuid(product.id)
    ? `https://chicmuse.saadsdam55.workers.dev/products/${productSlug(product)}`
    : `https://chicmuse.saadsdam55.workers.dev/product.html?id=${encodeURIComponent(product.id)}`;
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.href = canonicalUrl;
  const descMeta = document.querySelector('meta[name="description"]');
  const pageDesc = metaDescription(product);
  if (descMeta) descMeta.content = pageDesc;
  setSocialMeta(product, document.title, pageDesc);
  const affiliateLink = product.link || "#";
  const gallery = [product.image, ...(product.images || [])].filter(Boolean);

  productDetail.innerHTML = `
    <div class="detail-gallery">
      <img class="detail-main-image" src="${product.image}"${webpSrcsetAttrs(product.image, "(max-width: 640px) 100vw, 560px")} alt="${altText(product.name)}" fetchpriority="high" />
      ${gallery.length > 1 ? `<div class="detail-thumbs">${gallery.map((image) => `<img src="${image}" alt="${altText(`${product.name} alternate view`)}" />`).join("")}</div>` : ""}
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

  const itemHref = (item) => isUuid(item.id)
    ? `products/${productSlug(item)}`
    : `product.html?id=${encodeURIComponent(item.id)}`;
  relatedList.innerHTML = items.map((item) => `
    <article class="related-item">
      <a href="${itemHref(item)}" target="_blank" rel="noopener">
        <img src="${item.image}" alt="${altText(item.name)}" />
      </a>
      <div>
        <a href="${itemHref(item)}" target="_blank" rel="noopener"><strong>${item.name}</strong></a>
        <span>${categoryLabel(item.category)} - ${item.price}</span>
        <a class="shop-now" href="${item.link || "#"}" target="_blank" rel="nofollow sponsored noopener">SHOP NOW →</a>
      </div>
    </article>
  `).join("");
}

async function loadProductPage() {
  // TASK 15: legacy ?id= URLs redirect (301-equivalent) to the clean static page.
  const legacyId = params.get("id");
  if (legacyId && isUuid(legacyId)) {
    const legacyProduct = products.find((item) => item.id === legacyId);
    if (legacyProduct) {
      window.location.replace(`products/${productSlug(legacyProduct)}`);
      return;
    }
  }
  try {
    products = await fetchProductsFromSupabase();
    localStorage.setItem("chicmuse-products", JSON.stringify(products));
    product = products.find((item) => item.id === params.get("id")) || product || products[0];
    // Retry redirect with fresh catalog if the cached list missed it.
    if (legacyId && isUuid(legacyId)) {
      const fresh = products.find((item) => item.id === legacyId);
      if (fresh) {
        window.location.replace(`products/${productSlug(fresh)}`);
        return;
      }
    }
  } catch (error) {
    console.warn("Using cached/demo products until Supabase setup is complete.", error);
  }

  renderProduct();
  renderRelated();
}

loadProductPage();
