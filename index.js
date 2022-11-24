const sharp = require('sharp')
const fs = require("fs");
require("dotenv").config();
const NOMBRE_IMAGEN_GLOBO = "globo.png";

// Función de recuerdo. No sirve para nada pero es la primera que escribí para probar esta cosa
const agregarGloboDeTexto = async (porcentaje) => {
	const entrada = sharp("./esther.jpeg");
	const informacionEntrada = await entrada.metadata();
	const ALTURA_GLOBO = parseInt((porcentaje * informacionEntrada.height) / 100);
	const globo = sharp("./globo.png")
		.resize({ width: informacionEntrada.width, height: ALTURA_GLOBO, fit: "fill" })
	entrada
		.extend({ top: ALTURA_GLOBO, background: { r: 255, g: 255, b: 255, } })
		.composite([{ input: await globo.toBuffer(), left: 0, top: 0 }])
		.toFile('./kangta.new.jpg', function (err) {
			if (err) console.log(err);
		})
}

const agregarGloboDeTextoYDevolverBuffer = async (nombreEntrada, porcentaje) => {
	const entrada = sharp(nombreEntrada);
	const informacionEntrada = await entrada.metadata();
	const ALTURA_GLOBO = parseInt((porcentaje * informacionEntrada.height) / 100);
	const globo = sharp(NOMBRE_IMAGEN_GLOBO)
		.resize({ width: informacionEntrada.width, height: ALTURA_GLOBO, fit: "fill" })
	return entrada
		.extend({ top: ALTURA_GLOBO, background: { r: 255, g: 255, b: 255, } })
		.composite([{ input: await globo.toBuffer(), left: 0, top: 0 }])
		.toBuffer();
}
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('photo', async (msg) => {
	const caption = msg.caption;
	if (!caption || !msg.photo || msg.photo.length <= 0) {
		return;
	}
	const chatId = msg.chat.id;
	const opciones = [
		"hazle un globo de texto",
		"hacer un globo de texto",
		"haga un globo de texto",
		"poner un globo de texto",
		"ponga un globo de texto",
	];
	for (const opcion of opciones) {
		if (caption.toLowerCase().includes(opcion)) {
			const mejorFoto = msg.photo[msg.photo.length - 1]; // al momento  de escribir esto, la foto con mejor calidad estaba en la última posición
			const nombreFotoDescargada = await bot.downloadFile(mejorFoto.file_id, "./");
			const fotoConGloboDeTexto = await agregarGloboDeTextoYDevolverBuffer(nombreFotoDescargada, 15);
			fs.unlink(nombreFotoDescargada, () => {
				bot.sendPhoto(chatId, fotoConGloboDeTexto);
			});
		}
	}
});