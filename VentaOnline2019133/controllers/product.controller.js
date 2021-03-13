"use strict"

var Product = require("../modelos/product.model");
var Categoria = require("../modelos/categoria.model");

function setProducto(req,res){
    var categoriaId = req.params.id;
    var params = req.body;

    if(params.name && params.price && params.stock){
        Categoria.findById(categoriaId,(err,categoriaFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(categoriaFind){
                Product.findOne({name: params.name},(err,productFind)=>{
                    if(err){
                        return res.status(500).send({message: "Error al buscar producto"});
                    }else if(productFind){
                        return res.send({message: " Este Producto ya existe"});
                    }else{
                        var product = new Product();
                        product.name = params.name;
                        product.price = params.price;
                        product.stock = params.stock;
                        product.save((err,productSaved)=>{
                            if(err){
                                return res.status(500).send({message: "Error al agregar producto"});
                            }else if(productSaved){
                                Categoria.findByIdAndUpdate(categoriaId,{$push:{products:productSaved._id}},{new: true},(err,categoriaUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: "Error al agregar producto a categoría"});
                                    }else if(categoriaUpdated){
                                        return res.send({message: "Producto agregado a la categoría",categoriaUpdated});
                                    }else{
                                        return res.status(404).send({message: "No se agregó el producto a categoría"});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: "No se guardó"});
                            }
                        })
                    }
                })
            }else{
                return res.status(403).send({message: "Esta Categoría no existe"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese los datos: Nombre, Precio y Cantidad "});
    }
}

function actProducto(req,res){
    let categoriaId = req.params.idC;
    let productId = req.params.idP;
    let update = req.body;

    if(update.stock){
        Product.findById(productId,(err,productFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar producto"});
            }else if(productFind){
                Categoria.findOne({_id:categoriaId,products:productId},(err,categoriaFind)=>{
                    if(err){
                        return res.status(500).send({message: "Error al buscar categoría"});
                    }else if(categoriaFind){
                        Product.findByIdAndUpdate(productId,update,{new:true},(err,productUpdated)=>{
                            if(err){
                                return res.status(500).send({message: "Error al actualizar producto"});
                            }else if(productUpdated){
                                return res.send({message: "Producto actualizado exitosamente",productUpdated});
                            }else{
                                return res.status(404).send({message: "No se actualizó el producto"});
                            }
                        })
                    }else{
                        return res.status(403).send({message: "ID de categoría no existe"});
                    }
                })
            }else{
                return res.status(403).send({message: "ID de producto no existe"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese los datos:'cantidad'"});
    }
}

function elimProducto(req,res){
    let categoriaId = req.params.idC;
    let productId = req.params.idP;

    Categoria.findOneAndUpdate({_id:categoriaId,products:productId},{$pull:{products:productId}},{new:true},(err,categoriaUpdated)=>{
        if(err){
            return res.status(500).send({message: "Error al eliminar Producto de Categoría"});
        }else if(categoriaUpdated){
            Product.findByIdAndRemove(productId,(err,productRemoved)=>{
                if(err){
                    return res.status(500).send({message: "Error al eliminar producto"});
                }else if(productRemoved){
                    return res.send({message: "Producto eliminado exitosamente"});
                }else{
                    return res.status(403).send({message: "No se eliminó el producto"});
                }
            })
        }else{
            return res.status(404).send({message: "Este Producto no existe"});
        }
    })
}

function obtProducto(req,res){
    Product.find({}).exec((err,productos)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar Producto"});
        }else if(productos){
            return res.send({message: "Productos: ",productos});
        }else{
            return res.status(403).send({message: "No se encontraron productos"});
        }
    })
}

function buscarProducto(req,res){
    var params = req.body;

    if(params.search){
        Product.find({name: params.search},(err,resultSearch)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar dato"});
            }else if(resultSearch){
                return res.send({message: "Producto: ",resultSearch});
            }else{
                return res.status(403).send({message: "No se encontra ningun dato"});
            }
        })
    }else if(params.search == ""){
        Product.find({}).exec((err,productos)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(productos){
                return res.send({message: "Productos: ",productos});
            }else{
                return res.status(403).send({message: "No se encontra el producto"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese el producto: 'Nombre'"});
    }
}

function productoAgotado(req,res){
    Product.find({stock: 0},(err,resultSearch)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar productos agotados"});
        }else if(resultSearch){
            if(resultSearch != ""){
                return res.send({message: "Productos agotados: ",resultSearch});
            }else{
                return res.status(404).send({message: "No se encontraron productos agotados"});
            }
        }else{
            return res.status(404).send({message: "No se encontraron productos agotados"});
        }
    })
}

module.exports = {
    setProducto,
    actProducto,
    elimProducto,
    obtProducto,
    buscarProducto,
    productoAgotado
}