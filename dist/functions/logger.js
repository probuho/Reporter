"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const timezoned = () => (0, moment_timezone_1.default)().tz("America/Caracas").format("YYYY-MM-DD HH:mm:ss");
const logger = (0, winston_1.createLogger)({
    level: "info", // Nivel de logging (info, error, warn, etc.)
    format: winston_1.format.combine(winston_1.format.timestamp({ format: timezoned }), winston_1.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })),
    transports: [
        new winston_1.transports.Console(),
        new winston_daily_rotate_file_1.default({
            filename: "logs/bot-%DATE%.log", // Define el patrón para el nombre del archivo
            datePattern: "YYYY-MM-DD", // Rotar archivos diariamente
            zippedArchive: true, // Comprimir archivos de log anteriores
            maxSize: "20m", // Tamaño máximo de cada archivo de log
            maxFiles: "14d", // Mantener logs por 14 días, luego se eliminan
        }),
    ],
});
exports.default = logger;
