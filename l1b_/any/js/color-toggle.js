(()=>{let t=()=>localStorage.getItem("theme"),a=()=>{var e=t();return e||(e=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",console.log({theme:e}),e)},r=e=>{"auto"===e?document.documentElement.setAttribute("data-bs-theme",window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):document.documentElement.setAttribute("data-bs-theme",e)},o=(r(a()),(e,t=!1)=>{var a,r,o,c=document.querySelector("#bd-theme");c&&(a=document.querySelector("#bd-theme-text"),o=document.querySelector(".theme-icon-active use"),r=(e=document.querySelector(`[data-bs-theme-value="${e}"]`)).querySelector("svg use").getAttribute("href"),document.querySelectorAll("[data-bs-theme-value]").forEach(e=>{e.classList.remove("active"),e.setAttribute("aria-pressed","false")}),e.classList.add("active"),e.setAttribute("aria-pressed","true"),o.setAttribute("href",r),o=`${a.textContent} (${e.dataset.bsThemeValue})`,c.setAttribute("aria-label",o),t)&&c.focus()});window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{var e=t();"light"!==e&&"dark"!==e&&r(a())}),window.addEventListener("DOMContentLoaded",()=>{o(a()),document.querySelectorAll("[data-bs-theme-value]").forEach(t=>{t.addEventListener("click",()=>{var e=t.getAttribute("data-bs-theme-value");localStorage.setItem("theme",e),r(e),o(e,!0)})})}),console.log("color-toggle-run")})(),console.log("color-toggle-load");