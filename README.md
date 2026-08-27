# Landing — Martin de Lucca

Sitio estático, sin build. Abrís `index.html` en el navegador y funciona.

```
index.html      markup, una sección por bloque, comentado
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
| `--accent-lt` | `#E2564A` | acento sobre fondo oscuro |
| `--text` / `--muted` | `#171613` / `#56524A` | texto sobre claro |
| `--on-ink` / `--on-ink-muted` | `#F2EFE8` / `#A39D91` | texto sobre oscuro |

Tipografía: **Archivo** 800 para titulares (tracking `-.04em` a `-.05em`), **Newsreader** italic 300 como acento editorial (`.em`), **IBM Plex Mono** 500 para labels y metadata.

Ritmo de secciones: claro → oscuro → claro → oscuro. Máximo dos fondos en toda la página.

## Pendientes marcados con `TODO` en el HTML

1. **Retrato** — `.portrait` en Sobre mí es un placeholder 4:5. Reemplazar el `div.portrait__ph` por un `<img>`.
2. **Instagram** — el link del footer apunta a `https://instagram.com`.
3. **Precio** — `$200.000` está en `.offer__fig`. Si va otro número, es una sola línea.

## Cosas a saber antes de tocar

**Escena sticky del recorrido.** `.journey` tiene `height: 420vh` y su hijo `.journey__sticky` es `position: sticky`. `script.js` mapea el progreso de scroll a un índice 0–4 y aplica `.is-active` / `.is-past` a los `.step` y `.is-off` a los bloques de la demo. Debajo de 940px la sección pasa a `height: auto`, el sticky se apaga y todo se muestra a la vez — el JS detecta eso y no interviene.

**Conectores de "Qué incluye".** Se dibujan con JS midiendo las posiciones reales de `[data-mod]` y `[data-core]`. Sólo dibuja si las tres columnas comparten fila con el núcleo; si el flex wrapea, se apaga. Si cambiás el layout de esa sección, revisá `initSystem`.

**Reveals.** Cualquier elemento con `data-r="up|left|right|scale"` (opcional `data-rd` en ms) entra animado. Los estilos iniciales los pone el JS, no el CSS: sin JS todo queda visible.

**Movimiento.** Todo respeta `prefers-reduced-motion`. El parallax del hero y los botones magnéticos sólo corren con `(hover: hover)`, así que en touch no se disparan.

## WhatsApp

El número y el mensaje precargado están hardcodeados en los seis enlaces `wa.me`:

```
https://wa.me/543524401654?text=Hola%20Martin%2C%20llegue%20desde%20tu%20pagina%20y%20quiero%20que%20veamos%20mi%20negocio.
```

Si vas a cambiarlo seguido, conviene sacarlo a una constante y armar los hrefs en JS.

## Antes de publicar

- Meter el `assets/wordmark.svg` como favicon y en `og:image`.
- Analítica (el brief la incluye en el servicio).
- Comprimir las capturas de los casos si suman peso.
- Revisar que los links de los dos casos sigan vivos.
