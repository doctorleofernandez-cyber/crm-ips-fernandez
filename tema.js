/* Carga inmediata — evita flash de tema incorrecto */
(function () {
  const guardado = localStorage.getItem('tema_ips') || 'oscuro';
  let aplicar = guardado;
  if (guardado === 'sistema') {
    aplicar = window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
  }
  document.documentElement.setAttribute('data-theme', aplicar);
})();

/* Función global para cambiar tema desde cualquier página */
window.aplicarTema = function (tema) {
  localStorage.setItem('tema_ips', tema);
  let aplicar = tema;
  if (tema === 'sistema') {
    aplicar = window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
  }
  document.documentElement.setAttribute('data-theme', aplicar);
};
