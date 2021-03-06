"use strict"

var express = require("express");
var cartController = require("../controllers/cart.controller");
var api = express.Router();
var mdAuth = require("../middlewares/authenticated");

api.put("/addCarrito/:id",mdAuth.ensureUser,cartController.addCarrito);

module.exports = api;