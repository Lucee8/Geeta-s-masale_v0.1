/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Compass, MoveRight } from 'lucide-react';
import { CATEGORIES } from '../data/storeData';

interface CategoryGridProps {
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  return (
    <section id="categories" className="py-24 bg-[#FFFFFF] text-slate-800 relative overflow-hidden">
      {/* Decorative luxury pattern */}
      <div className="absolute inset-0 bg-slate-200/5 mix-blend-color opacity-20" />
      <div className="absolute top-1/2 left-0 w-96 h-96 rounded-full bg-slate-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-25">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-[#A61B1B]/20 text-[#A61B1B] text-xs font-mono tracking-widest uppercase"
          >
            <span>TASTE EXPLORATION</span>
          </motion.div>
          
          <h2 className="font-sans text-4xl sm:text-5xl font-black tracking-tight uppercase text-[#A61B1B]">
            Signature <span className="text-[#A61B1B]">Product Categories</span>
          </h2>
          <p className="text-[#A61B1B]/80 text-sm sm:text-base font-light font-sans max-w-xl mx-auto">
            Explore our curated culinary divisions of premium coastal delicacies, spice bags, fresh flours, sweet fruit leathers, and pure dry fruits.
          </p>
        </div>

        {/* 3D Grid of Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{
                y: -12,
                scale: 1.02,
                rotateY: 2,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative h-64 sm:h-96 rounded-xl sm:rounded-2xl overflow-hidden bg-transparent border border-white/10 p-3 sm:p-6 flex flex-col justify-end cursor-pointer transition-all duration-300"
            >
              {/* Background category image with overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110 filter saturate-[1.05] group-hover:saturate-[1.15] brightness-100 group-hover:brightness-95"
                  referrerPolicy="no-referrer"/>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/10 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
                <div className="absolute inset-0 bg-transparent transition-opacity group-hover:bg-[#FF0000]/5 group-hover:opacity-20 pointer-events-none" />
              </div>

              {/* Card content with 3D translation */}
              <div className="relative z-25 space-y-1.5 sm:space-y-3" style={{ transform: 'translateZ(30px)' }}>
                {/* Product Count Pill */}
                <span className="inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-[8px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest uppercase">
                  {cat.count} Sku Items
                </span>

                <h3 className="font-sans text-sm sm:text-xl font-bold tracking-tight text-white transition-colors uppercase leading-tight">
                  {cat.name}
                </h3>

                <p className="text-[10px] sm:text-xs text-white/90 font-sans line-clamp-1 sm:line-clamp-3 leading-relaxed">
                  {cat.description}
                </p>

                {/* Explore button indicators */}
                <div className="pt-1 sm:pt-2 flex items-center text-slate-800 text-[10px] sm:text-xs font-mono tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                  <span className="uppercase text-[8px] sm:text-[10px] font-bold mr-1 sm:mr-1.5">Shop<span className="hidden sm:inline"> Category</span></span>
                  <MoveRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </div>

              {/* Decorative side color block glow */}
              <div className="absolute left-0 bottom-0 top-0 w-1 bg-gradient-to-b from-transparent via-white to-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* High Volume Wholesale supply promo block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-16 p-8 rounded-2xl bg-black/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-red text-red border border-red/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase text-red tracking-wide">Looking For Wholesale & Festival Bulk Supplies?</h4>
              <p className="text-sm text-slate-800 font-sans mt-0.5">We provide customized packaging configurations and wholesale pricing tiers for restaurants, banquets, and resorts across Maharashtra.</p>
            </div>
          </div>
          <button
            onClick={() => onSelectCategory('wholesale')}
            className="w-full md:w-auto shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-[#A61B1B] font-sans text-xs font-black tracking-wider hover:bg-rose-50 transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer shadow-md"
          >
            <span>INQUIRE WHOLESALE TERMS</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
