# Resumen de trabajo — CRM IPS Fernández O&M
**Fecha:** 25 de mayo de 2026 · **Sesión 6**

---

## 🗂️ Resumen rápido

Sesión partida en dos grandes bloques:

1. **Alinear el CRM a la guía oficial del Dr. Leo** — el Dr. subió un documento Word con su visión de CRM ideal para la clínica (servicios reales, intención del paciente, objeciones, mensajes base, automatizaciones). Aplicamos esa guía al CRM en 4 frentes (Pipeline, Contactos, Ficha del contacto, Plantillas).

2. **Pasada responsive completa para el iPhone** — el CRM se veía mal en celular en muchas pantallas (menús que se disparaban al hacer scroll, filtros cortados, modales que se salían, tablas que no se deslizaban). Lo barrimos pantalla por pantalla, **sin tocar nada de PC ni iPad**.

Total: **12 commits** subidos a GitHub.

---

## 🎯 Bloque 1 — Alineación a la guía del Dr. Leo

El Dr. subió `Guia_CRM_Clinica_Dr_Leo_Fernandez.docx` (lo guardamos en `resúmenes/` como referencia oficial del proyecto). Es una visión muy completa: pipeline comercial, etiquetas por servicio e intención, mensajes base por tratamiento, automatizaciones, tablero del dueño, roles, etc.

**Lo que ya teníamos** cubría casi toda la estructura (pipeline, ficha, plantillas, dashboard, bots, etc.). Faltaban los conceptos comerciales específicos.

### Lo que aplicamos

**1) Plantillas (`plantillas.html`)** — 5 mensajes nuevos cargados con el texto exacto de la guía:
- 😁 **Diseño de sonrisa**
- 🦷 **Implantes**
- 🪥 **Ortodoncia**
- ✨ **Blanqueamiento Zoom**
- 💼 **Seguimiento de presupuesto 24-48h**
- Nuevo filtro "🦷 Servicios" para separarlos del resto.

**2) Ficha del Contacto (`contacto-perfil.html`)** — bloque nuevo **"CRM comercial"** en la columna izquierda:
- **Servicio de interés** (Diseño de sonrisa, Implantes, Ortodoncia, etc. — 12 opciones)
- **Canal de origen** (WhatsApp, Instagram, TikTok, Referido, Google Ads, etc.)
- **Nivel de intención** con píldora de color: 🔵 Frío · 🟡 Tibio · 🔴 Caliente
- **Objeción principal** (Precio, Tiempo, Miedo, Viaje, Financiación, Comparación, Otra)

**3) Pipeline (`pipeline.html`)** — cada tarjeta muestra ahora **servicio + intención** de un vistazo. El modal de "+ Nuevo contacto" pregunta los 3 campos (servicio, intención, origen) desde el primer momento — como pide la guía.

**4) Listado de Contactos (`contactos.html`)** — nuevas columnas **Servicio · Intención · Origen** y nuevos filtros (por servicio y por intención, para priorizar a los "calientes" primero).

Commit: `9770c0d` — *feat: alinear el CRM a la guía del Dr. Leo (servicio, intención, objeción)*

---

## 📱 Bloque 2 — Pasada responsive completa para el iPhone

El Dr. fue probando en su iPhone y reportó problemas concretos uno por uno. Los arreglamos en orden:

### Problemas reales que el Dr. encontró y arreglamos

| # | Pantalla | Problema | Commit |
|---|---|---|---|
| 1 | Menú móvil | Al deslizar para hacer scroll, abría cualquier item donde quedara el dedo | `ac3ce50` |
| 2 | Pipeline | Toggle Kanban/Lista + buscador + botón amontonados arriba | `d67a1a5` |
| 3 | Contactos | Filtros "Todos los estados / servicios / intención" cortados | `046ac83` |
| 4 | Difusiones | Cuadro de Campañas no se veía completo + tabla no cabía | `031a2ec` |
| 5 | (15 pantallas más) | Pasada preventiva del resto del CRM | `4a60eea` |
| 6 | Difusiones | KPIs y modal "Nueva difusión" no caían (faltó en la pasada) | `0d21f19` |
| 7 | Difusiones | Tabla aún no deslizaba con el dedo | `f26c36e` |
| 8 | Facturación | Igual problema con la tabla | `9769160` |
| 9 | iOS scroll | Refuerzo con `touch-action: pan-x` | `e46a9ad` |
| 10 | Cerrar sesión + tablas | Botón cerrar sesión muy pequeño + tablas seguían sin deslizar | `a81c2f1` |
| 11 | **El bug raíz** | Encontramos que `body { overflow-x: hidden }` bloqueaba el scroll horizontal de TODO en iOS | `beed3b6` |

### La pasada preventiva (`4a60eea`)

