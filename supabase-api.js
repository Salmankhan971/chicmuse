async function supabaseRequest(path, options = {}) {
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${options.accessToken || SUPABASE_PUBLISHABLE_KEY}`,
    ...options.headers
  };

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function normalizeProduct(row) {
  return {
    id: row.id,
    name: row.title || row.name,
    category: row.category,
    description: row.description,
    price: row.price,
    image: row.image_url || row.image,
    link: row.affiliate_url || row.link || "#",
    images: row.extra_images || row.images || [],
    badge: row.badge || ""
  };
}

function productToRow(product) {
  return {
    title: product.name,
    category: product.category,
    description: product.description,
    price: product.price,
    image_url: product.image,
    affiliate_url: product.link || "#",
    extra_images: product.images || [],
    badge: product.badge || ""
  };
}

async function fetchProductsFromSupabase() {
  const rows = await supabaseRequest("/rest/v1/products?select=*&order=created_at.desc");
  return rows.map(normalizeProduct);
}

async function signInAdmin(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Wrong email or password.");
  }

  return response.json();
}

async function saveProductToSupabase(product, accessToken) {
  const row = productToRow(product);
  if (product.id && !String(product.id).startsWith("p")) {
    const rows = await supabaseRequest(`/rest/v1/products?id=eq.${product.id}&select=*`, {
      method: "PATCH",
      accessToken,
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(row)
    });
    return normalizeProduct(rows[0]);
  }

  const rows = await supabaseRequest("/rest/v1/products?select=*", {
    method: "POST",
    accessToken,
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(row)
  });
  return normalizeProduct(rows[0]);
}

async function deleteProductFromSupabase(id, accessToken) {
  await supabaseRequest(`/rest/v1/products?id=eq.${id}`, {
    method: "DELETE",
    accessToken
  });
}

async function uploadProductImage(file, accessToken) {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${Date.now()}-${safeName}`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: file
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Image upload failed.");
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`;
}
