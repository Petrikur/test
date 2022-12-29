const { v4: uuidv4 } = require("uuid");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const HttpError = require("../models/HttpError");

const User = require("../models/user");


// Get users
const getUsers = (req, res, next) => {
  let users;
  try {
    users = User.Find({}, "-password");
  } catch (e) {
    const err = new httpError("Getting users failed, please try again", 500);
    return next(err);
  }
  res.status(201).json({ users: DUMMY_USERS });
};

// Signup
const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const err = new httpError("Signing up failed, please try again", 500);
    return next(err);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  try {
    console.log(createdUser);
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again 222", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      `${process.env.secret_key}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  res.status(201).json({
    user: createdUser.toObject({ getters: true }),
  });
};

//Login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (e) {
    const err = new httpError("Logging in failed, please try again", 500);
    return next(err);
  }

  if (!existingUser) {
    const error = new HttpError("Invalid credentials!", 401);
    return next(error);
  }

  try {
    let isValidPassword = false;
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Could not log you in", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials!", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      `${process.env.secret_key}`,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Could not log you in", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
