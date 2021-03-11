const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session")

// CODE TO SAVE TO DATABASE==================================
const KnexSessionStore = require("connect-session-knex")(session)
const db = require("../data/db-config")
//===========================================================
const usersRouter = require("./users/users-router")
const authRouter = require("./auth/auth-router")

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

// express-session
server.use(session( 
   {
      resave: false,  // AVOID CREATING SESSIONS THAT HAVEN'T CHANGED
      saveUninitialized: false,  // GDPR LAWS AGAINTS AUTOMATICALLY SETTING COOKIES
      secret: "arbitrary_value", //USED TO CRYPTOGRAPHICALLY SIGN THE COOKIE
      // STORE THE SESSION DATA IN THE DATABASE INSTEAD OF MEMORY
	   store: new KnexSessionStore({
		   knex: db, // configured instance of knex
         createtable: true, // if the table does not exist, it will create it automatically
      }),
    }))

server.use(usersRouter)
server.use(authRouter)

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
