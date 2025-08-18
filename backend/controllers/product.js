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
const createProducts = async (req, res) => {
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
const deleteProducts = async (req, res) => {

    const product = await Product.findById(req.params.id);
 
   product.remove()

      return res.status(404).json({ msg: "Ürün bulunamadı.." });
   

   
 
};


// Ürün Güncelle
const updateProducts = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // güncellenmiş veriyi geri döndürür
      runValidators: true, // schema kurallarına göre doğrular
    });

    if (!product) {
      return res.status(404).json({ msg: "Ürün bulunamadı.." });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ msg: "Ürün güncellenemedi.." });
  }
};

module.exports = {
  allProducts,
  detailProducts,
  createProducts,
  deleteProducts,
  updateProducts,
};






