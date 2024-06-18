//INFO: utiles comunes para procesar html

fs= require('node:fs');
yaml = require('js-yaml');
prettier= require("prettier");
const { parse }= require('node-html-parser');

let out_dir= process.argv[3] || 'xo';

function escapeRegex(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function sort_kv(kv) {
	return Object.assign({},...Object.entries(kv).sort().map(([k,v])=>({[k]:v})));
}

function set_f(fpath, content) {
	let dir= fpath.replace(/[^\/]*$/,'');
	dir && fs.mkdirSync(dir,{recursive: true});
	fs.writeFileSync(fpath, content);
}

const voidTags=['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
parse_opts= {
	lowerCaseTagName: true,
	comment: true,
	voidTag:{
		tags: voidTags,
		closingSlash: true //A: void tag serialisation, add a final slash <br/>
	},
	blockTextElements: { //A: keep text content when parsing
		script: true, noscript: true, style: true, pre: true
	}
}
function norm_html(htmlo) {
	htmlo.html_ast= parse(htmlo.html,parse_opts)
	htmlo.html_norm= htmlo.html_ast.outerHTML //.replace(/<[^>]+/gs,(m) => m.replace(/\s+/gs,' ').trim())
	//DBG: console.log(html_norm)
	return htmlo;
}

async function pretty_html(h) {
	let s= await prettier.format(h,{parser: 'html', useTabs: true, printWidth: 2000})
	return s.replace(/<([^>]+)>/gs, (m,c) => ('<'+c.replace(/\s+/gs,' ').trim()+'>')) //A: espacios normalizados en tags
}

function html_vars(htmlo) {
	let strs= (htmlo.strs ||= {});
	let vars= (htmlo.vars ||= {});
	let txt_cnt= (htmlo.txt_cnt ||= 1);
	htmlo.html_vars= htmlo.html_norm.replace(/(<([^\s>\/]+)[^>]+>)([^<]+)/gs, (n,tag,tagname,s)=> {
		let s_clean= s.replace(/[\s]+/gs,' ').trim()
		if (s_clean.length>0) { 
			let s_varname= 'v_'+tagname+'_'+encodeURIComponent(s_clean).replace(/[^a-z0-9]+/gsi,'_')
			if (tag=='<title>') { s_varname= 'TITLE_' }
			else if (s_varname.length>15) { s_varname= 'v_txt_'+(txt_cnt++) }
			//DBG: console.log("V",s_varname,tagname,tag,s_clean)
			strs[s_clean]= (strs[s_clean] || 0)+1; 
			vars[s_varname]= s_clean;
			return `${ tag }{{ p.${s_varname} }}`;
		}
		return n;
	})
	//DBG: console.log(html_vars)
	//DBG: console.log(strs)sections_html= {}
	//A: html_vars tiene variables en vez de string literals, asi reemplazamos
	return htmlo;
}

function html_links(htmlo) {
	let links= (htmlo.links ||= {});
	let strs= (htmlo.strs ||= {});
	let vars= (htmlo.vars ||= {});
	let txt_cnt= (htmlo.txt_cnt ||= 1);
	htmlo.html_links= htmlo.html_vars.replace(/(<([^>\s\/]+)[^>]*?((?:src)|(?:href))="([^"]*)"[^>]*?)((?:(\/\s*)>)|(?:>(.*?)<\/\2))/gsi, 
		(m,tag,tagname,attr,v,_1,_2,content) => {
			if (tagname=="script" || tagname=="link" || v.match(/^\s*javascript:/)) return m; //A: dejamos igual

			vn= (content && content.match(/\{\{ (v_\w+) \}\}/)||[])[1]
			if (vn) { vname= `${vn}_${attr}`; } //A: teniamos var
			else { vname=`v_${tagname}_${attr}_${v.replace(/[^a-z0-9]+/gsi,'_')}`; }
			links[vname]= {tagname,attr,v,tag,content};
			vars[vname]= v;
			return m.replace(new RegExp(escapeRegex(`${attr}="${v}"`),'g'),`${attr}="{{ p.${vname} }}"`);
		}
	);
	//DBG: console.log(links);

	return htmlo
}

function html_read(fpath) {
	r= {}
	r.src_path= fpath || process.argv[2];
	r.src_fname= r.src_path.match(/[^\/]+$/)[0];

	let html= fs.readFileSync(r.src_path,'utf8');
	r.html= html.replace(new RegExp('"'+escapeRegex(r.src_fname),'gs'),'"');
	//DBG: console.log(html);
	norm_html(r); //A: espacios normalizados dentro de los tags
	html_vars(r); //A: constantes a var
	html_links(r); //A: links a var
	return r;
}

module.exports= {fs,set_f,yaml,escapeRegex,sort_kv,norm_html,pretty_html,parse_html: parse,voidTags, html_vars, html_links, out_dir,
	html_read,
};
