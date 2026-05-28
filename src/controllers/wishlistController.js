const wishlistService = require('../services/wishlistService');

module.exports = {
  getWishlist: async (req, res) => {
    try {
      const list = await wishlistService.getWishlist(req.user.userId);
      res.json({ wishlist: list });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Unable to fetch wishlist' });
    }
  },
  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      const updated = await wishlistService.addToWishlist(req.user.userId, productId);
      res.json({ wishlist: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Unable to add to wishlist' });
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      const updated = await wishlistService.removeFromWishlist(req.user.userId, productId);
      res.json({ wishlist: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Unable to remove from wishlist' });
    }
  },
};
