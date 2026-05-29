(function () {
  if (window.__kbLiquidGlass) return;
  window.__kbLiquidGlass = true;

  (function initLiquidGlassMap() {
    var feImage = document.getElementById('lg-disp-image');
    if (!feImage) return;
    var canvas = document.createElement('canvas');
    var size = 128;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(size, size);
    var data = imageData.data;
    for (var y = 0; y < size; y += 1) {
      for (var x = 0; x < size; x += 1) {
        var i = (y * size + x) * 4;
        var wave = Math.sin(x * 0.14) * 18 + Math.cos(y * 0.16) * 18;
        data[i] = 128 + wave;
        data[i + 1] = 128 - wave;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    feImage.setAttribute('href', canvas.toDataURL());
  })();
})();
