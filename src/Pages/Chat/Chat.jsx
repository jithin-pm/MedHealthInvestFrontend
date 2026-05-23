import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPaperclip, FiLink2, FiMic, FiSquare, FiDownload, FiPlay, FiPause, FiX, FiTrash2, FiCopy, FiUser } from 'react-icons/fi';
import { MdSupportAgent } from 'react-icons/md';
import io from 'socket.io-client';
import { getChatMessagesApi, uploadChatFileApi, deleteChatMessageApi } from '../../Services/allApi';
import { BASE_URL } from '../../Services/baseUrl';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { TbChecks } from 'react-icons/tb';

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaModal, setMediaModal] = useState({ isOpen: false, url: '', type: '' });
  const [activeMenu, setActiveMenu] = useState(null); // msg id of open menu
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user from local storage
    const userData = localStorage.getItem('medhealthinvestuser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Initialize Socket
      const newSocket = io(BASE_URL || 'http://localhost:5000');
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('join_room', parsedUser.id);
        newSocket.emit('user_online', parsedUser.id);
        console.log("Socket connected and joined room:", parsedUser.id);
      });
      
      // Fetch history
      fetchMessages(parsedUser.id);
      
      // Listen for incoming
      newSocket.on('receive_message', (data) => {
        console.log("Received message via socket:", data);
        setMessages((prev) => {
          // 1. Remove any message that matches by tempId or real id
          const filtered = prev.filter(m => {
            const isMatch = (data.tempId && (m.tempId === data.tempId || m.id === data.tempId)) || 
                           (data.id && m.id === data.id);
            return !isMatch;
          });

          // 2. Check for fallback duplicate by content/sender/time (within 2s)
          const isDuplicate = filtered.some(m => 
            m.content === data.content && 
            m.senderType === data.senderType &&
            Math.abs(new Date(m.createdAt || m.created_at) - new Date(data.createdAt || data.created_at)) < 2000
          );
          if (isDuplicate) return filtered;

          // 3. Add and sort
          const newMessages = [...filtered, data];
          return newMessages.sort((a, b) => 
            new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at)
          );
        });
        scrollToBottom();
        // If message is from admin, mark as read
        if (data.senderType === 'admin') {
          newSocket.emit('mark_as_read', { userId: parsedUser.id, readerType: 'user' });
        }
      });

      // Listen for real-time deletion
      newSocket.on('message_deleted', ({ messageId }) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });

      // Messages read update
      newSocket.on('messages_read', ({ userId, readerType }) => {
        console.log('Messages read event received in User:', { userId, readerType });
        if (readerType === 'admin') {
          console.log('Updating messages to read state in User');
          setMessages(prev => prev.map(m => 
            m.senderType === 'user' ? { ...m, isRead: true } : m
          ));
        }
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      // Must be logged in to chat
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await getChatMessagesApi(userId);
      if (res.status === 200) {
        setMessages(res.data.messages);
        // Mark all as read
        if (socket) {
          socket.emit('mark_as_read', { userId: userId, readerType: 'user' });
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user) return;
    
    const tempId = `temp_${Date.now()}`;
    const payload = {
      tempId,
      senderId: user.id,
      senderType: 'user',
      receiverId: null,
      content: message,
      type: 'TEXT',
      userId: user.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, { ...payload, id: tempId }]);
    socket.emit('send_message', payload);
    setMessage('');
    scrollToBottom();
  };

  const handleSendLink = () => {
    if (!linkUrl.trim() || !socket || !user) return;
    
    const tempId = `temp_${Date.now()}`;
    const payload = {
      tempId,
      senderId: user.id,
      senderType: 'user',
      receiverId: null,
      content: linkUrl,
      type: 'TEXT',
      userId: user.id,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, { ...payload, id: tempId }]);
    socket.emit('send_message', payload);
    setLinkUrl('');
    setIsLinkModalOpen(false);
    scrollToBottom();
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || !socket) return;
    
    // Determine type
    let type = 'DOCUMENT';
    if (file.type.startsWith('image/')) type = 'IMAGE';
    if (file.type.startsWith('video/')) {
      type = 'VIDEO';
      const MAX_SIZE = 500 * 1024 * 1024; // 500MB
      if (file.size > MAX_SIZE) {
        alert('Video file size must be below 500MB');
        e.target.value = '';
        return;
      }
    }
    if (file.type.startsWith('audio/')) type = 'AUDIO';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadChatFileApi(formData, { "Content-Type": "multipart/form-data" });
      if (res.status === 200 && res.data.url) {
        const tempId = `temp_${Date.now()}`;
        const payload = {
          tempId,
          senderId: user.id,
          senderType: 'user',
          receiverId: null,
          content: res.data.url,
          type: type,
          userId: user.id,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        setMessages(prev => [...prev, { ...payload, id: tempId }]);
        socket.emit('send_message', payload);
        scrollToBottom();
      }
    } catch (error) {
      console.error('File upload failed', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await uploadChatFileApi(formData, { "Content-Type": "multipart/form-data" });
          if (res.status === 200 && res.data.url) {
            const tempId = `temp_${Date.now()}`;
            const payload = {
              tempId,
              senderId: user?.id,
              senderType: 'user',
              receiverId: null,
              content: res.data.url,
              type: 'AUDIO',
              userId: user?.id,
              createdAt: new Date().toISOString(),
              isRead: false
            };
            setMessages(prev => [...prev, { ...payload, id: tempId }]);
            socket.emit('send_message', payload);
            scrollToBottom();
          }
        } catch (error) {
          console.error('Voice upload failed', error);
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteMessage = async (msg) => {
    setActiveMenu(null);
    // Optimistically remove from UI
    setMessages(prev => prev.filter(m => (m.id || m.tempId) !== (msg.id || msg.tempId)));
    // Delete from DB and notify other party via socket
    if (msg.id && !String(msg.id).startsWith('temp_')) {
      try {
        await deleteChatMessageApi(msg.id);
        // Tell the other side to remove it
        if (socket) socket.emit('delete_message', { messageId: msg.id, userId: msg.userId });
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  const handleCopyText = (content) => {
    navigator.clipboard.writeText(content).catch(() => {
      const el = document.createElement('textarea');
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setActiveMenu(null);
  };

  const handleDownloadMedia = async (url, e) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = url.split('/').pop() || 'download_media';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed, opening in new tab', error);
      window.open(url, '_blank');
    }
    setActiveMenu(null);
  };

  const renderMessageContent = (msg, isUser) => {
    switch (msg.type) {
      case 'IMAGE':
        return <img src={msg.content} alt="Attachment" className="max-w-[200px] md:max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-white/5" onClick={() => setMediaModal({ isOpen: true, url: msg.content, type: 'IMAGE' })} />;
      case 'VIDEO':
        return (
          <div className="relative cursor-pointer group" onClick={() => setMediaModal({ isOpen: true, url: msg.content, type: 'VIDEO' })}>
            <video src={msg.content} className="max-w-[200px] md:max-w-[300px] rounded-lg pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center pl-1 backdrop-blur-sm">
                <FiPlay className="text-white text-2xl" />
              </div>
            </div>
          </div>
        );
      case 'AUDIO':
        return <audio src={msg.content} controls className="max-w-[200px] md:max-w-[250px] h-10" />;
      case 'DOCUMENT':
        return (
          <button type="button" onClick={() => setMediaModal({ isOpen: true, url: msg.content, type: 'DOCUMENT' })} className="flex items-center gap-3 bg-black/10 p-3 rounded-lg hover:bg-black/20 transition w-full text-left">
            <div className="w-10 h-10 bg-[#ccff00] text-black rounded-full flex items-center justify-center shrink-0">
              <FiDownload />
            </div>
            <div className="flex flex-col overflow-hidden text-white">
              <span className="font-bold text-sm truncate">Document Attachment</span>
              <span className="text-xs opacity-70">Click to view</span>
            </div>
          </button>
        );
      default: {
        if (!msg.content) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = msg.content.split(urlRegex);
        return (
          <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">
            {parts.map((part, index) => {
              if (part.match(urlRegex)) {
                const handleLinkClick = (e) => {
                  const lowerPart = part.toLowerCase();
                  if (lowerPart.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) {
                    e.preventDefault();
                    setMediaModal({ isOpen: true, url: part, type: 'IMAGE' });
                  } else if (lowerPart.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
                    e.preventDefault();
                    setMediaModal({ isOpen: true, url: part, type: 'VIDEO' });
                  } else if (lowerPart.match(/\.(pdf|doc|docx|xls|xlsx)(\?.*)?$/i)) {
                    e.preventDefault();
                    setMediaModal({ isOpen: true, url: part, type: 'DOCUMENT' });
                  }
                };

                return (
                  <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={handleLinkClick}
                    className="text-blue-500 hover:text-blue-400 underline break-all"
                  >
                    {part}
                  </a>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </p>
        );
      }
    }
  };

  const formatTime = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDateLabel = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yesterday)) return 'Yesterday';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0c0c0c] text-white font-['Outfit'] selection:bg-[#ccff00] selection:text-black">
      {/* Header */}
      <header className="bg-[#111] border-b border-white/5 px-6 py-4 flex items-center gap-4 shrink-0 shadow-md z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        
        <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
          <MdSupportAgent className="text-[#ccff00] text-xl" />
        </div>
        
        <div className="flex flex-col">
          <h1 className="font-bold text-[15px] leading-tight text-white">Med Health Invest</h1>
          <span className="text-[11px] text-[#ccff00] font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse"></span>
            Support Team
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {(() => {
          let lastDateLabel = null;
          return messages.map((msg, index) => {
            const isUser = msg.senderType === 'user';
            const msgKey = msg.id || msg.tempId || index;
            const dateLabel = getDateLabel(msg.createdAt || msg.created_at);
            const showDateSep = dateLabel && dateLabel !== lastDateLabel;
            if (showDateSep) lastDateLabel = dateLabel;

            return (
              <React.Fragment key={msgKey}>
                {/* Date Separator */}
                {showDateSep && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[11px] font-semibold text-gray-500 px-3 py-1 rounded-full bg-white/5 border border-white/10 whitespace-nowrap tracking-wide">
                      {dateLabel}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}

                <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {/* Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 shrink-0 flex items-center justify-center mb-5 shadow-sm">
                      <MdSupportAgent className="text-[#ccff00] text-[14px]" />
                    </div>
                  )}
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-[#ccff00]/20 border border-[#ccff00]/30 shrink-0 flex items-center justify-center mb-5 text-[#ccff00] shadow-sm">
                      <FiUser size={14} />
                    </div>
                  )}

                  {/* Message Bubble + three-dot menu */}
                  <div className={`flex items-center gap-1.5 group ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                    <button
                      onClick={() => setActiveMenu(msg)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                      title="Message options"
                    >
                      <BsThreeDotsVertical className="text-[13px]" />
                    </button>

                    <div className="flex flex-col gap-1">
                      <div className={`${(msg.type === 'IMAGE' || msg.type === 'VIDEO') ? 'p-1' : 'px-5 py-3'} rounded-2xl shadow-sm ${
                        isUser
                          ? 'bg-white text-black rounded-br-sm'
                          : 'bg-[#202020] text-white border border-white/5 rounded-bl-sm'
                      }`}>
                        {renderMessageContent(msg, isUser)}
                      </div>
                      <span className={`text-[10px] text-gray-500 font-medium flex items-center gap-1 ${isUser ? 'justify-end pr-1' : 'pl-1'}`}>
                        {formatTime(msg.createdAt || msg.created_at)} 
                        {isUser && (
                          <TbChecks className={`text-lg ${msg.isRead ? 'text-[#00e5ff] drop-shadow-[0_0_5px_rgba(0,229,255,0.5)]' : 'text-white/30'}`} title={msg.isRead ? 'Seen' : 'Delivered'} />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          });
        })()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#0c0c0c] border-t border-white/5 px-4 py-4 md:px-8 pb-6 shrink-0 relative">
        {isRecording && (
          <div className="absolute top-0 left-0 w-full h-full bg-[#ccff00]/10 flex items-center justify-center gap-4 z-20 backdrop-blur-sm">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-white font-bold tracking-widest uppercase text-sm animate-pulse">Recording Voice Note...</span>
            <button 
              onClick={stopRecording}
              className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center ml-4 shadow-xl hover:bg-red-500 hover:text-white transition-colors"
            >
              <FiSquare />
            </button>
          </div>
        )}

        <form onSubmit={handleSendText} className="flex items-center gap-3 w-full max-w-4xl mx-auto">
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          <button type="button" onClick={() => setIsLinkModalOpen(true)} className="p-2 text-gray-500 hover:text-[#ccff00] transition-colors shrink-0" title="Share a link">
            <FiLink2 className="text-xl" />
          </button>
          <button type="button" onClick={handleFileSelect} className="p-2 text-gray-500 hover:text-[#ccff00] transition-colors shrink-0" title="Attach file">
            <FiPaperclip className="text-xl" />
          </button>

          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Med Health Invest..." 
            className="flex-1 bg-[#111] border border-white/5 rounded-full px-6 py-3.5 text-[14px] text-white focus:outline-none focus:border-[#ccff00]/50 focus:ring-1 focus:ring-[#ccff00]/20 transition-all placeholder:text-gray-600 shadow-inner"
            disabled={isRecording}
          />

          <button 
            type="button"
            onClick={message.trim() ? handleSendText : startRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.1)] active:scale-95 ${
              message.trim() ? 'bg-[#ccff00] text-black hover:bg-white hover:text-black' : 'bg-[#111] text-gray-400 border border-white/5 hover:text-red-500 hover:border-red-500'
            }`}
          >
            {message.trim() ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                 <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
               </svg>
            ) : (
              <FiMic className="text-xl" />
            )}
          </button>
        </form>
      </div>

      {/* Link Sharing Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-center text-black mb-2">Share a link</h3>
            <p className="text-center text-gray-500 text-sm mb-6">Enter the URL</p>
            
            <input 
              type="url" 
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-black mb-6 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendLink();
              }}
            />
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={handleSendLink}
                className="bg-black text-white px-6 py-2 rounded-md font-bold hover:bg-gray-800 transition-colors"
              >
                OK
              </button>
              <button 
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                }}
                className="bg-[#6b7280] text-white px-6 py-2 rounded-md font-bold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Media Modal */}
      {mediaModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[400] flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setMediaModal({ isOpen: false, url: '', type: '' })}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setMediaModal({ isOpen: false, url: '', type: '' }); }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-red-500 rounded-full text-white flex items-center justify-center text-2xl z-[410] transition-colors"
            title="Close"
          >
            <FiX />
          </button>
          <div 
            className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaModal.type === 'IMAGE' && (
              <img 
                src={mediaModal.url} 
                alt="Media" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer" 
                onClick={(e) => { e.stopPropagation(); setMediaModal({ isOpen: false, url: '', type: '' }); }} 
              />
            )}
            {mediaModal.type === 'VIDEO' && (
              <video src={mediaModal.url} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
            )}
            {mediaModal.type === 'DOCUMENT' && (
              <iframe src={mediaModal.url} className="w-full h-full bg-white rounded-xl shadow-2xl" title="Document Viewer" />
            )}
          </div>
        </div>
      )}

      {/* Message Options Modal */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
          onClick={() => setActiveMenu(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Message Options</h3>
              <button
                onClick={() => setActiveMenu(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            {/* Modal Actions */}
            <div className="py-2">
              {/* Copy text — only for TEXT */}
              {(!activeMenu.type || activeMenu.type === 'TEXT') && (
                <button
                  onClick={() => handleCopyText(activeMenu.content)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <FiCopy className="text-gray-500 text-base" />
                  </span>
                  <span className="font-medium text-[15px]">Copy text</span>
                </button>
              )}
              {/* Download — for media types */}
              {(activeMenu.type === 'IMAGE' || activeMenu.type === 'VIDEO' || activeMenu.type === 'DOCUMENT') && (
                <button
                  onClick={(e) => handleDownloadMedia(activeMenu.content, e)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <FiDownload className="text-gray-500 text-base" />
                  </span>
                  <span className="font-medium text-[15px]">Download media</span>
                </button>
              )}
              {/* Delete for everyone - only for sender */}
              {activeMenu.senderType === 'user' && (
                <button
                  onClick={() => handleDeleteMessage(activeMenu)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-red-50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <FiTrash2 className="text-red-500 text-base" />
                  </span>
                  <span className="font-semibold text-[15px] text-red-500">Delete for Everyone</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
