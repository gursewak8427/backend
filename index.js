
const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config();
// s

const connectDb = require("./src/configs/db.config");
connectDb();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"))


app.get("/test", (req, res) => {
    res.contentType("html");
    res.send("<h1>Server Working</h1>");
})

app.use("/users", require("./src/routes/users.routes.js"));
app.use("/folders", require("./src/routes/folders.routes.js"));

app.listen(3006, () => {
    console.log("Server is running on port 3006");
});

// Make login api with phone and password
