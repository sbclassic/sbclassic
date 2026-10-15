
const ALLOWED_ORIGIN = "https://sbclassic.github.io";
const SITE_BASE = "https://sbclassic.github.io/sbclassic";
const CALLBACK_URL =
  `${SITE_BASE}/checkout.html?payment=return`;

const PRODUCT_PAGES = [
  { path: "/shoes.html", type: "cedi90" },
  { path: "/slippers-sandals.html", type: "mixed90" },
  { path: "/clothes.html", type: "cedi90" },
  { path: "/accessories.html", type: "naira" }
];

function reply(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin":
        origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      "Vary": "Origin"
    }
  });
}

function clean(value, max = 300) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function addProduct(catalog, name, rawPrice, type) {
  name = decodeEntities(clean(name, 180));

  const raw = Number(String(rawPrice).replace(/,/g, ""));

  if (!name || !Number.isFinite(raw) || raw <= 0) return;

  let priceNGN;

  // Preserve prices already in naira.
  if (type === "naira" || raw >= 10000) {
    priceNGN = Math.round(raw);
  } else if (type === "cedi90" || type === "mixed90") {
    // SB Classic pricing rule:
    // (original GHS price - 90) * 100
    priceNGN = Math.round((raw - 90) * 100);
  } else {
    return;
  }

  if (!Number.isSafeInteger(priceNGN) || priceNGN <= 0) return;

  if (!catalog[name]) catalog[name] = [];

  if (!catalog[name].includes(priceNGN)) {
    catalog[name].push(priceNGN);
  }
}

