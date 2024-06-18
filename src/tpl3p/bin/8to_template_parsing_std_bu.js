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

const ast_patt= (n,path=[]) => { //U: reemplazar por patterns en ast normalizado
	if (typeof(n)!="object") { return n; }
	let npath= [n.type,...path]; let spath= npath.join(' ');//A: prefix order


	try {
		let patterns= ( PFX2EL[n.type] ||= []);
		DBG && logmm("DBG:patt_try",n.type,patterns);
		let matches;
		if (patterns.length>0) {
			matches= patterns
				.map( p => to_for_grp([p,n]) )
				.filter( ([matched]) => matched )
				.sort( (a,b) => (a[3]-b[3]) )
			DBG && logmm("DBG:patt_maybe",n.type,matches.length,matches);
		}
		patterns.push(n) //A: todos a patterns
		if (matches?.length>0) {
			let [matched,pattern,vals]= matches[0]; //XXX:elegir el mejor
			DBG && logmm("DBG:patt_find",n.type,pattern,vals);
			let r= {type: `XXXPAT${n.type}_${patterns.indexOf(pattern)}`, vals: vals[1]};
			return r;
		}
		//A: si encontro pattern devolvio

		if (n.content?.length>0) {
			n.content= n.content.reduce(([grp,gcur,tcur], ch) => {
				let p= ast_patt(ch,npath)
				DBG && logmm("DBG:for_try",tcur, p.type,p)
				if (p.type!=tcur) { tcur=p.type; gcur= []; grp.push(gcur); }
				gcur.push(p);
				return [grp,gcur,tcur];
			},[[],null,' '])[0]
				.map( 
					g=> (g.length>1 && g[0].type.startsWith('XXXPAT')) 
								? {type: 'XXXFOR', patt: g[0].type, vals: g.map(e => e.vals)} 
								: g 
				)
				.flat()
		}
	} catch(ex) {
		logmm("ERR:EX:ast_patt",spath,ex+'',n);
		throw(ex);
	}
	return n;
}

const ast_norm_r= (n) => { //U: el que procesamos con diff al que necesita JSONToHTML
	if (typeof(n)!="object") { return n; }
	DBG && logmm(n);
	try {
		if (n.attributes?.class) { 
			n.attributes.class= n.attributes.class.join(' '); 
		}
		if (n.content) { n.content.forEach(ast_norm_r) }
		else if (n.txt) { n.content=[n.txt]; delete n.txt; }	

		let m= n.type.match(/XXX(\S+)/);
		if (m) { n.attributes= {...n.attributes, XXX: n.type}; n.type='div'; } //A: para pretty
	} catch (ex) {
		logmm("ERR:ast_norm_r",ex,n)
		throw(ex);
	}
}

const to_for_grp= (chs) => {
	let vals= [{}];
	let chC= chs[0]; 
	let types_differ= false;
	for (let i=1; i<chs.length;i++) { let chi= chs[i]; vals[i]= {}
		let df= diff(chC, chi);
		df && df.forEach( (dfj,j) => {
			DBG && logmm('DBG:diff',j,types_differ,dfj)
			let [plast]= dfj.path.slice(-1)
			if (plast=='class') return;
			if ( types_differ= types_differ|| plast=='type') { return } //A: demasiado diferentes
			if ( plast=='content' )  { 
				//types_differ= (dfj.item.rhs?.content || dfj.item.lhs?.content)!=null
				DBG && logmm("DBG:diff_content",j,types_differ,dfj);
				if (types_differ) return 
			}

			let vname= 'XXX_'+dfj.path.join('__');
			DBG && logmm("DFj",j,vname,dfj);
			if (i==1 && dfj.lhs!=vname) { vals[i-1][vname]= dfj.lhs }
			if (dfj.hhs!=vname) { vals[i][vname]= dfj.rhs }

			let o= dfj.path.slice(0,-1).reduce( (o,k) => (o[k]|| (typeof(k)=="string" ? {} : [])), chC)
			o[plast]= plast=="content" ? [vname] : vname;
			//diff.applyChange(chC,chi,dfi);
		});
	}
	DBG && logmm("DBG:to_for_grp_R",chC,vals)
	//XXX:NO UNIFICAR DEMASIADO DIFERENTES! COMO? ej. div de cada seccion!
	//XXX:los top eran MISMO tipo ej div, pero adentro es todo diferente!
	return types_differ ? [false,chs,{}] : [true,chC,vals,Object.values(vals).reduce((c,v) => c+typeof(v)=="object"?10:1,0) ];
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
	//root_selector=null;

	body= htmlutil.parse_html(html_norm).querySelector(root_selector||'body')
	ast= await HTMLToJSON(body.outerHTML);
	//A: ast

	ast_norm(ast);
	//A: class es array, si content era solo texto va a txt XXX:vars para href, imagenes, etc. DESPUES de to_for?
	DBG && logmm("DBG:AST_NORM", ast);
	set_f('xast_norm.yaml',yaml.dump(ast,{sortKeys: true}))

	apatt= ast_patt(ast)
	DBG && logmm("DBG:AST_PATT", apatt);
	let PATT={}
	Object.entries(PFX2EL).forEach(([t,vs]) => vs.forEach( (v,i) => (PATT[`XXXPAT${t}_${i}`]=v))) 
	set_f('xast_patt.yaml',yaml.dump(PATT));
	logmm("R", apatt);
	set_f('xast_gen.yaml',yaml.dump(apatt,{sortKeys: true}))
}

async function main_catch(){
	try{ await main(); }
	catch(ex) {console.log(ex);}
}

main_catch();

//XXX: tratar como patt de entrada, DESPUES si hay una sola instancia NO definir macro
//XXX: elegir el pattern que da "menos diferencia" en TAGS (ideal, solo cambio texto)
