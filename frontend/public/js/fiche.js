import { getByMatricule } from './api.js';
import { qs } from './utils.js';
import { mountAuthGuard, mountLogoutButton } from './auth.js';

function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export async function mountFichePage(){
  await mountAuthGuard();
  mountLogoutButton();
  const matricule = getParam('matricule');
  const msg = qs('#fiche-message');
  try{
    const u = await getByMatricule(matricule);
    qs('#fiche-container').classList.remove('d-none');
    qs('#f-nom').textContent = `${u.nom||''}`.trim() || 'Employé';
    qs('#f-matricule').textContent = u.matricule || '';
    qs('#f-statut').textContent = u.statut || 'employé';
    qs('#f-email').textContent = u.email || '';
    qs('#f-tel').textContent = u.telephoneqc || '';
    qs('#f-poste').textContent = u.poste || '';
    qs('#f-dept').textContent = u.departement || '';
    qs('#f-service').textContent = u.service || '';
    qs('#f-ville').textContent = u.ville || '';
  }catch(e){
    msg.textContent = e.message;
  }
}
