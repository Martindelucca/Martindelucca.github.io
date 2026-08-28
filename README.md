# Landing — Martin de Lucca

Sitio estático, sin build. Abrís `index.html` en el navegador y funciona.

```
index.html      markup, una sección por bloque, comentado
404.html        página de error (GitHub Pages la sirve sola desde la raíz)
styles.css      tokens en :root → base → componentes → secciones → responsive
script.js       reveals, parallax del hero, escena sticky, conectores, FAB
assets/         capturas de los casos + wordmark SVG
```

## Sistema visual

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#16150F` | fondo de secciones oscuras |
| `--cream` | `#F4F1EA` | fondo de secciones claras |
| `--paper` | `#FFFDF9` | cards sobre claro |
| `--accent` | `#B92F27` | acento (del wordmark) |
| `--accent-lt` | `#E66B61` | acento sobre fondo oscuro |
| `--text` / `--muted` / `--muted-2` / `--faint` | `#171613` / `#56524A` / `#635E56` / `#6E685E` | rampa de texto sobre claro |
| `--on-ink` / `--on-ink-2` / `--on-ink-muted` / `--on-ink-dim` / `--on-ink-faint` | `#F2EFE8` / `#C8C0B0` / `#B1A896` / `#A29987` / `#978F7E` | rampa de texto sobre oscuro |
| `--deco` | `#B5AFA3` | **nunca texto**: cuadrados, puntos, reglas |

Tipografía: **dos familias, ninguna mono.** **Archivo** hace interfaz, cuerpo, titulares y
labels; **Literata** italic 300 entra sólo en dos énfasis y en la pullquote.

El display va a `var(--w-display)` = **700**. Tracking `-.04em` como piso, nunca más cerrado.

**Los pesos son los cinco que Archivo carga de verdad**, y nada en el medio: `800` display · `700`
subtítulos · `600` labels · `500` metadatos · `400` cuerpo. Archivo entra como instancias estáticas,
no como fuente variable: un `620` no existe y el navegador lo resuelve a `700`, un `550` a `600`.
Escribir un peso fraccionario acá no afina nada, cambia el peso por otro. `--w-display` guarda el
tope para no repetirlo.

Lo que antes pedía una mono es ahora `.label` — la misma sans a 600, cuerpo chico y algo de
tracking. **La versalita se quedó sólo donde funciona como etiqueta** (chrome de card, campos de
ficha, chips, nav del footer) y se cayó en todo lo que en realidad era una frase: una oración entera
en mayúsculas era el tic más visible del sistema anterior. Los cuerpos de label subieron de 9.5–10px
a 10.5–11.5px, que es donde se leen en un celular en la calle. En el HTML los labels van en caja
natural y la versalita la pone el CSS, así el texto que se copia y el que lee un lector de pantalla
es el real.

Ritmo de secciones: claro → oscuro → claro → oscuro. Máximo dos fondos en toda la página.

**Las dos rampas de texto están calculadas, no elegidas a ojo.** La clara se verifica contra la
superficie clara más oscura del sistema (`--mist #EFEBE2`) y la oscura contra la más clara (la card
de precio, `#2C2820`), así un solo juego de tokens sirve en todas las superficies. Todos los
escalones pasan 4.5:1 como texto normal; `--faint` y `--on-ink-faint` son el piso. Debajo de ahí no
hay texto: hay `--deco`. Si agregás un color de texto nuevo, verificalo.

**Cumplir AA no alcanza: la rampa también tiene que abrir.** La versión anterior de la rampa oscura
pasaba AA con margen y aun así las secciones oscuras se veían grises, porque sus tres tonos apagados
habían quedado apretados en un 4.6% de luminancia: eran el mismo gris repetido tres veces. Ahora
abren 15.9%. Segunda regla, del mismo problema: `--ink` tiene croma 0.012, así que un texto a croma
0.016 es apenas más cálido que su propio fondo y el ojo lo lee como gris neutro sobre marrón. Los
tonos apagados van a 0.024–0.028 para que lean crema. Si tenés que subir el piso de contraste otra
vez, subilo abriendo hacia arriba, no comprimiendo hacia abajo.

**Las secciones entran por el título, sin label arriba.** No hay eyebrows: las nueve abren con su
H2 y nada más. Un label chico sobre cada título es el andamio de landing más repetido que hay, y en
la práctica ninguno de los seis que había decía algo que su H2 no dijera ya. Si alguna sección
necesita contexto que el título no da, la respuesta es reescribir el título, no ponerle una etiqueta
encima.

