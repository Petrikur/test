const express = require("express");

const usersController = require("../controllers/users-controller");
const router = express.Router();
const { check } = require("express-validator");

router.get("/", usersController.getUsers);

router.post()

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email")
      .normalizeEmail() 
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signUp
);

router.post("/login", usersController.login);

module.exports = router;
