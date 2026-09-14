// Menú móvil
const botonMenu = document.getElementById('menu-boton');
const menu = document.getElementById('menu');
if (botonMenu && menu) {
  botonMenu.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', abierto);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
  }));
}

// Formulario por pasos
const form = document.getElementById('formulario');
if (form) {
  const pasos = [...form.querySelectorAll('.paso')];
  const marcas = [...form.querySelectorAll('.progreso li')];
  const relleno = form.querySelector('.relleno');
  const resumen = form.querySelector('[data-resumen]');
  const estado = document.getElementById('estado');
  const enviar = document.getElementById('enviar');
  let actual = 0;

  const validarPaso = (i) => {
    const paso = pasos[i];
    let ok = true;
    const ayuda = paso.querySelector('[data-ayuda]');
    const radios = paso.querySelectorAll('input[type="radio"][required]');
    if (radios.length && ![...radios].some(r => r.checked)) {
      ok = false;
      if (ayuda) { ayuda.classList.add('error'); ayuda.textContent = 'Elige una opción para continuar.'; }
    }
    paso.querySelectorAll('input:not([type="radio"])[required], select[required], textarea[required]').forEach(c => {
      const v = c.checkValidity();
      c.classList.toggle('invalido', !v);
      if (!v) ok = false;
    });
    return ok;
  };

  const etiqueta = (c) => {
    const l = form.querySelector(`label[for="${c.id}"]`);
    return l ? l.textContent : c.name;
  };

  const armarResumen = () => {
    const filas = [];
    const radio = form.querySelector('input[type="radio"]:checked');
    if (radio) filas.push(`<strong>${radio.name}:</strong> ${radio.value}`);
    pasos[1].querySelectorAll('input, select, textarea').forEach(c => {
      if (c.value) filas.push(`<strong>${etiqueta(c)}:</strong> ${c.value}`);
    });
    resumen.innerHTML = '<strong>Resumen de tu solicitud</strong><ul>' + filas.map(f => `<li>${f}</li>`).join('') + '</ul>';
  };

  const mostrar = (i) => {
    pasos.forEach((p, k) => p.classList.toggle('activo', k === i));
    marcas.forEach((m, k) => {
      m.classList.toggle('activo', k === i);
      m.classList.toggle('hecho', k < i);
    });
    relleno.style.width = ((i + 1) / pasos.length * 100) + '%';
    actual = i;
    if (i === pasos.length - 1) armarResumen();
    const primero = pasos[i].querySelector('input:not([type="radio"]), select, textarea');
    if (primero && window.matchMedia('(min-width: 760px)').matches) primero.focus();
  };

  form.querySelectorAll('[data-siguiente]').forEach(b => b.addEventListener('click', () => {
    if (validarPaso(actual)) mostrar(actual + 1);
  }));
  form.querySelectorAll('[data-atras]').forEach(b => b.addEventListener('click', () => mostrar(actual - 1)));

  // Al elegir una ficha, avanzar automáticamente
  form.querySelectorAll('.ficha input').forEach(r => r.addEventListener('change', () => {
    const ayuda = pasos[0].querySelector('[data-ayuda]');
    if (ayuda) { ayuda.classList.remove('error'); ayuda.textContent = `Seleccionaste: ${r.value}`; }
    setTimeout(() => mostrar(1), 250);
  }));

  // Contador de caracteres
  const area = form.querySelector('textarea');
  const contador = form.querySelector('[data-contador]');
  if (area && contador) area.addEventListener('input', () => contador.textContent = area.value.length);

  form.querySelectorAll('[required]').forEach(c => c.addEventListener('input', () => c.classList.remove('invalido')));

  // No enviar con Enter antes del último paso
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && actual < pasos.length - 1) {
      e.preventDefault();
      if (validarPaso(actual)) mostrar(actual + 1);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    estado.className = 'estado';
    estado.textContent = '';
    if (!validarPaso(actual)) {
      estado.classList.add('error');
      estado.textContent = 'Revisa los campos marcados en rojo.';
      return;
    }
    enviar.disabled = true;
    enviar.textContent = 'Enviando...';
    try {
      const datos = Object.fromEntries(new FormData(form));
      const resp = await fetch('https://formsubmit.co/ajax/produsanchez@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(datos)
      });
      const data = await resp.json();
      if (resp.ok && data.success !== 'false') {
        window.location.href = 'gracias.html';
      } else {
        throw new Error(data.message || 'Error');
      }
    } catch (err) {
      estado.classList.add('error');
      estado.textContent = 'No se pudo enviar. Escríbenos por WhatsApp o inténtalo de nuevo.';
      enviar.disabled = false;
      enviar.textContent = 'Enviar solicitud';
    }
  });

  mostrar(0);
}

// Reproducir videos en la página
const reproductor = document.getElementById('video-destacado');
const ahora = document.getElementById('ahora');
if (reproductor) {
  const tarjetas = document.querySelectorAll('.video-card');
  tarjetas.forEach(t => t.addEventListener('click', () => {
    const id = t.dataset.video;
    const titulo = t.querySelector('.titulo').textContent;
    reproductor.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    reproductor.title = titulo;
    if (ahora) ahora.textContent = `Reproduciendo: ${titulo}`;
    tarjetas.forEach(x => x.classList.toggle('activo', x === t));
    document.getElementById('reproductor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}

// Servicios: preseleccionar en el formulario
document.querySelectorAll('.servicio').forEach(s => {
  const ir = () => {
    const radio = document.querySelector(`.ficha input[value="${s.dataset.servicio}"]`);
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  };
  s.addEventListener('click', ir);
  s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } });
});

// Resaltar sección actual en la barra
const enlaces = [...document.querySelectorAll('.barra nav a[href^="#"]')];
const secciones = enlaces.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && secciones.length) {
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        enlaces.forEach(a => a.classList.toggle('actual', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  secciones.forEach(sec => obs.observe(sec));
}

// Filtrar trabajos por artista
const filtros = document.querySelectorAll('.filtro');
if (filtros.length) {
  filtros.forEach(f => f.addEventListener('click', () => {
    filtros.forEach(x => x.classList.toggle('activo', x === f));
    document.querySelectorAll('.videos li[data-artista]').forEach(li => {
      li.classList.toggle('oculto', f.dataset.filtro !== 'todos' && li.dataset.artista !== f.dataset.filtro);
    });
  }));
}
