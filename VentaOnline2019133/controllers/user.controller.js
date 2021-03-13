"use strict"

var User = require("../modelos/user.model");
var Cart = require("../modelos/cart.model");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
const { param } = require("../rutas/user.route");

function createCart(user){
    var cart = new Cart();

    cart.compra = false;
    cart.owner = user._id;
    cart.save((err,cartSaved)=>{
        if(err){
            console.log(err);
        }else if(cartSaved){
            console.log("Carrito de compras creado exitosamente",cartSaved);
        }else{
            console.log("No se ha podido crear el carrito de compras");
        }
    })
}

function admin(){
    User.findOne({username: "ADMIN"},(err,adminFind)=>{
        if(err){
            console.log("Error al verificar Usuario ADMIN");
        }else if(adminFind){
            console.log("El usuario ADMIN ya existe");
        }else{
            var user = new User();
            bcrypt.hash("123456",null,null,(err,passwordHashed)=>{
                if(err){
                    console.log("Error al encriptar contraseña");
                }else if(passwordHashed){
                    user.username = "ADMIN";
                    user.password = passwordHashed;
                    user.role = "ROL_ADMIN";
                    user.save((err,userSaved)=>{
                        if(err){
                            console.log("Error al crear el Usuario ADMIN");
                        }else if(userSaved){
                            createCart(userSaved);
                            console.log("Usuario ADMIN creado exitosamente");
                        }else{
                            console.log("No se creó el usuario ADMIN");
                        }
                    })
                }else{
                    console.log("No se encriptó la contraseña");
                }
            })
        }
    })
}

function login(req,res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username},(err,userFind)=>{
            if(err){
                return res.status(500).send({message: "Error en el Servidor al buscar Usuario"});
            }else if(userFind){
                bcrypt.compare(params.password,userFind.password,(err,checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: "Error en la contraseñas"});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({token: jwt.createToken(userFind)});
                        }else{
                            return res.send({message: "Bienvenido"});
                        }
                    }else{
                        return res.status(403).send({message: "Contraseña incorrecta"});
                    }
                })
            }else{
                return res.send({message: "Este Usuario no existe"});
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese los datos: 'Usuario y contraseña'"});
    }
}

function registrar(req,res){
    var params = req.body;
    var user = new User();

    if(params.name && params.username && params.password && params.email){
        User.findOne({username: params.username},(err,userFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(userFind){
                return res.send({message: "Este Nombre de usuario ya existe"});
            }else{
                bcrypt.hash(params.password,null,null,(err,passwordHashed)=>{
                    if(err){
                        return res.status(500).send({message: "Error al encriptar la contraseña"});
                    }else if(passwordHashed){
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username;
                        user.password = passwordHashed;
                        user.email = params.email.toLowerCase();
                        if(params.role == "ROL_ADMIN"){
                            user.role = "ROL_ADMIN";
                        }else{
                            user.role = "ROL_CLIENTE";
                        }
                        user.save((err,userSaved)=>{
                            if(err){
                                return res.status(500).send({message: "Error al registrarse"});
                            }else if(userSaved){
                                createCart(userSaved);
                                return res.send({message: "El Usuario se ha creado exitosamente",userSaved});
                            }else{
                                return res.status(404).send({message: "No se ha podido registrar"});
                            }
                        })
                    }else{
                        return res.status(404).send({message: "Contraseña no encriptada"});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: "Ingrese sus datos: 'Nombre, correo, usuario y contraseña'"});
    }
}

function actUser(req,res){
    let userId = req.params.id;
    let update = req.body;

    if(userId == req.user.sub || req.user.role == "ROL_ADMIN"){
        if(update.password){
            return res.send({message: "No se ha podido actualizar la contraseña"});
        }else{
            User.findById(userId,(err,userFinded)=>{
                if(err){
                    return res.status(500).send({message: "Error al buscar"});
                }else if(userFinded){
                    if(userFinded.role == "ROL_CLIENTE"){
                        User.findByIdAndUpdate(userId,update,{new:true},(err,userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: "Error al actualizar"});
                            }else if(userUpdated){
                                return res.send({message: "El Usuario se ha actualizado exitosamente",userUpdated});
                            }else{
                                return res.status(404).send({message: "No se ha podido actualizar"});
                            }
                        })
                    }else{
                        return res.status(401).send({message: "Un Usuario ADMIN no puede actualizar a otro Uusuario ADMIN"});
                    }
                }else{
                    return res.status(404).send({message: "ID de usuario no existe"});
                }
            })
        }
    }else{
        return res.status(401).send({message: "No se puede actualizar este usuario"});
    }
}

function removeCart(user){
    Cart.findOneAndRemove({owner: user._id},(err,cartRemoved)=>{
        if(err){
            console.log("Error al eliminar el Carrito de Compras");
        }else if(cartRemoved){
            console.log("Carrito eliminado exitosamente");
        }else{
            console.log("No se eliminó el carrito");
        }
    })
}



function elimUser(req,res){
    let userId = req.params.id;
    
    if(userId == req.user.sub || req.user.role == "ROL_ADMIN"){
        User.findById(userId,(err,userFind)=>{
            if(err){
                return res.status(500).send({message: "Error al buscar"});
            }else if(userFind){
                if(userFind.role == "ROL_CLIENTE"){
                    removeCart(userFind);
                    User.findByIdAndRemove(userId,(err,userRemoved)=>{
                        if(err){
                            return res.status(500).send({message: "Error al eliminar Usuario"});
                        }else if(userRemoved){
                            return res.send({message: "Usuario eliminado exitosamente"});
                        }else{
                            return res.status(403).send({message: "Wste Usuario no existente"});
                        }
                    })
                }else{
                    return res.status(401).send({message: "Un Usuario ADMIN no puede eliminar a otro Usuario ADMIN"});
                }
            }else{
                return res.status(403).send({message: "El ID del usuario no existe"});
            }
        })
    }else{
        return res.status(401).send({message: "No puedes eliminar a este usuario"});
    }
}

module.exports = {
    admin,
    login,
    registrar,
    actUser,
    elimUser
}