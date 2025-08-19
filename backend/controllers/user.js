const mongoose = require("mongoose");
const User=require("../models/user.js")
const bcrypt=require("bcryptjs")
const jwt = require("jsonwebtoken");
const cloudinary=require("cloudinary").v2
const crypto=require("crypto")
const nodemailer = require('nodemailer');


const  register=async(req,res)=>{

  const avatar=await cloudinary.uploader.upload(req.body.avatar,{
    folder:"avatars",
    width: 130 ,
    crop:"scale"
  })
  
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
    avatar:{
      public_id:avatar.public_id,
      url:avatar.secure_url
    }
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

  const cookieOptions={
    httpOnly:true,
    expires: new Date(Date.now())

  }
    res.status(200).cookie("token",null,cookieOptions).json({
      message:"Çıkış işlemi başarılı"
    })
}




const forgotPassword=async(req,res)=>{
    const user=await User.findOne({email:req.body.email})

    if(!user){
      return res.status(500).json({message:"Böyle bir kullanıcı bulunamadı"})
    }

    const resetToken=crypto.randomBytes(20).toString("hex")

    user.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordExpire =Date.now() + 1000 * 60 * 15 ;

  await user.save({validateBeforeSave:false});

 
  const passwordUrl= `${protocol}://${req.get("host")}/reset/${resetToken}`

 const message=`Şifreni sıfırlamak için kullanıcıya token:${passwordUrl}`

try{
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service:"gmail",
    port: 465,
    auth: {
      user: "your_email@gmail.com",
      pass: "your_app_password",
    },
    secure:true,
  });

  const mailData = {
    from: "your_email@gmail.com",
    to: req.body.email,
    subject: "Şifre sıfırlama",
    text: "message",
  };

  await transporter.sendMail(mailData)

  res.status(200).json({message:"mailinizi kontrol ediniz"})

}catch(error){
  user.resetPasswordToken=undefined
  user.resetPasswordExpire=undefined

  await user.save({validateBeforeSave:false})

  res.status(500).json({message:error.message})
}


};





const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Eksik bilgi gönderildi." });
  }

  try {
    // Gelen token'ı hashleyelim, çünkü DB'de hash olarak tutuluyor
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Token ve süresi geçmemiş user bulalım
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token geçersiz veya süresi dolmuş." });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle ve token bilgilerini sıfırla
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};


module.exports={ register,login,logout,forgotPassword,resetPassword}