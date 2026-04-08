import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Post } from '../types/post';
import { postsApi, usersApi } from '../services/api';

const ASCII_ICONS = ['✦', '◆', '▲', '●', '★', '♦', '◉', '⬟', '⬡', '◈', '✿', '⚡', '♠', '♣', '☘', '⚙', '✪', '⬢'];

const getPostIcon = (postId: string) => {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = ((hash << 5) - hash) + postId.charCodeAt(i);
    hash |= 0;
  }
  return ASCII_ICONS[Math.abs(hash) % ASCII_ICONS.length];
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { token } = useAuth();
  const { t } = useLanguage();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextToken) {
        fetchPosts(nextToken);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, nextToken]);

  const fetchPosts = async (nextToken?: string | null) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const data = await postsApi.getPosts(token, {
        limit: 10,
        sortBy,
        nextToken: nextToken || undefined
      });

      const postsWithUsers = await Promise.all(
        data.posts.map(async (post: Post) => {
          try {
            const userData = await usersApi.getProfile(post.userId, token);
            return { ...post, user: userData.user };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return post;
          }
        })
      );

      setPosts(prevPosts => nextToken ? [...prevPosts, ...postsWithUsers] : postsWithUsers);
      setNextToken(data.nextToken);
    } catch (err) {
      setError(t('feed.error'));
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setPosts([]);
      setNextToken(null);
      fetchPosts();
    }
  }, [token, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLike = async (postId: string) => {
    if (!token) return;

    try {
      await postsApi.likePost(postId, token);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + 1, liked: true }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'newest' | 'popular');
  };

  const renderPostCard = (post: Post, ref?: React.Ref<HTMLDivElement>) => (
    <div ref={ref} key={post.id} className="post-card">
      <span className="post-icon" aria-hidden="true">{getPostIcon(post.id)}</span>
      <div className="post-card-body">
        <div className="post-header">
        <Link to={`/profile/${post.userId}`} className="user-link">
          {post.user ? post.user.displayName : t('feed.unknownUser')}
        </Link>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-footer">
        <button
          onClick={() => handleLike(post.id)}
          className={`like-button ${post.liked ? 'liked' : ''}`}
          disabled={post.liked}
        >
          {post.likesCount} {post.likesCount === 1 ? t('feed.like') : t('feed.likes')}
        </button>
        <span>{post.commentsCount} {post.commentsCount === 1 ? t('feed.comment') : t('feed.comments')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="feed-layout">
      <div className="feed-main">
        <div className="feed">
          <div className="feed-header">
            <h2>{t('feed.recent')}</h2>
          </div>
          <div className="feed-controls">
            <label htmlFor="sort-by">{t('feed.sortBy')}</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="newest">{t('feed.newest')}</option>
              <option value="popular">{t('feed.popular')}</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="posts-list">
            {posts.length === 0 && !loading ? (
              <p>{t('feed.noPosts')}</p>
            ) : (
              posts.map((post, index) =>
                posts.length === index + 1
                  ? renderPostCard(post, lastPostElementRef)
                  : renderPostCard(post)
              )
            )}
          </div>

          {loading && <div className="loading">{t('general.loading')}</div>}
        </div>
      </div>

      <div className="feed-sidebar">
        <div className="feed-sidebar-placeholder">
          <p>{t('sidebar.futureTitle')}</p>
          <p>{t('sidebar.futureDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Feed;
