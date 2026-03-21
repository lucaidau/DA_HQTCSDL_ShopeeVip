const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors")

app.use(express.json());
app.use(cors())

const route = require("./routers/index");
route(app);

// app.listen(port, () => {
//   console.log("App is running on http://localhost:3000");
// });

module.exports = app