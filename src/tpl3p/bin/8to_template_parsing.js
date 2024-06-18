//INFO: split an html file into our standard template
//U: bin/8to_template_parsing.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
//XXX:LIB {
//XXX:LIB }

function cmp_str(stl,stlx) {
	let cmp= stl.map( (l,i) => {
		let lx= stxl[i];
		let p= l.trim().split('.')
		let px= lx.trim().split('.')
		let ponly= p.filter( e => (px.indexOf(e)<0) )
		let pxonly= px.filter( e => (p.indexOf(e)<0) )
		return [l==lx ? '=':'X', ponly, pxonly, l, lx] 
	})
	return cmp;
}

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

async function main() {
	src_path= process.argv[2];
	out_dir= process.argv[3] || 'xo';
	src_fname= src_path.match(/[^\/]+$/)[0];

	html= fs.readFileSync(src_path,'utf8');
	html= html.replace(new RegExp('"'+escapeRegex(src_fname),'gs'),'"');
	//DBG: console.log(html);
	html_norm= htmlutil.norm_html(html).replace(/>\s+</gs,'><'); //A: espacios normalizados dentro de los tags
	ast= htmlutil.parse_html(html_norm).getElementsByTagName('body')[0]
	//DBG: console.log(ast)
	//g= ast.querySelector('.navbar-nav'); console.log(g.structure)
	g= ast.querySelector('#pricing .row:nth-child(2)'); console.log(g.structure)
	ch= g.childNodes
	if (false) { //by structure
		st= ch[0].structure; console.log(st);
		stl= st.split(/\n/);
		for (i=1;i<ch.length;i++) {
			stx= ch[i].structure
			stxl= stx.split(/\n/)
			cmp= cmp_str(stl, stxl)
			console.log(st==stx,cmp)
		}
	}
	for (i=0;i<ch.length;i++) {
		console.log(i,ch[i].attributes);
		ch[i].setAttribute('X_SAFE_v_mivar','')
	}
	console.log(g.outerHTML)

	let vs=[]
	to_for(g,vs)
	console.log(g.outerHTML)
	console.log(JSON.stringify(vs,null,2));
}

main();
