//INFO: generic functions to keep reusable but add to 11ty
//SEE: this.page this.eleventy https://www.11ty.dev/docs/shortcodes/#scoped-data-in-shortcodes

const DBG=process.env.DBG

const fs = require("fs");
const StreamTransform = require('stream').Transform;
const StreamReadable= require('stream').Readable
//XXXconst htmlmin = require("html-minifier");
//XXXimport { Buffer } from "node:buffer";
const minifyHtml = require("@minify-html/node");
const CleanCSS = require('clean-css');
const UglifyJS = require("uglify-js");
const browserify = require('browserify');
const { DateTime } = require("luxon");
const loremIpsum = require("lorem-ipsum").loremIpsum;
const yaml = require("js-yaml");
const plantUmlToSvg= require("./plantuml.js");
const lunr_index_gen = require('./search-lunr/create-index.js');
const { palette, palette2html } = require('./palette.js');
const { BasePath } = require('../env.js');
console.log({BasePath})

module.exports = { data: {}, filter: {}, collection: {}, shortCode: {}, shortCodePaired: {}, transform: {}, BasePath }

let CFG; //A: set by addToConfig options param
module.exports.addToConfig= function (eleventyConfig, options, kv) {
	kv= kv || module.exports;
	CFG= options;
	Object.entries(kv.data).forEach( ([k,v]) => eleventyConfig.addGlobalData(k,v) );
	Object.entries(kv.shortCodePaired).forEach( ([k,v]) => eleventyConfig.addPairedShortcode(k,v) );
	Object.entries(kv.shortCode).forEach( ([k,v]) => eleventyConfig.addShortcode(k,v) );
	Object.entries(kv.filter).forEach( ([k,v]) => eleventyConfig.addFilter(k,v) );
	Object.entries(kv.collection).forEach( ([k,v]) => eleventyConfig.addCollection(k,v) );
	Object.entries(kv.transform).forEach( ([k,v]) => eleventyConfig.addTransform(k,v) );

	//eleventyConfig.addNunjucksGlobal('wlib','bs')
	eleventyConfig.addPassthroughCopy(`${CFG.dir.input}/**/*.{js,css}`,{
		filter: '!*.gen.js',
		transform: DBG<1 ? xfrm_STREAM : null,
	});
	eleventyConfig.addPassthroughCopy(`${CFG.dir.input}/**/{img,fonts}/**`);
	eleventyConfig.addPassthroughCopy(`${CFG.dir.input}/**/*.{png,jpg,jpeg,svg,webp,ttf,woof*}`);
	//A: Copy the `img` and `css` folders to the output
}

/************************************************************/
//S: transformaciones como minimizar separadas de la gilada de 11ty
function xfrm_html(inputPath,outputPath,content) { 
	if ((outputPath || "").endsWith(".html")) {
		try {
			//SEE: https://docs.rs/minify-html/latest/minify_html/struct.Cfg.html
			let minified = minifyHtml.minify(Buffer.from(content),{
				do_not_minify_doctype: true,
				ensure_spec_compliant_unquoted_attribute_values: true,
				keep_spaces_between_attributes: true,
				keep_closing_tags: true,
				keep_html_and_head_opening_tags: true,
				minify_css: true,
				minify_js: false, //XXX:rompe
			}).toString();
			minified= minified.replace(/<script>(.*?)<\/script>/gsi,(m,js) => `<script>${xfrm_js(inputPath+'SCRIPT.js',outputPath+'SCRIPT.js',js)}</script>`); //XXX: ver por que no lo hace minifyHtml
			return minified;
		} catch (ex) { console.error("ERROR:htmlmin",inputPath,outputPath,ex); }
	}
	return content;//A: If not an HTML output, return content as-is
};

function xfrm_css(inputPath,outputPath,content) { //XXX:mover a lib, estandarizar signature transforms
	if ((outputPath || "").endsWith(".css")) {
		try {
			let minified = new CleanCSS({level: 1}).minify(content);
			DBG>7 && console.log("cssmin",minified);
			return minified.styles;
		} catch (ex) { console.error("ERROR:cssmin",inputPath,outputPath,ex); }
	}
	return content;//A: If not css output, return content as-is
}
function xfrm_js(inputPath,outputPath,content) { 
	if ((outputPath || "").endsWith(".js")) {
		try {
			let minified = UglifyJS.minify(content);
			DBG>7 && console.log("jsmin",outputPath,minified);
			if (minified.error) { throw(minified.error); }
			else { return minified.code };
		} catch (ex) { console.error("ERROR:jsmin",inputPath,outputPath,ex); }
	}
	return content;//A: If not js output, return content as-is
}

