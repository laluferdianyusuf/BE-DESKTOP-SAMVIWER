const ScheduleRepository = require("../repositories/scheduleRepository");
const RaspiServices = require("./raspiServices");
const LogsServices = require("./logServices");
const cron = require("node-cron");

class ScheduleService {
  static jobs = {};
  static async startSchedule({ samIds, startTime, type }) {
    try {
      const existingSchedules = await ScheduleRepository.findScheduleBySamIds(
        samIds
      );

      const [hour, minute] = startTime.split(":");
      let cronExp;
      if (type === "daily") {
        cronExp = `${minute} ${hour} * * *`;
      } else if (type === "12h") {
        cronExp = `${minute} ${hour}-23/12 * * *`;
      } else {
        throw new Error(`Unsupported schedule type: ${type}`);
      }

      if (existingSchedules.length > 0) {
        for (const schedule of existingSchedules) {
          if (this.jobs[schedule.id]) {
            this.jobs[schedule.id].stop();
            delete this.jobs[schedule.id];
          }

          await ScheduleRepository.updateSchedule(schedule.id, {
            samIds: JSON.stringify(samIds),
            startTime,
            type,
            isActive: true,
          });

          const job = cron.schedule(
            cronExp,
            async () => {
              for (const samId of samIds) {
                console.log(`[Scheduler] Collecting data for ${samId}`);
                await RaspiServices.collectData({ samId });
                await LogsServices.createLog({
                  activity: `Scheduled data collection triggered for samId: ${samId} (schedule ID: ${schedule.id})`,
                });
              }
            },
            { timezone: "Asia/Makassar" }
          );

          this.jobs[schedule.id] = job;

          await LogsServices.createLog({
            activity: `Updated existing schedule ID ${
              schedule.id
            } for samIds: ${samIds.join(", ")} to ${startTime} (${type})`,
          });
        }

        return {
          status: true,
          status_code: 200,
          message: "Existing schedule updated successfully",
          data: existingSchedules,
        };
      }

      const newSchedule = await ScheduleRepository.createSchedule({
        samIds: JSON.stringify(samIds),
        startTime,
        type,
        isActive: true,
      });

      const job = cron.schedule(
        cronExp,
        async () => {
          for (const samId of samIds) {
            console.log(`[Scheduler] Collecting data for ${samId}`);
            await RaspiServices.collectData({ samId });
            await LogsServices.createLog({
              activity: `Scheduled data collection triggered for samId: ${samId} (schedule ID: ${newSchedule.id})`,
            });
          }
        },
        { timezone: "Asia/Makassar" }
      );

      this.jobs[newSchedule.id] = job;

      await LogsServices.createLog({
        activity: `Created new schedule ID ${
          newSchedule.id
        } for samIds: ${samIds.join(
          ", "
        )}, startTime: ${startTime}, type: ${type}`,
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
        message: "Failed to create or update schedule: " + error.message,
        data: null,
      };
    }
  }

  static async stopSchedule({ id, samIds }) {
    try {
      if (samIds && Array.isArray(samIds)) {
        const activeSchedules = await ScheduleRepository.getActiveSchedules(
          true
        );
        let stoppedCount = 0;

        for (const raw of activeSchedules) {
          const schedule = raw.get({ plain: true });
          const scheduleSamIds = JSON.parse(schedule.samIds || "[]");

          const hasTargetSam = scheduleSamIds.some((sid) =>
            samIds.includes(sid)
          );
          if (!hasTargetSam) continue;

          if (this.jobs[schedule.id]) {
            this.jobs[schedule.id].stop();
            delete this.jobs[schedule.id];
          }

          await ScheduleRepository.stopSchedule({
            id: schedule.id,
            isActive: false,
          });

          stoppedCount++;
          console.log(
            `[Scheduler] Stopped schedule ${
              schedule.id
            } for samIds: ${scheduleSamIds.join(", ")}`
          );

          await LogsServices.createLog({
            activity: `Stopped schedule ID ${
              schedule.id
            } for samIds: ${scheduleSamIds.join(", ")}`,
          });
        }

        return {
          status: true,
          status_code: 200,
          message:
            stoppedCount === 0
              ? "No active schedules found for the given samIds."
              : `Stopped ${stoppedCount} schedules related to samIds.`,
          data: stoppedCount,
        };
      }

      if (id) {
        if (this.jobs[id]) {
          this.jobs[id].stop();
          delete this.jobs[id];
        }

        const updated = await ScheduleRepository.stopSchedule({
          id,
          isActive: false,
        });

        await LogsServices.createLog({
          activity: `Stopped schedule ID ${id}`,
        });

        return {
          status: true,
          status_code: 200,
          message: "Schedule stopped successfully by ID.",
          data: updated,
        };
      }

      return {
        status: false,
        status_code: 400,
        message: "Please provide either id or samIds[] to stop schedules.",
        data: null,
      };
    } catch (error) {
      console.error("[Scheduler] stopSchedule error:", error);
      return {
        status: false,
        status_code: 500,
        message: "Failed to stop schedules: " + error.message,
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

  static async listActiveSchedules() {
    try {
      const schedules = await ScheduleRepository.getActiveSchedules();
      return {
        status: true,
        status_code: 200,
        message: "Active schedules retrieved successfully",
        data: schedules,
      };
    } catch (error) {
      console.error("[Scheduler] listActiveSchedules error:", error);
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

      for (const raw of schedules) {
        const schedule = raw.get({ plain: true });
        const startTime = schedule.startTime;

        if (!startTime) {
          console.warn(
            `[Scheduler] Skip schedule ${schedule.id}, startTime missing`
          );
          continue;
        }

        const date = new Date(startTime);
        const hour = date.getHours();
        const minute = date.getMinutes();

        let cronExp;
        if (schedule.type === "daily") {
          cronExp = `${minute} ${hour} * * *`;
        } else if (schedule.type === "per12h" || schedule.type === "12h") {
          cronExp = `${minute} ${hour}-23/12 * * *`;
        } else {
          console.warn(`[Scheduler] Unknown schedule type: ${schedule.type}`);
          continue;
        }

        const samIds = Array.isArray(schedule.samIds)
          ? schedule.samIds
          : JSON.parse(schedule.samIds);

        const job = cron.schedule(
          cronExp,
          async () => {
            for (const samId of samIds) {
              console.log(`[Scheduler] Collecting data for ${samId}`);
              await RaspiServices.collectData({ samId });

              await LogsServices.createLog({
                activity: `Scheduled data collection triggered for samId: ${samId} (schedule ID: ${schedule.id})`,
              });
            }
          },
          { timezone: "Asia/Makassar" }
        );

        this.jobs[schedule.id] = job;
      }

      return {
        status: true,
        status_code: 200,
        message: `[Scheduler] Loaded ${schedules.length} active schedules`,
        data: schedules.map((s) => s.get({ plain: true })),
      };
    } catch (error) {
      console.error("[Scheduler] loadSchedules error:", error);
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
