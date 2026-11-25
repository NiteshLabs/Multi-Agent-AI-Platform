import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

function DeleteConversationModal({ isOpen, onClose, onConfirm, conversationTitle }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150'>
      <div
        className='relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#141722] p-5 shadow-2xl space-y-4'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-white/[0.05]'
        >
          <X size={15} />
        </button>

        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0'>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className='text-sm font-semibold text-slate-100'>Delete conversation?</h3>
            <p className='text-xs text-slate-400 mt-0.5 leading-relaxed'>
              This will delete <span className='text-slate-200 font-medium'>"{conversationTitle || 'this chat'}"</span>. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 pt-2'>
          <button
            onClick={onClose}
            className='px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors cursor-pointer'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-3.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer shadow-[0_1px_8px_rgba(239,68,68,0.3)]'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConversationModal;
