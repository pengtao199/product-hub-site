(function () {
  var metadataPromise;
  var METADATA_EVENT = "producthub:storemetadata";
  var METADATA_URL = (function () {
    var script = document.currentScript;
    if (script && script.src) {
      return new URL("app-store-metadata.json", script.src).toString();
    }
    return "assets/app-store-metadata.json";
  })();

  function getMetadataUrl() {
    return METADATA_URL;
  }

  function getLang() {
    var lang = document.documentElement.getAttribute("lang") || "zh";
    return lang.toLowerCase().indexOf("en") === 0 ? "en" : "zh";
  }

  function loadMetadata() {
    if (!metadataPromise) {
      metadataPromise = fetch(getMetadataUrl(), { cache: "force-cache" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Failed to load App Store metadata");
          }
          return response.json();
        });
    }
    return metadataPromise;
  }

  function chooseLocale(product, lang) {
    if (!product || !product.locales) return null;
    return product.locales[lang] || product.locales.zh || product.locales.en || null;
  }

  function setImage(el, locale) {
    var url = locale.artworkUrl512 || locale.artworkUrl100;
    if (!url) return;
    el.setAttribute("src", url);
    if (locale.trackName) {
      el.setAttribute("alt", locale.trackName);
    }
  }

  function setFavicon(el, locale) {
    var url = locale.artworkUrl100 || locale.artworkUrl512;
    if (!url) return;
    el.setAttribute("href", url);
    el.setAttribute("type", "image/jpeg");
  }

  function setStoreUrl(el, locale) {
    if (locale.trackViewUrl) {
      el.setAttribute("href", locale.trackViewUrl);
    }
  }

  function setStoreName(el, locale) {
    if (locale.trackName) {
      el.innerText = locale.trackName;
    }
  }

  function applyMetadata(metadata) {
    var lang = getLang();

    document.querySelectorAll("[data-store-product][data-store-field]").forEach(function (el) {
      var productKey = el.getAttribute("data-store-product");
      var field = el.getAttribute("data-store-field");
      var product = metadata.products && metadata.products[productKey];
      var locale = chooseLocale(product, lang);
      if (!locale) return;

      if (field === "icon") setImage(el, locale);
      if (field === "favicon") setFavicon(el, locale);
      if (field === "url") setStoreUrl(el, locale);
      if (field === "name") setStoreName(el, locale);
    });

    window.dispatchEvent(new CustomEvent(METADATA_EVENT, { detail: { lang: lang } }));
  }

  function refresh() {
    loadMetadata()
      .then(applyMetadata)
      .catch(function (error) {
        console.warn(error.message);
      });
  }

  window.addEventListener("DOMContentLoaded", function () {
    refresh();

    var langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        window.setTimeout(refresh, 0);
      });
    }
  });
})();
