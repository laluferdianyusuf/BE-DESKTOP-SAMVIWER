const UserServices = require("../services/userServices");

const createUser = async (req, res) => {
  const { username, password } = req.body;
  const { status, status_code, message, data } = await UserServices.register({
    username,
    password,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const { status, status_code, message, data } = await UserServices.login({
    username,
    password,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { status, status_code, message, data } = await UserServices.updateUser({
    id,
    username,
    password,
  });
  res.status(status_code).send({
    status,
    status_code,
    message,
    data,
  });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { status, status_code, message, data } = await UserServices.deleteUser({
    id,
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

module.exports = {
  createUser,
  login,
  updateUser,
  deleteUser,
  getAllUser,
  currentUser,
};
