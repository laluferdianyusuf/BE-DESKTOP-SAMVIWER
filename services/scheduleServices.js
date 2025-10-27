const ScheduleRepository = require("../repositories/scheduleRepository");
const DeviceRepository = require("../repositories/deviceRepositories");
const RaspiServices = require("./raspiServices");
const LogsServices = require("./logServices");
const cron = require("node-cron");
const moment = require("moment-timezone");

class ScheduleService {
  static jobs = {};

  static convertLocalToUTC(timeLike, timezone) {
    if (!timeLike) {
      throw new Error("convertLocalToUTC: missing time value");
    }

    let m;
    if (moment.isMoment(timeLike)) {
      m = timeLike.clone();
    } else if (typeof timeLike === "string") {
      if (/^\d{1,2}:\d{2}$/.test(timeLike)) {
        m = moment.tz(timeLike, "HH:mm", timezone);
      } else {
        m = moment.tz(timeLike, timezone);
      }
    } else if (timeLike instanceof Date || typeof timeLike === "number") {
      m = moment.tz(timeLike, timezone);
    } else {
      m = moment.tz(String(timeLike), timezone);
    }

    if (!m.isValid()) {
      throw new Error(`Invalid time / timezone: ${timeLike} / ${timezone}`);
    }

    return m.clone().utc().format("HH:mm");
  }

  static generateCronExp(timeLike, type) {
    let hour, minute;
    if (typeof timeLike === "string" && /^\d{1,2}:\d{2}$/.test(timeLike)) {
      [hour, minute] = timeLike.split(":").map((v) => parseInt(v, 10));
    } else {
      const m = moment.isMoment(timeLike) ? timeLike : moment(timeLike);
      if (!m.isValid()) {
        throw new Error("generateCronExp: invalid time value");
      }
      hour = m.hour();
      minute = m.minute();
    }

    hour = Number.isFinite(hour) ? hour : 0;
    minute = Number.isFinite(minute) ? minute : 0;

    if (type === "daily") {
      return `${minute} ${hour} * * *`;
    }

    if (type === "12h" || type === "per12h") {
      const hour2 = (hour + 12) % 24;
      return [`${minute} ${hour} * * *`, `${minute} ${hour2} * * *`];
    }

    throw new Error(`Unsupported schedule type: ${type}`);
  }

  static async createJobForDevice(scheduleId, samId, startTime, type) {
    const device = await DeviceRepository.existingDevice({ samId });
    if (!device) {
      console.warn(`[Scheduler] Device ${samId} tidak ditemukan`);
      return;
    }

    const timezone = device.utc ? "UTC" : device.timezone || "UTC";

    if (!startTime) {
      console.warn(`[Scheduler] Missing startTime for schedule ${scheduleId}`);
      return;
    }

    let cronTime = startTime;
    try {
      if (!device.utc) {
        cronTime = this.convertLocalToUTC(startTime, timezone);
      } else {
        if (
          !(typeof startTime === "string" && /^\d{1,2}:\d{2}$/.test(startTime))
        ) {
          cronTime = moment.tz(startTime, timezone).utc().format("HH:mm");
        }
      }
    } catch (err) {
      console.error(
        `[Scheduler] Failed to normalize startTime for ${samId}:`,
        err.message
      );
      return;
    }

    const cronExpOrArray = this.generateCronExp(cronTime, type);
    const jobKey = `${scheduleId}_${samId}`;

    if (this.jobs[jobKey]) {
      if (Array.isArray(this.jobs[jobKey])) {
        this.jobs[jobKey].forEach((j) => j.stop());
      } else {
        this.jobs[jobKey].stop();
      }
      delete this.jobs[jobKey];
    }

    if (Array.isArray(cronExpOrArray)) {
      this.jobs[jobKey] = [];
      for (const cronExp of cronExpOrArray) {
        const job = cron.schedule(
          cronExp,
          async () => {
            console.log(
              `[Scheduler] Collecting data for samId: ${samId} | Schedule ID: ${scheduleId} | TZ: ${timezone}`
            );
            await RaspiServices.collectData({ samId });
            await LogsServices.createLog({
              activity: `Schedule ID ${scheduleId} triggered for samId: ${samId}`,
            });
          },
          { timezone }
        );
        this.jobs[jobKey].push(job);
      }

      console.log(
        `[Scheduler] Created ${this.jobs[jobKey].length} jobs for samId: ${samId}, scheduleId: ${scheduleId}, timezone: ${timezone}`
      );
      return this.jobs[jobKey];
    }

    const job = cron.schedule(
      cronExpOrArray,
      async () => {
        console.log(
          `[Scheduler] Collecting data for samId: ${samId} | Schedule ID: ${scheduleId} | TZ: ${timezone}`
        );
        await RaspiServices.collectData({ samId });
        await LogsServices.createLog({
          activity: `Schedule ID ${scheduleId} triggered for samId: ${samId}`,
        });
      },
      { timezone }
    );

    this.jobs[jobKey] = job;
    console.log(
      `[Scheduler] Job created for samId: ${samId}, scheduleId: ${scheduleId}, cronExp: ${cronExpOrArray}, timezone: ${timezone}`
    );
    return job;
  }

