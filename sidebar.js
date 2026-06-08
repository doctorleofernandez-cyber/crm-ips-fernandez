/* ════════ SESIÓN ════════
   Cierra la sesión: borra la marca y vuelve al login. */
window.cerrarSesion = function () {
  localStorage.removeItem('crm_sesion');
  sessionStorage.removeItem('crm_sesion');
  localStorage.removeItem('crm_rol');
  sessionStorage.removeItem('crm_rol');
  localStorage.removeItem('crm_usuario');
  sessionStorage.removeItem('crm_usuario');
  location.href = 'index.html';
};

/* ════════ PERMISOS ════════
   Cada usuario tiene sus permisos individuales (configurables en Ajustes).
   Como respaldo, si no hay usuario, se usan los permisos por rol.
   (Seguridad "blanda": organiza el acceso; el blindaje real llega con Supabase.) */
var PERMISOS = {
  admin:         ['dashboard','contactos','calendario','comunicacion','facturacion','metas','reportes','marketing','ajustes'],
  marketing:     ['dashboard','contactos','calendario','comunicacion','reportes','marketing'],
  asistente:     ['dashboard','contactos','calendario','comunicacion'],
  recepcionista: ['dashboard','contactos','calendario','comunicacion'],
  auxiliar:      ['facturacion']
};
/* Lista maestra de módulos (para migrar permisos al agregar funciones nuevas). */
var TODOS_MODULOS = ['dashboard','contactos','calendario','comunicacion','facturacion','metas','reportes','marketing','ajustes'];

/* Migración: si un usuario guardado no tiene una clave de permiso nueva
   (p. ej. 'metas' recién creado), se la agregamos según su rol. Así no
   queda invisible un módulo nuevo para quien ya existía. */
(function migrarPermisos() {
  try {
    var users = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
    if (!Array.isArray(users) || !users.length) return;
    var cambio = false;
    users.forEach(function (u) {
      if (!u.permisos) return; // si no tiene, Ajustes lo crea completo
      var def = u.owner ? PERMISOS.admin : (PERMISOS[u.rol] || []);
      TODOS_MODULOS.forEach(function (k) {
        if (!(k in u.permisos)) { u.permisos[k] = def.indexOf(k) !== -1; cambio = true; }
      });
    });
    if (cambio) localStorage.setItem('usuarios_sistema', JSON.stringify(users));
  } catch (e) {}
})();
/* Lista de módulos permitidos para el usuario que inició sesión.
   Usa los permisos individuales del usuario; si no, cae al rol. */
function permisosActuales() {
  var uid = localStorage.getItem('crm_usuario') || sessionStorage.getItem('crm_usuario');
  if (uid) {
    try {
      var users = JSON.parse(localStorage.getItem('usuarios_sistema') || '[]');
      for (var i = 0; i < users.length; i++) {
        if (users[i].id === uid && users[i].permisos) {
          return Object.keys(users[i].permisos).filter(function (k) { return users[i].permisos[k]; });
        }
      }
    } catch (e) {}
  }
  return PERMISOS[rolActual()] || PERMISOS.admin;
}
var PAGINA_MODULO = {
  'index.html':'dashboard', 'dashboard.html':'dashboard',
  'pipeline.html':'contactos', 'contactos.html':'contactos', 'contacto-perfil.html':'contactos',
  'citas.html':'calendario',
  'chat.html':'comunicacion', 'correo.html':'comunicacion', 'chats-equipo.html':'comunicacion', 'plantillas.html':'comunicacion',
  'facturacion.html':'facturacion', 'reportes-facturacion.html':'facturacion',
  'metas.html':'metas',
  'reportes.html':'reportes', 'insights.html':'reportes',
  'difusiones.html':'marketing', 'bots.html':'marketing', 'agente-ia.html':'marketing',
  'ajustes.html':'ajustes'
};
function rolActual() {
  return localStorage.getItem('crm_rol') || sessionStorage.getItem('crm_rol') || 'admin';
}
function moduloDeHref(href) {
  var f = (href || '').split('/').pop().split('?')[0];
  return PAGINA_MODULO[f] || null;
}
function puedeAcceder(modulo) {
  if (!modulo) return true;
  return permisosActuales().indexOf(modulo) !== -1;
}

/* Guardia de acceso: si NO estamos en el login y NO hay sesión activa,
   redirige al login. Así el CRM siempre exige iniciar sesión. */
(function () {
  var enLogin = /index\.html$/.test(location.pathname) || /\/$/.test(location.pathname);
  var sesion = localStorage.getItem('crm_sesion') || sessionStorage.getItem('crm_sesion');
  if (!enLogin && !sesion) { location.replace('index.html'); return; }

  /* Guardia por rol: si la página no está permitida para el rol, al dashboard. */
  if (!enLogin) {
    var pagina = location.pathname.split('/').pop().split('?')[0] || 'index.html';
    var modulo = PAGINA_MODULO[pagina];
    if (modulo && !puedeAcceder(modulo)) { location.replace('inicio.html'); return; }
  }
})();