**Numeración.** Los `NN —` de sección se fueron completos. Sólo quedan números donde describen una
secuencia real: las tres situaciones de 01, los cuatro pasos de 02 con su contador `01 / 04`, y el
`01 / 02` de los casos.

## Pendiente marcado con `TODO` en el HTML

**Retrato real en Sobre mí.** No hay ninguna foto de Martin en el repo, así que la sección no dibuja
ningún hueco: es una columna de texto y listo. Cuando exista el retrato —vertical, 4:5, ~800×1000,
sin recorte circular ni avatar— se guarda como `assets/martin.webp` y se descomenta el `<figure
class="portrait">` de §06; `.about` pasa sola a dos columnas por el `:has(.portrait)` del CSS. No se
genera con IA, no se usa stock y no se deja un placeholder: la página vende prolijidad.

## Cosas a saber antes de tocar

**Escena sticky de la sección 02.** `.journey` tiene `--journey-scroll: 240vh` y su hijo `.journey__sticky` es `position: sticky`. Son 100vh de escena fija + 140vh de avance: 35vh por estado. `script.js` mapea el progreso de scroll a un índice 0–3 y aplica `.is-active` / `.is-past` a los `.step` y `.is-off` a los bloques de la demo. Mientras la escena corre, el JS pone `.is-scene` en la sección: sin esa clase —mobile, `reduced-motion`, sin JS— los cuatro pasos se ven a contraste pleno en vez de quedar apagados esperando un scroll que no va a pasar. Los estados nunca se distinguen por opacidad, porque bajarle la opacidad a un texto lo saca de AA. Debajo de 940px la sección pasa a `height: auto`, el sticky se apaga y todo se muestra a la vez.

**Conectores de "Qué incluye".** Se dibujan con JS midiendo las posiciones reales de `[data-mod]` y `[data-core]`. Sólo dibuja si las tres columnas comparten fila con el núcleo; si el flex wrapea, se apaga. Si cambiás el layout de esa sección, revisá `initSystem`.

**Reveals.** Cualquier elemento con `data-r="up|left|right|scale"` (opcional `data-rd` en ms) entra animado. Los estilos iniciales los pone el JS, no el CSS: sin JS todo queda visible.

**Foco.** Hay un sistema global en `styles.css`: todo lo operable dibuja un outline de 2px en rojo de marca (rojo claro sobre superficies oscuras) con `outline-offset: 3px`. No se saca ningún outline sin reemplazo. El `.skip-link` del principio del `<body>` aparece sólo con foco de teclado y lleva al `<main id="contenido">`.

**Scroll.** Hay un solo listener de scroll para toda la página (`onScroll()` en `script.js`).
El header, la escena sticky y el FAB se registran ahí y corren juntos, una vez por frame vía
`requestAnimationFrame`. Si agregás algo que reacciona al scroll, registralo en el mismo lugar en
vez de sumar un listener nuevo: tres handlers leyendo layout por separado era lo que había antes.

**`will-change`.** Se pone un frame antes de que el elemento anime y se saca al terminar. No lo
pongas en el CSS de nada que se revele: ponerlo de entrada promovía los ~63 elementos revelables a
capa propia desde el load, y los que nunca entran al viewport se quedaban promovidos para siempre.

**Movimiento.** Todo respeta `prefers-reduced-motion`. El parallax del hero y los botones magnéticos sólo corren con `(hover: hover)`, así que en touch no se disparan.

## WhatsApp

El número y el mensaje precargado están hardcodeados en los seis enlaces `wa.me` de `index.html`
más uno en `404.html`. El mensaje tiene que funcionar enviado tal cual: **nada de corchetes ni de
campos para completar**, porque se envían sin completar.

```
Hola Martin, quiero contarte sobre mi negocio y ver qué tipo de web me podría servir.
```

Los `wa.me` no llevan `target="_blank"`: en celular el handoff a la app es más limpio sin pestaña
intermedia, y en desktop `wa.me` ya muestra su propia pantalla de continuación. Los externos de
verdad —los dos casos e Instagram— sí abren en pestaña nueva y lo avisan con un `<span class="vh">`
para lectores de pantalla.

Si vas a cambiarlo seguido, conviene sacarlo a una constante y armar los hrefs en JS.

## Antes de publicar

- Analítica (el brief la incluye en el servicio).
- Revisar que los links de los dos casos sigan vivos.

Las capturas ya están comprimidas: cada caso tiene la versión 716w y una 400w para el render mobile,
servidas por `srcset` + `sizes`. Si agregás un caso, seguí el mismo par.
