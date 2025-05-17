import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isOpen: boolean;
  isLoading?: boolean;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isOpen,
  isLoading = false,
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {isDestructive && <AlertTriangle size={20} className="text-red-500 mr-2" />}
            {title}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white flex items-center ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-[#0B9444] hover:bg-[#056526]'
            }`}
          >
            {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;