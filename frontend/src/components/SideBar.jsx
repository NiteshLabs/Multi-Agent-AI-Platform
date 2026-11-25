import React, { useEffect, useState } from 'react'
import { Coins, LogOut, Menu, MessageSquare, PanelLeftIcon, PanelRight, PenSquare, Pin, Plus, User, X } from "lucide-react"
import { getConversations } from '../features/getConversations.js'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, removeConversation, setConversation, setConvTitle, setSelectedConversation, togglePinConv } from '../redux/conversationSlice.js'
import { createConversation } from '../features/createConversation.js'
import { updateConversation } from '../features/updateConversation.js'
import { deleteConversation } from '../features/deleteConversation.js'
import { togglePinConversation } from '../features/togglePinConversation.js'
import logOut from '../features/logOut.js'
import { setUserdata } from '../redux/userSlice.js'
import BillingDrawer from './BillingDrawer.jsx'
import ConversationItem from './ConversationItem.jsx'
import DeleteConversationModal from './DeleteConversationModal.jsx'


function SideBar() {
  const [collapsed, setCollapsed] = useState(false)
  const dispatch = useDispatch()
  const [imageError, setEmageError] = useState(false)
  const { conversations, selectedConversation } = useSelector(state => state.conversation)
  const { userData } = useSelector(state => state.user)
  const [showBilling, setShowBilling] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Manage single open context menu across the sidebar
  const [openMenuId, setOpenMenuId] = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    const getConv = async () => {
      const data = await getConversations()
      dispatch(setConversation(data))
    }
    getConv()
  }, [userData?._id])

  const handleCreateConversation = async () => {
    const data = await createConversation()
    dispatch(addConversation(data))
    dispatch(setSelectedConversation(data))
  }

  const handleRename = async (id, newTitle) => {
    dispatch(setConvTitle({ conversationId: id, title: newTitle }))
    await updateConversation({ id, title: newTitle })
  }

  const handleTogglePin = async (id) => {
    dispatch(togglePinConv(id))
    await togglePinConversation(id)
  }

  const handleDeleteClick = (conv) => {
    setDeleteTarget(conv)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget._id
    dispatch(removeConversation(targetId))
    setDeleteModalOpen(false)
    setDeleteTarget(null)
    await deleteConversation(targetId)
  }

  const pinnedConversations = conversations?.filter(c => c.isPinned) || []
  const recentConversations = conversations?.filter(c => !c.isPinned) || []

  if (collapsed) {
    return (
      <div className='hidden lg:flex flex-col items-center w-[56px] h-screen bg-[#0d0f14] border-r border-white/[0.06] py-4 gap-1 shrink-0'>
        <button
          className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer mb-1'
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
        >
          <PanelRight size={16} />
        </button>

        <button
          className='flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
          onClick={() => dispatch(setSelectedConversation(null))}
          title="New Chat"
        >
          <Plus size={16} />
        </button>

        <div className='flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-4 space-y-1'>
          {conversations.map((conv) => {
            const isActive = selectedConversation?._id == conv?._id
            return (
              <div
                key={conv._id}
                title={conv?.title || "New Chat"}
                onClick={() => dispatch(setSelectedConversation(conv))}
                className={`flex items-center justify-center cursor-pointer p-2 rounded-xl border transition-colors duration-150 ${isActive
                  ? "bg-indigo-500/15 border-indigo-500/[0.25] text-indigo-400"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
                  }`}
              >
                {conv?.isPinned ? (
                  <Pin size={13} className="rotate-45 fill-amber-400 text-amber-400" />
                ) : (
                  <MessageSquare size={13} />
                )}
              </div>
            )
          })}
        </div>

        <div className="relative shrink-0">
          {
            (userData?.avatar || !imageError)
              ? <img
                className='w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25'
                src={userData?.avatar} alt={"image"} onError={() => setEmageError(true)} />
              :
              <div className='w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center '>
                <User size={15} className='text-slate-400' />
              </div>
          }
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        className='lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer'
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={14} />
      </button>

      {
        mobileOpen &&
        <div
          onClick={() => setMobileOpen(false)}
          className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
        />
      }

      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        bg-[#0d0f14] border-r border-white/[0.06]
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
      >
        <div className='flex flex-col h-full'>

          <div className='flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]'>
            <div
              className='hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
            >
              <PanelLeftIcon size={16} />
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              <X size={16} />
            </button>
            <span className='text-[16px] font-semibold text-slate-100 tracking-tight flex-1'>
              CortexAi
            </span>

            <span className='text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide'>
              {userData?.plan ? `${userData?.plan}` : "Free"}
            </span>

            <button
              className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer'
              onClick={() => {
                dispatch(setSelectedConversation(null));
                setMobileOpen(false);
              }}
              title="New Chat"
            >
              <PenSquare size={14} />
            </button>
          </div>

          <div className='px-4 pt-4 pb-1'>
            <button
              className='w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] border-none cursor-pointer hover:opacity-90 transition-opacity duration-150'
              onClick={() => {
                dispatch(setSelectedConversation(null));
                setMobileOpen(false);
              }}
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          {/* Conversation List with Pinned and Recent sections */}
          <div
            className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            onScroll={() => setOpenMenuId(null)}
          >
            {/* Pinned Section */}
            {pinnedConversations.length > 0 && (
              <div className='mb-3'>
                <div className='flex items-center gap-1.5 px-3 pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-amber-400/80'>
                  <Pin size={11} className='rotate-45 fill-current' />
                  <span>Pinned</span>
                </div>
                {pinnedConversations.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conv={conv}
                    isActive={selectedConversation?._id === conv?._id}
                    isMenuOpen={openMenuId === conv._id}
                    onSelect={() => {
                      dispatch(setSelectedConversation(conv));
                      setMobileOpen(false);
                    }}
                    onOpenMenu={(id) => setOpenMenuId(id)}
                    onCloseMenu={() => setOpenMenuId(null)}
                    onRename={handleRename}
                    onPin={handleTogglePin}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            )}

            {/* Recent Section */}
            <div>
              {pinnedConversations.length > 0 && recentConversations.length > 0 && (
                <div className='px-3 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-widest text-slate-500'>
                  Recent
                </div>
              )}

              {pinnedConversations.length === 0 && recentConversations.length === 0 ? (
                <div className='px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600'>
                  No Recent Conversations
                </div>
              ) : pinnedConversations.length === 0 ? (
                <div className='px-3 pt-3 pb-1 text-[10.5px] font-semibold uppercase tracking-widest text-slate-500'>
                  Recent
                </div>
              ) : null}

              {recentConversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conv={conv}
                  isActive={selectedConversation?._id === conv?._id}
                  isMenuOpen={openMenuId === conv._id}
                  onSelect={() => {
                    dispatch(setSelectedConversation(conv));
                    setMobileOpen(false);
                  }}
                  onOpenMenu={(id) => setOpenMenuId(id)}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onRename={handleRename}
                  onPin={handleTogglePin}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          </div>

          <div className='mx-2.5 h-px bg-white/[0.06]' />

          <div className='px-3.5 py-3.5'>
            {userData ? (
              <div className='flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors duration-150'>
                <div className="relative shrink-0">
                  {
                    (userData?.avatar || !imageError)
                      ? <img
                        className='w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25'
                        src={userData?.avatar} alt={"image"} onError={() => setEmageError(true)} />
                      :
                      <div className='w-9 h-9 rounded-[10px] bg-white/[0.06] flex items-center justify-center '>
                        <User size={15} className='text-slate-400' />
                      </div>
                  }
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[13.5px] font-semibold text-slate-100 truncate'>
                    {userData?.name && "user"}
                  </p>

                  <p className='text-[11px] text-slate-600 mt-px'>
                    {userData?.plan ? `${userData.plan} plan` : "Free plan"}
                  </p>
                </div>
                <div className='flex gap-1'>
                  <button
                    onClick={() => setShowBilling(true)}
                    className='flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150'
                    title="Billing"
                  >
                    <Coins size={16} />
                  </button>

                  <button
                    className='flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150'
                    onClick={() => {
                      logOut();
                      dispatch(setUserdata(null));
                    }}
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                className='w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/[0.05] border border-white/[0.08] rounded-xl py-[11px] cursor-pointer hover:bg-white/[0.08] transition-colors duration-150'
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConversationModal
        isOpen={deleteModalOpen}
        conversationTitle={deleteTarget?.title}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default SideBar