  static async startSchedule({ samIds, startTime, type }) {
    try {
      const existing = await ScheduleRepository.findScheduleBySamIds(samIds);

      if (existing.length > 0) {
        for (const schedule of existing) {
          await ScheduleRepository.updateSchedule(schedule.id, {
            samIds: JSON.stringify(samIds),
            startTime,
            type,
            isActive: true,
          });

          for (const samId of samIds) {
            await this.createJobForDevice(schedule.id, samId, startTime, type);
          }

          await LogsServices.createLog({
            activity: `Updated schedule ID ${schedule.id} (${type}) at ${startTime}`,
          });
        }

        return {
          status: true,
          status_code: 200,
          message: "Schedule updated successfully",
          data: existing,
        };
      }

      const newSchedule = await ScheduleRepository.createSchedule({
        samIds: JSON.stringify(samIds),
        startTime,
        type,
        isActive: true,
      });

      for (const samId of samIds) {
        await this.createJobForDevice(newSchedule.id, samId, startTime, type);
      }

      await LogsServices.createLog({
        activity: `Created schedule ID ${newSchedule.id} (${type}) at ${startTime}`,
      });

      return {
        status: true,
        status_code: 201,
        message: "Schedule created successfully",
        data: newSchedule,
      };
    } catch (error) {
      console.error("[Scheduler] startSchedule error:", error);
      return {
        status: false,
        status_code: 500,
        message: `Failed to create or update schedule: ${error.message}`,
      };
    }
  }

  static async stopSchedule({ id, samIds }) {
    try {
      const stopJob = async (scheduleId, samId) => {
        const jobKey = `${scheduleId}_${samId}`;
        if (this.jobs[jobKey]) {
          if (Array.isArray(this.jobs[jobKey])) {
            this.jobs[jobKey].forEach((j) => j.stop());
          } else {
            this.jobs[jobKey].stop();
          }
          delete this.jobs[jobKey];
          console.log(`[Scheduler] Stopped job for samId: ${samId}`);
        }
      };

      if (samIds && Array.isArray(samIds)) {
        const actives = await ScheduleRepository.getActiveSchedules(true);
        let count = 0;

        for (const raw of actives) {
          const schedule = raw.get({ plain: true });
          const scheduleSamIds = JSON.parse(schedule.samIds || "[]");
          for (const samId of scheduleSamIds) {
            if (samIds.includes(samId)) {
              await stopJob(schedule.id, samId);
              count++;
            }
          }
        }

        return {
          status: true,
          status_code: 200,
          message: `Stopped ${count} jobs for given samIds`,
          data: count,
        };
      }

      if (id) {
        const schedule = await ScheduleRepository.findById(id);
        if (schedule) {
          const samIdList = JSON.parse(schedule.samIds || "[]");
          for (const samId of samIdList) {
            await stopJob(schedule.id, samId);
          }

          await ScheduleRepository.stopSchedule({
            id: schedule.id,
            isActive: false,
          });

          await LogsServices.createLog({
            activity: `Stopped schedule ID ${schedule.id}`,
          });

          return {
            status: true,
            status_code: 200,
            message: "Schedule stopped successfully",
          };
        }
      }

      return {
        status: false,
        status_code: 400,
        message: "Please provide either id or samIds[] to stop schedules.",
      };
    } catch (error) {
      console.error("[Scheduler] stopSchedule error:", error);
      return {
        status: false,
        status_code: 500,
        message: `Failed to stop schedules: ${error.message}`,
      };
    }
  }

  static async listSchedules() {
    try {
      const schedules = await ScheduleRepository.getAllSchedules();
      return {
        status: true,
        status_code: 200,
        data: schedules,
      };
    } catch (error) {
      return {
        status: false,
        status_code: 500,
        message: error.message,
      };
    }
  }

  static async listActiveSchedules() {
    try {
      const schedules = await ScheduleRepository.getActiveSchedules();
      return {
        status: true,
        status_code: 200,
        data: schedules,
      };
    } catch (error) {
      console.error("[Scheduler] listActiveSchedules error:", error);
      return {
        status: false,
        status_code: 500,
        message: error.message,
      };
    }
  }

  static async loadSchedules() {
    try {
      const schedules = await ScheduleRepository.getActiveSchedules(true);
      for (const raw of schedules) {
        const schedule = raw.get ? raw.get({ plain: true }) : raw;
        if (!schedule.startTime) continue;

        const samIds = Array.isArray(schedule.samIds)
          ? schedule.samIds
          : JSON.parse(schedule.samIds || "[]");

        for (const samId of samIds) {
          await this.createJobForDevice(
            schedule.id,
            samId,
            schedule.startTime,
            schedule.type
          );
        }
      }

      console.log(`[Scheduler] Loaded ${schedules.length} active schedules`);
      return {
        status: true,
        status_code: 200,
        message: `Loaded ${schedules.length} schedules`,
      };
    } catch (error) {
      console.error("[Scheduler] loadSchedules error:", error);
      return {
        status: false,
        status_code: 500,
        message: error.message,
      };
    }
  }
}

module.exports = ScheduleService;
