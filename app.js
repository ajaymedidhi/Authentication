const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Register

app.post("/users", async (request, response) => {
  const { username, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT username FROM user WHERE username=${username};`;

  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    const createUser = `INSERT INTO user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;

    const dbResponse = await db.run(createUser);
    const newUserId = dbResponse.lastID;

    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status(400);
    response.send("User Already Exits");
  }
});
