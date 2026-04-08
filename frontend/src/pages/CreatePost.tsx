import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { postsApi } from '../services/api';

const MAX_CONTENT_LENGTH = 280;

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const handleCancel = useCallback(() => {
    if (!content.trim() || window.confirm(t('confirm.discardDraft'))) {
      navigate('/');
    }
  }, [content, navigate, t]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError(t('createPost.empty'));
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`${t('createPost.tooLong')} ${MAX_CONTENT_LENGTH} ${t('createPost.characters')}`);
      return;
    }

    if (!token) {
      setError(t('createPost.notLoggedIn'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await postsApi.createPost(content, token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('general.errorFallback'));
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>{t('createPost.title')}</h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="content">{t('createPost.label')}</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            rows={5}
            maxLength={MAX_CONTENT_LENGTH}
            disabled={loading}
            placeholder={t('createPost.placeholder')}
            required
          />
          <div className="character-count">
            {content.length}/{MAX_CONTENT_LENGTH}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? t('createPost.posting') : t('createPost.submit')}
          </button>
          <button
            type="button"
            className="cancel-button"
            disabled={loading}
            onClick={handleCancel}
          >
            {t('createPost.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
