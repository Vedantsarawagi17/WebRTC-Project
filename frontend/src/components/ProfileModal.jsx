// The ProfileModal is a versatile component that displays user details (Profile Picture, Name, Email) in a pop-up window.
import { useState } from "react";

export const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Logic */}
      {children ? (
        <span onClick={onOpen} className="cursor-pointer">
          {children}
        </span>
      ) : (
        <button
          onClick={onOpen}
          className="flex items-center justify-center p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {/* Simple SVG replacement for ViewIcon */}
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}

      {/* Modal Overlay & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
            // If you click outside the modal (on the dark background), it closes the modal. This is a standard UX practice.
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[410px] p-8 flex flex-col items-center justify-between z-10 animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <h2 className="text-4xl font-sans font-semibold text-gray-800">
              {user.name}
            </h2>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>

            {/* Body */}
            <div className="flex flex-col items-center space-y-6">
              <img
                className="rounded-full w-36 h-36 object-cover border-4 border-gray-50 shadow-md"
                src={user.pic}
                alt={user.name}
              />
              <p className="text-xl md:text-2xl font-sans text-gray-600 break-all text-center">
                Email: {user.email}
              </p>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};