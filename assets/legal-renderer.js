(function () {
  var MINIGFM_CDN = "https://cdn.jsdelivr.net/npm/@oblivionocean/minigfm@1.0.8/dist/index.mjs";
  var parserPromise;
  var PRODUCTS = {
    apppad: "AppPad",
    caplingo: "CapLingo",
    fypix: "FyPix",
    mockpaper: "MockPaper"
  };
  function stripFrontmatter(markdown) {
    return markdown.replace(/^---[\s\S]*?---\s*/, "");
  }

  function parseFrontmatter(markdown) {
    var match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
    var metadata = {};
    if (!match) return { metadata: metadata, body: markdown };

    match[1].split(/\r?\n/).forEach(function (line) {
      var field = line.match(/^([a-zA-Z][\w-]*):\s*(.+)$/);
      if (field) metadata[field[1]] = field[2].trim();
    });

    return {
      metadata: metadata,
      body: stripFrontmatter(markdown)
    };
  }

  function loadParser() {
    if (!parserPromise) {
      parserPromise = import(MINIGFM_CDN).then(function (module) {
        return new module.MiniGFM({ unsafe: false });
      });
    }
    return parserPromise;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showError(message) {
    var content = document.getElementById("legal-content");
    if (!content) return;
    content.innerHTML = '<p class="legal-error">' + message + "</p>";
  }

  function getDocKey() {
    var params = new URLSearchParams(window.location.search);
    var queryDoc = params.get("doc");
    if (queryDoc) return queryDoc.replace(/^\/+|\/+$/g, "");

    var parts = window.location.pathname.split("/").filter(Boolean);
    if (parts[0] === "legal") return "";
    return parts.slice(0, 2).join("/");
  }

  function titleFromMarkdown(markdown, fallback) {
    var match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
  }

  function dateFromMarkdown(markdown) {
    var match = markdown.match(/^(最后更新时间|生效日期)：(.+)$/m);
    return match ? match[0].trim() : "";
  }

  function docFromKey(docKey) {
    var parts = docKey.split("/");
    var productKey = parts[0];
    var documentKey = parts[1];

    if (!PRODUCTS[productKey] || !/^[a-z0-9-]+$/.test(documentKey || "")) {
      return null;
    }

    return {
      product: PRODUCTS[productKey],
      path: "../" + productKey + "/" + documentKey + ".md",
      title: "",
      updatedAt: ""
    };
  }

  function render() {
    var docKey = getDocKey();
    var doc = docFromKey(docKey);
    if (!doc) {
      showError("未找到对应的协议文档。");
      return;
    }

    setText("legal-product", doc.product);

    fetch(doc.path, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Markdown document failed to load");
        return response.text();
      })
      .then(function (markdown) {
        return loadParser().then(function (parser) {
          var source = parseFrontmatter(markdown);
          return {
            parser: parser,
            markdown: source.body,
            metadata: source.metadata
          };
        });
      })
      .then(function (result) {
        var content = document.getElementById("legal-content");
        var title = titleFromMarkdown(result.markdown, doc.title);
        var updatedAt = dateFromMarkdown(result.markdown) || (result.metadata.updated ? "最后更新时间：" + result.metadata.updated : "");
        var bodyMarkdown = result.markdown.replace(/^#\s+.+(?:\r?\n|$)/, "");

        document.title = title ? doc.product + " | " + title : doc.product;
        setText("legal-title", title);
        setText("legal-updated", updatedAt);
        content.innerHTML = result.parser.parse(bodyMarkdown);
        content.querySelectorAll("ul, ol").forEach(function (list) {
          var isNumberedText = Array.prototype.some.call(list.querySelectorAll("li"), function (item) {
            return /^\s*\d+[.、)]/.test(item.textContent || "");
          });
          if (isNumberedText) list.classList.add("legal-numbered-list");
        });
        content.querySelectorAll("li").forEach(function (item) {
          var firstText = Array.prototype.find.call(item.childNodes, function (node) {
            return node.nodeType === Node.TEXT_NODE;
          });
          if (firstText) {
            firstText.nodeValue = firstText.nodeValue.replace(/^\s*[•·●]\s*/, "");
          }
        });
        content.querySelectorAll("a[href^='mailto:']").forEach(function (link) {
          link.classList.add("notranslate");
        });
        if (window.ProductHubTranslate) {
          window.ProductHubTranslate.refresh();
        }
      })
      .catch(function (error) {
        console.warn(error.message);
        showError("协议文档暂时无法加载，请稍后再试。");
      });
  }

  window.addEventListener("DOMContentLoaded", render);
})();
