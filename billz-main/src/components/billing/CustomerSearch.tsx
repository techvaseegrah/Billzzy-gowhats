'use client';

import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';

interface CustomerDetails {
  id?: number;
  name: string;
  phone: string;
  email: string;
  flatNo: string;
  street: string;
  district: string;
  state: string;
  pincode: string;
  city?: string;
}

interface CustomerFormProps {
  onCustomerChange: (customer: CustomerDetails | null) => void;
  onExistingCustomer: () => void;
}

const initialCustomerState: CustomerDetails = {
  name: '',
  phone: '',
  email: '',
  flatNo: '',
  street: '',
  district: '',
  state: '',
  pincode: '',
  city: '',
};

async function getPincodeDetails(pincode: string) {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data[0].Status === 'Error') {
      throw new Error('Invalid pincode');
    }

    const postOffice = data[0].PostOffice[0];
    return {
      city: postOffice.Block || postOffice.Division,
      district: postOffice.District,
      state: postOffice.State,
    };
  } catch (error) {
    throw new Error('Failed to fetch pincode details');
  }
}

export const CustomerForm = React.forwardRef<{ resetForm: () => void }, CustomerFormProps>(
  ({ onCustomerChange, onExistingCustomer }, ref) => {
    const [phone, setPhone] = useState('');
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(initialCustomerState);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPincodeLoading, setIsPincodeLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const pincodeInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const debouncedPhone = useDebounce(phone, 200);
    const debouncedPincode = useDebounce(customerDetails?.pincode || '', 200);

    const resetForm = () => {
      setPhone('');
      setCustomerDetails(initialCustomerState);
      setIsExistingCustomer(false);
      setError(null);
      setIsPincodeLoading(false);
      onCustomerChange(null);
    };

    React.useImperativeHandle(ref, () => ({
      resetForm
    }));

    useEffect(() => {
      const fetchCustomer = async () => {
        if (debouncedPhone.length !== 10) {
          setIsExistingCustomer(false);
          setCustomerDetails(initialCustomerState);
          onCustomerChange(null);
          return;
        }
    
        // Clear previous customer details before new search
        if (customerDetails?.phone !== debouncedPhone) {
          setCustomerDetails({
            ...initialCustomerState,
            phone: debouncedPhone
          });
          onCustomerChange(null);
        }
    
        setIsLoading(true);
        setError(null);
    
        try {
          const response = await fetch(`/api/customers?q=${debouncedPhone}`);
          const data = await response.json();
    
          if (!response.ok) {
            if (response.status === 404) {
              setCustomerDetails({
                ...initialCustomerState,
                phone: debouncedPhone,
              });
              setIsExistingCustomer(false);
              onCustomerChange(null);
              setTimeout(() => nameInputRef.current?.focus(), 100);
            } else {
              throw new Error(data.message || 'Failed to fetch customer');
            }
          } else {
            const exactMatch = data.find((cust: CustomerDetails) => cust.phone === debouncedPhone);
            if (exactMatch) {
              setCustomerDetails(exactMatch);
              setIsExistingCustomer(true);
              onCustomerChange(exactMatch);
              onExistingCustomer();
            } else {
              setCustomerDetails({
                ...initialCustomerState,
                phone: debouncedPhone,
              });
              setIsExistingCustomer(false);
              onCustomerChange(null);
              setTimeout(() => nameInputRef.current?.focus(), 100);
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch customer');
          setCustomerDetails({
            ...initialCustomerState,
            phone: debouncedPhone,
          });
          onCustomerChange(null);
        } finally {
          setIsLoading(false);
        }
      };
    
      fetchCustomer();
    }, [debouncedPhone]);

    useEffect(() => {
      if (debouncedPincode.length !== 6) return;

      const fetchPincodeDetails = async () => {
        setIsPincodeLoading(true);
        try {
          const details = await getPincodeDetails(debouncedPincode);
          const updatedDetails = {
            ...customerDetails,
            district: details.district,
            state: details.state,
            city: details.city,
          };
          setCustomerDetails(updatedDetails);
          onCustomerChange(updatedDetails);
        } catch (error) {
          setError('Invalid pincode');
        } finally {
          setIsPincodeLoading(false);
        }
      };

      fetchPincodeDetails();
    }, [debouncedPincode]);

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
      setPhone(value);
      if (value.length !== 10) {
        setCustomerDetails({
          ...initialCustomerState,
          phone: value
        });
      }
    };

    const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const updatedDetails = {
        ...customerDetails,
        [name]: value,
      };
      setCustomerDetails(updatedDetails);
      onCustomerChange(updatedDetails);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, nextRef?: React.RefObject<HTMLInputElement>) => {
      if (e.key === 'Enter' && nextRef?.current) {
        e.preventDefault();
        nextRef.current.focus();
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="Enter 10 digit number"
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={(e) => handleKeyDown(e, nameInputRef)}
            autoFocus
            required
            maxLength={10}
          />
          <Input
            ref={nameInputRef}
            label="Customer Name *"
            name="name"
            placeholder="Enter customer name"
            value={customerDetails.name}
            onChange={handleFieldChange}
            onKeyDown={(e) => handleKeyDown(e, pincodeInputRef)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Flat/House No"
            name="flatNo"
            placeholder="Enter flat/house number"
            value={customerDetails.flatNo}
            onChange={handleFieldChange}
          />
          <Input
            label="Street"
            name="street"
            placeholder="Enter street name"
            value={customerDetails.street}
            onChange={handleFieldChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            ref={pincodeInputRef}
            label="Pincode"
            name="pincode"
            placeholder="Enter 6 digit pincode"
            value={customerDetails.pincode}
            onChange={handleFieldChange}
            onKeyDown={(e) => handleKeyDown(e, emailInputRef)}
            maxLength={6}
          />
          <Input
            label="District"
            name="district"
            value={customerDetails.district}
            onChange={handleFieldChange}
            disabled={isPincodeLoading}
          />
          <Input
            label="State"
            name="state"
            value={customerDetails.state}
            onChange={handleFieldChange}
            disabled={isPincodeLoading}
          />
        </div>

        <div className="grid grid-cols-1">
          <Input
            ref={emailInputRef}
            label="Email (Optional)"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={customerDetails.email}
            onChange={handleFieldChange}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    );
  }
);

CustomerForm.displayName = 'CustomerForm';