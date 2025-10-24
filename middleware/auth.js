const jwt = require("jsonwebtoken");
const { JWT, CREDENTIAL } = require("../lib/const");
const UserRepositories = require("../repositories/userRepositories");

const authentication = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        status_code: 401,
        message: "Unauthorized: Token not found",
        data: { user: null },
      });
    }

    const decoded = jwt.verify(token, JWT.SECRET);

    const getUser = await UserRepositories.existingUsername({
      username: decoded.username,
    });

    if (!getUser) {
      return res.status(401).json({
        status: false,
        status_code: 401,
        message: "Invalid or expired token",
        data: { user: null },
      });
    }

    req.users = getUser;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Server error during authentication",
      data: { user: null },
    });
  }
};

const isAdmin = async (req, res, next) => {
  const user = req.users;
  if (
    (user && user.credential === CREDENTIAL.ADMIN) ||
    user.credential === CREDENTIAL.SUPERADMIN
  ) {
    return next();
  }
  return res.status(403).json({
    status: false,
    status_code: 403,
    message: "Must be an admin or superadmin to access this page",
    data: { user: null },
  });
};

module.exports = { authentication, isAdmin };
