// components/settings/PasswordSettings.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import React from 'react';  

export function PasswordSettings({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Add proper event typing
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!response.ok) throw new Error('Failed to update password');

      toast.success('Password updated successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          name="oldPassword"
          value={passwords.oldPassword}
          onChange={handleInputChange}
          required
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={handleInputChange}
          required
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isLoading}>
            Update Password
          </Button>
        </div>
      </form>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Forgot Password?</h3>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}