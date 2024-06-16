//INFO: split an html file into our standard template
//U: bin/8to_template_parsing.js my_template/index.html

const htmlutil= require('./htmlutil.js');
const { escapeRegex, set_f, sort_kv }= htmlutil;
//XXX:LIB {
const { HTMLToJSON, JSONToHTML } = require('html-to-json-parser');
const diff = require('deep-diff')
//XXX:LIB }

DBG=0;

const ast_norm= (n) => {
		if (typeof(n)!="object") { return n; }
		DBG && console.log(n);
		if (n.attributes?.class) { 
			n.attributes.class= n.attributes.class.split(/\s+/); 
		}
		if (n.content) { 
			if (n.content.length==1 && typeof(n.content[0])=="string")  { n.txt= n.content[0]; delete n.content; }
			else { n.content.forEach(ast_norm) }
		}
	}
	const ast_norm_r= (n) => {
		if (typeof(n)!="object") { return n; }
		DBG && console.log(n);
		if (n.attributes?.class) { 
			n.attributes.class= n.attributes.class.join(' '); 
		}
		if (n.content) { n.content.forEach(ast_norm) }
		else if (n.txt) { n.content=[n.txt]; delete n.txt; }	
	}


async function main() {
	src_path= process.argv[2];
	out_dir= process.argv[3] || 'xo';
	src_fname= src_path.match(/[^\/]+$/)[0];

	html= fs.readFileSync(src_path,'utf8');
	html= html.replace(new RegExp('"'+escapeRegex(src_fname),'gs'),'"');
	//DBG: console.log(html);
	html_norm= htmlutil.norm_html(html).replace(/>\s+</gs,'><'); //A: espacios normalizados dentro de los tags
	root_selector= '#navbar-navlist'
	root_selector= '#pricing .row:nth-child(2)'

	body= htmlutil.parse_html(html_norm).querySelector(root_selector||'body')
	ast= await HTMLToJSON(body.outerHTML);
	//A: ast
	
	ast_norm(ast);
	//A: class es array, si content era solo texto va a txt XXX:vars para href, imagenes, etc. DESPUES de to_for?
	DBG && console.log(JSON.stringify(ast,null,2));

	vals= [{}];
	chs= ast.content;
	chC= chs[0]; 
	for (let i=1; i<chs.length;i++) { chi= chs[i]; vals[i]= {}
		let df= diff(chC, chi);
		df.forEach( (dfj,j) => {
			let [plast]= dfj.path.slice(-1)
			if (plast=='class') return;

			let vname= 'XXX_'+dfj.path.join('__');
			DBG && console.log("DFj",j,vname,dfj);
			if (i==1 && dfj.lhs!=vname) { vals[i-1][vname]= dfj.lhs }
			if (dfj.hhs!=vname) { vals[i][vname]= dfj.rhs }

			let o= dfj.path.slice(0,-1).reduce( (o,k) => o[k], chC)
			o[plast]= vname;
			//diff.applyChange(chC,chi,dfi);
		});
	}
	DBG && console.log("CHG",vals,JSON.stringify(chC,null,2))
	ast_norm_r(ast);
	h2= JSONToHTML(ast);
	console.log(h2);
}

main();
