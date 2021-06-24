const express = require('express'),
      morgan = require('morgan'),
      helmet = require("helmet"),
      cors = require('cors'),
      app = express(),
      port = process.env.port || 4000;
      db = require("./db")
      TeacherRoutes = require("./Routes/teacher")
      ScheduleRoutes = require("./Routes/schedule")

app.use(morgan("tiny"));
app.use(helmet());
app.use(cors())
app.use(express.json());

app.use(ScheduleRoutes);
app.use(TeacherRoutes);
app.use((req,res,next) => {
    let error  = new Error("Not found");
    error.status  = 404;
    next(error);
    console.log("running");
})

// global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({message:err.message || "Something went wrong"})
})

db.connect()
.then(() => {
    app.listen(port, () => {
        console.log("Connected To database")
        console.log(`Server started on port: ${port}`)
    })
})
.catch(err => {
    console.log(err);
})