import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../ui';
import './Signin.css';
import { useSignin } from './hooks';

const Signin = () => {
  const {
    formData,
    error,
    loading,
    handleChange,
    handleSubmit
  } = useSignin();

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