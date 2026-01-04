import React, { useEffect, useState, useRef } from 'react';
import { Layout, List, Avatar, Input, Button, Spin, Typography } from 'antd';
import { UserOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import { io } from 'socket.io-client';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../store/authStore';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

interface ChatMessage {
  id: string;
  userId: string;
  doctorId: string;
  text: string;
  isFromUser: boolean;
  createdAt: string;
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const ChatsPage: React.FC = () => {
  const { user, token } = useAuthStore();
  // const [socket, setSocket] = useState<Socket | null>(null); // Unused variable removed
  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Socket
  useEffect(() => {
    if (user && user.role === 'DOCTOR') {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL); // Adjust URL if needed

      newSocket.on('connect', () => {

        // Join doctor's own room to receive messages
        // The backend emits to `doctorData.userId`.
        // So we join the room with our own userId.
        newSocket.emit('join', user.id);
      });

      newSocket.on('new_message', (message: ChatMessage) => {

        // Only append if it belongs to current open conversation
        // OR if it's sent by me (which is handled by optimistic update usually, but socket echoes back too)
        // If message.userId matches selectedUser.id, add it.
        // Note: The message object has `userId` as the PATIENT (User) ID, and `doctorId` as Doctor ID.

        // If I am the doctor, I want to see messages where message.userId === selectedUser.id
        // But wait, if I sent it (isFromUser=false), message.userId is still the patient.

        // So, if selectedUser is set, and message.userId === selectedUser.id
        setSelectedUser(currentUser => {
          if (currentUser && message.userId === currentUser.id) {
            setMessages(prev => [...prev, message]);
            // Scroll to bottom
            setTimeout(() => {
              scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          return currentUser;
        });
      });

      // setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axiosClient.get('/chat/conversations');
        setConversations(response.data.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [token]);

  // Fetch Messages when user selected & Polling
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (selectedUser) {
      const fetchMessages = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
          // For doctor, /api/chat/:id -> id is the userId of the patient
          const response = await axiosClient.get(`/chat/${selectedUser.id}`);

          if (isPolling) {
            // If polling, we just want to update messages without resetting scroll strictly unless need be
            // Or better, setState can handle it.
            // We need to merge? Or just replace entire list?
            // Since list is small page, replacing is fine typically.
            setMessages(response.data.data);
          } else {
            setMessages(response.data.data);
            setLoading(false);
            setTimeout(() => {
              scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }

        } catch (error) {
          console.error('Error fetching messages:', error);
          if (!isPolling) setLoading(false);
        }
      };

      // Initial fetch
      fetchMessages();

      // Start Polling (Vercel Fallback)
      intervalId = setInterval(() => {
        fetchMessages(true);
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedUser, token]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedUser) return;

    try {
      // Optimistic update? No, let's wait for socket/response or just push response
      const text = inputMessage;
      setInputMessage('');

      await axiosClient.post(`/chat/${selectedUser.id}`,
        { text }
      );

      // We can rely on the socket event to update the UI, OR manually push it.
      // Socket is safer for consistency, but might have delay.
      // Let's rely on Socket event (already handled above).
      // But if socket fails?
      // Let's strictly use the returned data to append immediately for better UX?
      // Problem: Socket event will come too and duplicate. 
      // Solution: Check ID? duplicate check? 
      // Simple: Just wait for socket. Backend emits to me too.

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Layout className="h-[calc(100vh-100px)] bg-white rounded-lg overflow-hidden border border-gray-200">
      <Sider width={300} theme="light" className="border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Title level={5}>Conversations</Title>
        </div>
        <div className="overflow-y-auto h-full">
          <List
            itemLayout="horizontal"
            dataSource={conversations}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer hover:bg-gray-50 transition-colors px-4 ${selectedUser?.id === item.id ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedUser(item)}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.avatarUrl} icon={<UserOutlined />} />}
                  title={item.name}
                  description={<Text type="secondary" ellipsis>{item.email}</Text>}
                />
              </List.Item>
            )}
          />
        </div>
      </Sider>
      <Content className="flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={selectedUser.avatarUrl} icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-xs text-green-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Online
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center p-8"><Spin /></div>
              ) : (
                messages.map((msg) => {
                  // isFromUser = true -> From Patient (User)
                  // isFromUser = false -> From Doctor (Me)
                  const isMe = !msg.isFromUser;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${isMe
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                      >
                        <div>{msg.text}</div>
                        <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef}></div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  className="rounded-full"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className="bg-blue-600"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Text type="secondary">Select a conversation to start chatting</Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ChatsPage;