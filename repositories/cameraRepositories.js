const ping = require("ping");

class CameraRepositories {
  static async checkConnection({ ip }) {
    try {
      const res = await ping.promise.probe(ip, { timeout: 3 });

      return {
        connected: res.alive,
        ip: ip,
        time: res.time,
      };
    } catch (error) {
      return { connected: false, ip, error: error.message };
    }
  }
}

module.exports = CameraRepositories;
