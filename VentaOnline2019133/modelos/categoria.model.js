"use strict"

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CategoriaSchema = ({
    name: String,
    products: [{type: Schema.ObjectId, ref:"product"}]
})

module.exports = mongoose.model("categoria",CategoriaSchema);