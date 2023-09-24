const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse,createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  //check for duplicate emails in DB
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  //basic user setup
  const user = await User.create({ email, name, password, role });
  const tokenUser = createTokenUser(user)
  //set up cookie
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  //check if the user provides email and password
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  //if there is a unique email there is a user as well
  const user = await User.findOne({ email });
  // if no email/user throw an error
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  //compare entered password with the password in DB
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);
  //set up cookie
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};


const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

module.exports = { register, login, logout };
