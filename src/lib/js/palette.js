//INFO: generate color palettes
//SEE: https://github.com/arcarson/palette-generator?tab=readme-ov-file#options
const paletteGenerator= require('palette-generator').default
const Schemes= ['analogous', 'accentedAnalogous', 'complementary', 'dual', 'triadic'] 

function HSLtoRGB(h,s,l) {
	s /= 100;  //A Must be fractions of 1
	l /= 100;
	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c/2,
		r = 0,
		g = 0,
		b = 0;
	if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
	else if (60 <= h && h < 120) { r = x; g = c; b = 0; } 
	else if (120 <= h && h < 180) { r = 0; g = c; b = x; } 
	else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
	else if (240 <= h && h < 300) { r = x; g = 0; b = c; } 
	else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);
	return [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')
}

function palette2html(palette_rgb) {
	let r='';
	Object.entries(palette_rgb).forEach(([color,shades]) => {
		r+=`<div style="height: 20px">${color}:</div>\n`;
		Object.entries(shades).forEach(([shade,rgb]) => {
			r+=`<div style="height: 25px; background: #${rgb};">&nbsp;&nbsp;${shade}: ${rgb} <span style="color: white;"># ${color} ${shade} ${rgb}</span></div>\n`;
		})
	});
	return r;
}

function palette(options={}) {
	options= {
		h: 127, s: 100, l: 50,
		shadeVariation: "20%", hueIncrement: 15, scheme: "complementary",
		...Object.assign({},...Object.entries(options).map(([k,v])=> ({[k]:parseFloat(v)||v}) ))
	}
	let p = paletteGenerator(options.h,options.s+'%',options.l+'%', options)
	
	//DBG: console.log(palette)
	let p_rgb= Object.entries(p).reduce( (acc, [k,v]) => {
		acc[k]= Object.entries(v).reduce( (acce,[ke,ve]) => {
			acce[ke]= HSLtoRGB.apply(this,ve.match(/([\d\.]+)/g).map(s => parseFloat(s)))
			return acce;
		}, {});
		return acc;
	}, {})
	//DBG: 
	console.log("DBG:PALETTE:RBG", options, p_rgb)
	return p_rgb;
}

module.exports= { palette, palette2html, HSLtoRGB, Schemes }
