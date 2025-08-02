'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import useSWR from 'swr';

interface AutoPayFormData {
  payerVa: string;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A simple fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MandateModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AutoPayFormData>();

  const { data } = useSWR('/api/organisation', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000, 
  });
  const subscriptionType = data?.organisation.subscriptionType
  


  useEffect(() => {
    if (subscriptionType && subscriptionType === 'pro') {
      onClose();
    }
  }, [data, onClose]);

  const onSubmit = async (data: AutoPayFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mandate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to set up subscription');
      }

      setSuccess(true);
      Swal.fire({
        icon: 'success',
        title: 'Almost there!',
        html: `
          <div class="space-y-4">
            <p>Follow these quick steps:</p>
            <ol class="text-left pl-4">
              <li>1. Check your UPI app notifications</li>
              <li>2. Tap on the payment request</li>
              <li>3. Confirm using your UPI PIN</li>
            </ol>
            <p class="text-sm text-gray-600 mt-2">Your Pro features will be activated instantly once we receive confirmation.</p>
          </div>
        `,
        showConfirmButton: true,
        timer: 90000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-md w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Unlock Pro Features</h2>
            <p className="text-sm text-gray-600 mt-1">Just ₹499/month - Cancel anytime</p>
          </div>
          <button
            onClick={() => {
              Swal.fire({
                title: 'About Pro Subscription',
                html: `
                  <div class="text-left">
                    <p class="font-medium mb-2">What you'll get:</p>
                    <ul class="list-disc pl-4 space-y-2">
                      <li>Unlimited bills & invoices</li>
                      <li>Priority customer support</li>
                      <li>Advanced analytics</li>
                      <li>Custom branding options</li>
                    </ul>
                    <p class="mt-4 text-sm text-gray-600">Secure payments powered by UPI</p>
                  </div>
                `,
                icon: 'info'
              });
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaInfoCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="payerVa" className="block text-sm font-medium text-gray-700 mb-2">
              Your UPI ID
            </label>
            <input
              type="text"
              id="payerVa"
              {...register('payerVa', {
                required: 'Please enter your UPI ID',
                pattern: {
                  value: /^[\w.\-]+@[a-zA-Z]+/,
                  message: 'Please enter a valid UPI ID (e.g., example@upi)',
                },
              })}
              disabled={loading || success}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.payerVa ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 ${
                errors.payerVa ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
              } transition-all`}
              placeholder="example@upi"
            />
            {errors.payerVa && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {errors.payerVa.message}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Subscription Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Monthly payment: ₹499</p>
              <p>• Auto-renews monthly</p>
              <p>• Cancel anytime</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-semibold ${
              success
                ? 'bg-green-500 cursor-not-allowed'
                : loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-all`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Processing...
              </>
            ) : success ? (
              <>
                <FaCheckCircle className="mr-2" /> Check UPI App
              </>
            ) : (
              'Start Pro Subscription'
            )}
          </button>

          {error && (
            <div className="mt-2 p-3 bg-red-50 rounded text-red-600 text-sm flex items-center">
              <FaExclamationCircle className="mr-2" /> {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
