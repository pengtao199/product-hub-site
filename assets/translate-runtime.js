(function () {
  var STORAGE_KEY = "product_hub_lang";
  var SOURCE_LANG = "zh-CN";
  var TARGET_LANG = "en";
  var TRANSLATE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/translate.js/4.0.0/translate.js";
  var BRAND_NAMES = ["HelloCode", "Product Hub", "Peng Tao", "AppPad", "MockPaper", "FyPix", "CapLingo"];
  var translatePromise;

  function preloadTranslate() {
    if (!translatePromise) {
      translatePromise = loadScript(TRANSLATE_CDN)
        .then(configureTranslate)
        .catch(function (error) {
          translatePromise = null;
          console.warn("Translation library failed to load:", error.message);
          return null;
        });
    }
    return translatePromise;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (existing.dataset.loaded === "true") resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.loaded = "false";
      script.onload = function () {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) === TARGET_LANG ? TARGET_LANG : SOURCE_LANG;
  }

  function setButtonLabel(lang) {
    var button = document.getElementById("lang-toggle");
    if (!button) return;

    button.classList.add("notranslate");
    button.setAttribute("data-no-translate", "");
    button.setAttribute("translate", "no");
    button.textContent = "";
    button.setAttribute("data-lang-label", lang === TARGET_LANG ? "中" : "EN");
    button.setAttribute("aria-label", lang === TARGET_LANG ? "切换到中文" : "Switch to English");
  }

  function setButtonBusy(isBusy) {
    var button = document.getElementById("lang-toggle");
    if (!button) return;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  function markStableText() {
    document.querySelectorAll("code, pre, [data-no-translate], .notranslate").forEach(function (el) {
      el.classList.add("notranslate");
    });
  }

  function markBrandNames() {
    if (!document.body) return;

    var pattern = new RegExp("(" + BRAND_NAMES.map(function (name) {
      return name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    }).join("|") + ")", "g");
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    var node;

    while ((node = walker.nextNode())) {
      if (node.parentElement && !node.parentElement.closest("script, style, .notranslate, [data-no-translate]")) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(function (textNode) {
      if (!pattern.test(textNode.nodeValue)) {
        pattern.lastIndex = 0;
        return;
      }

      pattern.lastIndex = 0;
      var fragment = document.createDocumentFragment();
      var parts = textNode.nodeValue.split(pattern);

      parts.forEach(function (part) {
        if (BRAND_NAMES.indexOf(part) !== -1) {
          var brand = document.createElement("span");
          brand.className = "notranslate";
          brand.setAttribute("data-no-translate", "");
          brand.textContent = part;
          fragment.appendChild(brand);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });
  }

  function configureTranslate() {
    var api = window.translate;
    if (!api) return;

    try {
      if (api.language && typeof api.language.setLocal === "function") {
        api.language.setLocal("chinese_simplified");
      }
      if (api.service && typeof api.service.use === "function") {
        api.service.use("client.edge");
      }
      if (api.selectLanguageTag) {
        api.selectLanguageTag.show = false;
      }
    } catch (error) {
      console.warn("Translation setup failed:", error.message);
    }
  }

  function applyTranslate(lang) {
    document.documentElement.lang = lang === TARGET_LANG ? "en" : SOURCE_LANG;
    setButtonLabel(lang);
    markStableText();
    markBrandNames();

    if (lang !== TARGET_LANG) {
      if (window.translate && typeof window.translate.reset === "function") {
        window.translate.reset({ selectLanguageRefreshRender: false });
      }
      return Promise.resolve();
    }

    return preloadTranslate().then(function () {
      var api = window.translate;
      if (!api) return;
      try {
        if (typeof api.changeLanguage === "function") {
          api.changeLanguage("english");
        } else if (typeof api.execute === "function") {
          api.execute();
        }
      } catch (error) {
        console.warn("Translation failed:", error.message);
      }
    });
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    setButtonBusy(true);
    return applyTranslate(lang).finally(function () {
      setButtonBusy(false);
    });
  }

  window.ProductHubTranslate = {
    getLang: getLang,
    setLang: setLang,
    refresh: function () {
      return applyTranslate(getLang());
    }
  };

  window.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("lang-toggle");
    if (button) {
      button.addEventListener("click", function () {
        var nextLang = getLang() === TARGET_LANG ? SOURCE_LANG : TARGET_LANG;
        setLang(nextLang);
      });
    }
    applyTranslate(getLang());

    var warmup = window.requestIdleCallback || function (callback) {
      window.setTimeout(callback, 300);
    };
    warmup(function () {
      preloadTranslate();
    });
  });
})();
