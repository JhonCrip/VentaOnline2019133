"use strict"

var express = require("express");
var factController = require("../controllers/fact.controller");
var api = express.Router();
var mdAuth = require("../middlewares/authenticated");

api.put("/addFact",mdAuth.ensureUser,factController.addFact);
api.get("/obtFact",mdAuth.ensureUser,factController.obtFact);
api.get("/obtProductoFact/:id",[mdAuth.ensureUser,mdAuth.ensureAdmin],factController.obtProductoFact);
api.get("/obtMostrarProductos",mdAuth.ensureUser,factController.obtMostrarProductos);

module.exports = api;