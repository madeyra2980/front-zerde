import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, Card } from '../ui';
import './Signin.css';

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setLoading(true);

    try {
      const result = await signin(formData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <Card className="signin-card">
        <h2>Вход в систему</h2>
        <form onSubmit={handleSubmit} className="signin-form">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <Button 
            type="submit" 
            disabled={loading}
            className="signin-button"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
        <div className="signin-footer">
          <p>Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default Signin;