import apiClient from './apiClient';
import type { BlogPost, BlogForm } from '../types/blog';

export const blogService = {
  getPosts: async (params?: Record<string, string>): Promise<BlogPost[]> => {
    const response = await apiClient.get('/api/posts', { params });
    return response.data;
  },

  // postData 타입을 any에서 BlogForm으로 변경
  createPost: async (postData: BlogForm): Promise<BlogPost> => {
    const response = await apiClient.post('/api/posts', postData);
    return response.data;
  },

  // postData 타입을 any에서 BlogForm으로 변경
  updatePost: async (id: number, postData: BlogForm): Promise<BlogPost> => {
    const response = await apiClient.put(`/api/posts/${id}`, postData);
    return response.data;
  },

  deletePost: async (id: number): Promise<boolean> => {
    await apiClient.delete(`/api/posts/${id}`);
    return true;
  },

  toggleLike: async (id: number): Promise<BlogPost> => {
    const response = await apiClient.post(`/api/posts/${id}/like`);
    return response.data;
  }
};