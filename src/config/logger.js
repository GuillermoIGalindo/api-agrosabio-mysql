const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Personaliza el formato de salida de tus logs
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Crea una instancia de logger de Winston
const logger = winston.createLogger({
    format: combine(
        colorize(), // Agrega colores en la consola para diferentes niveles de logs
        timestamp(), // Agrega una marca de tiempo a cada mensaje de log
        myFormat // Usa el formato personalizado definido arriba
    ),
    transports: [
        new transports.Console(), // Muestra los logs en la consola
        new transports.File({ filename: 'combined.log' }), // Guarda los logs en un archivo
    ],
});

module.exports = logger;
