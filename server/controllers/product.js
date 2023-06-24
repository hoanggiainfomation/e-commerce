const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error('Missing input');
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const newProduct = await Product.create(req.body);
  return res.status(200).json({
    succes: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : 'Cannot new create product',
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid);
  return res.status(200).json({
    succes: product ? true : false,
    productData: product ? product : 'Cannot get product',
  });
});
// Filtering, sorting and pagination
const getProducts = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const products = await Product.find();
  return res.status(200).json({
    succes: products ? true : false,
    productDatas: products ? products : 'Cannot get product',
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product',
  });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  // if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const deleteProduct = await Product.findByIdAndDelete(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: deleteProduct ? true : false,
    deleteProduct: deleteProduct ? deleteProduct : 'Cannot update product',
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
