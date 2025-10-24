const UserServices = require("../services/userServices");

const createUser = async (req, res) => {
  const { username, password, credential } = req.body;
  const { status, status_code, message, data } = await UserServices.register({
    username,
    password,
    credential,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const login = async (req, res) => {
  const { username, password, credential } = req.body;
  const { status, status_code, message, data } = await UserServices.login({
    username,
    password,
    credential,
  });

  res.cookie("token", data && data.token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(status_code).send({
    status,
    status_code,
    message,
    data: data && data.user,
  });
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, credential } = req.body;
  const { status, status_code, message, data } = await UserServices.updateUser({
    userId,
    username,
    credential,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { status, status_code, message, data } = await UserServices.deleteUser({
    userId,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const getAllUser = async (req, res) => {
  const { status, status_code, message, data } = await UserServices.listUser();
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const currentUser = async (req, res) => {
  const currentUser = req.users;

  res.status(200).send({
    status: true,
    message: "You are logged in with this user",
    data: { user: currentUser },
  });
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).send({
    status: true,
    message: "Logout successful",
  });
};

module.exports = {
  createUser,
  login,
  updateUser,
  deleteUser,
  getAllUser,
  currentUser,
  logout,
};
