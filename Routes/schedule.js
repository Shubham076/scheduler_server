const express = require("express");
      router = express.Router();
const {getSchedules, createSchedule, updateSchedule, removeSchedule, getTeacherSchedules} = require("../controllers/schedule")

router.get("/schedules", getSchedules);
router.post("/schedule", createSchedule);
router.put("/schedule/:id", updateSchedule);
router.delete("/schedule/:id", removeSchedule);
router.get("/teacher/:name",getTeacherSchedules);
module.exports = router;