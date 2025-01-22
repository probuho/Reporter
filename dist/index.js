"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const telegraf_1 = require("telegraf");
const logger_1 = __importDefault(require("./functions/logger"));
dotenv_1.default.config();
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ctx.replyWithPhoto({ source: "./src/images/emoti.png" }, {
            caption: `Hola ${ctx.from.first_name || ""}, soy Remi!\n\nTu ID es: ${ctx.from.id}`,
            parse_mode: "Markdown",
        });
    }
    catch (error) {
        logger_1.default.error(`${ctx.from.id}|Error al enviar el mensaje de bienvenida: ${error}`);
    }
}));
bot.launch();
bot.telegram.getMe().then(() => {
    logger_1.default.info("Bot started");
});
bot.catch((err) => {
    if (isConnectionError(err)) {
        logger_1.default.error(`Error de conexión: ${err.message}`);
        attemptReconnect();
    }
    else {
        logger_1.default.error(`Error no crítico: ${err.message}`);
    }
});
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
function isConnectionError(err) {
    try {
        const connectionErrorMessages = [
            "ETELEGRAM", // Código de error de Telegram API
            "connect ECONNREFUSED", // Error de conexión
            "socket hang up", // Conexión caída
            "ECONNRESET", // Conexión reseteada
            "ENOTFOUND", // No se encontró el host (DNS)
        ];
        return connectionErrorMessages.some((msg) => err.message.includes(msg));
    }
    catch (error) {
        logger_1.default.error(`Error al verificar el tipo de error: ${error}`);
        return false;
    }
}
function attemptReconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const reconnectInterval = 300000; // 5 Minutos
        let isConnected = false;
        let retryCount = 0;
        const maxRetries = 10; // Máximo de 10 intentos de reconexión
        logger_1.default.info(`Iniciando intento de reconexión... ${retryCount}`);
        const reconnect = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            retryCount++;
            try {
                yield bot.launch(); // Intenta relanzar el bot
                clearInterval(reconnect);
                isConnected = true;
                logger_1.default.info("Reconexión exitosa.");
            }
            catch (error) {
                logger_1.default.error(`Error al intentar reconectar (Intento ${retryCount}): ${error}`);
            }
            if (retryCount >= maxRetries) {
                clearInterval(reconnect);
                logger_1.default.error("Máximo de intentos de reconexión alcanzado.");
                process.exit(1); // O una forma controlada de reiniciar el proceso
            }
        }), reconnectInterval);
        setTimeout(() => {
            if (!isConnected) {
                logger_1.default.error("No se pudo reconectar el bot dentro del tiempo límite.");
                process.exit(1); // O reiniciar el proceso de forma controlada
            }
        }, reconnectInterval * maxRetries); // 50 segundos máximo antes de forzar salida
    });
}
