//INFO: try to generate sample yaml from macros/template

DBG=0
fs= require('fs');
yaml= require('js-yaml');

src= fs.readFileSync(0,'utf8');
let vars= {}

let ctx=''
src= src.replace(/(?:\{\{\s*(\w+\.)?(\w+)\s*\}\})|(?:\{\%\s*macro\s+(\w+))/gsi,
	(m,pfx,vname,a3) => { //DBG: 
		DBG && console.log({ctx,pfx,vname,a3})
		if (a3) { 
			ctx= a3.replace(/(ws_)?([a-z]+?)((?:_post)|(?:_reason))?(_1)?(_[_\w]*)?$/i,'$1$2$3$4'); 
			//DBG: console.log({ctx,a3})
			return m 
		}
		pfx ||= 'p.'	
		vname= vname.toLowerCase()
			.replace(/label/,'lbl')
			.replace(/a_href__/,'link')
			.replace(/h\d_.*/,'title')
			.replace(/_txt_(\d+)/, (x,d) => '_txt'+ d>3 ? '': d)
			.replace(/img_.*/,'img')
			.replace(/button/,'lbl')
		let vnamef= pfx+vname
		let kv= vname.startsWith('v_lbl') ? vars : (vars[ctx] ||= {});
		if (vname!='id') { kv[vname]= vnamef; }
		let r='{{ '+vnamef+' }}';
		DBG && console.log({r})
		return r;
	}
)

vars= Object.entries(vars) .sort((a,b) => a[0]>b[0]? 1:-1)
	.reduce( (r,[k,v]) => { let p= k.split('_'); 
		if (p.pop()=='1') {
			let t= p.length>2 ? p.pop(): p[1]; let kp0= p.join('_');
			let kv= r[kp0] || {type: p[1]}; delete r[kp0];
			kv[t.replace(/s$/,'')+'s']=[v];
			(r.sections ||= {})['a_'+p[1]]= kv;
			//DBG: console.log(k,t,kv,p)
		} else { r[k]= v; }
		return r;
	}, {})

console.log(`{#

${yaml.dump(vars)}

#}

${src}

`);
