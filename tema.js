/* Carga inmediata — evita flash de tema incorrecto */
/* El tema por defecto es 'claro' (paleta crema oficial del CRM).
   El tema 'oscuro' es un modo nocturno opcional. */
(function () {
  const guardado = localStorage.getItem('tema_ips') || 'claro';
  let aplicar = guardado;
  if (guardado === 'sistema') {
    aplicar = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
  document.documentElement.setAttribute('data-theme', aplicar);
})();

/* Función global para cambiar tema desde cualquier página */
window.aplicarTema = function (tema) {
  localStorage.setItem('tema_ips', tema);
  let aplicar = tema;
  if (tema === 'sistema') {
    aplicar = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  }
  document.documentElement.setAttribute('data-theme', aplicar);
};
