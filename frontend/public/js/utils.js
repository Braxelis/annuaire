export const qs  = (s, r=document)=> r.querySelector(s);
export const qsa = (s, r=document)=> Array.from(r.querySelectorAll(s));
export function setText(el, t){ if(el) el.textContent = t; }
export function badgeStatut(s){
  const v = (s||'').toLowerCase();
  if (v.includes('stag')) return '<span class="badge bg-warning text-dark">Stagiaire</span>';
  if (v.includes('a.s'))  return '<span class="badge bg-secondary">A.S</span>';
  return '<span class="badge bg-success">Employé</span>';
}
export function toast(msg, cls='text-danger'){
  const el = document.createElement('div');
  el.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-3 p-2 px-3 bg-white border rounded shadow ' + cls;
  el.style.zIndex = 1080;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 3000);
}
