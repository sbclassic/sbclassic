
const ALLOWED_ORIGIN = "https://sbclassic.github.io";
const CALLBACK_URL =
  "https://sbclassic.github.io/sbclassic/checkout.html?payment=return";

// Prices in naira. Add all your current products here before going live.
// Names must match the product names stored in your cart exactly.
const CATALOG = {
  "Classic Designer Slides": 109000,
  "Stylish Android Glasses": 64000,
  "Elegant 2pcs Sets": 179000,
  "Simple Classy Jackets": 74900,
  "Versace Sneaker Black/White": 178000,
  "Luxury LV Dress Shoe": 179900,
  "Luxury Prada Half Shoe": 159900
};

function reply(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin":
        origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

function clean(value, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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

    if (!env.PAYSTACK_SECRET_KEY) {
      return reply({ error: "Payment service is not configured." }, 503, origin);
    }

    // Create a Paystack checkout with a server-calculated amount.
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

      if (
        !name || !phone || !delivery ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return reply(
          { error: "Enter your name, valid email, phone and delivery address." },
          400, origin
        );
      }

      if (!items.length || items.length > 50) {
        return reply({ error: "Your cart is empty or invalid." }, 400, origin);
      }

      let totalNGN = 0;
      const verifiedItems = [];

      for (const item of items) {
        const productName = clean(item.name, 180);
        const quantity = Number(item.quantity || 1);
        const priceNGN = CATALOG[productName];

        if (
          !productName ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 20
        ) {
          return reply({ error: "Invalid product or quantity." }, 400, origin);
        }

        if (!Number.isSafeInteger(priceNGN) || priceNGN <= 0) {
          return reply({
            error: `“${productName}” is not enabled for online checkout yet.`
          }, 400, origin);
        }

        // Reject a browser-submitted price that differs from the catalog.
        if (Number(item.priceNGN ?? item.price) !== priceNGN) {
          return reply({
            error: `The price for “${productName}” needs updating. Remove it from your cart and add it again.`
          }, 400, origin);
        }

        totalNGN += priceNGN * quantity;

        verifiedItems.push({
          name: productName,
          quantity,
          unitPriceNGN: priceNGN,
          size: clean(item.size, 60),
          color: clean(item.color, 60)
        });
      }

      if (!Number.isSafeInteger(totalNGN) || totalNGN < 1) {
        return reply({ error: "Invalid order total." }, 400, origin);
      }

      const reference =
        "SBCLASSIC-" + crypto.randomUUID().replaceAll("-", "");

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

      const response = await fetch(
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

      const result = await response.json();

      if (!response.ok || !result.status ||
          !result.data?.authorization_url) {
        return reply({
          error: result.message || "Paystack could not start payment."
        }, 502, origin);
      }

      return reply({
        authorizationUrl: result.data.authorization_url,
        reference
      }, 200, origin);
    }

    // Verify the transaction with Paystack after the customer returns.
    if (request.method === "GET" && url.pathname === "/verify") {
      const reference = clean(url.searchParams.get("reference"), 120);

      if (!/^SBCLASSIC-[a-f0-9]{32}$/i.test(reference)) {
        return reply({ error: "Invalid payment reference." }, 400, origin);
      }

      const response = await fetch(
        "https://api.paystack.co/transaction/verify/" +
          encodeURIComponent(reference),
        {
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.status || !result.data) {
        return reply({ error: "Could not verify payment." }, 502, origin);
      }

      const tx = result.data;

      return reply({
        verified: tx.status === "success" && tx.currency === "NGN",
        status: tx.status,
        currency: tx.currency,
        amountNGN: Number(tx.amount) / 100,
        reference: tx.reference
      }, 200, origin);
    }

    return reply({ error: "Not found." }, 404, origin);
  }
};
    
