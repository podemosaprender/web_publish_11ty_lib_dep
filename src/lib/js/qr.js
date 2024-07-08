//FROM: ~/devel/dwimerAll/0ANTES/dwimerEnv/0snippets/js/qr/lib.js
const qrcode= require("qrcode-generator")

/******************************************************************************/
//S: QR, generar imagen
//INSTALL: npm i qrcode-generator
//SEE: https://kazuhikoarase.github.io/qrcode-generator/js/

function QR(str) { //U: genera un objeto QR para generar distintos formatos de grafico para la str recibida como parametro
  var typeNumber = 10; //U: cuantos datos entran VS que calidad requiere, con 10 y las tabletas baratas de VRN escaneando monitor laptop funciona ok, entran mas de 150 bytes
  var errorCorrectionLevel = 'L'; //U: mas alto el nivel de correcion, menos fallas pero menos datos, con L funciona ok
  var qr= qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(str);
  qr.make();
  return qr
}

function QRGenerarTag(str) { //U: devuelve un tag html "img" con el QR para str
  return QR(str).createImgTag();
}

function QRGenerarData(str) { //U: devuelve la data url para usar en un tag img con el QR para str
	return QR(str).createDataURL();
}

function QRGenerarSVG(str) { //U: devuelve la data url para usar en un tag img con el QR para str
	return QR(str).createSvgTag();
}

function QRGenerateFile(str,path) {
	var fs = require('fs'); //A: browserify provee un shim
	var data = r.substr(r.indexOf('base64') + 7)
	var buffer = Buffer.from(data, 'base64');
	fs.writeFileSync(path, buffer);
}

module.exports= { QR, QRGenerarSVG, QRGenerarTag, QRGenerarData, QRGenerateFile }

/* U:
r= QRGenerarData('https://o-o.fyi')
console.log(r.length, r)
*/

