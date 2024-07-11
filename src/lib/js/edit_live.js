/* INFO: extraer strings y reemplazar desde hash, live */

function el(spec) { return typeof(spec)=='string' ? document.querySelector(spec) : spec }
function t2e(spec) {
    let e0= el(spec);
    let b0= e0.innerHTML;
		let b1= b0.replace(/>([^<]+)</gsi,'><span class="xe">$1</span><'); 
    e0.innerHTML= b1;
    let r= Object.assign({}, ...(Array.from(e0.querySelectorAll('.xe')).map(e => ({[e.innerText]: e}))))
    return r;
}

function setTxt() {
    let m= decodeURI(location.hash).match(/^#o-o.t=(\{.*)/); if (!m) return;
    let t2= JSON.parse(m[1]);
    let cartel= document.createElement('div');
    cartel.innerHTML='<div style="background:red; font-size: 2rem; padding: 1rem; position: fixed; top: 0px; z-index: 9999;">EDITANDO</div>'
    document.body.prepend(cartel);
    let b_t2e= t2e('body');
    Object.entries(t2).forEach(([k,v]) => {(b_t2e[k]||{}).innerText=v});
    if (t2._k_) { prompt("keys",JSON.stringify(Object.keys(b_t2e))) }
}
setTxt()


