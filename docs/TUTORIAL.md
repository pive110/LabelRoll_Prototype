# Tu primer trabajo con Label Roll Calculator

Guía para quien abre la aplicación por primera vez y para quien la presenta a otra persona. Basada en la versión local 2.1.0, revisada el 22/10/2026.

## 1. Qué puedes hacer

Label Roll Calculator te ayuda a preparar un pedido de etiquetas y comprobar el material durante la producción.

| Herramienta del inicio | Para qué sirve |
| --- | --- |
| Parada de máquina | Obtener el diámetro de parada a partir del mandril, la marca roja y un margen. |
| Rollos y empaquetado | Calcular etiquetas por rollo, rollos necesarios, diámetro, metros y cajas. |
| Margen de desperdicio | Comparar la tirada disponible con el material que requiere el pedido. |
| ¿Me alcanza para terminar? | Comprobar si la bobina restante permite fabricar las etiquetas pendientes. |

Puedes entrar en cualquiera de ellas. Para conocerlas todas, sigue el recorrido de esta guía.

## 2. Antes de empezar

Pulsa **Nuevo trabajo** en el inicio para limpiar los datos y resultados de todos los apartados. Hazlo al comenzar otro pedido: el borrado es inmediato.

Introduce las medidas en **milímetros** y las longitudes de tirada en **metros lineales**. Escribe las cantidades sin puntos de miles: `300000`. Para decimales puedes usar coma o punto: `0,15` o `0.15`.

Estos conceptos aparecerán varias veces:

- **Mandril:** tubo central. Utiliza su diámetro exterior.
- **Avance:** longitud de una etiqueta en el sentido de desplazamiento, sin la separación.
- **Separación:** espacio entre etiquetas. La app lo suma al avance; si queda vacío, considera cero.
- **Ancho del rollo:** medida a lo largo del tubo; permite calcular las capas dentro de la caja.
- **Espesor:** espesor total efectivo del material enrollado, incluido el soporte. `0,15 mm` equivale a `150 µm`.
- **Figuras:** bandas de etiquetas en paralelo a lo ancho de la bobina. Con tres figuras, cada avance produce tres etiquetas.

**Para la demostración:** vamos a preparar 300000 etiquetas, en rollos de 1000, con tres figuras. Los valores son un ejemplo de práctica.

## 3. Preparar los rollos y el embalaje

Entra en **Rollos y empaquetado** e introduce:

| Campo | Valor de ejemplo |
| --- | --- |
| Cantidad total | 300000 |
| Ø mandril | 90 |
| Etiquetas × rollo | 1000 |
| Ancho del rollo | 45 |
| Avance | 38,1 |
| Separación | 0 |
| Figuras de la bobina | 3 |
| Ø máximo | Dejar vacío |
| Espesor | 0,15 |

Pulsa **CALCULAR**. Comprueba que aparecen:

- **1000 etiquetas por rollo** y **300 rollos**.
- **Ø final teórico de 124,00 mm**.
- **38,10 m por rollo**.
- **3810 m de bobina necesaria estimada**, sin merma de producción.
- **300000 etiquetas planificadas**.

El check verde confirma que el reparto previsto coincide con el pedido. La cantidad realmente fabricada debe contarse durante la producción.

### Entender y elegir las cajas

Con el ancho introducido, la app compara los formatos de su catálogo. En este ejemplo recomienda **N1**, con **36 rollos por caja** y **9 cajas en total**: ocho completas y una con doce rollos.

La recomendación busca menos cajas y, en empate, menor volumen total. Puedes pulsar otro formato disponible y comprobar cómo cambian la capacidad, las cajas necesarias y la última caja.

La tabla muestra la distribución por capa y el número de capas. Compara cuadrícula y patrones alternados. La estrella señala la caja recomendada y el check la seleccionada.

Abre **Ver detalle del cálculo** para consultar el último rollo, las medidas utilizadas, el patrón elegido y los huecos calculados. El embalaje supone rollos verticales y no añade holguras: comprueba el ajuste real con las medidas interiores de la caja.

Si dejas el ancho vacío, puedes calcular la producción; las cajas requieren ese dato.

### Ver cómo se llena la caja

Pulsa **VISTA 3D**. En **Representación**, elige:

- **Capacidad máxima de la caja**, para ver una caja llena.
- **Última caja del pedido**, para ver cuántos rollos lleva la última.

Usa ▶ para reproducir o pausar, reiniciar para comenzar otra vez y **Ver resultado final** para completar la colocación. Puedes cambiar la velocidad a 1×, 2× o 4×. Cierra con ×.

