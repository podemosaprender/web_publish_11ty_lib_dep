//INFO: generate color palettes
//SEE: https://github.com/arcarson/palette-generator?tab=readme-ov-file#options
//SEE: https://css-tricks.com/converting-color-spaces-in-javascript/
const paletteGenerator= require('palette-generator').default
const Schemes= ['analogous', 'accentedAnalogous', 'complementary', 'dual', 'triadic'] 

function RGBHexToInts(s) {
	return s.match(/^\#?(..)(..)(..)/).slice(1,4).map(h => parseInt(h,16))
}

function RGBtoHSL(r,g,b, returnType) {
	r /= 255; g /= 255; b /= 255;//A: Make r, g, and b fractions of 1
  
  let cmin = Math.min(r,g,b),
			cmax = Math.max(r,g,b), //A: Find greatest and smallest channel values
      delta = cmax - cmin,
      h = 0, s = 0, l = 0;
  
  if (delta == 0) h = 0;	// Calculate hue, No difference
  else if (cmax == r)  h = ((g - b) / delta) % 6;// Red is max
	else if (cmax == g) h = (b - r) / delta + 2;  // Green is max
 	else h = (r - g) / delta + 4; // Blue is max
  h = Math.round(h * 60);
  if (h < 0) h += 360;  // Make negative hues positive behind 360°

	l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));// Calculate saturation
  
  s = +(s * 100).toFixed(1);// Multiply l and s by 100
  l = +(l * 100).toFixed(1);

	return returnType=='array' ? [h,s,l] : returnType=='kv' ? {h,s,l} : "hsl(" + h + "," + s + "%," + l + "%)";
}

function HSLtoRGB(h,s,l) {
	s /= 100;  //A Must be fractions of 1
	l /= 100;
	let c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c/2,
		r = 0, g = 0, b = 0;
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
	let c0= options.primary
	if (typeof(c0)=='string') {
		if (c0.startsWith('#') || c0.length==6) {
			c0= RGBtoHSL(...RGBHexToInts(c0), 'kv')
		} else {
			let p= c0.split(/[(,\s]+/)
			if (p[0]=='hsl') { 
				let [h,s,l]= p.slice(1).map(parseInt);
				c0={h,s,l}
			}
		}
	}
	options= {
		h: 127, s: 100, l: 50,
		shadeVariation: "20%", hueIncrement: 15, scheme: "complementary",
		...c0,
		...Object.assign({},...Object.entries(options).map(([k,v])=> ({[k]:parseFloat(v)||v}) ))
	}
	//DBG: console.error({c0,options})
	let p = paletteGenerator(options.h,options.s+'%',options.l+'%', options)
	
	//DBG: console.log(palette)
	let p_rgb= Object.entries(p).reduce( (acc, [k,v]) => {
		acc[k]= Object.entries(v).reduce( (acce,[ke,ve]) => {
			acce[ke]= HSLtoRGB.apply(this,ve.match(/([\d\.]+)/g).map(s => parseFloat(s)))
			return acce;
		}, {});
		return acc;
	}, {})
	//DBG: console.log("DBG:PALETTE:RBG", options, p_rgb)
	return p_rgb;
}

module.exports= { palette, palette2html, HSLtoRGB, RGBtoHSL, RGBHexToInts, Schemes }
