import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username || !password) {
      setFormError(t('login.fillAll'));
      return;
    }

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="login-container">
      <div className="auth-language-toggle">
        <button
          className="language-toggle"
          onClick={toggleLanguage}
          aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>
      </div>
      <h2>{t('login.title')}</h2>
      <form onSubmit={handleSubmit}>
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">{t('login.username')}</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('login.password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? t('login.loggingIn') : t('login.submit')}
        </button>
      </form>

      <p>
        {t('login.noAccount')} <Link to="/register">{t('login.register')}</Link>
      </p>
    </div>
  );
};

export default Login;
