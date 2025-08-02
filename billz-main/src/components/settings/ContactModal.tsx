// components/ContactModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';  

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 relative max-w-md w-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-700 mb-2">
              Email:
              <a 
                href="mailto:techvaseegrah@gmail.com" 
                className="text-indigo-500 ml-1"
              >
                techvaseegrah@gmail.com
              </a>
            </p>
            <p className="text-gray-700">
              Phone:
              <a 
                href="tel:+919342241207" 
                className="text-indigo-500 ml-1"
              >
                +91 93422 41207
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}