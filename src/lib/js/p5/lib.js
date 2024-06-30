//INFO: generate images with p5js
//SEE: https://github.com/andithemudkip/p5-node
//SEE: se pueden elegir emojis de https://emojipedia.org/abacus

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
		if (frame++>10) { stopped=true;
			p.saveCanvas(canvas, params.fname || 'xp5js.png').then(filename => {
				console.log(`P5JS saved ${filename}`);
				if (params.no_exit) p.remove(); else process.exit(0);
			});
		}
		f(p,params);
	}
}

const SKETCH={}
SKETCH.logo= function sketch_logo(p,params) {
	p.background(params.bgcolor || '#00000000'); //A: transparenr
	p.fill(params.color || '#a0a0a0')
	if (params.font) p.textFont(params.font);
	p.textSize(p.height*0.7);
	p.textAlign(p.CENTER,p.CENTER)
	p.text(params.text, p.width/2, p.height/2);
}

function run_sketch(params) {
	let sketch_f= SKETCH[params.sketch];
	params.no_exit= 1;
	let p5Instance = p5.createSketch(p => gen_img(p, sketch_f,params));
}

[
	{ sketch: 'logo', text: '🧮Contador', fname:"x1.png", color: '#287167',bgcolor:'#ffffff'},
	{ sketch: 'logo', text: '🧮OtraCosa', fname:"x2.png", bgcolor: '#287167', color: '#ffffff'},
].forEach(run_sketch);


