# CHANGELOG — Rearme de RestoApp

## 1. Cómo estaba estructurado el proyecto originalmente

El proyecto consistía en un único archivo, `index.html`, que era a la vez una
Single Page Application (SPA) y contenía **todo** dentro de sí: la interfaz
(HTML), los estilos (`<style>` en el `<head>`) y toda la lógica (`<script>`
al final del `<body>`). Una sola pantalla mezclaba cuatro funcionalidades
distintas: tomar un pedido, iniciar/cerrar sesión, crear un producto nuevo y
cargar el menú desde Firebase.

## 2. Problemas identificados

- **Variables globales**: `items`, `total_global`, `menuData`, `isLogged`,
  `ADMIN_USER` y `ADMIN_PASS` vivían en el ámbito global de `window`,
  compartidas por toda la aplicación sin ningún control.
- **Credenciales hardcodeadas**: el usuario y la contraseña del administrador
  (`admin` / `admin`) estaban escritos directamente en el JavaScript.
- **Función monolítica**: `tomarTodo()` leía el DOM, convertía tipos,
  validaba, calculaba el IVA y volvía a escribir el DOM, todo en una sola
  función.
- **Nombres de variables poco claros**: `a`, `b`, `p` como identificadores de
  plato, cantidad y precio.
- **Código muerto**: la función `funcionObsoletaCalculoAnterior` nunca se
  llamaba desde ningún lugar.
- **CSS con una clase que no se usaba**: `.clase_redundante_que_no_se_usa`.
- **Mensajes de error poco claros**: por ejemplo, un simple `alert("Error en
  datos")` sin explicar qué dato estaba mal.
- **Todo en una sola página**: no había manera de compartir un enlace directo
  a "tomar pedido" o a "administración"; todo dependía de mostrar/ocultar
  bloques `div` con JavaScript.
- **Configuración de Firebase repetida**: la URL de la base de datos estaba
  escrita dos veces dentro del mismo archivo (una para leer el menú y otra
  para crear productos).

## 3. Conversión de SPA a MPA

Se separaron las cuatro funcionalidades en páginas independientes, cada una
con un único propósito:

| Página | Función |
|---|---|
| `index.html` | Bienvenida y navegación hacia las demás páginas |
| `login.html` | Inicio de sesión |
| `menu.html` | Consulta del menú disponible |
| `pedidos.html` | Toma de pedidos (cálculo de subtotal, IVA y total) |
| `admin.html` | Creación de productos (protegida: exige sesión iniciada) |

Todas comparten `css/styles.css` mediante `<link rel="stylesheet">` y cargan
únicamente el módulo JavaScript que necesitan (`type="module" src="js/main-*.js"`),
en vez de cargar toda la lógica de la aplicación en cada página.

## 4. Modularización de JavaScript

El JavaScript se dividió en módulos ES (`import`/`export`) según su
responsabilidad:

- **`js/firebase.js`**: único punto de conexión con Firebase Realtime
  Database. Expone `obtenerDatos(nodo)` y `guardarDatos(nodo, datos)`.
  Ningún otro archivo construye URLs de Firebase directamente.
- **`js/auth.js`**: inicio/cierre de sesión, verificación de sesión activa
  (`estaAutenticado`) y protección de páginas (`protegerPagina`).
- **`js/menu.js`**: obtener el menú (`obtenerMenu`) y crear productos
  (`crearProducto`), con sus validaciones.
- **`js/pedidos.js`**: cálculo y validación de un pedido (`calcularPedido`)
  y su formato de salida (`formatearPedido`). No toca el DOM: solo recibe
  números y devuelve un resultado, lo que permitió probarlo de forma
  aislada.
- **`js/ui.js`**: funciones reutilizables de interfaz (mostrar mensajes,
  limpiar formularios, mostrar/ocultar elementos), usadas por varias
  páginas.
- **`js/main-login.js`, `js/main-menu.js`, `js/main-pedidos.js`,
  `js/main-admin.js`**: un archivo de entrada por página, que conecta el
  HTML de esa página con los módulos anteriores. Es el único lugar donde se
  accede al DOM de esa página en particular.

