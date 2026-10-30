// Site appearance: "system" follows prefers-color-scheme; "light"/"dark" set data-theme on <html>.
// The choice lives in localStorage only (a per-visitor convenience); the inline script applies it before first paint.
export type ThemePref = "system" | "light" | "dark";
export const THEME_KEY = "gf-theme";

// --night (0..1) follows the visitor's clock: full night from 22:00 to 05:00, dusk and dawn ramps of two hours.
export function nightFor(hour: number): number {
  if (hour >= 22 || hour < 5) return 1;
  if (hour >= 20) return (hour - 20) / 2;
  if (hour < 7) return (7 - hour) / 2;
  return 0;
}

export const themeScript = `try{var p=localStorage.getItem("${THEME_KEY}"),d=document.documentElement;if(p==="light"||p==="dark"){d.dataset.theme=p}else{p="system"}d.dataset.themePref=p;var h=new Date().getHours()+new Date().getMinutes()/60,n=h>=22||h<5?1:h>=20?(h-20)/2:h<7?(7-h)/2:0;d.style.setProperty("--night",n.toFixed(2))}catch(e){}`;
