(function () {
  var words = ["Code", "World", "Apps", "Ideas"];
  var wordIndex = 0;
  var wordElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wait(duration) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, duration);
    });
  }

  function render(word) {
    if (wordElement) wordElement.textContent = word;
  }

  async function typeLoop() {
    if (!wordElement || reduceMotion) return;

    render(words[wordIndex]);
    await wait(1800);

    var current = words[wordIndex];
    while (current.length > 0) {
      current = current.slice(0, -1);
      render(current);
      await wait(75);
    }

    wordIndex = (wordIndex + 1) % words.length;
    var next = words[wordIndex];
    for (var index = 0; index < next.length; index += 1) {
      render(next.slice(0, index + 1));
      await wait(115);
    }

    await wait(900);
    typeLoop();
  }

  window.addEventListener("DOMContentLoaded", function () {
    wordElement = document.getElementById("typing-word");
    if (!wordElement) return;
    if (reduceMotion) render(words[0]);
    else typeLoop();
  });
})();
