//INFO: process plantuml files

//SEE: https://www.11ty.dev/docs/shortcodes/#paired-shortcodes
//XXX:dejo listo para armar un cache
const fsp= require('node:fs/promises');
const {execFileSync} = require('node:child_process')

const crypto = require('crypto');
function hash_s(s) {
	const hashgen = crypto.createHash('sha1');
	const hashdata = hashgen.update(s, 'utf-8');
	const r= hashdata.digest().slice(0, 16).toString('base64url');
	return r;	
}

function plantUmlToSvg(content) { 
	//XXX:cache const diag_hash= hash_s(content);
	//DBG: console.log("diagram",diag_hash, content, this.page);
	if ( ! content.match(/\n!theme/) ) { content= content.replace(/(^|\n)@start[^\n]*\n/,'$&!theme cyborg-outline\n') }
	//DBG: console.log(content);
	const rb= execFileSync('java',['-jar','plantuml.jar','-tsvg','-pipe','-nometadata'],{input: content})
	const r= rb.toString('utf8');
	//DBG: console.log("UML", r);
	return r;
};
// UML }

module.exports= plantUmlToSvg;
