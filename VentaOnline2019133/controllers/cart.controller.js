"use strict"

var Cart = require("../modelos/cart.model");
var Product = require("../modelos/product.model");

function addCarrito(req,res){
    var productId = req.params.id;
    var params = req.body;
    var userId = req.user.sub;

    if(params.stock){
        Product.findById(productId,(err,productFind)=>{
            if(err){
                return res.status(500).send({message: "Error al agregar el producto al carrito"});
            }else if(productFind){
                if(params.stock > productFind.stock){
                    return res.status(403).send({message: "La cantidad que lleva es mayor a la cantidad del producto"});
                }else{
                    Cart.findOneAndUpdate({owner: userId},{$push:{products:productFind._id,stock:params.stock}},{new:true},(err,cartUpdated)=>{
                        if(err){
                            return res.status(500).send({message: "Error al agregar el producto al carrito"});
                        }else if(cartUpdated){
                            return res.send({message: "Producto agregado al carrito"});
                        }else{
                            return res.status(404).send({message: "No se agregó el producto al carrito"});
                        }
                    })
                }
            }else{
                return res.status(403).send({message: "Este Producto no existe"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese la cantidad de productos que decea llevar"});
    }
}

module.exports = {
    addCarrito
}