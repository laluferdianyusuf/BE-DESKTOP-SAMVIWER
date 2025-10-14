const jwt = require("jsonwebtoken");
const { JWT, CREDENTIAL } = require("../lib/const");
const UserRepositories = require("../repositories/userRepositories");

const authentication = async (req, res, next) => {
  try {
    const autHeader = req.headers.authorization;

    if (!autHeader || !autHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        status: false,
        status_code: 401,
        message: "Mush be login first",
        data: { user: null },
      });
    }
    const token = autHeader.split(" ")[1];
    if (!token) {
      return res.status(404).send({
        status: false,
        status_code: 404,
        message: "Can't find token",
        data: { user: null },
      });
    }

    const decode = jwt.verify(token, JWT.SECRET);
    const getUser = await UserRepositories.existingUsername({
      username: decode.username,
    });
    if (!getUser) {
      return res.status(401).send({
        status: false,
        status_code: 401,
        message: "Your token is invalid",
        data: { user: null },
      });
    }
    req.users = getUser;
    next();
  } catch (error) {
    return res.status(401).send({
      status: false,
      status_code: 500,
      message: error,
      data: { user: null },
    });
  }
};
const isAdmin = async (req, res, next) => {
  const user = req.users;
  if (user && user.credential === CREDENTIAL.ADMIN) {
    return next();
  }
  return res.status(403).send({
    status: false,
    status_code: 403,
    message: "Must be an admin for access this page",
    data: { user: null },
  });
};

module.exports = { authentication, isAdmin };
