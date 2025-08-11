import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, User, MessageCircle, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 2, name: 'Product Name', price: 89.00, image: '/api/placeholder/200/200' },
    { id: 3, name: 'Product Name', price: 99.00, image: '/api/placeholder/200/200' }
  ]);

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-pink-300 transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/shop/product/${product.id}`}>
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-10 h-8 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">IMG</span>
            </div>
          </div>
        </div>
        <h3 className="font-medium text-gray-900 mb-1 text-center">{product.name}</h3>
        <p className="text-lg font-bold text-gray-900 text-center mb-3">₹{product.price}</p>
      </Link>
      <div className="flex space-x-2">
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105">
          Add to cart
        </button>
        <button
          onClick={() => removeFromWishlist(product.id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/shop" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                🏠 Home
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Home
                </Link>
                <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Rental Shop
                </Link>
                <Link to="/shop/wishlist" className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium">
                  Wishlist
                </Link>
                <Link to="/shop/contact" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Contact us
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full hover:bg-blue-200 transition-all duration-200">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">admin</span>
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📋</span>
                  </div>
                </button>
              </div>
              <Link to="/shop/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
                <MessageCircle className="h-6 w-6" />
              </Link>
              <Link to="/shop/cart" className="relative bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">💖 My Wishlist</h1>
          <p className="text-gray-600">Save your favorite items for later</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-500 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Start adding items you love!</p>
            <Link to="/shop">
              <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {wishlistItems.length} Items in your wishlist
              </h2>
              <p className="text-gray-600">Move items to cart when you're ready to rent</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/shop">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
