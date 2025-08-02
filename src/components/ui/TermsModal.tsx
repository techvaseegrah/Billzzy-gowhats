// components/auth/TermsModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';  // Add this import

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <div className="prose">
              {/* Add your terms and conditions content here */}
              <p>Welcome to Billzzy. By creating an account, you agree to the following terms:</p>
              <ul>
                <li>You will maintain the confidentiality of your account.</li>
                <li>The services are intended solely for business use.</li>
                <li>Each SMS sent through our service costs ₹0.30.</li>
                <li>You must not use our services for unlawful activities.</li>
                {/* Add more terms as needed */}
              </ul>
            </div>
            <button
              onClick={onClose}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}