//INFO: funciones que usamos siempre
const fs = require("fs");

const path_abs= (p,root,base) => ((p.startsWith('/') ? root : base+'/')+p);
const dirname = (path) => path.replace(/\/?[^\/]*$/,'')
const ensure_dir= (p,pathIsDir) => fs.mkdirSync(pathIsDir ? p : dirname(p),{recursive: true});
const set_file= (path,content,noOverwrite) => {
	ensure_dir(path);
	if (fs.existsSync(path)) {
		if (noOverwrite) { return 'no-overwrite' }
		let cur= fs.readFileSync(path,'utf8');
		if (cur==content+'') { return 'unchanged' }
	}
	fs.writeFileSync(path,content); 
	return 'written';
}

module.exports= { path_abs, ensure_dir, set_file, dirname }
