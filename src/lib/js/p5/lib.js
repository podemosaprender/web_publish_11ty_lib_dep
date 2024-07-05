//INFO: generate images with p5js
//SEE: https://github.com/andithemudkip/p5-node
//SEE: se pueden elegir emojis de https://emojipedia.org/abacus

const fs=require('fs')
const util= require('../util.js');
const p5lib = require('node-p5');

//SEE: https://github.com/andithemudkip/p5-node?tab=readme-ov-file#fonts
const SITE_DIR= __dirname+'/../../../this_site/';
const FONTS= {};
const FONT_DIR= SITE_DIR+'l1b_/any/fonts/';

let DBG=5;

fs.readdirSync(FONT_DIR).forEach( fn => {
	if (fn.match(/((ttf)|(otf)|(woff))$/)) {
		if (fn=='NotoColorEmoji-Regular.ttf') { return } //A: ignoring, breaks icons
		let p= FONT_DIR+fn;
		console.log("P5JS font found",fn,p);
		let r= p5lib.loadFont(p) //{path: p, family: n}))
		console.log("P5JS font loaded",r,p)
	}
})

function init_img(p5,params,preloaded) {
	p5.background(params.bgcolor || '#00000000'); //A: transparent
	if (preloaded.bg) {
		p5.image(preloaded.bg,0,0,p5.width,p5.height);
	} //A: si hay bg lo dibujamos
	p5.fill(params.color || '#a0a0a0')
	if (params.font) p5.textFont(params.font);
	p5.textAlign(p5.CENTER,p5.CENTER)
	p5.textSize(p5.height*0.7);
}

function gen_img(p5,f,params) {try{
	console.log("P5JS gen_img",params);
	let canvas,frame= 0,sketch_state= '',preloaded={};
	//A: separamos setup/draw en nuestro estado para hacer funcionar preload que en node-p5 necesita que ya exista el sketch (ver mainSketch en su index.js)
	const my_preload= () => Promise.all(
		Object.entries(params.images || {}).map( async ([k,p]) => {
			let r;
			console.log("P5JS preloading impl",k,p,SITE_DIR+p); 
			try { r= await p5.loadImage(SITE_DIR+p); }
			catch (ex) { console.log("P5JS preloading impl ERROR",k,p,SITE_DIR+p,ex); } 
			console.log("P5JS preloading impl R",k,p,SITE_DIR+p, DBG>8 ? r : {width: r.width, height: r.height}); 
			preloaded[k]= r;
			return r;
		}
	)).then( () => { sketch_state='preloaded' });

	const my_setup= () => {try{
		console.log("P5JS setup A");
		let bg= preloaded.bg;
		let w0= params.width || (bg ? bg.width : 910);
		let h0= params.height || (bg ? bg.height : 220);
		canvas = p5.createCanvas(w0, h0);
		console.log("P5JS canvas",{w0,h0,bg_w: bg && bg.width, bg_h: bg && bg.height, img: Object.keys(preloaded)}) 
		init_img(p5,params,preloaded);
		console.log("P5JS setup OK", canvas);
		sketch_state= 'setup';
	}catch(ex){console.log("P5JS gen_img setup ERROR",ex); throw(ex)}};

	const my_draw= () => {try{
		if (sketch_state=='stopped') return;
		if (frame++>(params.frame_cnt || 10)) { sketch_state=='stopped';
			util.ensure_dir(params.fname);
			p5.saveCanvas(canvas, params.fname || 'xp5js.png').then(filename => {
				console.log(`P5JS saved ${filename}`);
				if (params.no_exit) p5.remove(); else process.exit(0);
			});
		}
		f(p5,params,preloaded);
	}catch(ex){console.log("P5JS gen_img draw ERROR",ex)}};

	console.log("P5JS gen_img bind draw", params);
	p5.draw= () => {
		if (sketch_state=='') { my_preload() }
		else if (sketch_state=='preloaded') { my_setup() }
		else { my_draw() }
	}
}catch(ex) { console.log("P5JS gen_img ERROR",ex) }}

