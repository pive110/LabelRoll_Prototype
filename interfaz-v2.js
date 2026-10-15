/* Label Roll Calculator · actualización visual v2
   Solo cambia presentación y comportamiento de campos. No modifica fórmulas. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  function inicializar() {
    const base = document.querySelector('.calculadora > .grid');
    if (!base || !($('total') && $('mandril') && $('etiquetasManual') && $('anchoRollo') && $('avance') && $('separacion') && $('diamMax') && $('espesor'))) return;
    if (base.dataset.interfazV2 === '1') return;
    base.dataset.interfazV2 = '1';

    const css = document.createElement('style');
    css.textContent = `
      .calculadora>.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 12px}
      .calculadora>.grid>.campo{min-width:0}
      .calculadora>.grid>.campo.campo-ancho-completo{grid-column:1/-1}
      .calculadora>.grid>.espesor-rapido{grid-column:1/-1}
      .calculadora>.grid .campo label{font-size:13px}
      .calculadora>.grid .campo input{min-width:0;font-size:17px}
      .titulo-app-v2{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;position:relative}
      .titulo-app-v2 h1{flex:1;min-width:0}
      .tema-switch{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:auto;flex:none;margin:0;padding:8px;border-radius:30px;border:1px solid #bbb;background:#f1f1f1;color:#222;font:700 12px Arial,sans-serif;min-height:40px}
      .tema-switch:focus-visible{outline:3px solid #e30613;outline-offset:2px}
      .tema-indicador{width:29px;height:16px;border-radius:20px;background:#ccc;display:inline-flex;align-items:center;padding:2px}
      .tema-indicador:after{content:"";display:block;width:12px;height:12px;background:#fff;border-radius:50%;transition:transform .15s ease}
      .theme-dark .tema-indicador{background:#e30613}
      .theme-dark .tema-indicador:after{transform:translateX(13px)}
      .boton-mini-espesor{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
      .boton-mini-espesor svg{width:15px;height:15px;flex:none}
      @media(max-width:520px){.calculadora>.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.calculadora>.grid .campo input{font-size:16px;padding:11px 9px}.calculadora>.grid .campo label{font-size:12px}.titulo-app-v2 h1{font-size:20px}}
      /* Tema oscuro aplicado al formulario, resultados, diálogo de espesor y tabla */
      body.theme-dark{background:#0d0d0e;color:#f2f2f2}
      body.theme-dark .calculadora{background:#19191b;box-shadow:0 4px 20px #0008}
      body.theme-dark .sub,body.theme-dark .seccion,body.theme-dark .unidad,body.theme-dark .nota,body.theme-dark .titulo,body.theme-dark .hint-rapido{color:#bcbcc2}
      body.theme-dark .seccion{border-color:#444}
      body.theme-dark input{background:#262629;color:#fff;border-color:#666;color-scheme:dark}
      body.theme-dark input::placeholder{color:#aaa}
      body.theme-dark input:focus{border-color:#ff3745}
      body.theme-dark .resultado{background:#252529}
      body.theme-dark .card{background:#35353b;color:#fff}
      body.theme-dark .card.principal{background:#101013;color:#fff}
      body.theme-dark .principal .titulo{color:#bbb}
      body.theme-dark .auto-info,body.theme-dark .recomendada{background:#29292d;color:#f2f2f2}
      body.theme-dark .auto-info strong,body.theme-dark .tag{color:#ff7580}
      body.theme-dark .comparacion th{background:#101013}
      body.theme-dark .comparacion td{border-color:#555}
      body.theme-dark .comparacion tr.ganadora{background:#482027}
      body.theme-dark .espesor-rapido{background:#242427;border-color:#555}
      body.theme-dark .espesor-rapido summary,body.theme-dark .espesor-cuerpo p{color:#eee}
      body.theme-dark .espesor-cuerpo{border-color:#555}
      body.theme-dark .espesor-resultado{background:#35353b}
      body.theme-dark .boton-mini-espesor{background:#391c22;color:#ff858e;border-color:#c82b3a}
      body.theme-dark .boton-mini-espesor:hover,body.theme-dark .boton-mini-espesor[aria-expanded="true"]{background:#e30613;color:#fff}
      body.theme-dark .tema-switch{background:#2c2c30;border-color:#666;color:#fff}
      body.theme-dark .error,body.theme-dark .espesor-error{background:#57252c;color:#fff}
    `;
    document.head.appendChild(css);

    const fields = [
      ['total',true],['mandril',false],['etiquetasManual',false],
      ['anchoRollo',true],['avance',false],['separacion',false],
      ['diamMax',true],['espesor',true]
    ];
    for (const [id,wide] of fields) {
      const field = $(id).closest('.campo');
      if (!field) continue;
      field.classList.toggle('campo-ancho-completo',wide);
      base.appendChild(field);
    }
    const espesorRapido = $('espesorRapido');
    if (espesorRapido) base.appendChild(espesorRapido);

    const fieldEtiquetas = document.querySelector('label[for="etiquetasManual"]');
    if (fieldEtiquetas) fieldEtiquetas.textContent = 'Etiquetas × rollo';
    const fieldMandril = document.querySelector('label[for="mandril"]');
    if (fieldMandril) fieldMandril.textContent = 'Ø mandril';

    const boton = $('toggleEspesor');
    if (boton) {
      boton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 7h8M8 11h1M12 11h1M16 11h.01M8 15h1M12 15h1M16 15h.01M8 18h1M12 18h4"/></svg>Calcular';
      boton.title = 'Abrir calculadora de espesor';
      boton.addEventListener('click', () => {
        const cantidad = $('etiquetasManual').value;
        if (cantidad && $('muestraEtiquetas')) $('muestraEtiquetas').value = cantidad;
      });
    }
    if ($('etiquetasManual') && $('muestraEtiquetas')) {
      $('etiquetasManual').addEventListener('input', () => {
        if (!espesorRapido || !espesorRapido.open) $('muestraEtiquetas').value = $('etiquetasManual').value;
      });
    }

    const h1 = document.querySelector('.calculadora > h1');
    if (h1) {
      const head = document.createElement('div');
      head.className = 'titulo-app-v2';
      h1.parentNode.insertBefore(head, h1);
      head.appendChild(h1);
      const switcher = document.createElement('button');
      switcher.type = 'button';
      switcher.className = 'tema-switch';
      switcher.setAttribute('aria-label','Cambiar entre modo claro y modo oscuro');
      switcher.innerHTML = '<span aria-hidden="true">☀</span><span class="tema-indicador" aria-hidden="true"></span><span aria-hidden="true">☾</span>';
      const aplicar = dark => {
        document.body.classList.toggle('theme-dark',dark);
        switcher.setAttribute('aria-pressed',String(dark));
        switcher.title = dark ? 'Modo oscuro: cambiar a claro' : 'Modo claro: cambiar a oscuro';
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = dark ? '#0d0d0e' : '#eeeeee';
        try { localStorage.setItem('labelroll-tema', dark ? 'oscuro' : 'claro'); } catch (_) {}
      };
      head.appendChild(switcher);
      let saved;
      try { saved = localStorage.getItem('labelroll-tema'); } catch (_) {}
      aplicar(saved !== 'claro');
      switcher.addEventListener('click', () => aplicar(!document.body.classList.contains('theme-dark')));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',inicializar,{once:true});
  else inicializar();
})();
