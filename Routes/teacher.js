const express = require("express");
      router = express.Router();
const {createTeacher} = require("../controllers/teacher")


router.post("/teacher", createTeacher);

module.exports = router;