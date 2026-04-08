import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  const { register, loading, error } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const passwordCriteria = useMemo(() => [
    { key: 'minLength' as const, test: (p: string) => p.length >= 8, label: t('register.pwdMinLength') },
    { key: 'uppercase' as const, test: (p: string) => /[A-Z]/.test(p), label: t('register.pwdUppercase') },
    { key: 'lowercase' as const, test: (p: string) => /[a-z]/.test(p), label: t('register.pwdLowercase') },
    { key: 'digit' as const, test: (p: string) => /\d/.test(p), label: t('register.pwdDigit') },
    { key: 'special' as const, test: (p: string) => /[^A-Za-z0-9]/.test(p), label: t('register.pwdSpecial') },
  ], [t]);

  const allCriteriaMet = passwordCriteria.every((c) => c.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username || !email || !password || !confirmPassword || !displayName) {
      setFormError(t('register.fillAll'));
      return;
    }

    if (password !== confirmPassword) {
      setFormError(t('register.passwordNoMatch'));
      return;
    }

    if (password.length < 8) {
      setFormError(t('register.passwordTooShort'));
      return;
    }

    try {
      await register(username, email, password, displayName);
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="register-container">
      <div className="auth-language-toggle">
        <button
          className="language-toggle"
          onClick={toggleLanguage}
          aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>
      </div>
      <h2>{t('register.title')}</h2>
      <form onSubmit={handleSubmit}>
        {(formError || error) && (
          <div className="error-message">
            {formError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">{t('register.username')}</label>
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
          <label htmlFor="email">{t('register.email')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="displayName">{t('register.displayName')}</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('register.password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          {password.length > 0 && (
            <ul className="password-criteria" aria-label={t('register.pwdRequirements')}>
              {passwordCriteria.map((c) => (
                <li key={c.key} className={c.test(password) ? 'met' : 'unmet'}>
                  <span aria-hidden="true">{c.test(password) ? '✓' : '○'}</span> {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" disabled={loading || !allCriteriaMet}>
          {loading ? t('register.creating') : t('register.submit')}
        </button>
      </form>

      <p>
        {t('register.hasAccount')} <Link to="/login">{t('register.login')}</Link>
      </p>
    </div>
  );
};

export default Register;
