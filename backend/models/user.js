const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
    {
    name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
        enique:true,
    },

    password:{
        type: String,
        required: true,
        minLength:6,

    },

    avatar:{
        public_id:{
            type: String,
            required: true,
        },

       url:{
            type: String,
            required: true,
        },
    },

    role:{
        type: String,
        default:"user",
        required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
    },
    {
        timestamps: true, // createdAt ve updatedAt otomatik ekler
      }
)



module.exports=mongoose.model("user", userSchema)