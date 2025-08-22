import { logout } from './api.js';

export async function loadPartials() {
    try {
        // Chargement du header
        const headerResponse = await fetch("public/partials/header.html");
        const headerContent = await headerResponse.text();
        document.getElementById("header-placeholder").innerHTML = headerContent;

        // Chargement du footer
        const footerResponse = await fetch("public/partials/footer.html");
        const footerContent = await footerResponse.text();
        document.getElementById("footer-placeholder").innerHTML = footerContent;

        // Gestion du bouton de déconnexion
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    // Désactiver le bouton pendant la déconnexion
                    logoutBtn.disabled = true;
                    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Déconnexion...';
                    
                    await logout();
                    window.location.href = "login.html";
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                    alert("Une erreur est survenue lors de la déconnexion");
                    
                    // Réactiver le bouton en cas d'erreur
                    logoutBtn.disabled = false;
                    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
                }
            });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des partials:", error);
    }
}
