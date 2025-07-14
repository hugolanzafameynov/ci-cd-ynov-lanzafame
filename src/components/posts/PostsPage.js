import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../services/postApi';
import './PostsPage.css';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await postService.getAllPosts();
      setPosts(response.posts || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="posts-page">
      <div className="posts-card">
        <h1>Liste des posts</h1>
        {loading && <div className="loading">Chargement...</div>}
        {error && <div className="error-message">{error}</div>}
        <div className="posts-list">
          {posts.length === 0 && !loading && <div>Aucun post à afficher.</div>}
          {posts.map(post => (
            <div className="post-card" key={post.id || post._id}>
              <h2>{post.title}</h2>
              <p>{post.content}</p>
            </div>
          ))}
        </div>

        <div className="auth-links">
          <p>
            Tu veux ajouter un post ?{' '}
            <Link to="/login">Connecte toi</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;
