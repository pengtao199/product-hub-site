(function () {
  var THEME_KEY = "product_hub_theme";
  var DARK = "dark";
  var LIGHT = "light";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) === DARK ? DARK : LIGHT;
  }

  function setButtonLabel(theme) {
    var button = document.getElementById("theme-toggle");
    if (!button) return;

    button.classList.add("notranslate");
    button.setAttribute("data-no-translate", "");
    button.setAttribute("translate", "no");
    button.textContent = theme === DARK ? "☀" : "☾";
    button.setAttribute("aria-label", theme === DARK ? "切换浅色模式" : "切换深色模式");
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    setButtonLabel(theme);
  }

  function setupNavMenu() {
    var topbar = document.querySelector(".home-topbar");
    var nav = document.querySelector(".home-nav");
    var actions = document.querySelector(".home-actions");
    if (!topbar || !nav || !actions || document.getElementById("nav-toggle")) return;

    if (!nav.id) nav.id = "site-nav";

    var button = document.createElement("button");
    button.id = "nav-toggle";
    button.type = "button";
    button.className = "home-action-button home-nav-toggle notranslate";
    button.setAttribute("aria-label", "打开导航菜单");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", nav.id);
    button.setAttribute("data-no-translate", "");
    button.setAttribute("translate", "no");

    for (var i = 0; i < 3; i += 1) {
      var bar = document.createElement("span");
      bar.className = "home-nav-toggle-bar";
      button.appendChild(bar);
    }

    actions.insertBefore(button, actions.firstChild);
    document.documentElement.classList.add("has-nav-menu");

    function setOpen(open) {
      topbar.classList.toggle("is-nav-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!topbar.classList.contains("is-nav-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target && event.target.closest && event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (event) {
      if (!topbar.contains(event.target)) setOpen(false);
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("theme-toggle");
    applyTheme(getTheme());

    if (button) {
      button.addEventListener("click", function () {
        applyTheme(getTheme() === DARK ? LIGHT : DARK);
      });
    }

    setupNavMenu();
  });
})();
