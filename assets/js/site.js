/* Shared shell. Paths resolve from this script so nested pages and GitHub
   project repositories work without hard-coded domain or repository names. */
(() => {
  const root = new URL('../../', document.currentScript.src);
  const url = (path = '') => new URL(path, root).href;
  const pages = [
    ['home', 'Home', ''],
    ['about', 'About us', 'about/'],
    ['projects', 'Projects', 'projects/'],
    ['events', 'Events', 'events/'],
    ['education', 'Education', 'education/'],
    ['media', 'Media', 'media/'],
    ['contact', 'Contact us', 'contact/'],
  ];
  const current = document.body.dataset.page;
  document.querySelector('#site-header').innerHTML = `
    <div class="container header-inner">
      <a class="brand" href="${url()}">
        <img class="brand-logo" src="${url('assets/images/wqc-logo.png')}" alt="Western Quantum Club Logo" width="44" height="44">
        <span>Western Quantum Club<small>Western University · London, ON</small></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Menu</button>
      <nav id="main-nav" class="nav-links" aria-label="Main navigation">
        ${pages.map(([id, label, path]) => `<a href="${url(path)}"${id === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      </nav>
    </div>`;
  document.querySelector('#site-footer').innerHTML = `
    <div class="container footer-inner">
      <div>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem;">
          <img src="${url('assets/images/wqc-logo.png')}" alt="Western Quantum Club Logo" width="32" height="32" style="border-radius:50%;object-fit:cover;">
          <strong>Western Quantum Club</strong>
        </div>
        <p>Western University · London, Ontario, Canada</p>
        <p>© ${new Date().getFullYear()} Western Quantum Club</p>
      </div>
      <div class="footer-links">
        <a href="${url('contact/')}">Get in touch</a>
        <a href="https://www.westernquantumclub.ca/">Current Wix website</a>
      </div>
    </div>`;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeMenu(); toggle.focus(); }
  });
})();
