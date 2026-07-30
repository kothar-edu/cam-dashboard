// Single source of truth for product branding shown across the dashboard UI
// (sidebar, login screen, header, browser tab, broadcast overlay tab title).
// Change VITE_APP_NAME in .env to rebrand everywhere at once.
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Crixo';
export const APP_LOGO = '/assets/cricket_app_icon.png';
