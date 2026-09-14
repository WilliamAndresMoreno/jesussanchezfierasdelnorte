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

// Formulario de cotización (envío sin recargar la página)
const form = document.getElementById('formulario');
if (form) {
  const estado = document.getElementById('estado');
  const boton = document.getElementById('enviar');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    estado.className = 'estado';
    estado.textContent = '';

    let valido = true;
    form.querySelectorAll('[required]').forEach(c => {
      const ok = c.checkValidity();
      c.classList.toggle('invalido', !ok);
      if (!ok) valido = false;
    });
    if (!valido) {
      estado.classList.add('error');
      estado.textContent = 'Revisa los campos marcados en rojo.';
      return;
    }

    boton.disabled = true;
    boton.textContent = 'Enviando...';
    try {
      const resp = await fetch('https://formsubmit.co/ajax/produsanchez@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
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
      boton.disabled = false;
      boton.textContent = 'Enviar solicitud';
    }
  });

  form.querySelectorAll('[required]').forEach(c => {
    c.addEventListener('input', () => c.classList.remove('invalido'));
  });
}
