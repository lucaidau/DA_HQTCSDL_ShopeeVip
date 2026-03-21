const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors")

app.use(express.json());
app.use(cors({
  origin: "https://sv-da-hqtcsdl-shopee-vip.vercel.app/"
}))

const route = require("./routers/index");
route(app);

// app.listen(port, () => {
//   console.log("App is running on http://localhost:3000");
// });

module.exports = app

if(!process.env.VERCEL)
{
    app.listen(port, ()=>console.log(`App is running on http://localhost:${port}`))
}