function xfrm_MAIN(inputPath,outputPath,content) { 
	return [xfrm_html, xfrm_css,xfrm_js].reduce( (c,f) => f(inputPath,outputPath,c), content);
}
module.exports.xfrm_MAIN= xfrm_MAIN;
function xfrm_STREAM(src, dst, stats) {
		let chunks= [];
		return new StreamTransform({
			transform(chunk, enc, more)  { chunks.push(chunk); more(null); },
			flush() {
				let s= Buffer.concat(chunks).toString("utf-8");
				this.push(xfrm_MAIN(src,dst,s));
			}
		});
}	
module.exports.xfrm_STREAM= xfrm_STREAM;

const path_abs= (p,root,base) => ((p.startsWith('/') ? root : base+'/')+p);
const ensure_dir= (p) => fs.mkdirSync(p,{recursive: true});

/************************************************************/
/* page {
  date: 2024-06-22T02:19:03.119Z,
  inputPath: './src/this_site/g1ex/index.njk',
  fileSlug: 'g1ex',
  filePathStem: '/g1ex/index',
  outputFileExtension: 'html',
  templateSyntax: 'njk',
  url: '/g1ex/',
  outputPath: '_site/g1ex/index.html'
} */

const O_OCMD= {}

O_OCMD.TRY_PATHS= function O_OCmdTryPaths(params) { //U: elegir primer path existente entre opciones
	const try_paths= (root,base) => {
		let paths=  params.opts.map(p => path_abs(p,root,base));
		let found= paths.find(p => fs.existsSync(p)) //XXX: OjO! para out puede no haber ocurrido el build aun!
		DBG>5 && console.log("O-O:COMMANDS:TRY_PATHS:"+base,{found, root, paths})
		if (found) { return found.substr(root.length) }
	}
	let found= (
		try_paths(params.CFG.dir.input, params.ibase) ||
		try_paths(params.CFG.dir.output, params.obase) 
	)
	//A: probamos primero en input pq en general son estaticos que pusimos con el archivo
	if (found) { return found }
	else { return "O-O:ERROR:TRY_PATHS:NONE FOUND:"+params.m	}
}

O_OCMD.COPY= function O_OCopy(params) { //U: copiar un archivo al output, ej un json que queres usar desde el cliente
	let opts= params.cmd_s.split(/\s+/)
	const dstspec= opts[1]||someparts(opts[0],-1)
	const src= path_abs(opts[0], params.CFG.dir.input, params.ibase);
	const dst= path_abs(dstspec, params.CFG.dir.output, params.obase);
	DBG>0 && console.log("O-O:COMMANDS:COPY:",{src,dst,opts})
	try { 
		fs.cpSync(src,dst,{recursive: true}); 
		return dstspec;
	} catch (ex) { console.log("O-O:ERROR:COPY:",{src,dst,opts},ex) }
}

O_OCMD.INCLUDE= function O_OInclude(params) { //U: reemplazar marca por contendo del archivo
	const src= path_abs(params.cmd_s, params.CFG.dir.input, params.ibase);
	DBG>0 && console.log("O-O:COMMANDS:INCLUDE:",{src})
	try { 
		return fs.readFileSync(src,'utf8'); 
	} catch (ex) { console.log("O-O:ERROR:INCLUDE:",{src},ex) }
}


O_OCMD.SEARCH_IDX= function O_OCmdSearchIdx(params) { //U: construir indice de busqueda con lista recibida
	let opts= params.cmd_s.split(/\s+/)
	let idx_url= opts.shift()+'.txt'; //A: required by webservers
	const gen_idx= async () => {
		let dst= path_abs(idx_url,params.CFG.dir.output,params.obase);
		let docs= await Promise.all(opts.map( async o => { let [p,url]= o.split('=');
			try {
				let content= fs.readFileSync(p,'utf8');
				let title= (content.match(/<title>([^<]*)<\/title>/si)||[])[1]||'untitled';
				return {url,content,title} //OjO! las url del indice NO tienen BasePath, asi podemos moverlo
			} catch(ex) { console.error("O-O:ERROR:SEARCH_IDX:can't read",p) }
			return null;
		}));
		await	lunr_index_gen(dst, docs.filter(d => d));
		DBG>3 && console.log(`#O-O#${params.cmd}:${params.opath} DONE`,dst,idx_url);
	};
	gen_idx();
	return idx_url;
}
							
