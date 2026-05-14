import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../services/token';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('处理中…');

  useEffect(() => {
    // 从 hash 中读取 token: #token=xxx
    const hash = window.location.hash;
    const match = hash.match(/token=([^&]+)/);
    if (match?.[1]) {
      setToken(decodeURIComponent(match[1]));
      setStatus('登录成功，正在跳转…');
      // 清除 hash
      window.location.hash = '';
      // 刷新用户状态后再跳转
      refreshUser().finally(() => {
        navigate('/', { replace: true });
      });
    } else {
      setStatus('登录失败，未获取到认证信息');
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  }, [navigate, refreshUser]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span className="text-sm text-muted-400">{status}</span>
      </div>
    </div>
  );
}
