import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Input, Button, } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';


export const ChatDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, activeDoctorId, activePatientId, messages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isDrawerOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || !user || !activeDoctorId || !activePatientId) return;

    sendMessage(activeDoctorId, activePatientId, user._id, inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Drawer
      title="Chat"
      placement="right"
      onClose={closeDrawer}
      open={isDrawerOpen}
      width={400}
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column' }
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = user?._id === msg.senderId;
            return (
              <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none shadow-sm'}`}>
                  <div className="break-words">
                    {msg.message}
                  </div>
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {dayjs(msg.createdAt).format('HH:mm')}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            autoFocus
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
        </div>
      </div>
    </Drawer>
  );
};
