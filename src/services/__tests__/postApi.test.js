import { postService } from '../postApi';

describe('postService', () => {
  test('doit exposer createPost et getAllPosts', () => {
    expect(typeof postService.createPost).toBe('function');
    expect(typeof postService.getAllPosts).toBe('function');
  });
});
