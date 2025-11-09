import * as CategoryModel from '../models/categoryModel.js';
import * as ProductCategoryModel from '../models/productCategoryModel.js';
import asyncHandler from 'express-async-handler';

// 获取所有商品分类
export const queryAllCategory = asyncHandler(async (req, res) => {
  const categories = await CategoryModel.queryAllCategory();
  res.json({ categories, total: categories.length });
});

// 通过ID获取商品分类
export const queryCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await CategoryModel.queryCategoryById(id);
  if (!category) {
    return res.status(404).json({ _error: 'Category not found' });
  }
  res.json(category);
});

// 创建商品分类
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ _error: 'Category name is required' });
  }

  const newCategory = await CategoryModel.createCategory(name, description);
  res.status(201).json(newCategory);
});

// 更新商品分类
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    return res
      .status(400)
      .json({ _error: 'At least one field (name or description) is required' });
  }

  const category = await CategoryModel.queryCategoryById(id);
  if (!category) {
    return res.status(404).json({ _error: 'Category not found' });
  }

  const updatedCategory = await CategoryModel.updateCategory(id, {
    name: name || category.name,
    description: description !== undefined ? description : category.description,
  });

  res.json(updatedCategory);
});

// 删除商品分类
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedCategory = await CategoryModel.deleteCategory(id);
  if (!deletedCategory) {
    return res.status(404).json({ _error: 'Category not found' });
  }

  res.json({
    _message: 'Category deleted successfully',
    category: deletedCategory,
  });
});

// 获取分类下的所有商品
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 先检查分类是否存在
  const category = await CategoryModel.queryCategoryById(id);
  if (!category) {
    return res.status(404).json({ _error: 'Category not found' });
  }

  const products = await ProductCategoryModel.queryProductsByCategory(id);
  res.json({
    category: {
      category_id: category.category_id,
      name: category.name,
      description: category.description,
    },
    products,
    total: products.length,
  });
});

// 获取分类详情（包含商品列表）
export const getCategoryWithProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CategoryModel.queryCategoryById(id);
  if (!category) {
    return res.status(404).json({ _error: 'Category not found' });
  }

  const products = await ProductCategoryModel.queryProductsByCategory(id);

  res.json({
    ...category,
    products,
    product_count: products.length,
  });
});
