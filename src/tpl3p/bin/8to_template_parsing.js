//INFO: split an html file into our standard template
//U: bin/8to_template_parsing.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
const { out_dir }= htmlutil;
//XXX:LIB {
//XXX:LIB }

function node_diff(a,b,vs) {
	console.log("DFF0",a.outerHTML,b.outerHTML);
	if (a.outerHTML==null) { return } //XXX: si es b?

	let r= a.clone();
	let vs1= {}
	try {
	 	let a_attr= a.attributes || {} ; let b_attr= b.attributes || {}
		let c_attr= {};
		Object.entries(a_attr).forEach( ([k,v]) => { let vb= b_attr[k];
			if (vb==null) { c_attr['X_v_attr_SAFE']=''; vs1[k]=[v,vb] }
			else if (vb!=v && !k.startsWith('X_v_')) { c_attr[k]=`X_v_${k}`; vs1[k]=[v,vb] }
			else { c_attr[k]= v }
		})
		//DBG: console.log(has_diff, a_attr,b_attr,c_attr)	
		r.setAttributes(c_attr);

		let a_ch= a.childNodes;
		let b_ch= b.childNodes;
		if (a_ch.length==0 || a_ch.length!=b_ch.length) { console.log("CH LEN DIFF O VACIO"); }
		else {
			for (let i=0;i<a_ch.length;i++) {
				if (a_ch[i].outerHTML && b_ch[i].outerHTML) {
					let vsi= []
					r.childNodes[i]= node_diff(a_ch[i],b_ch[i],vsi);
					vs1._ch= vsi;
				}
			}
		}
	} catch (ex) {
		console.trace("DIF_EX",ex,a.outerHTML,b.outerHTML);
	}
	vs.push(vs1);
	return r;
}

function to_for(g,vs) {
	let ch= g.childNodes;
	if (ch.length<2) { return g; }
	for (let i=0; i<ch.length; i++) {
		ch[i]= to_for(ch[i],vs) //A: mutates!
	}
	let chC= ch[0]
	for (let i=1; i<ch.length; i++) {
		chC= node_diff(chC, ch[i],vs)
	}
	let f= htmlutil.parse_html('<x-for />')
	f.firstChild.set_content(chC)
	g.set_content(f);
}

function split_to_macros(g,p='r',acc={}) {
	let ch= g.childNodes
	//DBG: console.log(g.outerHTML)
	if (ch.length>1) {
		for (let i=0;i<ch.length;i++) { let chi=ch[i]; 
			if (chi && chi.rawTagName && chi.innerHTML) {
				let wants_split= "div section ul nav".indexOf(chi.rawTagName)>-1
				let id = (chi.attributes.id || p+'_'+i).replace(/\W/gsi,'_');
				console.log(i,{tag: chi.rawTagName, wants_split, id}, '\n'+chi.outerHTML);
				if (wants_split) {
					split_to_macros(chi.clone(),id,acc);
					let before= chi.innerHTML.match(/^(\s*)/)[0];
					let after= chi.innerHTML.match(/(\s*)$/)[0];
					chi.replaceWith(`${before}{{ ${id}(p) }}${after}`)
				}
				//		ch[i].setAttribute('X_SAFE_v_mivar','')
			}
		}
	}
	console.log("CONT", p, g.outerHTML);
	acc[p]= g;
	return acc;
}

async function main() {
	let html= htmlutil.html_read(); //A:norm, vars y links
	//g= ast.querySelector('.navbar-nav'); console.log(g.structure)

	let g= html.html_ast.querySelector('body'); 
	let parts= split_to_macros(g);
	set_f('xo/_includes/macros.njk', Object.entries(parts).sort((a,b) => a[0]>b[0]).map(([k,v]) => {
		return `
{% macro ${k}(p) %}	
${v.outerHTML}
{% endmacro %}
`
	}).join(''));

	htmlutil.data(html);
	htmlutil.page('{{ r(data); }}');
}

main();
