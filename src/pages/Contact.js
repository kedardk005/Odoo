import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShoppingCart, User, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
                <Link to="/shop/wishlist" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 font-medium">
                  Wishlist
                </Link>
                <Link to="/shop/contact" className="px-4 py-2 bg-black text-white rounded-full font-medium">
                  Contact us
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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg">We'd love to hear from you. Send us a message!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">support@rentalshop.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Address</h3>
                    <p className="text-gray-600">123 Business Street<br />City, State 12345</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black rounded-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                    placeholder="What is this about?"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition-all duration-200 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-bold text-lg shadow-sm flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/shop">
            <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;
