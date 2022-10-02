const express = require("express");
const db = require("./config/dbConfig");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.once("open", () => {
    console.log("Database connection successful.");
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});
