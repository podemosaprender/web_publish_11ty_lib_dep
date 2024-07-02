//INFO: generate images with p5js
//SEE: https://github.com/andithemudkip/p5-node
//SEE: se pueden elegir emojis de https://emojipedia.org/abacus

const util= require('../util.js');
const p5 = require('node-p5');

//SEE: https://github.com/andithemudkip/p5-node?tab=readme-ov-file#fonts
const FONTS= {};
[
	//ROMPE: 'this_site/l1b_/any/fonts/NotoColorEmoji-Regular.ttf',
	'this_site/l1b_/any/fonts/parisienne-regular.ttf',
].forEach(f => {
	let p= __dirname+'/../../../'+f;
	let n= (f.match(/([^\/]+)\...f/)||[])[1] || f;
	console.log("P5JS font",p);
	FONTS[n]= p5.loadFont(p) //{path: p, family: n}))
	let fnt= FONTS[n]
	console.log("P5JS font",n,p,fnt)
})

function gen_img(p,f,params) {
	let canvas,frame= 0,stopped= false;
	p.setup = () => {
		canvas = p.createCanvas(params.width ||910, params.height||220);
	}
	p.draw = () => {
		if (stopped) return;
		if (frame++>(params.frame_cnt || 10)) { stopped=true;
			util.ensure_dir(params.fname);
			p.saveCanvas(canvas, params.fname || 'xp5js.png').then(filename => {
				console.log(`P5JS saved ${filename}`);
				if (params.no_exit) p.remove(); else process.exit(0);
			});
		}
		f(p,params);
	}
}
const AlignOpts=['LEFT', 'CENTER', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER', 'BASELINE']

const SKETCH={}
SKETCH.logo= function sketch_logo(p5,params) {
	p5.background(params.bgcolor || '#00000000'); //A: transparenr
	p5.fill(params.color || '#a0a0a0')
	if (params.font) p5.textFont(params.font);
	p5.textAlign(p5.CENTER,p5.CENTER)
	p5.textSize(p5.height*0.7);
	let t= Array.isArray(params.text) ? params.text : [params.text];
	t.forEach( cmd => {
		/* 
		 ['10,20ACBAS70:mi string','solito','S70:solo size','30,50:solo pos','77,88ACL:ponele'].forEach(cmd => 
		 		cmd.replace(/^((\d+),(\d+))?(A([LCR])([CTBL]))?(S(\d+))?:?(.*)$/,
				(...args) => console.log(cmd,JSON.stringify(args))))
10,20ACBAS70:mi string ["10,20ACBAS70:mi string","10,20","10","20","ACB","C","B",null,null,"AS70:mi string",0,"10,20ACBAS70:mi string"]
solito ["solito",null,null,null,null,null,null,null,null,"solito",0,"solito"]
S70:solo size ["S70:solo size",null,null,null,null,null,null,"S70","70","solo size",0,"S70:solo size"]
30,50:solo pos ["30,50:solo pos","30,50","30","50",null,null,null,null,null,"solo pos",0,"30,50:solo pos"]
77,88ACL:ponele ["77,88ACL:ponele","77,88","77","88","ACL","C","L",null,null,"ponele",0,"77,88ACL:ponele"]
		*/
		cmd.replace(/^((\d+),(\d+))?(A([LCR])([CTB_]))?(S(\d+))?:?(.*)$/,
			(m,i1,x,y,i2,ah,av,i3,sz,t) => {
				console.log("P5JS:LOGO",JSON.stringify({x,y,ah,av,sz,t}))
				if(ah || av) { 
					let alignarg= [ah||'C',av||'C'].map(k => (k=='_' ? 'BASELINE' : AlignOpts.find(o => o[0]==k)) ) 
					console.log("P5JS:LOGO:align",JSON.stringify({ah,av,alignarg}))
					p5.textAlign(...alignarg.map(k => p5[k]));
				}
				if (sz) { p5.textSize(p5.height*(parseFloat(sz)||70)/100) }
				p5.text(t, parseFloat(x==null ? 50 : x)*p5.width/100, parseFloat(y==null ? 50: y)*p5.height/100);
			})
	})
}

function run_sketch(params) {
	let sketch_f= SKETCH[params.sketch];
	params.no_exit= 1;
	let p5Instance = p5.createSketch(p => gen_img(p, sketch_f,params));
}

/*
[
	{ sketch: 'logo', text: '🧮Contador', fname:"x1.png", color: '#287167',bgcolor:'#ffffff'},
	{ sketch: 'logo', text: '🧮OtraCosa', fname:"x2.png", bgcolor: '#287167', color: '#ffffff'},
].forEach(run_sketch);
*/

module.exports={ run_sketch }


