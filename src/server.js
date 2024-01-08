const express = require("express");
const { authRouter } = require("./routes");
const cors = require("cors");
const healthTipsRouter = require("./routes/healthTipsRouter");
const approveUsersRouter = require("./routes/approveUsersRouter");
const queryRouter = require("./routes/queryRouter");
const doctorsRouter = require("./routes/doctorsRouter");
const patientsRouter = require("./routes/patientsRouter");
const internsRouter = require("./routes/internsRouter");
const profileRouter = require("./routes/profileRouter");
const doctorScheduleRouter = require("./routes/doctorScheduleRouter");
const appointmentRouter = require("./routes/appointmentRouter");
const mailRouter = require("./routes/mailRouter");

require("dotenv").config();

const app = express();

app.use(express.json());

const allowedOrigins = [
	"http://localhost:3000",
];

// Set up CORS with options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


app.use("/auth", authRouter)
app.use("/health-tips", healthTipsRouter);
app.use("/approve-users", approveUsersRouter);
app.use("/query", queryRouter);
app.use("/doctors", doctorsRouter);
app.use("/doctor-schedule", doctorScheduleRouter);
app.use("/patients", patientsRouter);
app.use("/interns", internsRouter);
app.use("/profile", profileRouter);
app.use("/appointments", appointmentRouter);
app.use("/mail", mailRouter);


const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
