const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const logger = require('../config/logger');

const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      });

      await user.setRoles(roles);
      res.send({ message: "Usuario registrado correctamente!" });
      // Registra el éxito al crear un usuario con roles específicos
      logger.info(`Usuario registrado correctamente con el nombre: ${req.body.username} y el rol: ${req.body.roles.join(', ')}`);
      
    } else {
      // user has role = 1
      await user.setRoles([1]);
      res.send({ message: "Usuario registrado correctamente!" });
      // Registra el éxito al crear un usuario con el rol por defecto
      logger.info(`Usuario registrado correctamenre con el nombre: ${req.body.username} con el rol por defecto.`);
     
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
    // Registra el error
    logger.error(`Error al registrar al usuario ${req.body.username}: ${error.message}`);
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Contraseña incorrecta!",
      });
    }

    const token = jwt.sign({ id: user.id },
                           config.secret,
                           {
                            algorithm: 'HS256',
                            allowInsecureKeySizes: true,
                            expiresIn: 86400, // 24 hours
                           });

    let authorities = [];
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      authorities.push("ROLE_" + roles[i].name.toUpperCase());
    }

    req.session.token = token;

    return res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "Has cerrado sesión correctamente!"
    });
  } catch (err) {
    this.next(err);
  }
};