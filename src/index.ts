import dotenv from "dotenv";
import { Context, Telegraf } from "telegraf";
import logger from "./functions/logger";

dotenv.config();

const bot: Telegraf<Context> = new Telegraf(process.env.BOT_TOKEN as string);

bot.start(async (ctx) => {
  try {
    ctx.replyWithPhoto(
      { source: "./src/images/emoti.png" },
      {
        caption: `Hola ${ctx.from.first_name || ""}, soy Remi!\n\nTu ID es: ${
          ctx.from.id
        }`,
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    logger.error(
      `${ctx.from.id}|Error al enviar el mensaje de bienvenida: ${error}`
    );
  }
});

bot.launch();

bot.telegram.getMe().then(() => {
  logger.info("Bot started");
});

bot.catch((err: any) => {
  if (isConnectionError(err)) {
    logger.error(`Error de conexión: ${err.message}`);
    attemptReconnect();
  } else {
    logger.error(`Error no crítico: ${err.message}`);
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function isConnectionError(err: { message: string }): boolean {
  try {
    const connectionErrorMessages = [
      "ETELEGRAM", // Código de error de Telegram API
      "connect ECONNREFUSED", // Error de conexión
      "socket hang up", // Conexión caída
      "ECONNRESET", // Conexión reseteada
      "ENOTFOUND", // No se encontró el host (DNS)
    ];

    return connectionErrorMessages.some((msg) => err.message.includes(msg));
  } catch (error) {
    logger.error(`Error al verificar el tipo de error: ${error}`);
    return false;
  }
}

async function attemptReconnect() {
  const reconnectInterval = 300000; // 5 Minutos
  let isConnected = false;
  let retryCount = 0;
  const maxRetries = 10; // Máximo de 10 intentos de reconexión

  logger.info(`Iniciando intento de reconexión... ${retryCount}`);

  const reconnect = setInterval(async () => {
    retryCount++;
    try {
      await bot.launch(); // Intenta relanzar el bot
      clearInterval(reconnect);
      isConnected = true;
      logger.info("Reconexión exitosa.");
    } catch (error) {
      logger.error(
        `Error al intentar reconectar (Intento ${retryCount}): ${error}`
      );
    }

    if (retryCount >= maxRetries) {
      clearInterval(reconnect);
      logger.error("Máximo de intentos de reconexión alcanzado.");
      process.exit(1); // O una forma controlada de reiniciar el proceso
    }
  }, reconnectInterval);

  setTimeout(() => {
    if (!isConnected) {
      logger.error("No se pudo reconectar el bot dentro del tiempo límite.");
      process.exit(1); // O reiniciar el proceso de forma controlada
    }
  }, reconnectInterval * maxRetries); // 50 segundos máximo antes de forzar salida
}
