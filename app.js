require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const { sjf } = require("./scheduling-algoritm/sjf");
const { Response } = require("./models/response");
const morgan = require("morgan");
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log(`DB GOT CONNECTED`))
  .catch((error) => {
    console.log(`DB CONNECTION ISSUES`);
    console.log(error);
    process.exit(1);
  });

app.get("/status", (req, res) => {
  const name = req.query.name;
  res.send(`Hi ${name}`);
});

app.post("/scheduling/sjf", async (req, res) => {
  try {
    const { processes } = req.body;
    const result = sjf(processes);

    await Response.create({ result: processes });

    return res.status(200).json({ success: true, msg: null, data: { result } });
  } catch (error) {
    console.log("scheduling/sjf: ", error);
    return res.status(500).json({
      success: false,
      msg: "internal server error",
      data: {
        error,
      },
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
