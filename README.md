# Label Roll Calculator

Calculadora de producción de rollos y embalaje. Interfaz adaptable, tema claro/oscuro y funcionamiento sin conexión después de la primera carga.

[Abrir la aplicación](https://pive110.github.io/calculadora-rollos/)

## Desarrollo

La aplicación puede abrirse directamente con `index.html`. Las pruebas de instalación y caché requieren HTTP o HTTPS.

Con Node.js 24 y pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

`_site/` contiene exclusivamente los archivos que se publican. Las dependencias solo se utilizan durante desarrollo y pruebas.

## Organización

- `calculos.js`: cálculo y validación sin dependencias del DOM.
- `cajas.js`: catálogo único de cajas.
- `interfaz.js`, `styles.css`: estados, eventos y presentación.
- `cajas-selector.js`: selección y comparación de embalaje.
- `visor-3d.html`, `visor.js`, `visor.css`: representación del embalaje.
- `logo.svg`, `generar-iconos.py`: fuente del logo y generación de PNG/ICO con Pillow.
- `tests/`: regresiones de cálculo, interfaz y caché.
- `.github/workflows/pages.yml`: pruebas, preparación y despliegue a Pages solo si pasan.

## Cálculo y alcance

El check confirma el total planificado. Con diámetro máximo se puede elegir reparto exacto con rollos iguales o último rollo parcial. El embalaje minimiza el volumen total, con menor número de cajas en empate, en cuadrícula vertical sin holgura añadida. Las medidas interiores y el ajuste físico deben validarse en producción.

## Versiones y recuperación

La versión 2.0.0 incorpora las correcciones de auditoría, interfaz y nuevo logo. La etiqueta `backup/pre-2.0.0-2026-10-17` conserva la versión publicada anterior. Para recuperarla conservando el historial, crear una rama desde esa etiqueta y tramitar su restauración en `main`; no hace falta borrar ni forzar el historial.

Los iconos instalados en dispositivos pueden necesitar que el navegador actualice su caché o que se vuelva a crear el acceso directo.