/* Oculta del menú las secciones que el rol no puede ver. */
(function () {
  document.querySelectorAll('.nav-item[href]').forEach(function (a) {
    var m = moduloDeHref(a.getAttribute('href'));
    if (m && !puedeAcceder(m)) a.style.display = 'none';
  });
  // Oculta los títulos de sección que quedaron sin items visibles
  document.querySelectorAll('.nav-section').forEach(function (sec) {
    var el = sec.nextElementSibling, visibles = 0;
    while (el && !el.classList.contains('nav-section')) {
      if (el.classList.contains('nav-item') && el.style.display !== 'none') visibles++;
      el = el.nextElementSibling;
    }
    if (visibles === 0) sec.style.display = 'none';
  });
})();

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

  function setMargin(expanded) {
    if (main) main.style.marginLeft = expanded ? '220px' : '68px';
  }

  if (!btn) {
    // Páginas sin botón de anclar (menús cortos, p. ej. Facturación):
    // el menú se deja SIEMPRE abierto. Sin colapso ni expandir-con-hover,
    // para no confundir. No se toca la preferencia guardada del CRM.
    sidebar.classList.remove('collapsed');
    setMargin(true);
  } else {
    // Estado inicial: colapsado por defecto (recordando la preferencia)
    var pinned = localStorage.getItem('sidebarPinned') === 'true';

    var applyPin = function (p) {
      pinned = p;
      if (p) {
        sidebar.classList.remove('collapsed');
        setMargin(true);
        btn.title = 'Colapsar menú';
      } else {
        sidebar.classList.add('collapsed');
        setMargin(false);
        btn.title = 'Anclar menú abierto';
      }
      localStorage.setItem('sidebarPinned', p);
    };

    // Aplicar sin animación al cargar
    sidebar.style.transition = 'none';
    applyPin(pinned);
    requestAnimationFrame(function () { sidebar.style.transition = ''; });

    // Botón pin: alterna entre anclado y colapsado
    btn.addEventListener('click', function () { applyPin(!pinned); });

    // Hover: expandir el margen del main cuando el sidebar se agranda
    sidebar.addEventListener('mouseenter', function () {
      if (!pinned) setMargin(true);
    });
    sidebar.addEventListener('mouseleave', function () {
      if (!pinned) setMargin(false);
    });
  }


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
    hamburger.classList.add('is-open');
    hamburger.innerHTML = '✕';
    hamburger.setAttribute('aria-label', 'Cerrar menú');
  }

  function closeMobileMenu() {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('show');
    hamburger.classList.remove('is-open');
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
  //
  // IMPORTANTE: distinguimos "tap" de "scroll" midiendo cuánto se movió
  // el dedo. Si el usuario desliza para hacer scroll en el menú, al
  // levantar el dedo NO debe navegar — antes ese era el bug que abría
  // cualquier item cuando se intentaba desplazar el menú.
  var TAP_MAX_MOVE = 10; // px de tolerancia

  sidebar.querySelectorAll('.nav-item').forEach(function (item) {
    var startX = 0, startY = 0, moved = false, yaNavegando = false;

    item.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      moved = false;
    }, { passive: true });

    item.addEventListener('touchmove', function (e) {
      if (!e.touches || !e.touches[0]) return;
      var dx = Math.abs(e.touches[0].clientX - startX);
      var dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > TAP_MAX_MOVE || dy > TAP_MAX_MOVE) moved = true;
    }, { passive: true });

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

    item.addEventListener('touchend', function (e) {
      if (moved) return;          // fue un scroll, no un tap → ignorar
      navegar(e);
    }, { passive: false });

    item.addEventListener('click', navegar);
  });

  // Botón "Cerrar sesión": en iOS Safari el onclick inline a veces no
  // dispara dentro del menú con animación. Le añadimos un touchend que
  // hace exactamente lo mismo, distinguiendo tap de scroll.
  var logoutBtn = sidebar.querySelector('.logout-btn');
  if (logoutBtn) {
    var logoutStartX = 0, logoutStartY = 0, logoutMoved = false;

    logoutBtn.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches[0]) return;
      logoutStartX = e.touches[0].clientX;
      logoutStartY = e.touches[0].clientY;
      logoutMoved = false;
    }, { passive: true });

    logoutBtn.addEventListener('touchmove', function (e) {
      if (!e.touches || !e.touches[0]) return;
      var dx = Math.abs(e.touches[0].clientX - logoutStartX);
      var dy = Math.abs(e.touches[0].clientY - logoutStartY);
      if (dx > 10 || dy > 10) logoutMoved = true;
    }, { passive: true });

    logoutBtn.addEventListener('touchend', function (e) {
      if (logoutMoved) return;
      e.preventDefault();
      window.location.href = 'index.html';
    }, { passive: false });
  }

  // Si se agranda la ventana a escritorio, cerrar el menú móvil
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) closeMobileMenu();
  });

})();

/* ════════ ANTI-CACHÉ: registrar el service worker ════════
   Hace que el CRM siempre cargue la última versión cuando hay internet.
   (Solo funciona en https / el sitio público; en archivos locales se ignora.) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
