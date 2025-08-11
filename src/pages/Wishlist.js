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
    <div className="bg-white border border-gray-300 rounded-lg p-3 hover:shadow-md hover:border-gray-500 transition-all duration-200">
      <Link to={`/shop/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-8 h-6 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">IMG</span>
            </div>
          </div>
        </div>
        <h3 className="font-medium text-gray-900 mb-1 text-center text-sm">{product.name}</h3>
        <p className="text-base font-bold text-gray-900 text-center mb-2">₹{product.price}</p>
      </Link>
      <div className="flex space-x-2">
        <button className="flex-1 bg-black text-white py-1.5 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium">
          Add to cart
        </button>
        <button
          onClick={() => removeFromWishlist(product.id)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-black">
                Rental Management System
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 font-medium">
                  Rental Shop
                </Link>
                <Link to="/shop/wishlist" className="px-4 py-2 bg-black text-white rounded-full font-medium">
                  Wishlist
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gray-100 text-black px-3 py-2 rounded-full hover:bg-gray-200 transition-all duration-200">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">admin</span>
                </button>
              </div>
              <Link to="/shop/cart" className="relative bg-black text-white p-2 rounded-full hover:bg-gray-700 transition-all duration-200 shadow-sm">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">My Wishlist</h1>
          <p className="text-gray-600">Save your favorite items for later</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-500 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-6">Start adding items you love!</p>
            <Link to="/shop">
              <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-300">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {wishlistItems.length} Items in your wishlist
              </h2>
              <p className="text-gray-600 text-sm">Move items to cart when you're ready to rent</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/shop">
                <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm">
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
