// components/ui/EnhancedLogoutButton.tsx
"use client"

import React, { useState } from "react"
import { Dialog } from "@headlessui/react"
import { HiUserCircle, HiCheckCircle,  } from "react-icons/hi"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react" // Adjust import based on your auth setup
import { FiLogOut } from "react-icons/fi"

const EnhancedLogoutButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: true, callbackUrl: "/" }) // Adjust callbackUrl as needed
    } catch (error) {
      console.error("Error signing out:", error)
      // Optionally, display an error message to the user
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      {/* Logout Button */}
      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-full flex items-center py-2 text-md bg-red-500 font-medium text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
        aria-label="Logout"
      >
        <FiLogOut className="mx-3 h-6 w-6 text-white transition-transform duration-200 group-hover:text-red-200" />
        Logout
      </button>

      {/* Confirmation Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <Dialog.Panel className="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center">
            <HiUserCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
            <Dialog.Title className="mt-4 text-lg font-semibold text-gray-800">
              Confirm Logout
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              Are you sure you want to logout?
            </Dialog.Description>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200",
                isLoading && "cursor-not-allowed opacity-75"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                <HiCheckCircle className="h-5 w-5 mr-2" aria-hidden="true" />
              )}
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}

export default EnhancedLogoutButton
