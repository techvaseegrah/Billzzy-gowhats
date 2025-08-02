'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '../ui/Select';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import React from 'react';

import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { TermsModal } from '../ui/TermsModal';
import { TrialModal } from '../ui/TrailModal';
import { getPincodeDetails } from '@/lib/utils/pincode';

const COMPANY_SIZES = [
  { value: 'solo', label: 'Just me' },
  { value: 'small', label: '1-10 employees' },
  { value: 'medium', label: '11-50 employees' },
  { value: 'large', label: '50+ employees' }
];

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    companySize: '',
    shopName: '',
    flatNo: '',
    street: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    mobileNumber: '',
    landlineNumber: '',
    websiteAddress: '',
    gstNumber: '',
    subscriptionType: 'trial'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    handleInputChange(e);

    if (pincode.length === 6) {
      try {
        setIsLoading(true);
        const details = await getPincodeDetails(pincode);
        setFormData(prev => ({
          ...prev,
          ...details
        }));
        toast.success('Address details fetched successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to fetch pincode details');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.name || !formData.phone) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!validatePhone(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    if (formData.password.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return false;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setIsTrialModalOpen(true);
    }
  };

  const handleTrialConfirm = () => {
    setIsTrialModalOpen(false);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      toast.success('Registration successful! Please login.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 sm:px-6 md:px-0">
      <div className="relative w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {step === 1 ? 'Account Details' : 'Business Information'}
              </h2>
              <span className="text-xs sm:text-sm text-gray-500">Step {step} of 2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: step === 1 ? '50%' : '100%' }}
              ></div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={formVariants}
              transition={{ duration: 0.5 }}
              className="overflow-y-auto max-h-[calc(100vh-250px)] sm:max-h-[calc(100vh-220px)]"
            >
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pr-10 text-sm"
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 4 characters
                    </p>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      required
                      className="w-full text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => setIsTermsModalOpen(true)}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        terms and conditions
                      </button>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2 Content */}
              {step === 2 && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {/* Shop Details Section */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Shop Name
                    </label>
                    <Input
                      type="text"
                      name="shopName"
                      placeholder="Your Shop Name"
                      value={formData.shopName}
                      onChange={handleInputChange}
                      required
                      className="w-full text-sm"
                    />
                  </div>

                  {/* Address Section */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Flat/Shop No
                    </label>
                    <Input
                      type="text"
                      name="flatNo"
                      placeholder="Flat/Shop Number"
                      value={formData.flatNo}
                      onChange={handleInputChange}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <Input
                      type="text"
                      name="street"
                      placeholder="Street Name"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="text-sm"
                    />
                  </div>

                  {/* Pincode Section */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Pincode
                    </label>
                    <Input
                      type="text"
                      name="pincode"
                      placeholder="6-digit pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      className="text-sm"
                    />
                  </div>

                  {/* Auto-filled Fields */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      City
                    </label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      District
                    </label>
                    <Input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      State
                    </label>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="bg-gray-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <Input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="bg-gray-50 text-sm"
                    />
                  </div>

                  {/* Optional Fields */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      Website (Optional)
                    </label>
                    <Input
                      type="url"
                      name="websiteAddress"
                      placeholder="https://your-website.com"
                      value={formData.websiteAddress}
                      onChange={handleInputChange}
                      className="text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      GST Number (Optional)
                    </label>
                    <Input
                      type="text"
                      name="gstNumber"
                      placeholder="GST number"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Buttons */}
            <div className="flex justify-between space-x-3 sm:space-x-4 mt-4 sm:mt-6">
              {step === 2 && (
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full text-sm"
                >
                  Back
                </Button>
              )}
              <Button
                type={step === 1 ? "button" : "submit"}
                onClick={step === 1 ? handleNextStep : undefined}
                isLoading={isLoading}
                className="w-full text-sm"
              >
                {step === 1 ? 'Next Step' : 'Complete Registration'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Overlay */}
      {(isTrialModalOpen || isTermsModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      )}

      {/* Modals */}
      <TrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        onConfirm={handleTrialConfirm}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}