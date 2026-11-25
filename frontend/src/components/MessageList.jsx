import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import MessageBubble from './MessageBubble';
import LoadingAnimation from './LoadingAnimation';
import { deleteMessage, togglePinMessage } from '../redux/messageSlice.js';
import { deleteMessageApi } from '../features/deleteMessage.js';
import { togglePinMessageApi } from '../features/togglePinMessage.js';
import { ChevronDown, ChevronUp, Pin } from 'lucide-react';

function MessageList() {
    const dispatch = useDispatch();
    const { selectedConversation } = useSelector(state => state.conversation);
    const { messages, isLoading } = useSelector(state => state.message);
    const bottomRef = useRef(null);
    const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            bottomRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        });
    }, [messages?.length, isLoading]);

    const handlePin = async (targetId) => {
        dispatch(togglePinMessage(targetId));
        if (typeof targetId === "string" && !targetId.startsWith("local_")) {
            await togglePinMessageApi(targetId);
        }
    };

    const handleDelete = async (targetId) => {
        dispatch(deleteMessage(targetId));
        if (typeof targetId === "string" && !targetId.startsWith("local_")) {
            await deleteMessageApi(targetId);
        }
    };

    const scrollToMessage = (targetId) => {
        const element = document.getElementById(`msg-${targetId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-amber-400", "ring-offset-2", "ring-offset-[#0d0f14]");
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-amber-400", "ring-offset-2", "ring-offset-[#0d0f14]");
            }, 1800);
        }
    };

    const pinnedMessages = messages?.filter(m => m.isPinned) || [];

    return (
        <div className='flex-1 overflow-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

            {/* Pinned Messages Header Bar */}
            {pinnedMessages.length > 0 && selectedConversation && (
                <div className='sticky top-0 z-30 mb-4 rounded-xl border border-amber-500/25 bg-[#151822]/95 backdrop-blur-md px-3.5 py-2 shadow-xl'>
                    <div className='flex items-center justify-between gap-2'>
                        <div
                            onClick={() => scrollToMessage(pinnedMessages[0]?._id || pinnedMessages[0]?.localId)}
                            className='flex items-center gap-2 overflow-hidden cursor-pointer group flex-1'
                        >
                            <Pin size={13} className="rotate-45 fill-amber-400 text-amber-400 shrink-0" />
                            <span className='text-xs font-semibold text-amber-300 shrink-0'>
                                {pinnedMessages.length} Pinned {pinnedMessages.length === 1 ? "Message" : "Messages"}
                            </span>
                            <span className='truncate text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors'>
                                • {pinnedMessages[0]?.content?.slice(0, 50)}...
                            </span>
                        </div>

                        <div className='flex items-center gap-2'>
                            {pinnedMessages.length > 1 && (
                                <button
                                    onClick={() => setShowPinnedDrawer(prev => !prev)}
                                    className='text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition cursor-pointer'
                                    title="View all pinned messages"
                                >
                                    {showPinnedDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            )}
                            <button
                                onClick={() => scrollToMessage(pinnedMessages[pinnedMessages.length - 1]?._id || pinnedMessages[pinnedMessages.length - 1]?.localId)}
                                className='text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer'
                            >
                                Jump
                            </button>
                        </div>
                    </div>

                    {/* Collapsible list of multiple pinned messages */}
                    {showPinnedDrawer && pinnedMessages.length > 1 && (
                        <div className='mt-2.5 pt-2 border-t border-white/10 space-y-1.5 max-h-40 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                            {pinnedMessages.map((pm, idx) => {
                                const pId = pm?._id || pm?.localId || idx;
                                return (
                                    <div
                                        key={pId}
                                        onClick={() => scrollToMessage(pId)}
                                        className='flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white/[0.05] cursor-pointer text-[11px] text-slate-300 transition-colors'
                                    >
                                        <div className='flex items-center gap-2 truncate'>
                                            <span className={`text-[10px] uppercase font-bold px-1 py-0.5 rounded ${pm.role === "user" ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                                                {pm.role}
                                            </span>
                                            <span className='truncate'>{pm.content}</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePin(pId);
                                            }}
                                            className='text-slate-500 hover:text-amber-400 text-[10px] shrink-0'
                                        >
                                            Unpin
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {messages.length === 0 || !selectedConversation ? (
                <div className='h-full flex flex-col items-center justify-center gap-4 text-center'>
                    <div className='flex flex-col gap-1.5'>
                        <h1 className='text-[20px] font-semibold text-slate-200 tracking-tight'>
                            CortexAI
                        </h1>

                        <p className='text-[15px] font-semibold text-slate-400 tracking-tight'>
                            How can I help you?
                        </p>

                        <p className='text-[13px] text-slate-600 max-w-[260px] leading-relaxed'>
                            Ask me anything — code, ideas, explanations, or just a quick question.
                        </p>
                    </div>

                    <div className='flex flex-wrap justify-center gap-2 mt-1'>
                        {["Write a Netflix clone", "Explain Redis", "Build a dashboard"].map((s) => (
                            <button
                                key={s}
                                className='text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer'
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                </div>
            ) : (
                <div className='space-y-5'>
                    {messages?.map((msg, i) => {
                        const msgId = msg?._id || msg?.localId || i;
                        return (
                            <div id={`msg-${msgId}`} key={msgId} className='transition-all duration-300 rounded-2xl'>
                                <MessageBubble
                                    id={msgId}
                                    messageId={msg?._id}
                                    role={msg?.role}
                                    content={msg?.content}
                                    images={msg.images || []}
                                    artifacts={msg.artifacts || []}
                                    isPinned={msg?.isPinned}
                                    onPin={handlePin}
                                    onDelete={handleDelete}
                                />
                            </div>
                        );
                    })}
                    {isLoading && <LoadingAnimation />}
                </div>
            )}
            <div ref={bottomRef}/>
        </div>
    )
}

export default MessageList
