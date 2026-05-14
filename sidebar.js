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

})();