Delegamos al agente **revisor-frontend** una revisión sistemática de las 15 pantallas restantes (dashboard, citas, chat, correo, bots, agente-ia, insights, tratamientos, facturacion, reportes, plantillas, ajustes, contacto-perfil, chats-equipo, index/login). Aplicó las convenciones móviles:

- Botones principales a **100% ancho** + **mínimo 44px** de alto (regla de Apple para tap targets)
- Inputs/selects a **font-size 14px+** para evitar el zoom automático de iOS
- Tablas con **scroll horizontal dentro de su contenedor** (no que desborden la página)
- Tabs y filtros que no caben → scroll horizontal
- Modales con `max-width: 95vw` y formularios en una columna

**Regla de oro respetada:** todos los cambios fueron dentro de `@media (max-width: 760px)`. PC (>=1024px) e iPad portrait (768px) no se vieron afectados — exactamente lo que pidió el Dr.

---

## 🐛 El descubrimiento clave del día

Después de varios intentos de hacer que las tablas se deslizaran en el iPhone (forzar `overflow-x: auto`, agregar `touch-action: pan-x`, !important, wrappers, etc.) **nada funcionaba**. La tabla no se movía.

Investigando más a fondo encontramos la causa raíz en `sidebar.css`:

```css
html, body { max-width: 100%; overflow-x: hidden; }
```

Esto está bien para evitar que la página entera se desplace horizontalmente, **pero en iPhone Safari hay un bug conocido**: cuando el `body` tiene `overflow-x: hidden`, **bloquea el touch-scroll horizontal de cualquier hijo**. Por más `overflow-x: auto` que pusiéramos en la tabla, iOS lo ignoraba.

**La solución moderna:** cambiar `hidden` por `clip`. `clip` recorta exactamente igual visualmente pero **no crea contexto de scroll**, así que los hijos sí pueden deslizarse. Soportado desde iOS Safari 16+.

Ese cambio de 6 letras (`hidden` → `clip`) **arregló el scroll horizontal en todo el CRM de un solo golpe**.

---

## 🎓 Lecciones del día

1. **Tener la guía del Dr. Leo cambia la conversación.** Antes propíamos cosas "que pareciera Kommo"; ahora podemos comparar contra un documento concreto y ver qué falta y qué sobra.

2. **El móvil no se prueba en el navegador del Mac.** La mayoría de los problemas (filtros cortados, tablas que no deslizan, botones que abren otra cosa) solo se ven en el iPhone real. Cada vez que tocamos responsive, hay que pedirle al Dr. que pruebe.

3. **El caché de Safari iOS es muy terco.** Aprendimos a pasar URLs con `?v=N` para forzar la versión nueva sin tener que borrar caché completo cada vez.

4. **Un bug "imposible" suele ser una regla CSS global olvidada.** Estuvimos 4-5 commits peleando con la tabla sin éxito hasta que miramos el `body`.

---

## 📁 Archivos modificados hoy

**Bloque 1 — guía:**
- `plantillas.html` · `contactos.html` · `contacto-perfil.html` · `pipeline.html`

**Bloque 2 — responsive (todos en `@media max-width: 760px`):**
- `sidebar.css` · `sidebar.js` (menú móvil, botón cerrar sesión, fix global del scroll)
- `pipeline.html` · `contactos.html` · `difusiones.html` (correcciones específicas)
- `dashboard.html` · `index.html` · `citas.html` · `chat.html` · `chats-equipo.html` · `correo.html` · `bots.html` · `agente-ia.html` · `insights.html` · `tratamientos.html` · `facturacion.html` · `reportes.html` · `ajustes.html` · `contacto-perfil.html` (pasada preventiva)

**Nuevo en el repo:**
- `resúmenes/Guia_CRM_Clinica_Dr_Leo_Fernandez.docx` (la guía oficial del Dr., como referencia del proyecto)

---

## ⏭️ Por dónde podemos seguir mañana

La guía del Dr. todavía tiene 2 puntos importantes que NO hemos abordado:

1. **Automatizaciones de seguimiento** (los 8 momentos del punto 6 de la guía: bienvenida, 24h sin respuesta, recordatorio 24h antes, reagendamiento, seguimiento 24-48h tras presupuesto, etc.). La pantalla `bots.html` existe pero los flujos hay que diseñarlos.

2. **Datos reales (Supabase).** Hoy el CRM funciona con `localStorage` — los datos viven solo en el navegador. Para usarlo de verdad en la clínica (recepción, asistentes y Dr. compartiendo info) hay que conectarlo a una base de datos. Es el salto a CRM funcional de verdad.

Otras opciones más pequeñas:
- Continuar puliendo responsive (probablemente queden detalles)
- Avanzar en seguridad/login real
- Pulir contenidos y textos (tono profesional consistente)
