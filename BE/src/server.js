const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const route = require("./routers/index");
route(app);

app.listen(port, () => {
  console.log("App is running on http://localhost:3000");
});
