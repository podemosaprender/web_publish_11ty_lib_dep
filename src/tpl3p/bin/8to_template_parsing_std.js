//INFO: split an html file into our standard template
//U: bin/8to_template_parsing.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
//XXX:LIB {
const { HTMLToJSON, JSONToHTML } = require('html-to-json-parser');
const diff = require('deep-diff')
const logmx=  (m,...args) => {
	console.log(m,...(args||[]).map(v => (typeof(v)=="object" ? JSON.stringify(v,null,2): v)))
}
//XXX:LIB }

DBG=1;

const ast_norm= (n) => { //U: HTMLToJSON al formato que queremos comparar con diff
	if (typeof(n)!="object") { return n; }
	DBG && logmx(n);
	if (n.attributes?.class) { 
		n.attributes.class= n.attributes.class.split(/\s+/); 
	}
	if (n.content) { 
		if (n.content.length==1 && typeof(n.content[0])=="string")  { n.txt= n.content[0]; delete n.content; }
		else { n.content.forEach(ast_norm) }
	}
}

const ast_norm_r= (n) => { //U: el que procesamos con diff al que necesita JSONToHTML
	if (typeof(n)!="object") { return n; }
	DBG && logmx(n);
	try {
		if (n.attributes?.class) { 
			n.attributes.class= n.attributes.class.join(' '); 
		}
		if (n.content) { n.content.forEach(ast_norm_r) }
		else if (n.txt) { n.content=[n.txt]; delete n.txt; }	

		let m= n.type.match(/XXX(\S+)/);
		if (m) { n.attributes= {...n.attributes, XXX: n.type}; n.type='div'; } //A: para pretty
	} catch (ex) {
		logmx("ERR:ast_norm_r",ex,n)
		throw(ex);
	}
}

const to_for_grp= (chs) => {
	let vals= [{}];
	let chC= chs[0]; 
	for (let i=1; i<chs.length;i++) { let chi= chs[i]; vals[i]= {}
		let df= diff(chC, chi);
		df.forEach( (dfj,j) => {
			DBG && logmx('DBG:diff',j,dfj)
			let [plast]= dfj.path.slice(-1)
			if (plast=='class') return;

			let vname= 'XXX_'+dfj.path.join('__');
			DBG && logmx("DFj",j,vname,dfj);
			if (i==1 && dfj.lhs!=vname) { vals[i-1][vname]= dfj.lhs }
			if (dfj.hhs!=vname) { vals[i][vname]= dfj.rhs }

			let o= dfj.path.slice(0,-1).reduce( (o,k) => (o[k]|| (typeof(k)=="string" ? {} : [])), chC)
			o[plast]= plast=="content" ? [vname] : vname;
			//diff.applyChange(chC,chi,dfi);
		});
	}
	DBG && logmx("DBG:to_for_grp_R",chC,vals)
	//XXX:NO UNIFICAR DEMASIADO DIFERENTES! COMO?
	return [{type:'XXXFOR', content: [chC]}];
}

const to_for= (ast) => {
	const chs= ast.content;
	if (! (chs?.length>0)) return; //A: nada que hacer
	DBG && logmx("DBG:to_for",ast.type)
	chs.forEach(to_for); //A: depth first

	DBG && logmx("DBG:to_for_top",chs)

	let chs_grps_acc= chs.reduce( ([g,tcur,gcur],chx) => {
		let tx= typeof(chx)=='object' ? chx.type : ''
		if (tx!=tcur) { gcur= []; g.push(gcur); } //A: empieza tipo, agregar grupo
		gcur.push(chx) //A: agregar al grupo actual
		return [g,tx,gcur]
	}, [[]])
	let chs_grps= chs_grps_acc[0]
	DBG && logmx("DBG:to_for_grp",chs_grps)
		
	ast.content= chs_grps.map( g => (g.length>1 ? to_for_grp(g) : g[0]) ).flat()
	DBG && logmx("DBG:to_for_R",ast)
}

async function main() {
	src_path= process.argv[2];
	out_dir= process.argv[3] || 'xo';
	src_fname= src_path.match(/[^\/]+$/)[0];

	html= fs.readFileSync(src_path,'utf8');
	html= html.replace(new RegExp('"'+escapeRegex(src_fname),'gs'),'"');
	DBG && logmx("DBG:HTML_NOFILENAME",html);

	html_norm= htmlutil.norm_html(html).replace(/>\s+</gs,'><'); //A: espacios normalizados dentro de los tags
	root_selector= '#navbar-navlist'
	//root_selector= '#pricing .row:nth-child(2)'
	root_selector= '#blog'

	body= htmlutil.parse_html(html_norm).querySelector(root_selector||'body')
	ast= await HTMLToJSON(body.outerHTML);
	//A: ast

	ast_norm(ast);
	//A: class es array, si content era solo texto va a txt XXX:vars para href, imagenes, etc. DESPUES de to_for?
	DBG && logmx("DBG:AST_NORM", ast);

	to_for(ast);

	ast_norm_r(ast);
	h2= (await JSONToHTML(ast))
	h2= h2.replace(/<([^\s>]+)([^>]*)><\/\1>/gs,'<$1$2 />')
	h2= await htmlutil.pretty_html(h2);
	logmx("RESULT",h2);	
}

main();
