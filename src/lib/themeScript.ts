/**
 * Inline no-flash theme script (D-002), the only client JS on the site; must stay under 1 KB.
 * Readable form:
 *   theme = localStorage.theme if it is 'light' or 'dark' (storage errors ignored),
 *           else 'dark' when prefers-color-scheme is dark, else 'light';
 *   <html data-theme=theme> is set before first paint;
 *   on DOMContentLoaded every [data-theme-toggle] gets aria-pressed ("true" when dark) and,
 *   on click, flips the theme, saves it (errors ignored) and updates aria-pressed on all toggles.
 * Values written to the DOM are only the literals 'light' / 'dark'; stored values are never echoed.
 */
export const THEME_SCRIPT = `(function(){var d=document,r=d.documentElement,k='theme',t;
try{t=localStorage.getItem(k)}catch(e){}
if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
r.dataset.theme=t;
d.addEventListener('DOMContentLoaded',function(){var b=d.querySelectorAll('[data-theme-toggle]'),i;
function s(){for(var j=0;j<b.length;j++)b[j].setAttribute('aria-pressed',r.dataset.theme==='dark'?'true':'false')}
s();for(i=0;i<b.length;i++)b[i].addEventListener('click',function(){t=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=t;try{localStorage.setItem(k,t)}catch(e){}s()})})})();`;
