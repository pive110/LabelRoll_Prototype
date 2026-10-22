# Label Roll 2.2.0 · 22/10/2026

Actualización visual de las cuatro herramientas: Preparar pedido pasa al primer lugar; se mantienen los cálculos, el embalaje, la ficha impresa y el visor 3D.

- Interfaz clara/oscura con controles redondeados, ayudas visibles en móvil y tipografía del sistema.
- Logo con marca roja, giro de 180 grados asociado al tema y nombre compacto.
- Calculadora de espesor en ventana modal; ayudas para diámetro de preparación y espesor en la comprobación de bobina restante.
- Comparativa compacta de embalajes y botones Caja completa / Última caja estimada en el visor.
- Corrección de navegación tras retirar el antiguo desplegable; Enter avanza entre los campos de las cuatro herramientas.
- Indicador rojo en Nuevo trabajo cuando hay datos y caché offline actualizada a 2.2.0.

Validación previa a publicación: 32 pruebas de Node correctas. Prueba en Chrome con HTTP local del paquete generado: navegación entre herramientas, Enter, cálculo y selección de embalaje, ambas representaciones del visor, tres calculadoras auxiliares, sincronización de espesor, reinicio de trabajo y ausencia de desbordamiento horizontal a 390 y 1280 px. Recarga y cálculo offline, incluido acceso al visor, correctos. Sin errores JavaScript en los recorridos comprobados.

No se ha realizado una auditoría completa de accesibilidad ni pruebas de instalación y actualización en dispositivos físicos Android/iPhone.
