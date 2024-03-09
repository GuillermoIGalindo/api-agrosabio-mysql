const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
// Importa el logger
const logger = require('../config/logger');


checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Username
    let user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      logger.error(`Failed! Username is already in use: ${req.body.username}`);
      return res.status(400).send({
        message: "Failed! Username is already in use!"
      });
    }

    // Email
    user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      logger.error(`Failed! Email is already in use: ${req.body.email}`);
      return res.status(400).send({
        message: "Failed! Email is already in use!"
      });
    }

    next();
  } catch (error) {
    logger.error(`Unable to validate Username or Email: ${error.message}`);
    return res.status(500).send({
      message: "Unable to validate Username or Email!"
    });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        logger.warn(`Failed! Role does not exist: ${req.body.roles[i]}`);
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
