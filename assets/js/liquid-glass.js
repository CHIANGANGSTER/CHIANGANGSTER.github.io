/* Liquid-glass SVG displacement filter for workflow detail pages.
   Injects a single #liquid-glass-filter (idempotent) and fills its feImage
   with a generated displacement map. CSS references it via --wf-glass-filter. */
(() => {
  if (window.__kbLiquidGlass) return;
  window.__kbLiquidGlass = true;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const FILTER_ID = 'liquid-glass-filter';
  const IMAGE_ID = 'lg-disp-image';

  function ensureFilter() {
    // Avoid injecting a duplicate filter if one already exists in the DOM.
    if (document.getElementById(FILTER_ID)) {
      return document.getElementById(IMAGE_ID);
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';

    const defs = document.createElementNS(SVG_NS, 'defs');
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.setAttribute('id', FILTER_ID);
    filter.setAttribute('x', '-10%');
    filter.setAttribute('y', '-10%');
    filter.setAttribute('width', '120%');
    filter.setAttribute('height', '120%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const feImage = document.createElementNS(SVG_NS, 'feImage');
    feImage.setAttribute('id', IMAGE_ID);
    feImage.setAttribute('width', '100%');
    feImage.setAttribute('height', '100%');
    feImage.setAttribute('result', 'dispMap');

    const feDisp = document.createElementNS(SVG_NS, 'feDisplacementMap');
    feDisp.setAttribute('in', 'SourceGraphic');
    feDisp.setAttribute('in2', 'dispMap');
    feDisp.setAttribute('scale', '5');
    feDisp.setAttribute('xChannelSelector', 'R');
    feDisp.setAttribute('yChannelSelector', 'G');

    filter.appendChild(feImage);
    filter.appendChild(feDisp);
    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.appendChild(svg);

    return feImage;
  }

  function buildMap(feImage) {
    if (!feImage || feImage.dataset.lgReady === 'true') return;

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = (y * size + x) * 4;
        const wave = Math.sin(x * 0.14) * 18 + Math.cos(y * 0.16) * 18;
        data[i] = 128 + wave;
        data[i + 1] = 128 - wave;
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    feImage.setAttribute('href', canvas.toDataURL());
    feImage.dataset.lgReady = 'true';
  }

  function init() {
    buildMap(ensureFilter());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
