import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import ApiUrlDisplay from './components/ApiUrlDisplay';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <div className="loading">{t('general.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
    >
      {language === 'en' ? 'FR' : 'EN'}
    </button>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="layout">
      <header className="app-header">
        <h1><Link to="/">Micro Blogging</Link></h1>
        <nav>
          <ul>
            <li><Link to="/">{t('nav.feed')}</Link></li>
            <li><Link to="/create">{t('nav.newPost')}</Link></li>
            <li><Link to={`/profile/${user?.id}`}>{t('nav.profile')}</Link></li>
          </ul>
        </nav>
        <div className="user-info">
          <span>{t('nav.welcome')} {user?.displayName} {user?.followersCount !== undefined && `(${user.followersCount} ${t('nav.followers')})`}</span>
          <LanguageToggle />
          <button onClick={logout}>{t('nav.logout')}</button>
        </div>
      </header>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Feed />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreatePost />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <ApiUrlDisplay />
        </div>
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
