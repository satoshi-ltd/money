(() => {
  const KEY = 'money-design-theme';

  function paint(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    for (const button of document.querySelectorAll('[data-kit-theme]')) {
      button.setAttribute('aria-pressed', String(button.dataset.kitTheme === theme));
    }
    const computed = getComputedStyle(document.documentElement);
    for (const swatch of document.querySelectorAll('[data-token]')) {
      const code = swatch.querySelector('code');
      if (code) code.textContent = computed.getPropertyValue(`--${swatch.dataset.token}`).trim() || 'unset';
    }
  }

  function initial() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      /* storage blocked */
    }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kit-theme]');
    if (!button) return;
    try {
      localStorage.setItem(KEY, button.dataset.kitTheme);
    } catch {
      /* storage blocked */
    }
    paint(button.dataset.kitTheme);
  });

  paint(initial());
})();
