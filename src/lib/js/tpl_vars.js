//INFO: try to generate sample yaml from macros/template

fs= require('fs');

src= fs.readFileSync(0,'utf8');
let vars= {}

let ctx=''
src.replace(/(?:\{\{\s*(\w+\.)?(\w+)\s*\}\})|(?:\{\%\s*macro\s+(\w+))/gsi,
	(m,pfx,vname,a3) => { //DBG: console.log({ctx,pfx,vname,a3})
		if (a3) { 
			ctx= a3.replace(/(ws_)?([a-z]+?)(_post)?(_1)?(_[_\w]*)?$/,'$1$2$3$4'); 
			//DBG: console.log({ctx,a3})
			return m 
		}
		pfx ||= 'p.'	
		vname= vname.toLowerCase()
			.replace(/a_href__/,'link')
			.replace(/h\d_.*/,'title')
			.replace(/_txt_\d+/,'_txt')
			.replace(/img_.*/,'img')
			.replace(/button/,'lbl')
		let vnamef= pfx+vname
		let kv= vname.startsWith('v_lbl') ? vars : (vars[ctx] ||= {});
		if (vname!='id') { kv[vname]= vnamef; }
		return '{{ '+vnamef+' }}';
	}
)

vars= Object.entries(vars).sort((a,b) => a[0]>b[0]? 1:-1).reduce( (r,[k,v]) => ({...r, [k]:v}),{})
console.log(vars)
console.log(src);
