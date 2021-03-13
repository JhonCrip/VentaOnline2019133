"use strict"

var express = require("express");
var userController = require("../controllers/user.controller");
var api = express.Router();
var mdAuth = require("../middlewares/authenticated");

api.post("/login",userController.login);
api.post("/registrar",userController.registrar);
api.put("/actUser/:id",mdAuth.ensureUser,userController.actUser);
api.delete("/elimUser/:id",mdAuth.ensureUser,userController.elimUser);

module.exports = api;