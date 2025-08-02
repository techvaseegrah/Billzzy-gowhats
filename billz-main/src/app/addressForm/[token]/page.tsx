'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { getPincodeDetails } from '@/lib/utils/pincode';
import { useDebounce } from '@/hooks/useDebounce';

interface FormData {
  name: string;
  phone: string;
  pincode: string;
  flatNo: string;
  street: string;
  district: string;
  state: string;
  email: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const initialFormData: FormData = {
    name: '',
    phone: '',
    pincode: '',
    flatNo: '',
    street: '',
    district: '',
    state: '',
    email: '',
    notes: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);

  const debouncedPincode = useDebounce(formData.pincode, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.flatNo.trim()) {
      newErrors.flatNo = 'Flat/House No is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/billing/customer_submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit data');
        return;
      }

      toast.success(data.message || 'Your information has been submitted successfully!');
      router.push('/thankYou');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchPincodeDetails() {
      if (debouncedPincode.length === 6) {
        setIsPincodeLoading(true);
        try {
          const details = await getPincodeDetails(debouncedPincode);
          setFormData(prev => ({
            ...prev,
            district: details.district,
            state: details.state,
          }));
          setErrors(prev => ({
            ...prev,
            pincode: '',
            district: '',
            state: ''
          }));
        } catch (error) {
          setErrors(prev => ({
            ...prev,
            pincode: 'Invalid pincode'
          }));
        } finally {
          setIsPincodeLoading(false);
        }
      }
    }

    fetchPincodeDetails();
  }, [debouncedPincode]);

  if (!isValidToken) {
    return <div>Invalid or expired link.</div>;
  }

  return (
    <div className="min-h-[100dvh] place-content-center bg-gray-50 relative">
      <div className="h-full w-full max-w-4xl place-content-center mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="w-full my-8 md:my-0 place-content-center">
          <div className="bg-white rounded-lg shadow-sm place-content-center border border-gray-100 p-4 md:p-8">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 text-center">
              Delivery Information
            </h1>
            
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    placeholder="Enter your full name"
                  />
                <Input
                  label="Phone *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

         

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Flat/House No *"
                  name="flatNo"
                  value={formData.flatNo}
                  onChange={handleChange}
                  error={errors.flatNo}
                  required
                  placeholder="Enter flat/house number"
                />
                <Input
                  label="Street *"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  error={errors.street}
                  required
                  placeholder="Enter street name"
                />

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Pincode *"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  error={errors.pincode}
                  required
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                <Input
                  label="District *"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  error={errors.district}
                  required
                  placeholder="Enter district"
                  disabled={isPincodeLoading}
                />
                     <Input
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                required
                placeholder="Enter state"
                disabled={isPincodeLoading}
              />
                    <Input
                label="Email (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email address"
              />
              </div>


        

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           resize-none"
                  rows={3}
                  placeholder="Any special delivery instructions..."
                />
              </div>

              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                         font-medium transition-colors duration-200"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Address'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}