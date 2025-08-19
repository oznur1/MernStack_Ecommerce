const mongoose = require("mongoose");
const User=require("../models/user.js")
const bcrypt=require("bcryptjs")
const jwt = require("jsonwebtoken");





const  register=async(req,res)=>{
  
    const {name,email,password}=req.body;
      
      // Kullanıcı var mı?
    const user=await User.findOne({email})

    if(user){
        return res.status(500).json({message:"Böyle bir kullanıcı zaten var"})
    }
     
    
    if(password.length<6){
        return res.status(500).json({message:"Şifre 6 karakterden küçük olamaz"})    

    }

    // Şifreyi hash'le
    const passwordHash=await bcrypt.hash(password, 10);


 // Yeni kullanıcı oluştur
 const newUser = await User.create({
    name,
    email,
    password:passwordHash,
  })

   // JWT oluştur
   const token = jwt.sign({ id: newUser._id }, "SECRETTOKEN", { expiresIn: "1h" });


  const cookieOptions={
    httpOnly:true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

  }


   res.status(201).cookie("token",token,cookieOptions).json({newUser,token})

};




const login=async(req,res)=>{
    
   const {email,password}=req.body;
   
   const user=await User.findOne({email});

   if(!user){
    return res.status(500).json({message:"Böyle bir kullanıcı bulunamadı.."})
   }

   const comparePassword=await bcrypt.compare(password,user.password)

   if(!comparePassword){
    return req.status(500).json({message:"Yanlış şifre girdiniz"})
   }

   // JWT oluştur
   const token = jwt.sign({ id: user._id }, "SECRETTOKEN", { expiresIn: "1h" });


  const cookieOptions={
    httpOnly:true,
    expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)

  }


   res.status(200).cookie("token",token,cookieOptions).json({user,token})

}




const logout=async(req,res)=>{
    
}




const forgotPassword=async(req,res)=>{
    
}




const resetPassword=async(req,res)=>{
    
}


module.exports={ register,login,logout,forgotPassword,resetPassword}