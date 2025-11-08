import * as CartModel from '../models/cartModel.js';
import * as CartItemModel from '../models/cartItemModel.js';
import * as ProductModel from '../models/productModel.js';
import * as OrderModel from '../models/orderModel.js';
import asyncHandler from 'express-async-handler';

// 获取用户的购物车信息（包含商品列表和总价）
export const getUserCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // 获取或创建购物车
    let cart = await CartModel.getCartByUserId(userId);

    if (!cart) {
      cart = await CartModel.createCart(userId);
    }

    // 获取购物车项目
    const items = await CartItemModel.getCartItemsByCartId(cart.cart_id);

    // 获取购物车摘要（总价等）
    const summary = await CartModel.getCartSummary(cart.cart_id);

    res.json({
      cart_id: cart.cart_id,
      user_id: cart.user_id,
      updated_at: cart.updated_at,
      items,
      summary: {
        item_count: parseInt(summary.item_count),
        total_quantity: parseInt(summary.total_quantity),
        total_amount: parseFloat(summary.total_amount),
      },
    });
  } catch (error) {
    console.error('Error getting user cart:', error);
    res.status(500).json({ _error: 'Failed to get cart.' });
  }
});

// 为用户创建购物车
export const createCart = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ _error: 'User ID is required.' });
    return;
  }

  try {
    const cart = await CartModel.createCart(userId);
    res.status(201).json(cart);
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ _error: 'Failed to create cart.' });
  }
});

// 删除购物车
export const deleteCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;

  try {
    const deletedCart = await CartModel.deleteCart(cartId);

    if (!deletedCart) {
      res.status(404).json({ _error: 'Cart not found.' });
      return;
    }

    res.json({
      message: 'Cart deleted successfully',
      cart_id: deletedCart.cart_id,
    });
  } catch (error) {
    console.error('Error deleting cart:', error);
    res.status(500).json({ _error: 'Failed to delete cart.' });
  }
});

// 删除用户的购物车
export const deleteUserCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedCart = await CartModel.deleteCartByUserId(userId);

    if (!deletedCart) {
      res.status(404).json({ _error: 'Cart not found for this user.' });
      return;
    }

    res.json({
      message: 'Cart deleted successfully',
      cart_id: deletedCart.cart_id,
    });
  } catch (error) {
    console.error('Error deleting user cart:', error);
    res.status(500).json({ _error: 'Failed to delete cart.' });
  }
});

// 清空购物车（删除所有商品但保留购物车）
export const clearCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await CartModel.clearCart(cartId);

    if (!cart) {
      res.status(404).json({ _error: 'Cart not found.' });
      return;
    }

    res.json({
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ _error: 'Failed to clear cart.' });
  }
});

// 添加商品到购物车
export const addItemToCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    res
      .status(400)
      .json({ _error: 'Product ID and valid quantity are required.' });
    return;
  }

  try {
    // 验证购物车是否存在
    const cart = await CartModel.getCartById(cartId);
    if (!cart) {
      res.status(404).json({ _error: 'Cart not found.' });
      return;
    }

    // 获取商品信息以获取当前价格
    const product = await ProductModel.getProductInfoById(productId);
    if (!product) {
      res.status(404).json({ _error: 'Product not found.' });
      return;
    }

    // 检查库存
    if (product.stock_quantity < quantity) {
      res.status(400).json({ _error: 'Insufficient stock.' });
      return;
    }

    // 添加商品到购物车
    const cartItem = await CartItemModel.addCartItem(
      cartId,
      productId,
      quantity,
      product.price
    );

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ _error: 'Failed to add item to cart.' });
  }
});

// 更新购物车商品数量
export const updateCartItem = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    res.status(400).json({ _error: 'Valid quantity is required.' });
    return;
  }

  try {
    // 获取购物车项目信息
    const cartItem = await CartItemModel.getCartItemById(cartItemId);
    if (!cartItem) {
      res.status(404).json({ _error: 'Cart item not found.' });
      return;
    }

    // 检查库存
    const product = await ProductModel.getProductInfoById(cartItem.product_id);
    if (product && product.stock_quantity < quantity) {
      res.status(400).json({ _error: 'Insufficient stock.' });
      return;
    }

    // 更新数量
    const updatedItem = await CartItemModel.updateCartItem(cartItemId, {
      quantity,
    });

    if (!updatedItem) {
      res.status(404).json({ _error: 'Cart item not found.' });
      return;
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ _error: 'Failed to update cart item.' });
  }
});

