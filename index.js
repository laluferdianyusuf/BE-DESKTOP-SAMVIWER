const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 2090;
const socketPort = 2091;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = /^https?:\/\/.*/.test(origin);
      if (allowed) return callback(null, origin);

      return callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

require("dotenv").config();
require("./jobs/DailySendEmail.js");

const ScheduleService = require("./services/scheduleServices.js");
const upload = require("./utils/fileUploads");

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

const videoFolder = path.join(__dirname, "videos");
app.use("/videos", express.static(videoFolder));

app.get("/", (req, res) => {
  res.status(200).send({ message: "Successfully" });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

(async () => {
  await ScheduleService.loadSchedules();
  console.log("All schedules restored and cron jobs started!");
})();

// User
app.post("/api/v1/register/user", UserController.createUser);
app.post("/api/v1/login/user", UserController.login);
app.get(
  "/api/v1/getAll/user",
  middleware.authentication,
  UserController.getAllUser,
  middleware.isAdmin
);
app.put(
  "/api/v1/update/user/:userId",
  middleware.authentication,
  UserController.updateUser,
  middleware.isAdmin
);
app.delete(
  "/api/v1/delete/user/:userId",
  middleware.authentication,
  UserController.deleteUser
);
app.get(
  "/api/v1/current/user",
  middleware.authentication,
  UserController.currentUser
);

app.post("/api/v1/logout", middleware.authentication, UserController.logout);

// Device
app.post("/api/v2/add/device", DeviceController.addDevice);
app.put("/api/v2/update/device/:deviceId", DeviceController.updateDevice);
app.get("/api/v2/getAll/device", DeviceController.getAllDevice);
app.delete("/api/v2/delete/device/:samId", DeviceController.deletedDevice);
app.get("/api/v2/system/info", DeviceController.getSystemInfo);

// Data
app.post(
  "/api/v3/create/video/:samId",
  upload.single("video"),
  DataController.createVideo
);
app.get("/api/v3/get/speed/category", DataController.getSpeedByCategory);
app.get("/api/v3/filter/data/:samId", DataController.filterData);
app.get("/api/v3/all/data/:samId", DataController.getAllData);
app.get("/api/v3/get/all-data/filters", DataController.getTrafficByFilter);
app.get("/api/v3/get/summary", DataController.getSummaryData);

// Raspi
app.get("/api/v4/raspi/:samId/connect", RaspiController.connect);
app.get("/api/v4/raspi/:samId/collect", RaspiController.collect);
app.post("/api/v4/raspi/:samId/configure", RaspiController.configure);
app.get("/api/v4/raspi/:samId/config", RaspiController.getConfig);
app.get("/api/v4/raspi/:samId/json", RaspiController.getAllFileJson);
app.get("/api/v4/raspi/:samId/json/filename", RaspiController.getFileJson);

// Schedule
app.post("/api/v5/schedule/generate", ScheduleController.createSchedule);
app.put("/api/v5/schedule/stop", ScheduleController.stopSchedule);
app.get("/api/v5/schedule/get", ScheduleController.getAllSchedules);
app.get("/api/v5/schedule/load", ScheduleController.loadSchedules);
app.get("/api/v5/schedule/active", ScheduleController.listActiveSchedules);

// Email
app.post("/api/v6/email/create", EmailController.createEmail);
app.get("/api/v6/emails/get", EmailController.getEmails);
app.get("/api/v6/email/get/:emailName", EmailController.getEmailByEmail);
app.put("/api/v6/email/update/:id", EmailController.updateEmail);
app.delete("/api/v6/email/delete/:id", EmailController.deleteEmail);

// Logs
app.get("/api/v7/logs/get", LogController.getAllLogs);

// Location
app.post("/api/v8/location/create", LocationController.createLocation);
app.get("/api/v8/location/get", LocationController.getALlLocation);
app.put("/api/v8/location/update/:id", LocationController.updateLocation);
app.delete("/api/v8/location/delete/:id", LocationController.deleteLocation);

// User-Device relation
app.post("/api/v9/user-device/assign", UserDeviceController.assignDeviceToUser);
app.get(
  "/api/v9/user-device/get/device/:userId",
  UserDeviceController.getDevicesByUser
);
app.get(
  "/api/v9/user-device/get/accessible/device",
  middleware.authentication,
  UserDeviceController.accessibleDevices
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
  console.log(`Server listening on http://localhost:${PORT}`);
});

server.listen(socketPort, () => {
  console.log(
    `Server with Socket.IO running on http://localhost:${socketPort}`
  );
});