La vista representa el diámetro del rollo completo, también cuando el pedido incluye uno parcial. Está disponible para capacidades de hasta 300 rollos por caja y sirve como esquema de colocación.

### Imprimir la preparación

Pulsa **IMPRIMIR FICHA** para abrir la impresión del navegador. La ficha incluye el pedido, los rollos, el material y el embalaje seleccionado. Si el diálogo de impresión ofrece guardar como PDF, también puedes conservarla así.

## 4. Cuando el cliente indica un diámetro máximo

En el mismo apartado, introduce un **Ø máximo** mayor que el mandril. La app calculará automáticamente las etiquetas por rollo; el campo manual queda desactivado.

Prueba **135 mm** y compara las dos opciones de reparto:

| Opción | Qué hace |
| --- | --- |
| Rollos iguales · pedido exacto | Busca una cantidad por rollo que permita completar el pedido con todos los rollos iguales y respetar el diámetro máximo. |
| Aprovechar Ø máximo · último rollo parcial | Aprovecha la capacidad calculada y deja las etiquetas restantes para el último rollo. |

Pulsa **CALCULAR** después de cada cambio y revisa **Ver detalle del cálculo**. El reparto exacto puede reducir bastante las etiquetas por rollo según la cantidad pedida. Para volver a fijar 1000 etiquetas manualmente, borra el diámetro máximo.

## 5. Si desconoces el espesor

En **Rollos y empaquetado**, completa mandril, avance y separación con los datos de un rollo de muestra ya fabricado.

1. Pulsa **Calcular espesor**, junto al campo Espesor. También puedes acceder desde **Opciones adicionales · espesor desde una muestra**.
2. Introduce el diámetro exterior medido y las etiquetas reales del rollo de muestra.
3. Pulsa **CALCULAR ESPESOR**.
4. Revisa el resultado en milímetros y micras.
5. Pulsa **USAR ESTE ESPESOR** y vuelve a **CALCULAR** el pedido.

Para practicar con el material del ejemplo, utiliza mandril `90`, avance `38,1`, separación `0`, diámetro medido `124` y `1000` etiquetas. Obtendrás aproximadamente **0,15 mm**.

Es una estimación geométrica del conjunto enrollado. Utiliza una muestra del mismo material y mide sin comprimirla. Si cambias los datos de la muestra, calcula de nuevo antes de aplicar el espesor.

## 6. Calcular la parada de máquina

Vuelve al inicio y entra en **Parada de máquina**.

1. Introduce `90` en **Ø exterior del mandril vacío**.
2. Introduce `50` en **Del mandril a la marca roja**. Es una distancia radial, desde el exterior del tubo hasta la marca, como indica el dibujo.
3. Introduce `5` en **Margen antes de la marca**.
4. Pulsa **CALCULAR DIÁMETRO DE PARADA**.

El objetivo será **195 mm**: 90 + 2 × 50 + 5.

También puedes pulsar **Cargar ejemplo: mandril 90 mm y distancia 50 mm** para completar las dos primeras medidas. Comprueba el margen antes de calcular.

El margen está expresado en milímetros de **diámetro**. Un objetivo mayor hace que la máquina se detenga antes. Con margen cero, el objetivo coincide con el diámetro de la marca: en este caso, **190 mm**. Ajusta el margen a la respuesta real de la máquina.

Selecciona cada campo para identificar su medida en el dibujo y abre **Cómo se calcula** para consultar la fórmula.

## 7. Comprobar el margen de desperdicio

Vuelve al inicio y entra en **Margen de desperdicio**. Introduce o revisa:

| Campo | Valor |
| --- | --- |
| Tirada del maquinista | 4000 |
| Etiquetas del pedido | 300000 |
| Figuras en paralelo | 3 |
| Etiquetas por rollo terminado | 1000 |
| Avance | 38,1 |
| Separación | 0 |

Pulsa **CALCULAR MARGEN**. Obtendrás **190 m de margen**, equivalentes a unos **14,96 rollos terminados**.

La tirada necesita 3810 m para cubrir el pedido y dispone de 4000 m. Introduce los metros que indica el maquinista directamente: la app ya tiene en cuenta las figuras.

Prueba a cambiar la tirada a `3700` y vuelve a calcular: faltarán **110 m**. Con `3810`, la tirada queda ajustada al pedido, sin margen teórico para pérdidas.

Los rollos equivalentes expresan una cantidad de material; pueden incluir decimales.

