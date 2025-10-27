const axios = require("axios");

class RaspiRepositories {
  static async collectData({ ip }) {
    try {
      const response = await axios.get(`http://${ip}:5001/api/data`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to collect data from ${ip}: ${error.message}`);
    }
  }

  static async configureDevice({ ip, config }) {
    try {
      const response = await axios.post(`http://${ip}:5001/api/config`, config);
      return response.data;
    } catch (error) {
      console.log(error);

      throw new Error(`Failed to configure device at ${ip}: ${error.message}`);
    }
  }

  static async checkConnection({ ip }) {
    try {
      const response = await axios.get(`http://${ip}:5001/api/health`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to connect to device at ${ip}: ${error.message}`);
    }
  }

  static async getConfig({ ip }) {
    try {
      const response = await axios.get(`http://${ip}:5001/api/network`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get config at ${ip}: ${error.message}`);
    }
  }

  static async getJsonFile({ ip }) {
    try {
      const response = await axios.get(`http://${ip}:5001/api/json-files`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get config at ${ip}: ${error.message}`);
    }
  }

  static async getJsonFilename({ ip, filename }) {
    try {
      const response = await axios.get(
        `http://${ip}:5001/api/json-files/${filename}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get config at ${ip}: ${error.message}`);
    }
  }
}

module.exports = RaspiRepositories;
