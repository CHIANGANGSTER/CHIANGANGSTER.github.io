(function () {
  var root;
  var modalImage;

  function ensureModal() {
    root = document.getElementById('image-modal-root');
    if (root) {
      modalImage = root.querySelector('.image-modal__image');
      return root;
    }

    root = document.createElement('div');
    root.id = 'image-modal-root';
    root.className = 'image-modal__root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');

    var backdrop = document.createElement('div');
    backdrop.className = 'image-modal__backdrop';

    modalImage = document.createElement('img');
    modalImage.className = 'image-modal__image';
    modalImage.alt = '';

    root.appendChild(backdrop);
    root.appendChild(modalImage);
    document.body.appendChild(root);
    return root;
  }

  function openModal(sourceImage) {
    ensureModal();
    modalImage.src = sourceImage.getAttribute('data-full') || sourceImage.currentSrc || sourceImage.src;
    modalImage.alt = sourceImage.alt || '';
    root.setAttribute('data-open', 'true');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('image-modal-open');
    document.body.classList.add('image-modal-open');
  }

  function closeModal() {
    if (!root || root.getAttribute('data-open') !== 'true') return;
    root.removeAttribute('data-open');
    root.setAttribute('aria-hidden', 'true');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
    document.documentElement.classList.remove('image-modal-open');
    document.body.classList.remove('image-modal-open');
  }

  function isBackdropTarget(target) {
    return target === root || Boolean(target.classList && target.classList.contains('image-modal__backdrop'));
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest ? event.target.closest('img[data-image-modal]') : null;
    if (trigger) {
      event.preventDefault();
      openModal(trigger);
      return;
    }

    if (!root || root.getAttribute('data-open') !== 'true') return;
    if (isBackdropTarget(event.target)) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeModal();
  });

  document.addEventListener('wheel', function (event) {
    if (!root || root.getAttribute('data-open') !== 'true') return;
    if (isBackdropTarget(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });

  document.addEventListener('touchmove', function (event) {
    if (!root || root.getAttribute('data-open') !== 'true') return;
    if (isBackdropTarget(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive: false });
})();
