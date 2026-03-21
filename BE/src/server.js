const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      ,
      "https://sv-da-hqtcsdl-shopee-vip.vercel.app/",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

// Router
const route = require("./routers/index");
route(app);

module.exports = app;

// Change environment between DEV and PRODUCTION
if (!process.env.VERCEL) {
  app.listen(port, () =>
    console.log(`App is running on http://localhost:${port}`),
  );
}
