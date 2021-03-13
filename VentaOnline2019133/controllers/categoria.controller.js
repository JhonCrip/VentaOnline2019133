"use strict"

var Categoria = require("../modelos/categoria.model");

function deafultCategory(){
    var nombre = "Default"
    Categoria.findOne({name: nombre},(err,categoriaFind)=>{
        if(err){
            console.log("Error al buscar",err);
        }else if(categoriaFind){
            console.log("Ya existe la Categoria");
        }else{
            var category = new Category();
            category.name = "Default";
            category.save((err,categorySaved)=>{
                if(err){
                    console.log("Error al intentar agregar");
                }else if(categorySaved){
                    console.log("Categoría creada");
                }else{
                    console.log("No se creó la categoría");
                }
            })
        }
    })
}

function crearCategoria(req,res){
    var params = req.body;
    
    if(params.name){
        Categoria.findOne({name: params.name},(err,categoriaFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(categoriaFind){
                return res.send({message: "Esta Categoría ya existe"});
            }else{
                var category = new Category();
                category.name = params.name;
                category.save((err,categorySaved)=>{
                    if(err){
                        return res.status(500).send({message: "Error al intentar agregar"});
                    }else if(categorySaved){
                        return res.send({message: "Categoría creada exitosamente",categorySaved});
                    }else{
                        return res.status(404).send({message: "No se guardó"});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese los datos:'Nombre' "})
    }
}

function actCategoria(req,res){
    let categoriaId = req.params.id;
    let update = req.body;

    if(update.name){
        Categoria.findOne({name: update.name},(err,categoriaFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar categoria"});
            }else if(categoriaFind){
                return res.send({message: "El Nombre de categoría ya existe"});
            }else{
                Categoria.findByIdAndUpdate(categoriaId,update,{new:true},(err,categoriaUpdated)=>{
                    if(err){
                        return res.status(500).send({message: "Error al actualizar"});
                    }else if(categoriaUpdated){
                        return res.send({message: "Se actualizo Categoria",categoriaUpdated});
                    }else{
                        return res.status(500).send({message: "No se actualizó"});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese el nuevo nombre de categoría"});
    }
}

function elimCategoria(req,res){
    let categoriaId = req.params.id;

    Categoria.findOne({_id : categoriaId},(err,categoriaFind)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar"});
        }else if(categoriaFind){
            var productos = categoriaFind.products;
            Categoria.findOneAndUpdate({name: "Default"},{$push:{products:productos}},{new: true},(err,categoriaUpdated)=>{
                if(err){
                    return res.status(500).send({message: "Error al actualizar"});
                }else if(categoriaUpdated){
                    Categoria.findOne({_id : categoriaId},(err,categoriaFind)=>{
                        if(err){
                            return res.status(500).send({message: "Error al buscar"});
                        }else if(categoriaFind){
                            Categoria.findByIdAndRemove(categoriaId,(err,categoriaRemoved)=>{
                                if(err){
                                    return res.status(500).send({message: "Error al eliminar"});
                                }else if(categoriaRemoved){
                                    return res.send({message: "Categoría eliminada exitosamente"});
                                }else{
                                    return res.status(404).send({message: "No se eliminó"});
                                }
                            })
                        }else{
                            return res.status(403).send({message: "ID de categoría no existe"});
                        }
                    })
                }else{
                    return res.status(404).send({message: "No se actualizó"});
                }
            })
        }else{
            return res.status(403).send({message: "ID de categoría no existe"});
        }
    })
}

function obtCategoria(req,res){
    Categoria.find({}).populate("products").exec((err,categorias)=>{
        if(err){
            return res.status(500).send({message: "Error al obtener los datos"});
        }else if(categorias){
            return res.send({message: "Categorías:",categorias});
        }else{
            return res.status(403).send({message: "No hay datos"});
        }
    })
}

function buscarCategoria(req,res){
    var params = req.body;

    if(params.search){
        Categoria.find({name: params.search},(err,categoriaFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(categoriaFind){
                if(categoriaFind != ""){
                    return res.send({message: "Coinciencias encontradas: ",categoriaFind});
                }else{
                    return res.status(404).send({message: "No se encontraron coincidencias"});
                }
            }else{
                return res.status(404).send({message: "No se encontraron coincidencias"});
            }
        })
    }else if(params.search == ""){
        Categoria.find({}).exec((err,categorias)=>{
            if(err){
                return res.status(500).send({message: "Error al obtener los datos"});
            }else if(categorias){
                return res.send({message: "Categorías:",categorias});
            }else{
                return res.status(403).send({message: "No hay datos"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese el dato a buscar: 'Ejemplo'"});
    }
}

module.exports = {
    deafultCategory,
    crearCategoria,
    actCategoria,
    elimCategoria,
    obtCategoria,
    buscarCategoria
}