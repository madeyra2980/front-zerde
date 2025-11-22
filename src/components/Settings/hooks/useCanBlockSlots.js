import { useAuth } from '../../../contexts/AuthContext';

export const useCanBlockSlots = () => {
  const { user } = useAuth();

  const canBlockSlots = () => {
    const token = localStorage.getItem('accessToken');
    
    const userRole = user?.role || user?.userType || user?.type;
    const isAdmin = userRole === 'admin' || userRole === 'ADMIN' || userRole === 'administrator';
    
    let tokenRole = null;
    let tokenAuthorities = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        tokenRole = payload.role;
        tokenAuthorities = payload.authorities;
        console.log('JWT Payload:', payload);
      } catch (e) {
        console.error('Ошибка декодирования токена:', e);
      }
    }
    
    const isAdminFromToken = tokenAuthorities && (
      tokenAuthorities.includes('ADMIN') || 
      tokenAuthorities.includes('admin') ||
      tokenAuthorities.includes('ROLE_ADMIN')
    );
    
    const userAuthorities = user?.authorities;
    const isAdminFromUser = userAuthorities && (
      userAuthorities === 'ADMIN' ||
      userAuthorities === 'admin' ||
      userAuthorities === 'ROLE_ADMIN' ||
      (typeof userAuthorities === 'string' && userAuthorities.includes('ADMIN'))
    );
    
    console.log('Детальная проверка прав доступа:', {
      token: token ? 'Present' : 'Missing',
      userRole,
      tokenRole,
      tokenAuthorities,
      userAuthorities,
      isAdmin,
      isAdminFromToken,
      isAdminFromUser,
      user,
      finalDecision: isAdmin || isAdminFromToken || isAdminFromUser
    });
    
    return isAdmin || isAdminFromToken || isAdminFromUser;
  };

  return canBlockSlots;
};

