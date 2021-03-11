// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require("express")
const Users = require("../users/users-model")
const bcrypt = require("bcryptjs") // IMPORT BCRYPT
const { 
   checkUsernameFree,
   checkUsernameExists, 
   checkPasswordLength } = require("./auth-middleware")

   const router = express.Router()


/**========================================================================
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
  router.post("/api/auth/register", 
   checkUsernameFree(),checkPasswordLength(), async (req, res, next) => {

	try {
      console.log(req.body)
		const { username, password } = req.body

		const newUser = await Users.add({
         username,
         // hash password with time complexity to the power of( 2^of )
         // need to tweak to 1-2 seconds 
			password: await bcrypt.hash(password,12)  // CALL BCRYPT
		})

		res.status(201).json(newUser)
	} catch(err) {
		next(err)
	}
})


/**========================================================================
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
  router.post("/api/auth/login", checkUsernameExists(), async (req, res, next) => {

   try {		

      const user = await Users.findBy(req.body.username).first()

      const passwordValid = await bcrypt.compare(req.body.password, user.password)

      if (!passwordValid) {
			return res.status(401).json({
				message: "Invalid credentials",
			})
      }

      // EXPRESS-SESSION 
      req.session.user = user
		res.status(200).json({ message: `Welcome ${user.username}!`})

	} catch(err) {
		next(err)
	}
})


/**========================================================================
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

  router.get("/api/auth/logout", async (req, res, next) => {
	try {
		// deletes the session on the server-side, so the user is no longer authenticated
		req.session.destroy((err) => {
			if (err) {
				next(err)
			} else {
				res.status(204).end()
			}
		})
	} catch (err) {
		next(err)
	}
})

 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router