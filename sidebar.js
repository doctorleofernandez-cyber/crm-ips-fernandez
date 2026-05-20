(function () {

  /* ── ACORDEÓN DE SECCIONES ── */
  document.querySelectorAll('.nav-section').forEach(function (section) {
    var items = [];
    var el = section.nextElementSibling;
    while (el && !el.classList.contains('nav-section') && !el.classList.contains('nav-divider')) {
      if (el.classList.contains('nav-item')) items.push(el);
      el = el.nextElementSibling;
    }
    if (items.length === 0) return;

    var chevron = document.createElement('span');
    chevron.className = 'section-chevron';
    chevron.textContent = '▾';
    section.appendChild(chevron);

    var key = 'sec_' + section.textContent.trim().replace(/[^a-zA-Z0-9]/g, '_');
    var closed = localStorage.getItem(key) === 'closed';

    function applySection(c) {
      closed = c;
      section.classList.toggle('closed', c);
      items.forEach(function (i) { i.classList.toggle('section-hidden', c); });
      localStorage.setItem(key, c ? 'closed' : 'open');
    }
    applySection(closed);

    section.addEventListener('click', function () { applySection(!closed); });
  });


  /* ── HOVER EXPAND + BOTÓN PIN ── */
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  var btn  = document.getElementById('sidebar-toggle');
  var main = document.querySelector('.main');

  // Estado inicial: colapsado por defecto
  var pinned = localStorage.getItem('sidebarPinned') === 'true';

  function setMargin(expanded) {
    if (main) main.style.marginLeft = expanded ? '220px' : '68px';
  }

  function applyPin(p) {
    pinned = p;
    if (p) {
      sidebar.classList.remove('collapsed');
      setMargin(true);
      if (btn) btn.title = 'Colapsar menú';
    } else {
      sidebar.classList.add('collapsed');
      setMargin(false);
      if (btn) btn.title = 'Anclar menú abierto';
    }
    localStorage.setItem('sidebarPinned', p);
  }

  // Aplicar sin animación al cargar
  sidebar.style.transition = 'none';
  applyPin(pinned);
  requestAnimationFrame(function () { sidebar.style.transition = ''; });

  // Botón pin: alterna entre anclado y colapsado
  if (btn) {
    btn.addEventListener('click', function () { applyPin(!pinned); });
  }

  // Hover: expandir el margen del main cuando el sidebar se agranda
  sidebar.addEventListener('mouseenter', function () {
    if (!pinned) setMargin(true);
  });
  sidebar.addEventListener('mouseleave', function () {
    if (!pinned) setMargin(false);
  });


  /* ── MENÚ MÓVIL (OFF-CANVAS) ── */
  // En pantallas pequeñas el menú está fuera de pantalla; un botón
  // hamburguesa lo despliega encima del contenido, con una capa oscura detrás.

  // Botón hamburguesa
  var hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'mobile-menu-btn';
  hamburger.setAttribute('aria-label', 'Abrir menú');
  hamburger.innerHTML = '☰';
  // iOS Safari a veces ignora clicks en botones creados por JS si no tienen
  // un handler inline. onclick="void(0)" garantiza que el toque dispare el click.
  hamburger.setAttribute('onclick', 'void(0)');

  // Capa oscura (overlay)
  var overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';

  document.body.appendChild(hamburger);
  document.body.appendChild(overlay);

  function openMobileMenu() {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('show');
    hamburger.innerHTML = '✕';
    hamburger.setAttribute('aria-label', 'Cerrar menú');
  }

  function closeMobileMenu() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Abrir menú');
  }

  function toggleMobileMenu(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (sidebar.classList.contains('mobile-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  // Delegación global: capturamos el toque en TODO el documento y, si cae
  // sobre el botón hamburguesa o la capa oscura, reaccionamos. Esto evita
  // problemas de iOS con elementos creados por JS que a veces no reciben
  // el evento click directamente.
  document.addEventListener('touchend', function (e) {
    var t = e.target;
    if (t && (t === hamburger || (t.closest && t.closest('.mobile-menu-btn')))) {
      e.preventDefault();
      toggleMobileMenu();
      return;
    }
    if (t && (t === overlay || (t.closest && t.closest('.sidebar-overlay')))) {
      e.preventDefault();
      closeMobileMenu();
    }
  }, { passive: false });

  // Tocar la capa oscura cierra el menú (escritorio)
  overlay.addEventListener('click', closeMobileMenu);

  // Al navegar (tocar un enlace del menú) se cierra solo
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    item.addEventListener('click', closeMobileMenu);
  });

  // Si se agranda la ventana a escritorio, cerrar el menú móvil
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) closeMobileMenu();
  });

})();
