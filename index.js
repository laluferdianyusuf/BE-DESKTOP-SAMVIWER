const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 2090;
const upload = require("./utils/fileUploads");
// require("dotenv").config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const UserController = require("./controllers/userController");
const DeviceController = require("./controllers/deviceController");
const DataController = require("./controllers/dataController");
const middleware = require("./middleware/auth");
const { device } = require("./models");

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Successfully",
  });
});

// User
app.post("/api/v1/register/user", UserController.createUser);
app.post(
  "/api/v1/login/user",
  middleware.authentication,
  UserController.login,
  middleware.isAdmin
);
app.get(
  "/api/v1/getAll/user",
  middleware.authentication,
  UserController.getAllUser,
  middleware.isAdmin
);
app.put(
  "/api/v1/update/user/:id",
  UserController.updateUser,
  middleware.authentication
);
app.delete(
  "/api/v1/delete/user/:id",
  middleware.authentication,
  UserController.deleteUser,
  middleware.isAdmin
);
app.get(
  "/api/v1/current/user",
  middleware.authentication,
  UserController.currentUser
);

// Device
app.post("/api/v2/add/device", DeviceController.addDevice);
app.put("/api/v2/update/device/:deviceId", DeviceController.updateDevice);
app.get("/api/v2/getAll/device", DeviceController.getAllDevice);
app.delete("/api/v2/delete/device/:samId", DeviceController.deletedDevice);

// data
app.post(
  "/api/v3/create/video/:samId",
  upload.single("video"),
  DataController.createVideo
);
app.get("/api/v3/get/speed/category", DataController.getSpeedByCategory);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on http://localhost:${PORT}`);
});
