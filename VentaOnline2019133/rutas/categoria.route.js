"use strict"

var express = require("express");
var categoriaController = require("../controllers/categoria.controller");
var api = express.Router();
var mdAuth = require("../middlewares/authenticated");

api.post("/crearCategoria",[mdAuth.ensureUser,mdAuth.ensureAdmin],categoriaController.crearCategoria);
api.put("/actCategoria/:id",[mdAuth.ensureUser,mdAuth.ensureAdmin],categoriaController.actCategoria);
api.delete("/elimCategoria/:id",[mdAuth.ensureUser,mdAuth.ensureAdmin],categoriaController.elimCategoria);
api.get("/obtCategoria",mdAuth.ensureUser,categoriaController.obtCategoria);
api.get("/buscarCategoria",mdAuth.ensureUser,categoriaController.buscarCategoria);

module.exports = api;