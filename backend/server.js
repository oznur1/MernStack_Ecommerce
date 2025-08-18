

const express=require("express")
const cors=require("cors")
const bodyParser=require("body-parser")
const cookieParser=require("cookie-parser")
require("dotenv").config()
const db=require("./config/db")
const  product=require("./routes/product.js")
const cloudinary=require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app=express();

// MongoDB bağlantısı
db();

// 1️⃣ CORS middleware: frontend’den gelen istekleri kontrol eder
 app.use(cors({

 }))


 // 2️⃣ Body-parser middleware: POST/PUT body verilerini JS objesi olarak al
app.use(bodyParser.json({limit:"30mb", extended:true}));  

app.use(bodyParser.urlencoded({ extended: true }))



// 3️⃣ Cookie-parser middleware: cookie’leri okumak için
app.use(cookieParser());


app.get("/products",(req,res)=>{
     res.status(200).json('rota belirlendi')
})




app.use("/",product)




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`${PORT} DİNLENİYOR`);
});