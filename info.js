// Formularios de nosotros.html y soporte.html: arman el mensaje y abren WhatsApp (no hay servidor)
document.querySelectorAll('form.info-wa').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault();
  const datos = [...new FormData(f)].filter(([, v]) => String(v).trim()).map(([k, v]) => `${k}: ${String(v).trim()}`);
  const txt = [f.dataset.wa, ...datos].join('\n');
  window.open(`https://wa.me/${window.WA_NUM}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
}));