module.exports.transform.O_O_COMMANDS= function transform_O_O_COMMANDS(content) {
	const opath= this.page.outputPath || '';
	const ipath= this.page.inputPath || '';
	const ext= (opath.match(/\.[^\.]+$/)||[])[0];
	DBG>5 && console.log("O-O:COMMANDS TRY:",{ext, opath})
	if (opath && ['.html','.css'].indexOf(ext)>-1) {
		content= content.replace(/#O-O#(\w+)(.)(.*?)\2/gs,(m,cmd,sep,cmd_s) => {
			let opts= cmd_s.split(/\s+/);
			DBG>5 && console.log("O-O:COMMANDS:"+opath,{cmd,cmd_s})
			DBG>5 && console.log(this.page)
			let obase= opath.replace(/\/?[^\/]*$/,'');
			let ibase= ipath.replace(/\/?[^\/]*$/,'');

			let cmd_f= O_OCMD[cmd];
			if (cmd_f) { 
				let r= cmd_f({CFG,obase,opath,ext,ibase,ipath,opts,m,cmd,sep,cmd_s,content,page:this.page}); 
				if (r!=null) { return r; }
			}
			return "O-O:ERROR:"+m
		});
	}
	//A: commands applied
	let meta_links= {};
	content= content.replace(/<link\s([^>]*)\/?>/gsi,(m,opts) => {
		let href= (opts.match(/href=\"([^"]*)\"/si)||[])[1]
		DBG>3 && console.log("O-O:COLLECT_METALINK",{href,opts})	
		if (!href) { return m }
		meta_links[href] ||= m;
		return '';
	});
	content= content.replace(/<\/head>/, Object.values(meta_links).join('\n')+'\n</head>')

	let scripts_pending= {}, scripts_loaded= {};
	content= content.replace(/<script([^>]*)>(.*?)<\/script>/gsi,(m,opts,content) => {
		let src= (opts.match(/src=\"([^"]*)\"/si)||[])[1]
		DBG>1 && console.log("O-O:SCRIPT",{src,opts})	
		if (content || !src || m.match('oo_keep_here')) {
			let r= Object.values(scripts_pending).join('\n')+m;
			scripts_loaded= {...scripts_loaded, ...scripts_pending};
			scripts_pending= {};
			return r; //A: flush, may be dependencies
		}
		if (!scripts_loaded[src]) {scripts_pending[src]= m};
		return '';
	}); //A: collected all scripts, removed with src to place at the end
	content= content.replace(/<\/body>/, Object.values(scripts_pending).join('\n')+'\n</body>')
	//A: consolidate scripts and css

	if (BasePath!='') { 
		content= content.replace(/((?:url\())(\/[^\)"]+)/gsi, (m,pfx,p) => {
			//XXX:intento los que NO reemplazo antes 11ty
			let r= pfx+ (p.startsWith(BasePath) ? '' : BasePath) + p 
			console.log("BasePath",BasePath,p,r,m)
			return r;
		})
	}
	//A: BasePath ej del ambiente de github empieza con barra
	return content;
};

if (!DBG || DBG<1) { //OjO! tiene que ser despues de O_O_COMMANDS porque rompe ej minjs
	console.log("WILL MINIMIZE htmlmin, cssmin, jsmin");
	module.exports.transform.O_O_MINIFY= function O_O_MINIFY(content) {
		return xfrm_MAIN(this.page.inputPath, this.page.outputPath, content);
	};
}

/************************************************************/
module.exports.shortCodePaired.plantUmlToSvg= plantUmlToSvg;
module.exports.shortCodePaired.markdown= (content) => CFG.md.render(content)
module.exports.shortCode.lorem= (opts) => loremIpsum({count: 30, units: 'words', ...opts}); //SEE: https://github.com/knicklabs/lorem-ipsum.js/?tab=readme-ov-file#using-the-function

module.exports.filter.mix_kv = (...kvs) => {DBG>7 && console.log("MIX_KV filter",kvs); return Object.assign({},...kvs);}  //U: better, no side effects
module.exports.shortCode.mix_kv = (kv1,...kvs) => {Object.assign(kv1,...kvs); return ''}
module.exports.shortCode.set_k= (kv,k,v) => { kv[k]= v; return ''; };
module.exports.shortCodePaired.set_k2= (v,kv,k) => { kv[k]= v; return ''; };

