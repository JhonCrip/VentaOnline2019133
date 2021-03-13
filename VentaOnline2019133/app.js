"use strict"

var express = require("express");
var bodyParser = require("body-parser");
var userRoutes = require("./rutas/user.route");
var categoriaRoutes = require("./rutas/categoria.route");
var productRoutes = require("./rutas/product.route");
var cartRoutes = require("./rutas/cart.route");
var factRoutes = require("./rutas/fact.route");

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use("/v1",userRoutes);
app.use("/v1",categoriaRoutes);
app.use("/v1",productRoutes);
app.use("/v1",cartRoutes);
app.use("/v1",factRoutes);

module.exports = app;