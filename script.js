// HexHub JS with Icon Nav + Palworld hook

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const links = document.querySelector('.nav-links');
  const backdrop = document.getElementById('navBackdrop');

  function setActiveNavLink(){
    const all = document.querySelectorAll('.nav-links a');
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    all.forEach(a => {
      const target = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
      a.classList.toggle('active', path === target);
    });
  }
  setActiveNavLink();

  function closeMenu(){
    if (links) links.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    if (menuBtn) menuBtn.setAttribute('aria-expanded','false');
  }

  if (menuBtn && links){
    menuBtn.addEventListener('click', () => {
      const isOpen = links.classList.toggle('show');
      if (backdrop) backdrop.classList.toggle('show', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  if (links) links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });

  // Palworld status fetch (if the elements exist on this page)
  const badge = document.getElementById('palworld-badge');
  if (badge){
    fetch('/.netlify/functions/palworld-status')
      .then(r => r.json())
      .then(data => {
        const detailsEl = document.getElementById('palworld-details');
        const status = (data && (data.status || (data.online ? 'online' : 'offline'))) || 'unknown';
        if (status === 'online'){
          badge.textContent = 'Online';
          badge.classList.remove('neutral','offline'); badge.classList.add('online');
        } else if (status === 'offline'){
          badge.textContent = 'Offline';
          badge.classList.remove('neutral','online'); badge.classList.add('offline');
        } else {
          badge.textContent = 'Unknown';
          badge.classList.remove('online','offline'); badge.classList.add('neutral');
        }
        if (detailsEl){
          const ip = data?.ip || data?.host || '';
          const port = data?.port || '';
          const name = data?.name || 'Palworld Server';
          const players = data?.players;
          let line = name;
          if (ip && port) line += ` — ${ip}:${port}`;
          if (players && (players.current !== undefined)) line += ` — Players: ${players.current}${players.max ? '/'+players.max : ''}`;
          detailsEl.textContent = line;
        }
      })
      .catch(_ => {
        badge.textContent = 'Unknown';
        badge.classList.remove('online','offline'); badge.classList.add('neutral');
      });
  }
});

/** Server Status Placeholder */
