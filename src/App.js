import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RentalOrders from './pages/RentalOrders';
import RentalOrderDetail from './pages/RentalOrderDetail';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Reporting from './pages/Reporting';
import Settings from './pages/Settings';
import Transfer from './pages/Transfer';
import Profile from './pages/Profile';
import CustomerPortal from './pages/CustomerPortal';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rental" element={<RentalOrders />} />
            <Route path="rental/:id" element={<RentalOrderDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="reporting" element={<Reporting />} />
            <Route path="settings" element={<Settings />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Customer Portal Routes */}
          <Route path="/shop" element={<CustomerPortal />} />
          <Route path="/shop/product/:id" element={<ProductDetail />} />
          <Route path="/shop/cart" element={<Cart />} />
          <Route path="/shop/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
