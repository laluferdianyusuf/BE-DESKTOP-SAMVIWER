const DataRepositories = require("../repositories/dataRepositories");
const DeviceRepositories = require("../repositories/deviceRepositories");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

class DataServices {
  static validateFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        return `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }
    return null;
  }

  static async createVideo({ video, speed, samId }) {
    try {
      const error = this.validateFields({
        video: video,
        speed: speed,
      });

      if (error) {
        return {
          status: false,
          status_code: 400,
          message: error,
          data: { data: null },
        };
      }

      let categories = "";

      if (speed > 99) {
        categories = "over speed";
      } else if (speed > 30 && speed < 99) {
        categories = "average speed";
      } else if (speed < 30) {
        categories = "low speed";
      }

      const getDevice = await DeviceRepositories.existingDevice({
        samId: samId,
      });

      if (!getDevice) {
        return {
          status: false,
          status_code: 404,
          message: "Can't find a device",
          data: { device: null },
        };
      }

      let videos = "";

      if (video) {
        const uploadToCloudinary = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "video",
                folder: "cctv_videos",
              },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );

            streamifier.createReadStream(video.buffer).pipe(stream);
          });
        };

        const cloudinaryResult = await uploadToCloudinary();
        videos = cloudinaryResult.secure_url;
      } else {
        videos = getDevice.video;
      }

      const createVideo = await DataRepositories.createVideo({
        deviceId: getDevice.deviceId,
        samId: samId,
        video: videos,
        speed: speed,
        category: categories,
      });

      return {
        status: true,
        status_code: 200,
        message: "Video uploaded successfully",
        data: { device: createVideo },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server error" + error,
        data: {
          data: null,
        },
      };
    }
  }

  static async getSpeedByCategory({ category }) {
    try {
      const getSpeed = await DataRepositories.getSpeedByCategory({
        category: category,
      });

      if (!getSpeed) {
        return {
          status: false,
          status_code: 404,
          message: `Speed with category ${category} not found`,
          data: { data: null },
        };
      }

      return {
        status: true,
        status_code: 200,
        message: "data retrieved",
        data: { data: getSpeed },
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Server error" + error,
        data: {
          data: null,
        },
      };
    }
  }
}

module.exports = DataServices;
