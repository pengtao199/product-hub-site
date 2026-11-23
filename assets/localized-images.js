(function () {
  var SOURCE_LANG = "zh";

  function currentLang() {
    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    return lang.indexOf("en") === 0 ? "en" : SOURCE_LANG;
  }

  function apply() {
    var lang = currentLang();

    document.querySelectorAll("[data-shot-zh]").forEach(function (el) {
      var next = el.getAttribute("data-shot-" + lang) || el.getAttribute("data-shot-zh");
      if (next && el.getAttribute("src") !== next) {
        el.setAttribute("src", next);
      }
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    apply();

    if (window.MutationObserver) {
      new MutationObserver(apply).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
      });
    }
  });
})();
