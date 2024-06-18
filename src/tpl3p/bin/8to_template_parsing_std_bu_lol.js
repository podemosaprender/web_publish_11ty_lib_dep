//INFO: unificar html bottom up y generar macros
//U: bin/8to_template_parsing_std_bu.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv, yaml }= htmlutil;
//XXX:LIB {
const { HTMLToJSON, JSONToHTML } = require('html-to-json-parser');
const diff = require('deep-diff')
const logmm=  (m,...args) => {
	let f= (m.startsWith("ERR:EX")) ? 'trace' : 'log';
	console[f](m,...(args||[]).map(v => (typeof(v)=="object" ? JSON.stringify(v): v)))
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
const tadd= (t,p) => tadd1('__END__', t.reduce( (p, e) => tadd1(Array.isArray(e) ? tadd(e) : e,p), null )).__id__;

const kv_to_lol= (n) => {
	if (typeof(n)!="object") { return ['__txt',n.replace(/\s+/gs,' ').trim()] }
	if (Array.isArray(n)) { return [n]; }
	let r= [
		n.type, 
		['__class', ...(n.attributes?.class || [])],
		['__att',...(Object.keys(n.attributes||{}).filter(k => (k!='class')).sort().map(k => [k, n.attributes[k]]) )],
		['__txt',...(n.txt ? [ n.txt.replace(/\s+/gs,' ').trim()] : [])],
		...((n.content||[]).map(kv_to_lol)),
	].map(e => (typeof(e)=="object" ? tadd(e) : e));
	logmm("DBG:to_lol",r,n);
	return tadd(r);
}

const listdiff= (l1,l2,diff_idx_min) => {
	//l2= [ '__class', 'rounded', 'text-center','verde', 'active', 'very', 'p-4' ] 
	//l1= [ '__class', 'pricing-box', 'rounded', 'text-center','rojo', 'p-4','ymas!','mucho mas' ]
	//l1= 'nada que ver p-4'.split(' ')
	logmm("DBG:listdiff",l1,l2,diff_idx_min)
	let patt=[], a1=[],a2=[];
	let i1=0;i2=0;
	while (i1<l1.length || i2<l2.length) { let w1= l1[i1], w2= l2[i2];
		if (w1==w2) { patt.push(w1); i1++; i2++; }
		else { if (diff_idx_min && patt.length<diff_idx_min) { patt= false; break; }
			let n1= l1.indexOf(w2,i1), n2=l2.indexOf(w1,i2);
			if (n1<0 && n2<0) { patt.push('__a'+a1.length); a1.push(w1); a2.push(w2); i1++; i2++; }
			else if (n2<0) { patt.push('__a'+a1.length); a1.push(w1); a2.push(undefined); i1++; }
			else { patt.push('__a'+a1.length); a1.push(undefined); a2.push(w2); i2++; }
		}
	}
	logmm("DBG:listdiff_R",{patt,a1,a2,l1,l2})
	return [patt,a1,a2]
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

	const patt_min_len=1
	const TInvPatt= {}
				
	const patt_pending= {}

	const patt_try= ([kprev,vprev],[k,v]) => { //XXX:usar con CUALQUIER par, lo que MAS me importa es el FOR!
		logmm("DBG:patt",{k,kprev},v,vprev)
		if (vprev && kprev!=k) {
			let [xpatt, xprev, xthis]= listdiff(vprev,v,patt_min_len);
			let pattId;
			if (xpatt && xpatt.length>1 && xpatt[1]=='__a0') { //A: class! considerar distancia
				let c1= TInvPatt[xprev[0]]; let c2= TInvPatt[xthis[0]];
				logmm("DBG:patt_class",{k,kprev,c1,c2,xthis,xprev,v,vprev})
				xpatt= v.length-xthis.length>1 ? xpatt : false;
			}
			if (xpatt) {
				let last_non_arg_idx= xpatt.findLastIndex( e => !e.startsWith('__a') )
				logmm("DBG:patt_star",last_non_arg_idx,xpatt);
				if (last_non_arg_idx<xpatt.length-1) { //A: todos los ultimos son argumentos
					xpatt= xpatt.slice(0,last_non_arg_idx+1);
					xpatt.push('__a*');
					logmm("DBG:patt_star_R",last_non_arg_idx,xpatt);
				}
				if (xpatt.find(e => e.startsWith('__a')) || xpatt.length>patt_min_len ) { 
					pattId= tadd(xpatt); patt_pending[pattId]= xpatt; 
				}
			}

			if (pattId) {
				logmm("DBG:patt_add",pattId,kprev,k,xpatt,xprev,vprev,xthis,v)
				TInvPatt[kprev]= [pattId,xprev];
				TInvPatt[k]= [pattId,xthis];
			} else {
				TInvPatt[k]= ['',v];
			}
		}
	}; //END: patt_try

	
	Object.entries(TInv).forEach(([k,v]) => { TInvPatt[k]= ['',v]; }); //A: agrego sin patterns
	let kvprev=[]; Object.entries(TInv).filter(kv=>(kv[1].length>1 && kv[1][0]=='__class')).forEach(kv => { patt_try(kvprev,kv); kvprev= kv });  //A: patterns para class
	Object.entries(patt_pending).forEach(([k,v]) => { TInvPatt[k]= ['__p',v]; }); //A: agrego los patterns nuevos

	logmm("DBG:BF");
	const grp_by_head= (ids,grp) =>	(
		ids.map(id =>[id,TInvPatt[id]])
			.reduce((acc,[k,v]) => { (acc[v[1][0]] ||= []).push([k,v[1]]); return	acc }, grp)
	)

	const visit_breadthfirst= (from_id,max_i=3) => {
		if (!from_id?.match(/^__\d+/)) return {};
		const from= TInvPatt[from_id];
		const ids= from[1].slice(3)
		const gq= grp_by_head(ids,{});
		const kvprev= {}
		for (let i=0; i<max_i;) { 
			Object.entries(gq).forEach(([t,kvs]) => { logmm("DBG:BFQ",i,t,kvs.length,kvs);
				if (t.match(/^__\d+/)) return ; //A: no hacemos pattern de pattern!
				let idq=[], fid='CALC';
				for (let idx= 0;fid;idx++) { 
					for (let j=0;j<kvs.length;j++) {
						let kv= kvs[j][1]; fid= kv[3+idx]; logmm("BFG:BFQ1",{idx,j,fid,kv});
						if (fid && fid!= idq.slice(-1)[0]) { idq.push(fid) }
					}	
				}
				logmm("DBG:BFQL",i,t,idq)
				i += idq.length; grp_by_head(idq,gq);
				idq.forEach(id => { let kv= [id,TInvPatt[id][1]], h= kv[1][0];
					logmm("DBG:BFQL1",{h},kv)
					if (!h || h.match(/^__\d+/)) return;
					patt_try(kvprev[h] || [], kv); kvprev[h]= kv;
				});  //A: patterns para class
			})
			Object.entries(patt_pending).forEach(([k,v]) => { TInvPatt[k]= ['__p',v]; }); //A: agrego los patterns nuevos
		}
	}
	visit_breadthfirst(ast_lol,1000)


	set_f('xast_tip.yaml',yaml.dump(TInvPatt,{flowLevel:1}))

	const expand= (id) => {
		if (! (typeof(id)=='string' && id.match(/^__\d+/))) return id;

		let r;
		DBG && logmm('DBG:expand',id);
		let [pidP,d]= TInvPatt[id];
		DBG && logmm('DBG:expand_def',{id,pidP},d);
		let dex= d.map( expand ); r=dex; //DFLT
		DBG && logmm('DBG:expand_data',{id,pidP},{d,dex});
		if (pidP.match(/^__\d+/)) {
			let patt= TInvPatt[pidP][1];
			DBG && logmm('DBG:expand_patt',{id,pidP},{patt,d,dex});
			let idx_last=-1;
			r= patt
					.map( e => { 
						let idx= (e.match && e.match(/__a(\d+)/)||[])[1] 
						if (idx) { idx_last= idx; return dex[idx]}
						return e; 
					})
			if (patt.slice(-1)[0]=='__a*') {
				DBG && logmm('DBG:expand_patt_star',{id,pidP,idx_last},{patt,d,dex});
				r.pop(); r= [...r, ...dex.slice(idx_last+1)]	
			}
			r= r.map(expand)
			DBG && logmm('DBG:expand_patt_R',{id,pidP},{r,patt,dex});
		}
		try { if (r[2][0]=='__att') { r[2].push(['ID___',id]); r[2].push(['IDP___',pidP]); }} catch(ex) {}
		return r.filter(e => e!=null);
	}

	let lol= expand(ast_lol)
	
	const lol_to_html= (lol) => {
		if (Array.isArray(lol) && lol.length==1 && Array.isArray(lol[0])) lol=lol[0] //XXX:FIXME!
		if (!Array.isArray(lol)) return lol;
		if (lol[0]=='__txt') return lol[1];
		logmm("DBG:lol_to_html",lol)
		let [h,[_1,...cls],[_2,...att],...content]= lol;
		console.log({content},lol)
		let hasContent= content.length>0 && (content[0][1] || content.length>1) //A: siempre viene un __txt
		DBG && logmm("DBG:lol_to_html",{h,hasContent,cls,att,content})
		let r= ['<',h, 
			cls?.length>0 ? ` class="${cls.filter(e=>e).join(' ')}"` : '', 
			att?.length>0 ? ` ${att.filter(e=>e).map(([k,v]) => (k==v ? k : k+'="'+v+'"')).join(' ')}` : '', 
			'>',...content.map(lol_to_html),
			htmlutil.voidTags.indexOf(h)>-1 ? '': `</${h}>`,
		].join('');
		logmm("DBG:lol_to_html_R",r);
		return r;
	}
	htmlg= lol_to_html(lol);
	logmm("DBG:HTMLG",htmlg)
	set_f('xg.html',htmlg.replace(/</gs,'\n<'));
	set_f('xexpand.html',await htmlutil.pretty_html(htmlg));
}

async function main_catch(){
	try{ await main(); }
	catch(ex) {console.log(ex);}
}

main_catch();

//XXX: tratar como patt de entrada, DESPUES si hay una sola instancia NO definir macro
//XXX: elegir el pattern que da "menos diferencia" en TAGS (ideal, solo cambio texto)
