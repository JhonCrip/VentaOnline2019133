"use strict"

var express = require("express");
var productController = require("../controllers/product.controller");
var api = express.Router();
var mdAuth = require("../middlewares/authenticated");

api.put("/setProducto/:id",[mdAuth.ensureUser,mdAuth.ensureAdmin],productController.setProducto);
api.put("/:idC/actProducto/:idP",[mdAuth.ensureUser,mdAuth.ensureAdmin],productController.actProducto);
api.put("/:idC/elimProducto/:idP",[mdAuth.ensureUser,mdAuth.ensureAdmin],productController.elimProducto);
api.get("/obtProducto",mdAuth.ensureUser,productController.obtProducto);
api.get("/buscarProducto",mdAuth.ensureUser,productController.buscarProducto);
api.get("/productoAgotado",mdAuth.ensureUser,productController.productoAgotado);

module.exports = api;