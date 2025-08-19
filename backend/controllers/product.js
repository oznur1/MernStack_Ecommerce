const mongoose = require("mongoose");
const Product = require("../models/product.js");
const ProductFilter = require("../utils/productFilter.js");

// Tüm Products
const allProducts = async (req, res) => {
    const resultPerPage=10
  const productsFilter=new ProductFilter(Product.find(),req.query).search().filter().pagination(resultPerPage)
  const products = await productsFilter.query

    res.status(200).json(products);
  
};




const adminProducts=async(req,res,next)=>{
  const products=await Product.find()
}



// Ürünün Detayları
const detailProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Ürün bulunamadı.." });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ msg: "Ürün detayı alınamadı.." });
  }
};


// Ürün Oluştur
const createProducts = async (req, res,next) => {

    let images=[];

  if(typeof req.body.images==="string"){
  images.push(req.body.images)
  }else{
    images=req.body.images
  }

  let allImage=[];
 for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "products", 
      });

      allImage.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

   
    req.body.images = allImage;

    const product = await Product.create(req.body);
    res.status(201).json(product);
 
};


// Ürün Sil
const deleteProducts = async (req, res,next) => {

    const product = await Product.findById(req.params.id);
    
    for (let i=0;i < product.images.length; i++)

   await cloudinary.uploader.destroy([i].public_id)

  return res.status(404).json({ msg: "Ürün silindi.." });
   

   
 
};


// Ürün Güncelle
const updateProducts = async (req, res,next) => {
  // Önce ürünü bul
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ msg: "Ürün bulunamadı." });
  }

  // Yeni images verisi varsa işle
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else if (Array.isArray(req.body.images)) {
    images = req.body.images;
  }

  if (images.length > 0) {
    // Eski resimleri Cloudinary'den sil
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    // Yeni resimleri yükle
    let allImages = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "products",
      });
      allImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    // Yeni resimleri req.body.images olarak ayarla
    req.body.images = allImages;
  }

  // Ürünü güncelle
await Product.findByIdAndUpdate(req.params.id, req.body);

  return res.status(200).json(product);
};



// Ürünlere Yorum Ekleme
const createReview=async(req,res,next)=>{
  const { productId, comment, rating } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      comment,
      rating: Number(rating),
    };

    const product = await Product.findById(productId);


    product.reviews.push(review);

    let avg=0;
    product.reviews.forEach(rev=>{
      avg+=rev.rating
    })
    product.rating = avg / product.reviews.length;

    await product.save({ValidateBeforeSave: false})

    res.status(200).json({
      message:"yorum başarıyla eklendi.."
    })
}








module.exports = {
  allProducts,
  detailProducts,
  createProducts,
  deleteProducts,
  updateProducts,
  createReview,
  adminProducts
};






