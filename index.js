const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 2090;
const upload = require("./utils/fileUploads");
const path = require("path");
// require("dotenv").config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use("/videos", express.static("D:/VideosRaspi"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const UserController = require("./controllers/userController");
const DeviceController = require("./controllers/deviceController");
const DataController = require("./controllers/dataController");
const RaspiController = require("./controllers/raspiController");
const ScheduleController = require("./controllers/scheduleController");
const EmailController = require("./controllers/emailController");
const LogController = require("./controllers/logController");
const LocationController = require("./controllers/locationController");
const UserDeviceController = require("./controllers/userDeviceController");
const middleware = require("./middleware/auth");

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Successfully",
  });
});

// User
app.post("/api/v1/register/user", UserController.createUser);
app.post("/api/v1/login/user", UserController.login);
app.get(
  "/api/v1/getAll/user",
  // middleware.authentication,
  UserController.getAllUser
  // middleware.isAdmin
);
app.put("/api/v1/update/user/:userId", UserController.updateUser);
app.delete("/api/v1/delete/user/:userId", UserController.deleteUser);
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
app.get("/api/v3/filter/data/:samId", DataController.filterData);
app.get("/api/v3/all/data/:samId", DataController.getAllData);

// raspi
app.get("/api/v4/raspi/:samId/connect", RaspiController.connect);
app.get("/api/v4/raspi/:samId/collect", RaspiController.collect);
app.post("/api/v4/raspi/:samId/configure", RaspiController.configure);
app.get("/api/v4/raspi/:samId/config", RaspiController.getConfig);

// schedule
app.post("/api/v5/schedule/generate", ScheduleController.createSchedule);
app.put("/api/v5/schedule/stop", ScheduleController.stopSchedule);
app.get("/api/v5/schedule/get", ScheduleController.getAllSchedules);
app.get("/api/v5/schedule/load", ScheduleController.loadSchedules);
app.get("/api/v5/schedule/active", ScheduleController.listActiveSchedules);

// email
app.post("/api/v6/email/create", EmailController.createEmail);
app.get("/api/v6/emails/get", EmailController.getEmails);
app.get("/api/v6/email/get/:emailName", EmailController.getEmailByEmail);
app.put("/api/v6/email/update/:id", EmailController.updateEmail);
app.delete("/api/v6/email/delete/:id", EmailController.deleteEmail);

// logs
app.get("/api/v7/logs/get", LogController.getAllLogs);

// location
app.post("/api/v8/location/create", LocationController.createLocation);
app.get("/api/v8/location/get", LocationController.getALlLocation);
app.put("/api/v8/location/update/:id", LocationController.updateLocation);
app.delete("/api/v8/location/delete/:id", LocationController.deleteLocation);

// user device relation
app.post("/api/v9/user-device/assign", UserDeviceController.assignDeviceToUser);
app.get(
  "/api/v9/user-device/get/device/:userId",
  UserDeviceController.getDevicesByUser
);
app.delete(
  "/api/v9/user-device/delete",
  UserDeviceController.removeDeviceFromUser
);
app.get(
  "/api/v9/user-device/get/user/:deviceId",
  UserDeviceController.getUsersByDevice
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on http://localhost:${PORT}`);
});
