import moment from "moment-timezone";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const timezoned = () =>
  moment().tz("America/Caracas").format("YYYY-MM-DD HH:mm:ss");

const logger = createLogger({
  level: "info", // Nivel de logging (info, error, warn, etc.)
  format: format.combine(
    format.timestamp({ format: timezoned }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "logs/bot-%DATE%.log", // Define el patrón para el nombre del archivo
      datePattern: "YYYY-MM-DD", // Rotar archivos diariamente
      zippedArchive: true, // Comprimir archivos de log anteriores
      maxSize: "20m", // Tamaño máximo de cada archivo de log
      maxFiles: "14d", // Mantener logs por 14 días, luego se eliminan
    }),
  ],
});

export default logger;
