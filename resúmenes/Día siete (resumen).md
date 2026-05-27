# Resumen de trabajo — CRM IPS Fernández O&M
**Fecha:** 27 de mayo de 2026 · **Sesión 7**

---

## 🗂️ Resumen rápido

Sesión 100% dedicada a **arreglar la experiencia móvil** del CRM. El Dr. Leo fue probando pantalla por pantalla en su iPhone y reportando lo que se veía amontonado, mal alineado o se atascaba con el dedo. Atacamos cada problema en orden y al final también limpiamos el flujo para empezar pruebas nuevas.

Total: **12 commits** subidos a GitHub.

Lo más importante del día:
1. **Tablas grandes → tarjetas apiladas en celular** (Facturación y Difusiones)
2. **Botón "Cerrar sesión" unificado** (igual de bonito en PC, iPad y móvil)
3. **X del menú móvil** ya no tapa el logo
4. **Sistema de versiones** en `sidebar.css/js` para que Safari no use caché viejo
5. **Pasada responsive completa de Ajustes**
6. **Pipeline:** líneas divisorias llegan hasta abajo en celular
7. **"Limpiar todo"** ahora sí borra TODOS los datos del CRM

---

## 💰 Bloque 1 — Facturación en celular: tabla → tarjetas

El Dr. reportó que en su iPhone la tabla de Facturación no se deslizaba igual de bien que la de Contactos. Investigando descubrimos **tres problemas combinados**:

1. `touch-action: pan-x` en la tabla le decía a iOS "aquí solo se desliza horizontal" — **el scroll vertical del dedo quedaba bloqueado** sobre la tabla.
2. Las columnas se **cortaban** a la derecha aunque hubiera scroll horizontal.
3. La página entera era **más ancha que el iPhone** — los botones del topbar (Exportar + Nueva Factura) desbordaban.

### La solución: layout de tarjetas

En vez de mantener la tabla con scroll horizontal en móvil (como hacen pocas apps modernas), **cada factura ahora es una tarjeta apilada** en el celular — como hace Stripe, Square y Kommo. Toda la info visible sin necesidad de deslizar la tabla a los lados:

```
┌─────────────────────────┐
│ FAC-2026-001            │
│ María García            │
│ CC 1.234.567            │
│                         │
│ Concepto: Limpieza      │
│ Fecha:    25/05/2026    │
│ Vence:    25/06/2026    │
│                         │
│ $ 150.000  [Pendiente]  │
│                         │
│ [Editar]      [✕]       │
└─────────────────────────┘
```

**Cómo se logró:**
- `data-label` en cada `<td>` del JS para que muestre la etiqueta en móvil
- En `@media (max-width: 760px)`: cada `<tr>` se vuelve `display: block` con borde, padding y `margin-bottom`, y cada `<td>` muestra su etiqueta usando `::before { content: attr(data-label) }`
- Garantías de ancho: `.main { max-width: 100vw; overflow-x: hidden }` + `.main > * { max-width: 100%; min-width: 0 }`
- Botones del topbar apilados (`flex-direction: column; width: 100%`) en vez de `flex: 1`

**Regla de oro respetada:** todo dentro de `@media (max-width: 760px)`. PC e iPad portrait no se tocaron.

Commits: `038e41a`, `a544143`

---

## 📣 Bloque 2 — Mismo enfoque para Difusiones

Una vez que el patrón funcionó en Facturación, lo replicamos en Difusiones. Las 8 columnas (Campaña, Canal, Audiencia, Enviados, Apertura, Estado, Fecha, Acciones) se vuelven una tarjeta con la campaña arriba como título y el resto de info debajo con sus etiquetas.

Commit: `dfb55bb`

---

## 🚪 Bloque 3 — Botón "Cerrar sesión" unificado

Al Dr. le gustó cómo se ve el botón de cerrar sesión en su iPhone (borde dorado suave, fondo dorado tenue, texto en color dorado de la marca, fácil de tocar). Pero en PC y iPad seguía viéndose plano y feo (sin borde, color marrón apagado, fuente diminuta).