## 5. Organización de Firebase

Toda la aplicación sigue usando la misma base de datos indicada:
`https://restos-pop-default-rtdb.firebaseio.com/`, en el mismo nodo `menu`
que ya existía. No se creó otra base, no se cambió la URL y no se modificó
la estructura de los datos.

- La lectura del menú (`obtenerMenu`) y la creación de productos
  (`crearProducto`) pasan siempre por `js/firebase.js`.
- Se agregó manejo de errores con `try/catch` en cada lugar donde se llama a
  Firebase, mostrando un mensaje entendible en vez de dejar el error sin
  controlar.

## 6. Seguridad

- Las credenciales de administrador se centralizaron en un único módulo
  (`js/auth.js`) en vez de estar sueltas junto con el resto de la lógica.
- La sesión ahora se guarda en `sessionStorage` para que `admin.html`
  pueda verificar si hay sesión activa y redirigir a `login.html` si no la
  hay (necesario porque, al ser ahora varias páginas, ya no se puede guardar
  el estado en una variable en memoria como antes).
- **Limitación importante, documentada honestamente**: al ser un proyecto
  100% estático (HTML/CSS/JS sin backend), *no existe* una forma de guardar
  credenciales que sea imposible de leer desde el navegador; cualquier valor
  presente en el JavaScript que se descarga es visible para quien abra las
  herramientas de desarrollador. La solución correcta a largo plazo es usar
  **Firebase Authentication**, pero esto requiere el `apiKey` del proyecto
  de Firebase (visible en Configuración del proyecto → General, en la
  consola de Firebase), que no estaba disponible para este rearme. Queda
  como tarea pendiente — ver sección "Checklist del README".
- Sobre las reglas de Firebase Realtime Database: no fue posible modificarlas
  desde este proyecto porque requieren acceso a la consola de Firebase. Se
  recomienda configurar, como mínimo, que el nodo `menu` permita lectura
  pública pero restrinja la escritura a usuarios autenticados, una vez se
  active Firebase Authentication.

## 7. Validaciones agregadas

- `pedidos.js`: exige seleccionar un plato, cantidad mayor que cero y precio
  unitario válido, con un mensaje distinto para cada caso.
- `menu.js`: exige un nombre no vacío y un precio mayor que cero al crear un
  producto.
- Todos los mensajes son frases entendibles (por ejemplo, "Debes ingresar el
  nombre del producto.") en vez de errores técnicos como `undefined is not
  valid`.

## 8. Manejo de errores

- Todas las llamadas a Firebase (`obtenerDatos`, `guardarDatos`) están
  envueltas en `try/catch` en los módulos que las usan, y muestran un
  mensaje claro en pantalla en vez de dejar la aplicación en un estado roto.
- Los errores técnicos (`console.error`) se registran en la consola para
  depuración, pero el usuario final solo ve el mensaje entendible.

## 9. Código eliminado o limpiado

- Se eliminó `funcionObsoletaCalculoAnterior` (código muerto, nunca se
  llamaba).
- Se eliminó la clase CSS `.clase_redundante_que_no_se_usa`.
- Se eliminaron las variables globales sueltas (`items`, `total_global`,
  `menuData`, `isLogged`, etc.): ahora cada módulo mantiene su propio
  estado interno.
- Se eliminaron los nombres de variable crípticos (`a`, `b`, `p`) y se
  reemplazaron por nombres descriptivos (`plato`, `cantidad`, `precio`).
- Se eliminó la duplicación de la URL de Firebase (antes escrita dos veces).

## 10. Buenas prácticas aplicadas

- Separación entre lógica de negocio (`menu.js`, `pedidos.js`, `auth.js`,
  `firebase.js`) y manipulación del DOM (`js/main-*.js`, `ui.js`).
- Un archivo, una responsabilidad.
- Módulos ES (`import`/`export`) en vez de todo en el ámbito global.
- Mensajes de usuario consistentes mediante `ui.js`.
