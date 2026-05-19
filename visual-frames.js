(function () {
  var DESIGN_WIDTH = 1920;
  var DESIGN_HEIGHT = 1080;
  var frames = [];

  function resizeFrame(frame) {
    var wrap = frame.closest(".visual-embed");
    if (!wrap) return;
    var width = wrap.clientWidth;
    if (!width) return;
    var scale = width / DESIGN_WIDTH;
    wrap.style.height = Math.round(DESIGN_HEIGHT * scale) + "px";
    frame.style.width = DESIGN_WIDTH + "px";
    frame.style.height = DESIGN_HEIGHT + "px";
    frame.style.transform = "scale(" + scale + ")";
  }

  function resizeAll() {
    frames.forEach(resizeFrame);
  }

  function init() {
    frames = Array.prototype.slice.call(document.querySelectorAll(".visual-embed iframe"));
    frames.forEach(function (frame) {
      resizeFrame(frame);
      frame.addEventListener("load", function () {
        resizeFrame(frame);
      });
    });
    window.addEventListener("resize", resizeAll, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
