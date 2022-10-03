const express = require("express");
const db = require("./config/dbConfig");
const routes = require("./routes");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

db.once("open", () => {
    console.log("Database connection successful.");
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});
