const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
const route = require("./routers/index");
route(app);

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
