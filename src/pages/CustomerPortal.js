import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List, ShoppingCart, User, MessageCircle, ChevronDown } from 'lucide-react';

const CustomerPortal = () => {
  const [sortBy, setSortBy] = useState('price-list');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

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

  const colors = ['Red', 'Blue', 'Green', 'Black', 'White'];
  const priceRanges = ['₹0 - ₹50', '₹50 - ₹100', '₹100 - ₹200', '₹200+'];

  const ProductCard = ({ product }) => (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md hover:border-gray-500 transition-all duration-200 ${
      viewMode === 'list' ? 'flex items-center space-x-4' : ''
    }`}>
      <Link to={`/shop/product/${product.id}`} className={viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''}>
        <div className={`bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${
          viewMode === 'list' ? 'w-16 h-16 flex-shrink-0' : 'aspect-square mb-3'
        }`}>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-8 h-6 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs font-medium">IMG</span>
            </div>
          </div>
        </div>
        <div className={viewMode === 'list' ? 'flex-1' : ''}>
          <h3 className={`font-medium text-gray-900 mb-1 ${
            viewMode === 'list' ? 'text-left' : 'text-center'
          }`}>{product.name}</h3>
          <p className={`text-lg font-bold text-gray-900 ${
            viewMode === 'list' ? 'text-left mb-0' : 'text-center mb-3'
          }`}>₹{product.price}</p>
        </div>
      </Link>
      <button className={`bg-black text-white py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-sm ${
        viewMode === 'list' ? 'px-4 flex-shrink-0' : 'w-full'
      }`}>
        Add to cart
      </button>
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
                <Link to="/shop" className="px-4 py-2 bg-black text-white rounded-full font-medium">
                  Rental Shop
                </Link>
                <Link to="/shop/wishlist" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 font-medium">
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
        {/* Category Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8 border border-gray-300">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-4 py-2 border border-gray-400 rounded-full text-sm font-medium hover:border-black hover:bg-gray-100 hover:text-black transition-all duration-200"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-72 space-y-6">
            {/* Product Attributes */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Product attributes</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Colors</h4>
                  <div className="space-y-2">
                    {colors.map((color, index) => (
                      <label key={index} className="flex items-center group cursor-pointer">
                        <input type="checkbox" className="mr-3 w-4 h-4 text-black rounded focus:ring-gray-500" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                          {color}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Price range</h4>
                  <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <label key={index} className="flex items-center group cursor-pointer">
                        <input type="checkbox" className="mr-3 w-4 h-4 text-black rounded focus:ring-gray-500" />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                          {range}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-300">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-400 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium hover:border-gray-600 transition-all duration-200"
                    >
                      <option value="price-list">Price List</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                  
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-600 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="relative">
                    <select className="appearance-none bg-white border border-gray-400 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium hover:border-gray-600 transition-all duration-200">
                      <option>Sort by</option>
                      <option>Name</option>
                      <option>Price</option>
                      <option>Newest</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 border rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-black border-black text-white' 
                        : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 border rounded-lg transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-black border-black text-white' 
                        : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-3 py-8">
              <button className="p-2 text-gray-400 hover:text-black transition-colors">
                &lt;
              </button>
              {[1, 2, 3, 4, '...', 10].map((page, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    page === 1 
                      ? 'bg-black text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="p-2 text-gray-400 hover:text-black transition-colors">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