function parseDataProducts(html, type, catalog) {
  const pattern =
    /data-name=["']([^"']+)["'][\s\S]{0,300}?data-price=["']([\d,]+(?:\.\d+)?)/gi;

  for (const match of html.matchAll(pattern)) {
    addProduct(catalog, match[1], match[2], type);
  }
}

function parseInlineProducts(html, type, catalog) {
  // Read products defined as name and price in JavaScript objects.
  const pattern =
    /name:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")\s*,\s*price:\s*([\d,]+(?:\.\d+)?)/g;

  for (const match of html.matchAll(pattern)) {
    const name = (match[1] ?? match[2] ?? "")
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    addProduct(catalog, name, match[3], type);
  }

  // Handle names that append the selected option from a dropdown.
  const dynamicPattern =
    /name:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1\s*\+\s*document\.getElementById\(['"]([^'"]+)['"]\)\.value\s*,\s*price:\s*([\d,]+(?:\.\d+)?)/g;

  for (const match of html.matchAll(dynamicPattern)) {
    const prefix = match[2]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    const selectId = match[3];
    const rawPrice = match[4];

    const selectPattern = new RegExp(
      `<select\\b[^>]*\\bid=["']${selectId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>([\\s\\S]*?)<\\/select>`,
      "i"
    );

    const selectMatch = html.match(selectPattern);

    if (!selectMatch) continue;

    const optionPattern =
      /<option\b[^>]*\bvalue=["']([^"']+)["'][^>]*>/gi;

    for (const option of selectMatch[1].matchAll(optionPattern)) {
      const optionValue = decodeEntities(option[1]);

      addProduct(
        catalog,
        prefix + optionValue,
        rawPrice,
        type
      );
    }
  }
}

async function buildCatalog() {
  const catalog = Object.create(null);

  const pages = await Promise.all(
    PRODUCT_PAGES.map(async page => {
      const response = await fetch(SITE_BASE + page.path, {
        headers: { "Accept": "text/html" }
      });

      if (!response.ok) {
        throw new Error(`Could not load product page ${page.path}`);
      }

      return {
        ...page,
        html: await response.text()
      };
    })
  );

  for (const page of pages) {
    // Read data attributes and inline product objects.
    parseDataProducts(page.html, page.type, catalog);
    parseInlineProducts(page.html, page.type, catalog);
  }

  if (Object.keys(catalog).length === 0) {
    throw new Error("The product catalog could not be built.");
  }

  return catalog;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin":
            origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Vary": "Origin"
        }
      });
    }

    if (origin && origin !== ALLOWED_ORIGIN) {
      return reply({ error: "Origin not allowed." }, 403, origin);
    }

    // Inspect the catalog without starting a payment.
    if (request.method === "GET" && url.pathname === "/catalog") {
      try {
        const catalog = await buildCatalog();

        const products = Object.entries(catalog).map(
          ([name, pricesNGN]) => ({
            name,
            pricesNGN
          })
        );

        return reply({
          productNameCount: products.length,
          products
        }, 200, origin);
      } catch {
        return reply({
          error: "Could not read the live product catalog."
        }, 503, origin);
      }
    }

    if (url.pathname !== "/initialize" && url.pathname !== "/verify") {
      return reply({ error: "Not found." }, 404, origin);
    }

    if (!env.PAYSTACK_SECRET_KEY) {
      return reply({
        error: "Payment service is not configured."
      }, 503, origin);
    }

    if (request.method === "POST" && url.pathname === "/initialize") {
      let body;

      try {
        body = await request.json();
      } catch {
        return reply({ error: "Invalid request." }, 400, origin);
      }

      const customer = body.customer || {};
      const name = clean(customer.name, 120);
      const email = clean(customer.email, 254);
      const phone = clean(customer.phone, 40);
      const delivery = clean(customer.delivery, 500);
      const items = Array.isArray(body.items) ? body.items : [];

      if (!name || !validEmail(email) || !phone || !delivery) {
        return reply({
          error: "Enter your name, valid email, phone and delivery address."
        }, 400, origin);
      }

      if (items.length < 1 || items.length > 50) {
        return reply({
          error: "Your cart is empty or contains too many items."
        }, 400, origin);
      }

      let catalog;

      try {
        // Re-read the live product pages for every new checkout.
        catalog = await buildCatalog();
      } catch {
        return reply({
          error: "We could not verify the current product prices. Please try again later."
        }, 503, origin);
      }

      let totalNGN = 0;
      const verifiedItems = [];

      for (const item of items) {
        const productName = clean(item.name, 180);
        const quantity = Number(item.quantity || 1);
        const priceNGN = Number(item.priceNGN ?? item.price);
        const allowedPrices = catalog[productName];

        if (
          !productName ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 20
        ) {
          return reply({
            error: "A product name or quantity is invalid."
          }, 400, origin);
        }

        if (!allowedPrices || !allowedPrices.includes(priceNGN)) {
          return reply({
            error: `The current price for "${productName}" could not be matched to the live catalog. Remove it from your cart and add it again.`
          }, 400, origin);
        }

        totalNGN += priceNGN * quantity;

        if (!Number.isSafeInteger(totalNGN)) {
          return reply({ error: "Invalid order total." }, 400, origin);
        }

        verifiedItems.push({
          name: productName,
          quantity,
          unitPriceNGN: priceNGN,
          size: clean(item.size, 60),
          color: clean(item.color, 60)
        });
      }

      if (totalNGN < 1) {
        return reply({ error: "Invalid order total." }, 400, origin);
      }

      const reference =
        "SBCLASSIC-" + crypto.randomUUID().replace(/-/g, "");

      const payload = {
        email,
        amount: String(totalNGN * 100),
        currency: "NGN",
        reference,
        callback_url: CALLBACK_URL,
        metadata: {
          customer_name: name,
          phone,
          delivery_address: delivery,
          order_items: verifiedItems,
          order_total_ngn: totalNGN
        }
      };

      let response;
      let result;

      try {
        response = await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        result = await response.json();
      } catch {
        return reply({
          error: "Could not connect to Paystack. Please try again."
        }, 502, origin);
      }

      if (!response.ok || !result.status || !result.data?.authorization_url) {
        return reply({
          error: result.message || "Paystack could not start payment."
        }, 502, origin);
      }

      return reply({
        authorizationUrl: result.data.authorization_url,
        reference,
        amountNGN: totalNGN
      }, 200, origin);
    }

    if (request.method === "GET" && url.pathname === "/verify") {
      const reference = clean(url.searchParams.get("reference"), 120);

      if (!/^SBCLASSIC-[a-f0-9]{32}$/i.test(reference)) {
        return reply({ error: "Invalid payment reference." }, 400, origin);
      }

      let response;
      let result;

      try {
        response = await fetch(
          "https://api.paystack.co/transaction/verify/" +
            encodeURIComponent(reference),
          {
            headers: {
              Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
            }
          }
        );

        result = await response.json();
      } catch {
        return reply({
          error: "Could not connect to Paystack to verify payment."
        }, 502, origin);
      }

      if (!response.ok || !result.status || !result.data) {
        return reply({
          error: "Could not verify payment."
        }, 502, origin);
      }

      const tx = result.data;

      return reply({
        verified:
          tx.status === "success" &&
          tx.currency === "NGN" &&
          Number.isSafeInteger(Number(tx.amount)) &&
          Number(tx.amount) > 0,
        status: tx.status,
        currency: tx.currency,
        amountNGN: Number(tx.amount) / 100,
        reference: tx.reference
      }, 200, origin);
    }

    return reply({ error: "Method not allowed." }, 405, origin);
  }
};
