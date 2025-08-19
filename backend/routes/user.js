

const express=require("express");
const { register, login, logout, forgotPassword, resetPassword } = require("../controllers/user");

const router=express.Router();

router.post("/register",register)

router.post("/login",login)

router.get("/logout",logout)

router.post("/forgotPassword",forgotPassword)

router.post("/resetPassword/:token ",resetPassword)



module.exports=router

