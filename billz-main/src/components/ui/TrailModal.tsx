'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import React from 'react';  // Add this import

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TrialModal({ isOpen, onClose, onConfirm }: TrialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="bg-indigo-500 text-white p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Free Trial</h2>
              <p className="text-sm opacity-80">Try our premium features for 7 days</p>
            </div>
            
            <div className="p-6">
              <ul className="mb-4 space-y-3">
                {[
                  'Unlimited access to all features',
                  'Priority customer support',
                  'Advanced analytics',
                  'No credit card required'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <span className="text-indigo-500 mr-2">
                      <FiCheck className="w-5 h-5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Start Trial
                </button>
              </div>

              <p className="text-xs text-gray-600 mt-4 text-center">
                By starting a free trial, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => {/* Handle terms modal */}}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Terms of Service
                </button>
                {' '}and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}