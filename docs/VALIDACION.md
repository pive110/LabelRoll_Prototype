# Validación de Label Roll 2.0.0 · 17 de octubre de 2026

Registro de cambios y validación de la versión 2.0.0. La publicación se realiza mediante GitHub Actions después de superar las pruebas.

## Qué incorpora

- Entrada visual de 1,25 segundos con solo el icono rojo centrado, zoom de entrada y desvanecimiento hacia la app; sin animación cuando se solicita movimiento reducido. Desaparece mediante CSS incluso si JavaScript falla; no representa progreso de descarga.

- Invalidación de resultados, check y visor al editar o fallar un cálculo.
- Espesor de muestra ligado a los datos con los que se calculó; aplicación bloqueada si cambian.
- Validación estricta de números, coma decimal, errores junto a cada campo y límite del cálculo de divisores.
- Dos modos con diámetro máximo: rollos iguales (predeterminado) o máximo aprovechamiento con último rollo parcial.
- Embalaje automático por menor volumen total; en empate, menor cantidad de cajas. Recomendación y selección diferenciadas.
- Detalles técnicos desplegables, tabla compacta, interfaz de escritorio en columnas y móvil adaptable.
- Check de etiquetas planificadas; no certifica fabricación real.
- Visor con capacidad máxima o última caja, salto al resultado final, velocidad y movimiento reducido.
- Teclado contextual en la muestra, fondo inerte en el diálogo y comunicación de foco entre visor y calculadora.
- Ficha imprimible del cálculo actual.
- Catálogo, cálculo, interfaz y estilos separados; retirados los cuatro archivos de presentación sustituidos.
- Corrección del fallback offline del visor, limpieza de cachés limitada a la app, identidad estable del manifest y aviso de actualización.

## Prueba local

Recarga `index.html` en la pestaña existente. Introduce:

| Campo | Valor |
|---|---|
| Cantidad total | 102000 |
| Mandril | 84 |
| Etiquetas por rollo | 1500 |
| Ancho | 90 |
| Avance | 200 |
| Separación | 15,9 |
| Diámetro máximo | vacío |
| Espesor | 0,115 |

Resultado esperado: 68 rollos, diámetro 233,40 mm, 323,85 m por rollo; CampoFr, 2 rollos por caja, 34 cajas y 2 rollos en la última.

1. Cambia la cantidad: los resultados anteriores deben quedar pendientes hasta recalcular.
2. Calcula espesor con muestra de 230,7 mm y 1500 etiquetas; cambia el avance y comprueba que Aplicar queda desactivado.
3. Prueba cantidad 1009 y diámetro máximo 150: compara ambos modos. El modo exacto produce rollos de una etiqueta; el modo de aprovechamiento permite un último rollo parcial.
4. Selecciona otra caja: la estrella de recomendación permanece y el check de selección cambia.
5. Abre el visor, cambia a Última caja y pulsa Ver resultado final. Prueba también Escape y navegación con Tab.
6. Revisa tema claro/oscuro, ancho móvil y zoom 200 %. Imprime la ficha desde el botón para comprobar la vista previa.

## Verificación realizada y límites

Suite `node --test tests/regresiones.test.cjs`: 11 pruebas, incluyendo 1000 repartos, estados de interfaz mediante DOM simulado, visor parcial y caché offline simulada. Linkedom es una dependencia de desarrollo; la app sigue funcionando sin dependencias externas de ejecución.

La inspección visual automatizada de la URL file:// está bloqueada por la herramienta. Pendientes: revisión visual real, teclado/lector de pantalla, impresión, rendimiento en móvil, instalación y actualizaciones offline reales en Android/iPhone. Un archivo local no registra service workers: esa parte requiere servir la app por HTTP local o HTTPS durante la validación previa a publicación.

No se han inventado medidas interiores, tolerancias, costes, pesos ni disponibilidad de stock. El embalaje sigue usando cuadrícula vertical y un solo formato por pedido. El visor representa todos los rollos con el diámetro del rollo completo, incluido el último parcial.

Pendientes de otra fase: stock, catálogo de materiales, borradores de pedidos y mezcla de formatos. La publicación queda condicionada a las pruebas en GitHub Actions.
