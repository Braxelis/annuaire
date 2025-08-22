import { currentUser, mountAuthGuard, mountLogoutButton } from './auth.js';
import { qs } from './utils.js';

export function mountProfilePage(){
  mountAuthGuard();
  mountLogoutButton();
  const u = currentUser();
  if(!u) return;
  qs('#p-nom').textContent = `${u.nom||''}`.trim() || 'Utilisateur';
  qs('#p-matricule').textContent = u.matricule || u.sub || '';
  qs('#p-statut').textContent = (u.statut || 'employé');
  qs('#p-email').textContent = u.email || '';
  qs('#p-tel').textContent = u.telephoneqc || '';
  qs('#p-poste').textContent = u.poste || '';
  qs('#p-dept').textContent = u.departement || '';
  qs('#p-service').textContent = u.service || '';
  qs('#p-ville').textContent = u.ville || '';
}
