import { render, screen, waitFor } from '@testing-library/react';
import PostsPage from '../PostsPage';
import { postService } from '../../../services/postApi';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../services/postApi');

const mockPosts = [
  { id: '1', title: 'Post 1', content: 'Contenu 1' },
  { id: '2', title: 'Post 2', content: 'Contenu 2' }
];

describe('PostsPage', () => {
  beforeEach(() => {
    postService.getAllPosts.mockResolvedValue({ posts: mockPosts });
  });

  it('affiche le titre et la liste des posts', async () => {
    render(
      <BrowserRouter>
        <PostsPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Liste des posts/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Contenu 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
      expect(screen.getByText('Contenu 2')).toBeInTheDocument();
    });
  });

  it('affiche le message aucun post si la liste est vide', async () => {
    postService.getAllPosts.mockResolvedValue({ posts: [] });
    render(
      <BrowserRouter>
        <PostsPage />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Aucun post à afficher/i)).toBeInTheDocument();
    });
  });

  it('affiche le message de connexion pour ajouter un post', async () => {
    render(
      <BrowserRouter>
        <PostsPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Tu veux ajouter un post/i)).toBeInTheDocument();
    expect(screen.getByText(/Connecte toi/i)).toBeInTheDocument();
  });
});