## 8. Comprobar si la bobina restante alcanza

Entra en **¿Me alcanza para terminar?**. Esta herramienta combina lo que ya has fabricado con una estimación del material útil restante.

Para una prueba sencilla, introduce:

| Campo | Valor |
| --- | --- |
| Etiquetas totales del pedido | 300000 |
| Cajas completas ya hechas | 0 |
| Rollos por caja completa | 36 |
| Rollos sueltos terminados | 200 |
| Etiquetas por rollo terminado | 1000 |
| Etiquetas válidas adicionales | 0 |
| Ø actual de la bobina | 250 |
| Ø exterior de la preparación | 190 |
| Espesor total del material con soporte | 0,15 |
| Figuras en paralelo | 3 |
| Avance | 38,1 |
| Separación | 0 |

Pulsa **COMPROBAR BOBINA RESTANTE**. Verás que:

- Hay **200000 etiquetas válidas fabricadas** y **100000 pendientes**.
- Quedan unos **138,23 m útiles**.
- Se necesitan unos **1270,03 m** para terminar.
- **No alcanza según la estimación**: faltan unos **1131,80 m**.

Prueba después con un diámetro actual de `600` y vuelve a comprobar: el material estimado sí alcanza.

En un trabajo real, cuenta las cajas completas y añade solo los rollos sueltos que quedan fuera de ellas. Usa las etiquetas adicionales para un rollo parcial válido; evita contarlo también como rollo completo.

La preparación se excluye usando su diámetro exterior. En este ejemplo son **190 mm**, aunque la parada se haya configurado a 195 mm con margen. Los metros restantes son una estimación por diámetro y espesor; las pérdidas posteriores consumen el margen mostrado.

## 9. Atajos y comportamiento general

- **Datos compartidos:** pedido, figuras, avance, separación, etiquetas por rollo y espesor se trasladan entre los apartados relacionados. Mandril también se comparte entre rollos y parada. La última edición prevalece.
- **Datos calculados:** al calcular el embalaje se trasladan las etiquetas por rollo y la capacidad de la caja seleccionada a las comprobaciones correspondientes. Al cambiar de caja se actualizan los rollos por caja.
- **Preparación:** las medidas del mandril y la marca pueden completar su diámetro en la comprobación de bobina restante, sin añadir el margen de parada. Revisa que corresponda a la bobina utilizada.
- **Cambios:** después de editar datos, vuelve a pulsar el botón de cálculo del apartado. Los resultados anteriores dejan de estar vigentes.
- **Navegación:** usa **Volver al inicio** para cambiar de herramienta conservando los datos durante la sesión.
- **Aspecto:** pulsa el logo superior para alternar entre tema claro y oscuro. La preferencia se recuerda en el navegador cuando está disponible el almacenamiento local.
- **Sin conexión:** la versión web dispone de caché para funcionar después de una primera carga y preparación correctas en el navegador.
- **Actualizaciones:** cuando aparezca **Nueva versión disponible**, puedes pulsar **Actualizar**. Conserva antes los datos que necesites: la actualización recarga la aplicación.

No hay un historial de pedidos en esta versión. Conserva la ficha o anota los datos que necesites antes de recargar o empezar otro trabajo.

## 10. Guion para enseñársela a otra persona

Puedes presentar la app con este recorrido:

1. «Aquí eliges qué necesitas calcular». Muestra las cuatro herramientas del inicio.
2. «Vamos a preparar un pedido». Introduce el ejemplo de 300000 etiquetas y explica rollos, metros y diámetro.
3. «Ahora elegimos cómo embalarlo». Compara cajas, abre la vista 3D y muestra la última caja.
4. «Si el cliente limita el diámetro, la app reparte los rollos». Prueba 135 mm y los dos modos.
5. «Si no sabemos el espesor, podemos estimarlo desde una muestra». Muestra el cálculo y cómo aplicarlo.
6. «Antes de producir, calculamos la parada». Muestra la diferencia entre marca y margen.
7. «Con los metros de tirada, comprobamos cuánto podemos perder». Prueba 4000 y 3700 m.
8. «Durante el trabajo, podemos comprobar si llegamos al final». Introduce producción válida y diámetro restante.
9. «La ficha permite conservar la preparación». Muestra la impresión y termina señalando **Nuevo trabajo**.

Para comprobar que la persona lo ha entendido, pídele que prepare el pedido de ejemplo, encuentre las nueve cajas necesarias y explique por qué un margen de 190 m no equivale a 190 rollos.