// 从购物车删除商品
export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { cartItemId } = req.params;

  try {
    const deletedItem = await CartItemModel.deleteCartItem(cartItemId);

    if (!deletedItem) {
      res.status(404).json({ _error: 'Cart item not found.' });
      return;
    }

    res.json({
      message: 'Item removed from cart successfully',
      cart_item_id: deletedItem.cart_item_id,
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ _error: 'Failed to remove item from cart.' });
  }
});

// 通过商品ID从购物车删除商品
export const removeProductFromCart = asyncHandler(async (req, res) => {
  const { cartId, productId } = req.params;

  try {
    const deletedItem = await CartItemModel.deleteCartItemByProductId(
      cartId,
      productId
    );

    if (!deletedItem) {
      res.status(404).json({ _error: 'Product not found in cart.' });
      return;
    }

    res.json({
      message: 'Product removed from cart successfully',
      cart_item_id: deletedItem.cart_item_id,
    });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ _error: 'Failed to remove product from cart.' });
  }
});

// 批量删除购物车商品
export const removeBatchItems = asyncHandler(async (req, res) => {
  const { cartItemIds } = req.body;

  if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    res.status(400).json({ _error: 'Cart item IDs array is required.' });
    return;
  }

  try {
    const deletedItems = await CartItemModel.deleteBatchCartItems(cartItemIds);

    res.json({
      message: 'Items removed from cart successfully',
      deleted_count: deletedItems.length,
      deleted_items: deletedItems,
    });
  } catch (error) {
    console.error('Error removing batch items:', error);
    res.status(500).json({ _error: 'Failed to remove items from cart.' });
  }
});

// 获取购物车摘要（总价、商品数量等）
export const getCartSummary = asyncHandler(async (req, res) => {
  const { cartId } = req.params;

  try {
    const summary = await CartModel.getCartSummary(cartId);

    if (!summary) {
      res.status(404).json({ _error: 'Cart not found.' });
      return;
    }

    res.json({
      cart_id: summary.cart_id,
      user_id: summary.user_id,
      updated_at: summary.updated_at,
      item_count: parseInt(summary.item_count),
      total_quantity: parseInt(summary.total_quantity),
      total_amount: parseFloat(summary.total_amount),
    });
  } catch (error) {
    console.error('Error getting cart summary:', error);
    res.status(500).json({ _error: 'Failed to get cart summary.' });
  }
});

// 使用购物车商品创建订单
export const createOrderFromCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400).json({ _error: 'Shipping address is required.' });
    return;
  }

  try {
    // 获取购物车信息
    const cart = await CartModel.getCartById(cartId);
    if (!cart) {
      res.status(404).json({ _error: 'Cart not found.' });
      return;
    }

    // 获取购物车商品
    const cartItems = await CartItemModel.getCartItemsByCartId(cartId);
    if (!cartItems || cartItems.length === 0) {
      res.status(400).json({ _error: 'Cart is empty.' });
      return;
    }

    // 验证库存
    for (const item of cartItems) {
      const product = await ProductModel.getProductInfoById(item.product_id);
      if (!product) {
        res
          .status(404)
          .json({ _error: `Product ${item.product_id} not found.` });
        return;
      }
      if (product.stock_quantity < item.quantity) {
        res.status(400).json({
          _error: `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Required: ${item.quantity}`,
        });
        return;
      }
    }

    // 转换购物车商品为订单商品格式
    const orderItems = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    // 创建订单
    const order = await OrderModel.createOrder(
      cart.user_id,
      shippingAddress,
      orderItems
    );

    // 清空购物车
    await CartModel.clearCart(cartId);

    res.status(201).json({
      message: 'Order created successfully from cart',
      order,
    });
  } catch (error) {
    console.error('Error creating order from cart:', error);
    res.status(500).json({ _error: 'Failed to create order from cart.' });
  }
});

// 获取购物车的所有商品
export const getCartItems = asyncHandler(async (req, res) => {
  const { cartId } = req.params;

  try {
    const items = await CartItemModel.getCartItemsByCartId(cartId);
    res.json(items);
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({ _error: 'Failed to get cart items.' });
  }
});
