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

const loginPanel = document.querySelector("#loginPanel");
const adminWorkspace = document.querySelector("#adminWorkspace");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const productForm = document.querySelector("#productForm");
const adminList = document.querySelector("#adminList");
const resetForm = document.querySelector("#resetForm");
const resetProducts = document.querySelector("#resetProducts");

let products = loadProducts();
let adminSession = JSON.parse(sessionStorage.getItem("chicmuse-admin-session") || "null");

function loadProducts() {
  const saved = localStorage.getItem("chicmuse-products");
  return saved ? JSON.parse(saved) : demoProducts;
}

function saveProducts() {
  localStorage.setItem("chicmuse-products", JSON.stringify(products));
}

function isSignedIn() {
  return Boolean(adminSession?.access_token);
}

async function showWorkspace() {
  loginPanel.hidden = true;
  adminWorkspace.hidden = false;
  await loadAdminProducts();
}

function showLogin() {
  loginPanel.hidden = false;
  adminWorkspace.hidden = true;
}

function categoryLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  signIn();
});

async function signIn() {
  const user = document.querySelector("#adminUser").value.trim();
  const pass = document.querySelector("#adminPass").value;

  try {
    adminSession = await signInAdmin(user, pass);
    sessionStorage.setItem("chicmuse-admin-session", JSON.stringify(adminSession));
    loginForm.reset();
    loginMessage.textContent = "";
    await showWorkspace();
  } catch (error) {
    loginMessage.textContent = error.message || "Wrong email or password.";
  }
}

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("chicmuse-admin-session");
  adminSession = null;
  showLogin();
});

async function loadAdminProducts() {
  try {
    products = await fetchProductsFromSupabase();
    localStorage.setItem("chicmuse-products", JSON.stringify(products));
  } catch (error) {
    console.warn("Using demo/local products until Supabase setup is complete.", error);
  }
  renderAdminList();
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#productId").value || `p${Date.now()}`;
  const existingProduct = products.find((item) => item.id === id);
  const uploadedImage = document.querySelector("#productImageUpload").files[0];
  let image = document.querySelector("#productImage").value || existingProduct?.image || "assets/images/hero.jpg";
  if (uploadedImage) {
    image = adminSession?.access_token
      ? await uploadProductImage(uploadedImage, adminSession.access_token)
      : await fileToDataUrl(uploadedImage);
  }

  const product = {
    id,
    name: document.querySelector("#productName").value.trim(),
    category: document.querySelector("#productCategory").value,
    description: document.querySelector("#productDescription").value.trim(),
    price: document.querySelector("#productPrice").value.trim(),
    image,
    link: document.querySelector("#productLink").value.trim() || "#",
    images: document.querySelector("#productImages").value.split("\n").map((url) => url.trim()).filter(Boolean),
    badge: document.querySelector("#productBadge").value.trim().toUpperCase()
  };

  try {
    const savedProduct = await saveProductToSupabase(product, adminSession.access_token);
    products = products.some((item) => item.id === savedProduct.id)
      ? products.map((item) => item.id === savedProduct.id ? savedProduct : item)
      : [savedProduct, ...products];
  } catch (error) {
    alert(`Product save failed. Check Supabase setup.\n\n${error.message}`);
    return;
  }

  saveProducts();
  productForm.reset();
  document.querySelector("#productId").value = "";
  renderAdminList();
});

resetForm.addEventListener("click", () => {
  productForm.reset();
  document.querySelector("#productId").value = "";
});

resetProducts.addEventListener("click", () => {
  products = demoProducts;
  saveProducts();
  productForm.reset();
  document.querySelector("#productId").value = "";
  renderAdminList();
});

function fillProductForm(product) {
  document.querySelector("#productId").value = product.id;
  document.querySelector("#productName").value = product.name;
  document.querySelector("#productCategory").value = product.category;
  document.querySelector("#productDescription").value = product.description;
  document.querySelector("#productPrice").value = product.price;
  document.querySelector("#productImage").value = product.image.startsWith("data:") ? "Uploaded image saved in browser" : product.image;
  document.querySelector("#productLink").value = product.link || "";
  document.querySelector("#productImageUpload").value = "";
  document.querySelector("#productImages").value = (product.images || []).join("\n");
  document.querySelector("#productBadge").value = product.badge || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  deleteProductFromSupabase(id, adminSession.access_token)
    .then(() => {
      products = products.filter((product) => product.id !== id);
      saveProducts();
      renderAdminList();
    })
    .catch((error) => {
      alert(`Delete failed. Check Supabase setup.\n\n${error.message}`);
    });
}

function renderAdminList() {
  adminList.innerHTML = products.map((product) => `
    <article class="admin-item">
      <img src="${product.image}" alt="" />
      <div>
        <strong>${product.name}</strong>
        <small>${categoryLabel(product.category)} - ${product.price}</small>
      </div>
      <div>
        <button type="button" data-edit="${product.id}">Edit</button>
        <button type="button" data-delete="${product.id}">Delete</button>
      </div>
    </article>
  `).join("");

  adminList.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item.id === button.dataset.edit);
      if (product) fillProductForm(product);
    });
  });

  adminList.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteProduct(button.dataset.delete));
  });
}

if (isSignedIn()) {
  showWorkspace();
} else {
  showLogin();
}