const AlignOpts=['LEFT', 'CENTER', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER', 'BASELINE']

const SKETCH={}
SKETCH.logo= function sketch_logo(p5,params,preloaded) {
	let t= Array.isArray(params.text) ? params.text : [params.text];
	t.forEach( cmd => { if (!cmd) return;
		/* 
		 ['10,20ACBAS70:mi string','solito','S70:solo size','30,50:solo pos','77,88ACL:ponele','39,77C#ff34ac:colorido','39,77 C#ff34ac Fparisienne :colorido'].forEach(cmd => 
				cmd.replace(/^(((\d+),(\d+))?\s*(A([LCR])([CTB_]))?\s*(S(\d+))?\s*(C([#\w]+))?\s*(F(\w+))?\s*:)?(.*)$/,
				(...args) => console.log(cmd,JSON.stringify(args))))
10,20ACBAS70:mi string ["10,20ACBAS70:mi string",null,null,null,null,null,null,null,null,null,null,null,"10,20ACBAS70:mi string",0,"10,20ACBAS70:mi string"]
solito ["solito",null,null,null,null,null,null,null,null,null,null,null,"solito",0,"solito"]
S70:solo size ["S70:solo size","S70:",null,null,null,null,null,null,"S70","70",null,null,"solo size",0,"S70:solo size"]
30,50:solo pos ["30,50:solo pos","30,50:","30,50","30","50",null,null,null,null,null,null,null,"solo pos",0,"30,50:solo pos"]
77,88ACL:ponele ["77,88ACL:ponele",null,null,null,null,null,null,null,null,null,null,null,"77,88ACL:ponele",0,"77,88ACL:ponele"]
39,77C#ff34ac:colorido ["39,77C#ff34ac:colorido","39,77C#ff34ac:","39,77","39","77",null,null,null,null,null,"C#ff34ac","#ff34ac","colorido",0,"39,77C#ff34ac:colorido"]
		*/
		cmd.replace(/^(((\d+),(\d+))?\s*(A([LCR])([CTB_]))?\s*(S(\d+))?\s*(C([#\w]+))?\s*(F(\w+))?\s*:)?(.*)$/,
			(m,i1,i1b,x,y,i2,ah,av,i3,sz,i4,color,i5,font,t) => {
				DBG>7 && console.log("P5JS:LOGO",JSON.stringify({x,y,ah,av,sz,color,font,t}))
				if(ah || av) { 
					let alignarg= [ah||'C',av||'C'].map(k => (k=='_' ? 'BASELINE' : AlignOpts.find(o => o[0]==k)) ) 
					DBG>8 && console.log("P5JS:LOGO:align",JSON.stringify({ah,av,alignarg}))
					p5.textAlign(...alignarg.map(k => p5[k]));
				}
				if (sz) { p5.textSize(p5.height*(parseFloat(sz)||70)/100) }
				if (color) { p5.fill(color) }
				if (font) { p5.textFont(font) }
				p5.text(t, parseFloat(x==null ? 50 : x)*p5.width/100, parseFloat(y==null ? 50: y)*p5.height/100);
			})
	})
}

function run_sketch(params) {
	let sketch_f= SKETCH[params.sketch || 'logo'];
	params.no_exit= 1;
	//SEE: https://www.npmjs.com/package/node-p5#basic-usage
	let p5Instance = p5lib.createSketch( (p) => gen_img(p,sketch_f,params) );
}

/*
[
	{ sketch: 'logo', text: '🧮Contador', fname:"x1.png", color: '#287167',bgcolor:'#ffffff'},
	{ sketch: 'logo', text: '🧮OtraCosa', fname:"x2.png", bgcolor: '#287167', color: '#ffffff'},
].forEach(run_sketch);
*/

module.exports={ run_sketch }


