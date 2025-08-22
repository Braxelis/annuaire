//Lien du backend
const API_BASE_URL = "http://localhost:8000/api";

//Gestion du token
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

//Fonction de sauvegarde du token
export function saveToken(token, userData) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

//Fonction de récupération du token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

//Fonction de suppression du token
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

//Fonction pour vérifier si l'utilisateur est connecté
export function isAuthenticated() {
    return !!getToken();
}

//Fonction pour récupérer les données de l'utilisateur
export function getUserData() {
    try {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
    }
}

//Fonction de requête générique avec gestion des erreurs
async function apiRequest(endpoint, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Une erreur s'est produite");
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la requête API:", error);
        throw error;
    }
}

//Fonction pour l'authentification de l'utilisateur
export async function login(matricule, motdepasse) {
    const data = await apiRequest("login", {
        method: "POST",
        body: JSON.stringify({ matricule, motdepasse }),
    });

    if (data.token) {
        saveToken(data.token, data.user);
        return true;
    } else {
        return false;
    } 
}

//Fonction pour la déconnexion de l'utilisateur
export async function logout() {
    try {
        await apiRequest("logout", {
            method: "POST",
        });
        clearAuth();
    } catch (error) {
        console.error("Erreur lors de la demande de déconnexion:", error);
    }finally {
        clearAuth();
    }
}

//Fonction pour récupérer les informations de l'utilisateur courant
export async function getMe() {
    try {
        return await apiRequest("me");
    } catch (error) {
        console.error("Erreur lors de la demande de données utilisateur:", error);
        return null;
    }
}

//Fonction pour la recherche de personnel
export async function searchPersonnel(query = "") {
    try {
        return await apiRequest(`personnel?query=${encodeURIComponent(query)}`);
    } catch (error) {
        console.error("Erreur lors de la recherche de personnel:", error);
        return [];
    }
}

//Fonction pour la récupération de tous les personnels
export async function getAllPersonnel() {
    try {
        return await apiRequest("personnel");
    } catch (error) {
        console.error("Erreur lors de la recherche de personnel:", error);
        return [];
    }
}