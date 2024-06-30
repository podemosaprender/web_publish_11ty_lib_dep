(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Palette = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.generateShades = generateShades;
exports.default = generatePalette;
// todo
// -------------------------------------------

// handle for errors/incorrect values
// accept rgb/hsl string?


// utilities
// -------------------------------------------

function hslString(h, s, l) {
  return 'hsl(' + h + ', ' + s + ', ' + l + ')';
}

function oppositeHue(h) {
  return (h + 180) % 360;
}

function getShade(h, s, l, percentage) {
  var baseLightness = parseInt(l, 10);
  var differenceToWhite = 100 - parseInt(l, 10);
  var tint = parseInt(percentage, 10) / 100 * differenceToWhite;
  var adjustedLightness = baseLightness + tint + '%';
  return hslString(h, s, adjustedLightness);
}

function generateShades(h, s, l, shadeVariation) {
  var names = ['darker', 'dark', 'base', 'light', 'lighter'];
  var variationMultiplier = -2;
  var shades = {};

  names.forEach(function (name) {
    var variationPercentage = parseInt(shadeVariation, 10) * variationMultiplier;
    shades[name] = getShade(h, s, l, variationPercentage);
    variationMultiplier++;
  });

  return shades;
}

// scheme generators
// -------------------------------------------

function generateAnalogousScheme(h, s, l, hueIncrement) {
  return [[h, s, l], [h - hueIncrement, s, l], [h + hueIncrement, s, l]];
}

function generateAccentedAnalogousScheme(h, s, l, hueIncrement) {
  return [[h, s, l], [h - hueIncrement, s, l], [h + hueIncrement, s, l], [oppositeHue(h), s, l]];
}

function generateDualScheme(h, s, l, hueIncrement) {
  var betaHue = h + hueIncrement;
  return [[h, s, l], [oppositeHue(h), s, l], [betaHue, s, l], [oppositeHue(betaHue), s, l]];
}

function generateComplementaryScheme(h, s, l, hueIncrement) {
  return [[h, s, l], [oppositeHue(h), s, l], [oppositeHue(h) - hueIncrement, s, l], [oppositeHue(h) + hueIncrement, s, l]];
}

function generateTriadicScheme(h, s, l, hueIncrement) {
  return [[h, s, l], [oppositeHue(h) - hueIncrement, s, l], [oppositeHue(h) + hueIncrement, s, l]];
}

// palette generator
// -------------------------------------------

function generatePalette(h, s, l) {
  var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var _ref$hueIncrement = _ref.hueIncrement;
  var hueIncrement = _ref$hueIncrement === undefined ? 20 : _ref$hueIncrement;
  var _ref$shadeVariation = _ref.shadeVariation;
  var shadeVariation = _ref$shadeVariation === undefined ? '20%' : _ref$shadeVariation;
  var _ref$scheme = _ref.scheme;
  var scheme = _ref$scheme === undefined ? 'complementary' : _ref$scheme;

  var colorGroupNames = ['alpha', 'beta', 'delta', 'gamma', 'epsilon'];

  var colorValues = [];
  switch (scheme) {
    case 'complementary':
      colorValues = generateComplementaryScheme(h, s, l, hueIncrement);
      break;
    case 'analogous':
      colorValues = generateAnalogousScheme(h, s, l, hueIncrement);
      break;
    case 'accentedAnalogous':
      colorValues = generateAccentedAnalogousScheme(h, s, l, hueIncrement);
      break;
    case 'dual':
      colorValues = generateDualScheme(h, s, l, hueIncrement);
      break;
    case 'triadic':
      colorValues = generateTriadicScheme(h, s, l, hueIncrement);
      break;
    default:
      colorValues = generateComplementaryScheme(h, s, l, hueIncrement);
  }

  var colors = {};
  colorValues.forEach(function (color, i) {
    var _color = _slicedToArray(color, 3);

    var h = _color[0];
    var s = _color[1];
    var l = _color[2];

    colors[colorGroupNames[i]] = generateShades(h, s, l, shadeVariation);
  });

  colors.grey = generateShades(h, '25%', '87%', shadeVariation);

  return colors;
}
},{}],2:[function(require,module,exports){
//INFO: generate color palettes
//SEE: https://github.com/arcarson/palette-generator?tab=readme-ov-file#options
//SEE: https://css-tricks.com/converting-color-spaces-in-javascript/
const paletteGenerator= require('palette-generator').default
const Schemes= ['analogous', 'accentedAnalogous', 'complementary', 'dual', 'triadic'] 

function RGBtoHSL(r,g,b) {
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

  return "hsl(" + h + "," + s + "%," + l + "%)";
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
	//DBG: console.log("DBG:PALETTE:RBG", options, p_rgb)
	return p_rgb;
}

module.exports= { palette, palette2html, HSLtoRGB, RGBtoHSL, Schemes }

},{"palette-generator":1}]},{},[2])(2)
});
