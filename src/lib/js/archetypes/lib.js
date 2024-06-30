//INFO: para los juegos con arquetipos
module.exports= {};

const $= (s) => document.querySelector(s)
const DBG= (r,msg,lvl, ...details) => {console.log(msg,r,...details); return r }
const range= (max) => [...Array(max).keys()];
const rnd_element= (list) => list[Math.floor(Math.random()*list.length)];
const rnd_mix= (list) => { 
	let c= [...list]; let r= []; while (c.length) { r.unshift(rnd_element(c)); c= c.filter(e => e!=r[0]) }
	return r;
}
const cmp_arrays= (a,b) => (range(Math.max(a.length,b.length)).map(i => a[i]<b[i]?-1:a[i]==b[i]?0:1).find(v=>v))

let ArchJSON= require('../../../this_site/web/archetype/_here.data.json');
let Arch= ArchJSON.items;
let ArchNames= Object.keys(Arch);	
let ArchFeatures= 'Desire,Branding style,Fears,Traits'.split(',')

const to_lol= () => { //U: devuelve lista [word,role,archetypename]
	return ArchFeatures.map( feat =>  
		Object.entries(Arch).map( ([an,akv]) => 
			(akv[feat]||'').toLowerCase()
			.replace('boring','boredom')
			.split(/,\s*(?:and\s*)?/)
			.map(w => [w,feat.toLowerCase(),an.toLowerCase()])
		)
	)
	.flat(2)
	.sort(cmp_arrays)
}

const to_word2feat2arch= (lol) => { //U: devuelve kv word->feat->arch
	return (lol || to_lol()).reduce( (acc,[w,f,a]) => {
		let accw= (acc[w] = acc[w] || {});
		let accwf= (accw[f] = accw[f] || {});
		accwf[a]=1;
		return acc;
	}, {})
}

const query= (q,lol) => (lol || to_lol()).filter( //U: .query(['*','desire','*'])
	a => q.every( (qi,i) => (qi=='*' || a[i]==qi) )	
)

module.exports= {...module.exports, 
	DBG, rnd_element, rnd_mix,cmp_arrays,
	Arch, ArchNames, ArchFeatures,
	to_lol, to_word2feat2arch, query,
}
