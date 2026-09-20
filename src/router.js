// src/router.js
import { writable } from 'svelte/store';

// Guarda la ruta inicial (por defecto 'inicio')
export const currentRoute = writable('inicio');

// Función global para cambiar de página
export function navigate(route) {
    currentRoute.set(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}