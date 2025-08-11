import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, MoreHorizontal, ShoppingCart, User, MessageCircle, Bookmark } from 'lucide-react';

const CustomerPortal = () => {
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    'Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'
  ];

  const products = [
    { id: 1, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 2, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 3, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 4, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 5, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 6, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 7, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' },
    { id: 8, name: 'Product Name', price: 79.00, image: '/api/placeholder/200/200' }
  ];

  const ProductCard = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link to={`/shop/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
            <span className="text-gray-500 text-xs">IMG</span>
          </div>
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        <p className="text-lg font-semibold text-gray-900">₹{product.price}</p>
      </Link>
      <button className="w-full mt-3 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors text-sm">
        Add to cart
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/shop" className="text-xl font-bold">Rental Shop</Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/shop" className="text-gray-600 hover:text-gray-900">Rental Shop</Link>
                <Link to="/shop/wishlist" className="text-gray-600 hover:text-gray-900">Wishlist</Link>
                <Link to="/shop/contact" className="text-gray-600 hover:text-gray-900">Contact us</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div className="relative">
                <MessageCircle className="h-6 w-6 text-gray-600" />
              </div>
              <Link to="/shop/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-6">
            {/* Categories */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-50"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Attributes */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Product attributes</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Colors</h4>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Black</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">White</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price range</h4>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">₹0 - ₹50</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">₹50 - ₹100</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="name">Price List</option>
                  <option value="price">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <select className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black">
                  <option>Sort by</option>
                  <option>Name</option>
                  <option>Price</option>
                  <option>Newest</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 border ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 border ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2">
              <button className="p-2 text-gray-400">&lt;</button>
              {[1, 2, 3, 4, '...', 10].map((page, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded ${
                    page === 1 
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="p-2 text-gray-400">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