Movimos ese mismo estilo bonito al `.logout-btn` base — ahora se ve **igual en las 18 pantallas del CRM** automáticamente, sin tocar HTML.

En PC con el menú colapsado (botón ◀) sigue mostrándose solo el ícono "→" centrado para no ocupar espacio; al expandir, vuelve al estilo completo.

Commit: `c1216f1`

---

## ❌ Bloque 4 — La X del menú móvil ya no tapa el logo

Cuando se abría el menú en iPhone, el mismo botón hamburguesa se convertía en X pero **seguía en la misma posición** (esquina superior izquierda), tapando el logo de IPS Fernández O&M.

Intento 1 (`10ae640`): mover la X a `left: 184px` (dentro del sidebar). Resultado: ahora tapaba el texto "O&M". 😅

Intento 2 (`bec6f3c`): mover la X a `right: 14px` (FUERA del menú, sobre la capa oscurecida del overlay), con fondo oscuro semitransparente y color blanco para que se distinga. Este es el patrón estándar de "drawer" en apps móviles modernas. ✅

---

## ♻️ Bloque 5 — Sistema de versiones en sidebar.css/js

**El bug oculto del día:** las 18 páginas cargaban `sidebar.css` y `sidebar.js` **sin parámetro de versión**, así que Safari guardaba versiones viejas en caché. Aunque el HTML fuera nuevo (con `?v=N`), los arreglos del menú móvil no se veían.

Solución: agregar `?v=N` a las referencias de `sidebar.css` y `sidebar.js` en TODAS las páginas. Ahora cuando cambiemos algo del sidebar, bumpeamos a `?v=N+1` y se ve al instante en todos los dispositivos.

Aplicamos `?v=2` primero y luego `?v=3` cuando movimos la X.

Commits: `39a48bd`, `bec6f3c`

---

## ⚙️ Bloque 6 — Pasada responsive completa de Ajustes

El Dr. dijo que Ajustes "queda como amontonado" en celular. Una revisión a fondo de cada pestaña reveló varios problemas:

| Pestaña | Antes | Ahora |
|---|---|---|
| Perfil clínica | Logo + botón pegados en una fila | Logo arriba, botón abajo a 100% ancho |
| Horarios | 4 columnas estrechas (día / abre / cierra / on-off) | Día arriba, horas en una fila, toggle abajo |
| Apariencia | 3 temas en una fila super estrechos | 1 columna, cada tema grande y visible |
| Equipo | Avatar + nombre + email + badge + 2 botones todo apretado | Avatar+info+badge arriba, botones abajo |
| Zona de peligro | Texto + botón pegados | Texto arriba, botón rojo a 100% ancho |

Más las garantías de ancho `max-width: 100vw` + `overflow-x: hidden` para que nada se salga del iPhone.

Commit: `f005cb5`

---

## 🧹 Bloque 7 — "Limpiar todo" ahora sí borra todo

El Dr. pidió limpiar el CRM para empezar una prueba nueva. Resulta que ya existía un botón **"Limpiar datos"** en Ajustes → Zona de peligro, **pero solo borraba 4 cosas** (pacientes, citas, facturas, tratamientos). Dejaba sucias: difusiones, plantillas, bots, tareas, configuración de la clínica, etapas del pipeline, vista del pipeline, horarios, agente IA y notas de pacientes.

Mejoramos la función para borrar **todos los datos operacionales** (14 llaves de localStorage + todas las notas de pacientes con prefijo `notas_pac_*`) y conservar solo las preferencias visuales (tema, tamaño de fuente, estado del menú anclado).

También cambiamos el texto del botón a **"Limpiar todo"** con descripción más clara, y agregamos `window.location.reload()` después de borrar para que cada pantalla se vea vacía de verdad sin tener que refrescar a mano.

Commit: `19e0499`

---

## 📊 Bloque 8 — Pipeline: las líneas llegan hasta abajo

