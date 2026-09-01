(() => {
  const KEY = 'mivek-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const buttons = [...document.querySelectorAll('[data-theme-option]')];
  const header = document.querySelector('.site-header');
  const mobileMenu = document.querySelector('.mobile-nav');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function resolved(choice) {
    return choice === 'auto' ? (media.matches ? 'dark' : 'light') : choice;
  }

  function apply(choice, persist = false) {
    const safeChoice = ['light', 'dark', 'auto'].includes(choice) ? choice : 'auto';
    const actualTheme = resolved(safeChoice);
    document.documentElement.dataset.themeChoice = safeChoice;
    document.documentElement.dataset.theme = actualTheme;
    if (persist) localStorage.setItem(KEY, safeChoice);

    if (themeMeta) themeMeta.setAttribute('content', actualTheme === 'dark' ? '#0f0d14' : '#4f16c7');

    buttons.forEach((button) => {
      const active = button.dataset.themeOption === safeChoice;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  apply(localStorage.getItem(KEY) || 'auto');

  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.themeOption, true));
  });

  media.addEventListener?.('change', () => {
    if ((localStorage.getItem(KEY) || 'auto') === 'auto') apply('auto');
  });

  // Compact the fixed header only after the visitor starts scrolling.
  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  // Close the mobile menu after choosing a destination and support Escape.
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => { mobileMenu.open = false; });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.open) {
        mobileMenu.open = false;
        mobileMenu.querySelector('summary')?.focus();
      }
    });
  }

  // Highlight the current section in the homepage desktop navigation.
  const sectionLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]:not(.nav-button)')];
  if ('IntersectionObserver' in window && sectionLinks.length) {
    const linkById = new Map(sectionLinks.map((link) => [link.getAttribute('href').slice(1), link]));
    const sections = [...linkById.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => link.classList.remove('is-active'));
      linkById.get(visible.target.id)?.classList.add('is-active');
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .08, .2, .45] });

    sections.forEach((section) => observer.observe(section));
  }
})();
