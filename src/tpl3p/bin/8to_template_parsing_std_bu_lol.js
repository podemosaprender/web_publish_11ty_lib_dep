//INFO: unificar html bottom up y generar macros
//U: bin/8to_template_parsing_std_bu.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv, yaml }= htmlutil;
//XXX:LIB {
const { HTMLToJSON, JSONToHTML } = require('html-to-json-parser');
const diff = require('deep-diff')
const logmm=  (m,...args) => {
	let f= (m.startsWith("ERR:EX")) ? 'trace' : 'log';
	console[f](m,...(args||[]).map(v => (typeof(v)=="object" ? JSON.stringify(v,null,2): v)))
}
//XXX:LIB }

DBG=1;

PFX2EL= {}
const ast_norm= (n,path=[]) => { //U: HTMLToJSON al formato que queremos comparar con diff
	if (typeof(n)!="object") { return n; }
	let npath= [n.type,...path]; let spath= npath.join(' ');//A: prefix order

	DBG && logmm("DBG:norm_n_a",n);
	if (n.attributes?.class) { 
		n.attributes.class= n.attributes.class.split(/\s+/); 
	}
	if (n.content) { 
		if (n.content.length==1 && typeof(n.content[0])=="string")  { n.txt= n.content[0]; delete n.content; }
		else { n.content.forEach((n) => ast_norm(n,npath)) }
	}
	DBG && logmm("DBG:norm_n_z",n);
	//A: normalice atributos
	return n;
}

let Nid= 1;
const T={}
const tadd1= (w,p) => { p ||= T; let r= (p[w] ||= {__id__: `__${Nid++}`,__cnt__: 0}); r.__cnt__++; return r }
tadd1('__END__') //A: para que tenga id facil
const tadd= (t,p) => tadd1('__END__', t.reduce( (p, e) => tadd1(e,p), null )).__id__;

const kv_to_lol= (n) => {
	if (typeof(n)!="object") { return ['__txt',n.replace(/\s+/gs,' ').trim()] }
	if (Array.isArray(n)) { return [n]; }
	let r= [
		n.type, 
		['__class', ...(n.attributes?.class || [])],
		['__att',...(Object.keys(n.attributes||{}).filter(k => (k!='class')).sort().map(k => [k, n.attributes[k]]) ).flat()],
		['__txt',n.txt ? n.txt.replace(/\s+/gs,' ').trim() : undefined],
		...((n.content||[]).map(kv_to_lol)),
	].map(e => (typeof(e)=="object" ? tadd(e) : e));
	logmm("DBG:to_lol",r,n);
	return tadd(r);
}

async function main() {
	src_path= process.argv[2];
	out_dir= process.argv[3] || 'xo';
	src_fname= src_path.match(/[^\/]+$/)[0];

	html= fs.readFileSync(src_path,'utf8');
	html= html.replace(new RegExp('"'+escapeRegex(src_fname),'gs'),'"');
	DBG && logmm("DBG:HTML_NOFILENAME",html);

	html_norm= htmlutil.norm_html(html).replace(/>\s+</gs,'><'); //A: espacios normalizados dentro de los tags
	root_selector= '#navbar-navlist'
	root_selector= '#pricing'
	//root_selector= '#blog'
	root_selector=null;

	body= htmlutil.parse_html(html_norm).querySelector(root_selector||'body')
	ast= await HTMLToJSON(body.outerHTML);
	//A: ast

	ast_norm(ast);
	//A: class es array, si content era solo texto va a txt XXX:vars para href, imagenes, etc. DESPUES de to_for?
	DBG && logmm("DBG:AST_NORM", ast);
	set_f('xast_norm.yaml',yaml.dump(ast,{sortKeys: true}))

	let ast_lol= kv_to_lol(ast);
	set_f('xast_lol.yaml',yaml.dump(ast_lol,{flowLevel:0}))

	set_f('xast_t.yaml',yaml.dump(T))

	const TInv= {}
	const tinvert= (kv,p=[]) => {
		if (p.slice(-1)[0]=='__END__') { TInv[kv.__id__]= p.slice(0,-1) } //A: como llegar a ese id
		Object.entries(kv).forEach( ([k,v]) => { if (k!='__id__' && k!='__cnt__') {
			tinvert(v,[...p,k]);
		}})
	}
	tinvert(T);
	set_f('xast_ti.yaml',yaml.dump(TInv,{flowLevel:1}))
	//TInv queda ordenado en prefix order

	const patt_min_len=2
	const TInvPatt= {}
	const patt_pending= {}
	let kprev, vprev;
	Object.entries(TInv).forEach( ([k,v]) => {
		if (vprev) {
			let xpatt= [], xprev=[], xthis=[], last_non_a=null; skip=0;
			v.every( (w,i) => { 
				let wp= vprev[i+skip], eq= (w==wp);
				console.log("XXX",i,eq,w,wp) 
				if (eq) { xpatt[i]= w; last_non_a=i; }
				else { if (i<patt_min_len) { xpatt= null; return false; } //A: stop attempt
					xpatt[i]=`__a${xthis.length}`;
					xprev.push(wp); xthis.push(w);
				}
				return true;
			})
			console.log("XXXp",xpatt,last_non_a ,xprev,xthis,v,vprev)
			let pattId;
			if (xpatt) {
				if (last_non_a<xpatt.length-1) { //A: todos los ultimos son argumentos
					xpatt= xpatt.slice(0,last_non_a);
					if (xpatt.slice(-1)[0]=='__a0') { xpatt.pop() };
					xpatt.push('__a*');
				}
				if (xpatt.indexOf('__a0')>-1 || xpatt.length>patt_min_len ) { pattId= tadd(xpatt); patt_pending[pattId]= xpatt; }
			}

			if (pattId) {
				TInvPatt[kprev]= [pattId,xprev];
				TInvPatt[k]= [pattId,xthis];
			} else {
				TInvPatt[k]= ['',v];
			}
		}
		kprev=k; vprev= v;
	})
	Object.entries(patt_pending).forEach(([k,v]) => {
		TInvPatt[k]= ['__p',v];
	}); //A: agrego los patterns
	set_f('xast_tip.yaml',yaml.dump(TInvPatt,{flowLevel:1}))
	
}

async function main_catch(){
	try{ await main(); }
	catch(ex) {console.log(ex);}
}

main_catch();

//XXX: tratar como patt de entrada, DESPUES si hay una sola instancia NO definir macro
//XXX: elegir el pattern que da "menos diferencia" en TAGS (ideal, solo cambio texto)
