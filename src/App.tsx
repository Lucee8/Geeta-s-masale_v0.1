/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import FloatingSpices from './components/FloatingSpices';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductSection from './components/ProductSection';
import Heritage from './components/Heritage';
import RecipeSection from './components/RecipeSection';
import WhyChooseUs from './components/WhyChooseUs';
import Reviews from './components/Reviews';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import InquiryDrawer from './components/InquiryDrawer';
import AdminDashboard from './components/AdminDashboard';
import { Product } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inquiryBag, setInquiryBag] = useState<{ product: Product; quantity: number }[]>([]);
  const [inquiryDrawerOpen, setInquiryDrawerOpen] = useState(false);

  // Full-stack dynamic data lists
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStoreData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductsList(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoriesList(catData);
      }
    } catch (e) {
      console.error("Failed to load products/categories from express DB APIs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [adminOpen]);

  // Smooth scroll helper
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Synchronized category mapping
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    handleScrollToSection('products');
  };

  // Inquiry list controllers
  const handleAddToInquiry = (product: Product, quantity: number) => {
    setInquiryBag((prevBag) => {
      const existing = prevBag.find((item) => item.product.id === product.id);
      if (existing) {
        return prevBag.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevBag, { product, quantity }];
    });
    
    // Auto-open drawer when adding for premium visual feedback
    setInquiryDrawerOpen(true);
  };

  const handleRemoveInquiryItem = (productId: string) => {
    setInquiryBag((prevBag) => prevBag.filter((item) => item.product.id !== productId));
  };

  const handleUpdateInquiryItemQuantity = (productId: string, quantity: number) => {
    setInquiryBag((prevBag) =>
      prevBag.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Master WhatsApp Click actions
  const handleWhatsAppGeneralClick = () => {
    const textMsg = `Hello Geeta's Masale! I am visiting your brand website and would like to ask some questions regarding your traditional Malvani masalas and fresh grain flours. Please connect with me. Thank you!`;
    const url = `https://api.whatsapp.com/send?phone=917620428920&text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If Admin panel dashboard is activated, direct viewport to dashboard workspace
  if (adminOpen) {
    return <AdminDashboard onClose={() => setAdminOpen(false)} />;
  }

  return (
    <motion.div
      key="main-app-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="font-sans antialiased bg-[#FAF9F6] text-slate-900 selection:bg-[#A61B1B]/15 selection:text-[#A61B1B] min-h-screen relative overflow-x-hidden"
    >
      {/* Absolute Particle floating background layer */}
      <FloatingSpices />

      {/* Sticky Navigation Bar */}
      <Navbar
        onNavigate={handleScrollToSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inquiryCount={inquiryBag.reduce((total, item) => total + item.quantity, 0)}
        onOpenInquiry={() => setInquiryDrawerOpen(true)}
      />

      {/* Main view sections */}
      <Hero
        onExploreClick={() => handleScrollToSection('products')}
        onWhatsAppClick={handleWhatsAppGeneralClick}
        onSelectCategory={handleCategorySelection}
      />

      <ProductSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddToInquiry={handleAddToInquiry}
        inquiryList={inquiryBag}
        productsList={productsList}
        categoriesList={categoriesList}
      />

      <Heritage />

      <RecipeSection />

      <WhyChooseUs />

      <Reviews />

      <Gallery />

      <Contact />

      <Footer
        onNavigate={handleScrollToSection}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Shopping Inquiry side drawer */}
      <InquiryDrawer
        isOpen={inquiryDrawerOpen}
        onClose={() => setInquiryDrawerOpen(false)}
        inquiryList={inquiryBag}
        onRemoveItem={handleRemoveInquiryItem}
        onUpdateQuantity={handleUpdateInquiryItemQuantity}
      />

    </motion.div>
  );
}
