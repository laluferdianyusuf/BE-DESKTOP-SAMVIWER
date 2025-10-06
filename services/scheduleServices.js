const ScheduleRepository = require("../repositories/scheduleRepository");
const RaspiServices = require("./raspiServices");
const cron = require("node-cron");

class ScheduleService {
  static jobs = {};

  static async startSchedule({ samIds, startTime, type }) {
    try {
      const schedule = await ScheduleRepository.createSchedule({
        samIds: JSON.stringify(samIds),
        startTime,
        type,
        isActive: true,
      });

      const [hour, minute] = startTime.split(":");

      let cronExp;

      if (type === "daily") {
        cronExp = `${minute} ${hour} * * *`;
      } else if (type === "12h") {
        cronExp = `${minute} ${hour}-23/12 * * *`;
      }

      const job = cron.schedule(cronExp, async () => {
        for (const samId of samIds) {
          console.log(`[Scheduler] Collecting data for ${samId}`);
          await RaspiServices.collectData({ samId });
        }
      });

      this.jobs[schedule.id] = job;

      return {
        status: true,
        status_code: 201,
        message: "Schedule created successfully",
        data: schedule,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Failed to create schedule: " + error.message,
        data: null,
      };
    }
  }

  static async stopSchedule(id) {
    try {
      if (this.jobs[id]) {
        this.jobs[id].stop();
        delete this.jobs[id];
      }

      const updated = await ScheduleRepository.stopSchedule({
        id,
        isActive: false,
      });

      return {
        status: true,
        status_code: 200,
        message: "Schedule stopped successfully",
        data: updated,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Failed to stop schedule: " + error.message,
        data: null,
      };
    }
  }

  static async listSchedules() {
    try {
      const schedules = await ScheduleRepository.getAllSchedules();

      return {
        status: true,
        status_code: 200,
        message: "Schedules retrieved successfully",
        data: schedules,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Failed to retrieve schedules: " + error.message,
        data: null,
      };
    }
  }

  static async loadSchedules() {
    try {
      const schedules = await ScheduleRepository.getActiveSchedules(true);

      for (const schedule of schedules) {
        const [hour, minute] = schedule.startTime.split(":");
        let cronExp;

        if (schedule.type === "daily") {
          cronExp = `${minute} ${hour} * * *`;
        } else if (schedule.type === "per12h") {
          cronExp = `${minute} ${hour}-23/12 * * *`;
        }

        const job = cron.schedule(cronExp, async () => {
          for (const samId of schedule.samIds) {
            console.log(`[Scheduler] Collecting data for ${samId}`);
            await RaspiServices.collectData({ samId });
          }
        });

        this.jobs[schedule.id] = job;
      }

      return {
        status: true,
        status_code: 200,
        message: `[Scheduler] Loaded ${schedules.length} active schedules`,
        data: schedules,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: "Failed to load schedules: " + error.message,
        data: null,
      };
    }
  }
}

module.exports = ScheduleService;
