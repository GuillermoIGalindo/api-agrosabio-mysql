const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const winston = require('winston');
const logger = require('./src/config/logger'); // Asegúrate de que la ruta sea correcta


const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//create roles of the static form
const db = require("./src/models");
const Role = db.role;

db.sequelize.sync({ force: false }).then(() => {
  console.log("Sincronización de DB exitosa.");
  initialRoleSetup();
  logger.info('Sincronización de DB exitosa.');
});

function initialRoleSetup() {
  Role.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: "admin"
    }
  });
  Role.findOrCreate({
    where: { id: 2 },
    defaults: {
      name: "user"
    }
  });
}

// routes
require('./src/routes/auth.routes')(app);
require('./src/routes/user.routes')(app);

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la aplicación" });
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo por el puerto ${PORT}.`);
});