const include_js= async function include_js(srcOrFile,outpath_UNSAFE) { 
	let src= srcOrFile; //DFLT;
	if (!src.match(/^[\w\/\.-]*?\.js(on)?$/)) {
		src= StreamReadable.from(srcOrFile);
	}
	let ibase= this.page.inputPath.replace(/\/?[^\/]*$/,'');
	let obase= this.page.outputPath.replace(/\/?[^\/]*$/,'');
	const outpath_html= outpath_UNSAFE && outpath_UNSAFE.replace(/\.js$/,'.gen.js');
	const outpath_here= outpath_UNSAFE && path_abs(outpath_html,CFG.dir.input,ibase)
	const outpath_site= outpath_UNSAFE && path_abs(outpath_html,CFG.dir.output,obase)
	//A: sufix needed to avoid retriggering 11ty, see filter above
	console.log("DBG:include_js",outpath_here, outpath_UNSAFE,this.page.inputPath);

	const b= browserify();
	b.add(src,{ basedir: ibase });
	return await new Promise( (onOk,onErr) => {
		let bundle= b.bundle( (err,src_browser) => {
			console.log("DBG:include_js",err,(src_browser+'').slice(0,80));
			if (err) return onErr(err);
			if (outpath_here) {
				let obase= outpath_here.replace(/\/?[^\/]*$/,'');
				ensure_dir(obase);
				if (fs.existsSync(outpath_here)) {
					let cur= fs.readFileSync(outpath_here,'utf8');
					if (cur!= src_browser+'') { fs.writeFileSync(outpath_here,src_browser); }
					//A: don't retriger 11ty copy/build
				}
				fs.writeFileSync(outpath_site,src_browser);
				onOk(`<script src="${outpath_html}" oo_keep_here></script>`);
			} else {
				onOk(`<script>${src_browser}</script>`);
			}
		})
	})
}
module.exports.shortCode.js= include_js
module.exports.shortCodePaired.js2= include_js

module.exports.filter.keys= (kv) => kv ? Object.keys(kv) : [];

module.exports.filter.split= (s,sep) => s.split(sep);
const someparts= (s,from=0,to=-1,sep='/') => s.split(sep).slice(from,(from==-1 && to==-1) ? 9999 : to).join(sep);				
module.exports.filter.someparts= someparts
module.exports.filter.hex2rgb3= (hex) => {
	let r= (hex+'').length!=6 ? 'ERROR:hex2rgb:NO_INPUT' :hex.toLowerCase().replace(/^#/,'')
		.replace(/../g,(b)=>(parseInt(b,16)+',')).slice(0,-1)
	//DBG: console.log("DBG:hex2rgb3",{hex,r})
	return r;
}
module.exports.filter.palette= (opts) => palette(opts);
module.exports.filter.palette2html= palette2html;

module.exports.filter.dateJSON= (dateObj) => (dateObj ? new Date(dateObj).toJSON() : '')

module.exports.filter.readFile= function (pathSpec) { //U: make file data available to njk
	return JSON.stringify({pathSpec, page: this.page}); //XXX:
}

function data_cfg() { 
		const cfg_defaults= require('../1cfg_defaults.json');
		const cfg_overrides= require('../../this_site/_data/1cfg_manual.json');
		const cfg= Object.assign({}, cfg_defaults, cfg_overrides);
		return cfg;
}
module.exports.data.cfg= data_cfg;
module.exports.data.SiteBasePath= () => BasePath; //U: desplegar en subcarpetas como github

module.exports.data.now= () => new Date();

module.exports.filter.formatDate= (dateObj, format) => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat(format);
}

module.exports.filter.readableDate= dateObj => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
}

//SEE: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
module.exports.filter.htmlDateString= (dateObj) => {
	return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
}

module.exports.filter.head= (array, n) => { //U: Get the first `n` elements of a collection.
	if( n < 0 ) { return array.slice(n); }
	return array.slice(0, n);
}

module.exports.filter.min= (...numbers) => { //U: Return the smallest number argument
	return Math.min.apply(null, numbers);
}

module.exports.collection.tagList= function(collection) { //U: Create an array of all tags
	let tagSet = new Set();
	collection.getAll().forEach(item => {
		(item.data.tags || []).forEach(tag => tagSet.add(tag));
	});
	return [...tagSet];
}