El Dr. notó que en su iPhone las líneas verticales que separan las etapas del pipeline (Contacto inicial · Interesado · Agendada · …) eran **cortitas si la etapa estaba vacía o tenía pocos contactos** — se cortaban a media pantalla y dejaban un espacio cremoso enorme debajo sin línea.

**Causa:** en móvil cambiamos `.main { height: auto }` para que la página pueda hacer scroll vertical. Esto rompía la cadena de alturas: `.kanban` quedaba sin altura definida, las columnas se ajustaban al contenido, y los `border-right` de cada columna llegaban solo hasta donde llegaba el contenido.

**Intento 1 (`3a51c5f`):** `min-height: 100%` en la columna. **No funcionó** — porcentajes de altura dependen del `height` del padre, y `.kanban` solo tenía `min-height`.

**Intento 2 (`59c8414`):** `min-height: calc(100vh - 220px)` en la columna. Unidades de viewport siempre funcionan, sin depender del padre. ✅

---

## 🎓 Lecciones del día

1. **Las tablas en móvil son una mala idea por defecto.** El usuario quiere deslizar la página vertical, no la tabla horizontal. Las apps modernas (Stripe, Kommo, Square) convierten cada fila en tarjeta. Este patrón debería ser nuestro **default** para tablas con > 4 columnas.

2. **`touch-action` en iOS es traicionero.** `pan-x` parece inofensivo, pero bloquea el scroll vertical de la página entera. La regla segura: `pan-x pan-y` o no tocarlo.

3. **Los assets compartidos sin versión son una bomba de tiempo.** `sidebar.css` y `sidebar.js` lo usan 18 páginas. Sin `?v=N`, Safari nunca veía los cambios aunque pusiéramos `?v=` en cada HTML. **Regla nueva:** siempre versión en los assets compartidos.

4. **Porcentajes de altura en CSS solo funcionan si el padre tiene `height` (no `min-height`).** Cuando el padre es `height: auto`, usar `calc(100vh - X)` directo en el hijo es más robusto.

5. **Borrar datos a medias es peor que no borrarlos.** Si el botón se llama "Limpiar datos", tiene que limpiar **todo** lo que el usuario llamaría "datos" — no solo 4 de 14 llaves.

---

## 📁 Archivos modificados hoy

- `facturacion.html` — layout de tarjetas + fix overflow + cache busting
- `difusiones.html` — layout de tarjetas + cache busting + ajuste touch-action
- `sidebar.css` — logout-btn unificado + X del menú móvil a la derecha
- `sidebar.js` — clase `is-open` en el botón hamburguesa
- `ajustes.html` — limpiarDatos() expandido + pasada responsive completa
- `pipeline.html` — line divider llega abajo en móvil
- **Las 18 páginas HTML** del CRM — `sidebar.css?v=3` y `sidebar.js?v=3`

---

## ⏭️ Por dónde podemos seguir mañana

La guía del Dr. todavía tiene 2 puntos importantes que NO hemos abordado:

1. **Automatizaciones de seguimiento** — los 8 momentos del punto 6 de la guía (bienvenida, 24h sin respuesta, recordatorio 24h antes, reagendamiento, seguimiento 24-48h tras presupuesto, etc.). La pantalla `bots.html` existe pero los flujos hay que diseñarlos.

2. **Datos reales (Supabase)** — hoy el CRM funciona con `localStorage` — los datos viven solo en el navegador (y en cada dispositivo por separado). Para usarlo de verdad en la clínica (recepción, asistentes y Dr. compartiendo info) hay que conectarlo a una base de datos. Es el salto a CRM funcional de verdad.

Otras opciones más pequeñas:
- **Tratamientos** — última tabla del CRM que todavía usa scroll horizontal. Mismo enfoque de tarjetas que Facturación/Difusiones.
- **Reportes** — revisar si las gráficas y tablas se ven bien en celular.
- **Login real** y pulir contenidos.
