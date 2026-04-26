import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ConfigProvider, Spin } from 'antd';
import { App as AntApp } from 'antd';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import './index.css';

function App() {
  const { verifySession, isInitializing, user } = useAuthStore();
  const { connect, disconnect } = useChatStore();

  useEffect(() => {
    // Always verify session on mount against the server cookie.
    // Do NOT include `user` in deps — that would re-fire on every auth state
    // change and create a feedback loop.
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && user._id) {
      connect(user._id);
    } else {
      disconnect();
    }
  }, [user, connect, disconnect]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#2563eb', // Tailwind blue-600
        borderRadius: 6,
      }
    }}>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
