// Site appearance: "system" follows prefers-color-scheme; "light"/"dark" set data-theme on <html>.
// The choice lives in localStorage only (a per-visitor convenience); the inline script applies it before first paint.
export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "gf-theme";

export const themeScript = `try{var p=localStorage.getItem("${THEME_KEY}"),d=document.documentElement;if(p==="light"||p==="dark"){d.dataset.theme=p}else{p="system"}d.dataset.themePref=p}catch(e){}`;
