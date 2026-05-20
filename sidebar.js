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

  // Click normal (escritorio + iOS)
  hamburger.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', closeMobileMenu);

  // Refuerzo solo en el botón hamburguesa y la capa oscura: en iOS Safari
  // el touchend dispara el toggle antes que el click sintético. Anotamos
  // los listeners en los elementos concretos (no en document) para no
  // interferir con los toques sobre los enlaces del menú.
  hamburger.addEventListener('touchend', function (e) {
    e.preventDefault();
    toggleMobileMenu();
  }, { passive: false });

  overlay.addEventListener('touchend', function (e) {
    e.preventDefault();
    closeMobileMenu();
  }, { passive: false });

  // Al tocar un enlace del menú en móvil: navegar de forma fiable en iOS.
  // En iPhone el click sintético sobre un <a> dentro de un sidebar con
  // transform/animación no siempre se dispara, así que respondemos al
  // touchend (que sí llega) y forzamos la navegación con window.location.
  // El click se queda como respaldo para escritorio y navegadores que no
  // disparen touchend.
  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    var yaNavegando = false;

    function navegar(e) {
      if (yaNavegando) return;
      if (!sidebar.classList.contains('mobile-open')) return;
      var href = item.getAttribute('href');
      if (!href || href === '#' || href.charAt(0) === '#') {
        closeMobileMenu();
        return;
      }
      yaNavegando = true;
      if (e && e.preventDefault) e.preventDefault();
      window.location.href = href;
    }

    item.addEventListener('touchend', navegar, { passive: false });
    item.addEventListener('click', navegar);
  });

  // Si se agranda la ventana a escritorio, cerrar el menú móvil
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) closeMobileMenu();
  });

})();
