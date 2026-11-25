import React, { useEffect, useRef, useState } from 'react';
import { Archive, Ellipsis, MessageSquare, PenLine, Pin, PinOff, Share2, Trash2 } from 'lucide-react';

function ConversationItem({
  conv,
  isActive,
  isMenuOpen,
  onSelect,
  onOpenMenu,
  onCloseMenu,
  onRename,
  onPin,
  onDeleteClick,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conv?.title || 'New Chat');
  const [openUpward, setOpenUpward] = useState(false);

  const inputRef = useRef(null);
  const itemRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setEditTitle(conv?.title || 'New Chat');
  }, [conv?.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onCloseMenu();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCloseMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, onCloseMenu]);

  const handleSaveRename = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== conv?.title) {
      onRename(conv._id, trimmed);
    } else {
      setEditTitle(conv?.title || 'New Chat');
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditTitle(conv?.title || 'New Chat');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (isMenuOpen) {
      onCloseMenu();
    } else {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setOpenUpward(window.innerHeight - rect.bottom < 210);
      }
      onOpenMenu(conv._id);
    }
  };

  const handleStartRename = (e) => {
    e.stopPropagation();
    onCloseMenu();
    setIsEditing(true);
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    onCloseMenu();
    onPin(conv._id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onCloseMenu();
    onDeleteClick(conv);
  };

  return (
    <div
      ref={itemRef}
      onClick={() => {
        if (!isEditing) onSelect();
      }}
      className={`group relative flex items-center justify-between gap-2 cursor-pointer mb-0.5 px-3 py-2 rounded-[10px] border transition-all duration-150 ${
        isActive
          ? 'bg-indigo-500/10 border-indigo-500/[0.22] text-slate-100'
          : 'bg-transparent border-transparent hover:bg-white/[0.04] text-slate-300'
      }`}
    >
      <div className='flex items-center gap-2.5 min-w-0 flex-1'>
        <div
          className={`flex items-center justify-center shrink-0 w-[24px] h-[24px] rounded-lg transition-colors duration-150 ${
            conv?.isPinned
              ? 'bg-amber-500/15 text-amber-400'
              : isActive
              ? 'bg-indigo-500/15 text-indigo-400'
              : 'bg-white/[0.05] text-slate-500 group-hover:text-slate-400'
          }`}
        >
          {conv?.isPinned ? <Pin size={12} className='rotate-45 fill-current' /> : <MessageSquare size={12} />}
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type='text'
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveRename}
            onClick={(e) => e.stopPropagation()}
            className='w-full bg-[#11131a] border border-indigo-500/50 rounded px-2 py-0.5 text-[12.5px] text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500'
          />
        ) : (
          <span className='text-[12.5px] font-medium truncate flex-1 select-none'>
            {conv?.title || 'New Chat'}
          </span>
        )}
      </div>

      {/* Three-dot Button (⋯) */}
      {!isEditing && (
        <div className='relative shrink-0 flex items-center'>
          <button
            onClick={handleToggleMenu}
            title='Options'
            className={`w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all duration-150 cursor-pointer ${
              isMenuOpen ? 'opacity-100 bg-white/10 text-slate-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Ellipsis size={15} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-0 ${
                openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
              } z-50 w-44 rounded-xl border border-white/10 bg-[#161922] p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 space-y-0.5`}
            >
              {/* Share */}
              <button
                disabled
                className='w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-500 cursor-not-allowed'
              >
                <div className='flex items-center gap-2'>
                  <Share2 size={13} />
                  <span>Share</span>
                </div>
                <span className='text-[10px] text-slate-600 uppercase font-semibold'>Soon</span>
              </button>

              {/* Rename */}
              <button
                onClick={handleStartRename}
                className='w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-left'
              >
                <PenLine size={13} className='text-slate-400' />
                <span>Rename</span>
              </button>

              {/* Pin / Unpin */}
              <button
                onClick={handleTogglePin}
                className='w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer text-left'
              >
                {conv?.isPinned ? (
                  <>
                    <PinOff size={13} className='text-amber-400' />
                    <span>Unpin chat</span>
                  </>
                ) : (
                  <>
                    <Pin size={13} className='text-slate-400' />
                    <span>Pin chat</span>
                  </>
                )}
              </button>

              {/* Archive */}
              <button
                disabled
                className='w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-500 cursor-not-allowed'
              >
                <div className='flex items-center gap-2'>
                  <Archive size={13} />
                  <span>Archive</span>
                </div>
                <span className='text-[10px] text-slate-600 uppercase font-semibold'>Soon</span>
              </button>

              <div className='my-1 h-px bg-white/[0.06]' />

              {/* Delete */}
              <button
                onClick={handleDelete}
                className='w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left font-medium'
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationItem;
