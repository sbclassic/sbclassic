
(function () {
  "use strict";

  const COLOURS = [
    "blue black", "blueblack", "army green", "dark grey",
    "dark gray", "light brown", "light green", "deep green",
    "midnight blue", "royal blue", "sea blue", "seablue",
    "orange", "apricot", "caramel", "coffee", "cream",
    "white", "black", "brown", "green", "grey", "gray",
    "khaki", "ash", "blue", "red", "gold", "silver",
    "mixed", "camel"
  ];

  function clean(text) {
    return text.toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function getColour(title) {
    const normalized = clean(title);

    for (const colour of COLOURS) {
      if (normalized.endsWith(" " + colour)) {
        return {
          colour: colour,
          base: normalized.slice(0, -(colour.length + 1)).trim()
        };
      }
    }

    return null;
  }

  function addGroupingStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .sb-variant-group { display: contents; }
      .sb-variant-group > .product.sb-hidden-variant {
        display: none !important;
      }
      .sb-colour-options {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin: 12px 0;
      }
      .sb-colour-options .sb-colour-button {
        border: 1px solid #b99a61;
        background: #fff;
        color: #111;
        padding: 8px 11px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .sb-colour-options .sb-colour-button[aria-pressed="true"] {
        background: #111;
        color: #fff;
        outline: 2px solid #b99a61;
      }
      .product img, .product video {
        cursor: zoom-in;
      }
      .sb-image-viewer {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(0,0,0,.92);
      }
      .sb-image-viewer.is-open { display: flex; }
      .sb-image-viewer img {
        max-width: 95vw;
        max-height: 88vh;
        object-fit: contain;
        cursor: zoom-out;
      }
      .sb-image-viewer button {
        position: absolute;
        top: 15px;
        right: 18px;
        border: 0;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        font-size: 28px;
        background: #b99a61;
        color: #111;
        cursor: pointer;
      }
      .sb-image-viewer .sb-viewer-caption {
        position: absolute;
        bottom: 12px;
        left: 15px;
        right: 15px;
        color: white;
        text-align: center;
        font-size: 13px;
      }
    `;

    document.head.appendChild(style);
  }

  function groupColourVariants() {
    document.querySelectorAll(".products, #products").forEach(function (grid) {
      const cards = Array.from(grid.querySelectorAll(":scope > .product"));
      const groups = new Map();

      cards.forEach(function (card) {
        const heading = card.querySelector("h3");
        if (!heading) return;

        const parsed = getColour(heading.textContent.trim());
        if (!parsed || !parsed.base) return;

        if (!groups.has(parsed.base)) groups.set(parsed.base, []);
        groups.get(parsed.base).push({
          card: card,
          colour: parsed.colour
        });
      });

      groups.forEach(function (items) {
        const distinctColours = new Set(items.map(function (item) {
          return item.colour;
        }));

        if (items.length < 2 || distinctColours.size < 2) return;

        const firstCard = items[0].card;
        const parent = firstCard.parentNode;
        const wrapper = document.createElement("div");
        wrapper.className = "sb-variant-group";

        parent.insertBefore(wrapper, firstCard);

        items.forEach(function (item, index) {
          wrapper.appendChild(item.card);

          if (index !== 0) {
            item.card.classList.add("sb-hidden-variant");
          }
        });

        const options = document.createElement("div");
        options.className = "sb-colour-options";
        options.setAttribute("aria-label", "Choose a colour");

        items.forEach(function (item, index) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "sb-colour-button";
          button.textContent = item.colour.replace(/\b\w/g, function (c) {
            return c.toUpperCase();
          });
          button.setAttribute("aria-pressed", index === 0 ? "true" : "false");

          button.addEventListener("click", function () {
            items.forEach(function (choice, choiceIndex) {
              choice.card.classList.toggle(
                "sb-hidden-variant",
                choiceIndex !== index
              );

              options.children[choiceIndex].setAttribute(
                "aria-pressed",
                choiceIndex === index ? "true" : "false"
              );
            });
          });

          options.appendChild(button);
        });

        firstCard.insertBefore(options, firstCard.querySelector("h3"));
        firstCard.dataset.sbVariantGroup = "true";
      });
    });
  }

  function enableImageViewer() {
    const viewer = document.createElement("div");
    viewer.className = "sb-image-viewer";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-modal", "true");
    viewer.setAttribute("aria-label", "Enlarged product image");

    const largeImage = document.createElement("img");
    largeImage.alt = "Enlarged product image";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close enlarged image");

    const caption = document.createElement("div");
    caption.className = "sb-viewer-caption";

    viewer.append(largeImage, closeButton, caption);
    document.body.appendChild(viewer);

    function closeViewer() {
      viewer.classList.remove("is-open");
      largeImage.removeAttribute("src");
    }

    closeButton.addEventListener("click", closeViewer);

    viewer.addEventListener("click", function (event) {
      if (event.target === viewer || event.target === largeImage) {
        closeViewer();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeViewer();
    });

    document.addEventListener("click", function (event) {
      const image = event.target.closest(".product img");
      if (!image) return;

      // Don't interfere with an image that is itself a link.
      if (image.closest("a")) return;

      event.preventDefault();
      largeImage.src = image.currentSrc || image.src;
      largeImage.alt = image.alt || "Enlarged product image";
      caption.textContent = image.alt || "";
      viewer.classList.add("is-open");
    });
  }

  function initialise() {
    addGroupingStyles();
    groupColourVariants();
    enableImageViewer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
  } else {
    initialise();
  }
})();
