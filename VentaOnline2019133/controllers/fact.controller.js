"use strict"

var Fact = require("../modelos/fact.model");
var User = require("../modelos/user.model");
var Cart = require("../modelos/cart.model");
var Product = require("../modelos/product.model");

function addFact(req,res){
    var userId = req.user.sub;

    Cart.findOne({owner: userId},(err,cartFind)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar su carrito"});
        }else if(cartFind){
            if(cartFind.products != ""){
                let cantidad = cartFind.stock;
                let producto = cartFind.products;
                let i = 0;
                let j = 0;
                producto.forEach(element =>{
                    Product.findOne({_id:element},(err,productFind)=>{
                        if(err){
                            res.status(500).send({message: "Error al buscar producto"})
                        }else if(productFind){
                            let stockP = productFind.stock;
                            if(stockP<cantidad[i]){
                                i++;
                                return res.send({message: "Cantidad de carrito no válida"});
                            }else{
                                i++;
                            }
                        }else{
                        res.status(403).send({message: "No se encontró el producto"});
                        }
                    })
                })
                producto.forEach(element =>{
                    Product.findOne({_id:element},(err,productFind)=>{
                        if(err){
                            res.status(500).send({message: "Error al buscar producto"})
                        }else if(productFind){
                            let stockP = productFind.stock;
                            let stockT = stockP - cantidad[j];
                            j++;
                            Product.findByIdAndUpdate(element,{stock:stockT},{new:true},(err,stockUpdated)=>{
                                if(err){
                                    res.status(500).send({message: "Error al actualizar stock"});
                                }else if(stockUpdated){
                                    console.log("El stock del producto se actualizó exitosamente");
                                }else{
                                    res.status(500).send({message: "No se actualizó"});
                                }
                            })
                        }else{
                        res.status(403).send({message: "No se encontró el producto"});
                        }
                    })
                })
                var fact = new Fact();
                fact.name = req.user.name;
                fact.products = producto;
                fact.save((err,factsSaved)=>{
                    if(err){
                        return res.status(500).send({message: "Error al guardar factura"});
                    }else if(factsSaved){
                        User.findByIdAndUpdate(userId,{$push:{facts:factsSaved._id}},{new:true},(err,userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: "Error al conectar factura con el usuario"});
                            }else if(userUpdated){
                                Cart.findOneAndRemove({owner: userId},(err,cartRemoved)=>{
                                    if(err){
                                        return res.status(500).send({message: "Error al eliminar carrito"});
                                    }else if(cartRemoved){
                                        var cart = new Cart();
                                        cart.owner = req.user.sub;
                                        cart.save((err,cartSaved)=>{
                                            if(err){
                                                return res.status(500).send({message: "Error al vaciar carrito"});
                                            }else if(cartSaved){
                                                return res.send({message: "Carrito listo para comprar",billSaved});
                                            }else{
                                                return res.status(404).send({message: "No se limpió el carrito"});
                                            }
                                        })
                                    }else{
                                        return res.status(404).send({message: "EL Carrito no existe"});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: "No se a podido conectar la factura con el usuario"});
                            }
                        })
                    }else{
                        return res.status(404).send({message: "Factura no creada"});
                    }
                })
            }else{
                return res.status(403).send({message: "No tiene productos en su carrito"});
            }
        }else{
            return res.status(403).send({message: "No se encontró su carrito"});
        }
    })
}

function obtFact(req,res){
    var userId = req.user.sub;

    if(req.user.role == "ROLE_ADMIN"){
        Fact.find({}).exec((err,bills)=>{
            if(err){
                return res.status(500).send({message: "Error al obtener facturas"});
            }else if(bills){
                return res.send({message: "Todas las facturas: ",bills});
            }else{
                return res.status(403).send({message: "No hay facturas por mostrar"});
            }
        })
    }else{
        User.findOne({_id : userId}).populate("bills").exec((err,user)=>{
            if(err){
                console.log(err);
                return res.status(500).send({message: "Error al obtener datos"});
            }else if(user){
                var facturas = user.bills;
                return res.send({message: "Facturas: ",facturas});
            }else{
                return res.status(403).send({message: "No hay registros"});
            }
        })
    }
}

function obtProductoFact(req,res){
    var factId = req.params.id;

    Fact.findById({_id:factId}).populate("products").exec((err,factFind)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar factura"});
        }else if(factFind){
            var productos = factFind.products;
            return res.send({message: "Los productos de la factura son: ",productos});
        }else{
            return res.status(403).send({message: "ID de factura no existe"});
        }
    })
}

function obtMostrarProductos(req,res){
    Fact.find({}).populate("products").exec((err,bills)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar productos"});
        }else if(bills){
            let productos = [];
            bills.forEach(element => {
                if(productos.includes(element.products)){
                   
                }else{
                    productos.push(element.products);
                }
            });
            return res.send({message: "Los productos más vendidos: ",productos});
        }else{
            return res.status(403).send({message: "No hay productos por mostrar"});
        }
    })
}

module.exports = {
    addFact,
    obtFact,
    obtProductoFact,
    obtMostrarProductos
}