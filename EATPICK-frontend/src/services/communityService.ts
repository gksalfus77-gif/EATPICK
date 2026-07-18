import apiClient from "./apiClient";

// ─── 인터페이스 정의 ───
export interface Post {
  postId: number;
  boardId: number;
  parentId: number | null;
  quoteId: number | null;
  writer: string;
  content: string;
  replyCount: number;
  likeCount: number;
  imgUrl: string;
  thumbUrl: string;
  isLocked: boolean;
  lockedAt: string | null;
  bumpAt: string;
  createdAt: string;
  category?: string;
  isLikedByUser?: boolean;
}

export interface BoardCategory {
  boardId: number;
  name: string;            // boardName 대신 name으로 변경
  slug: string;            // wrapperId 대신 slug로 변경
  categories?: string[];    // 백엔드 API가 이 정보를 주는지 꼭 확인해야 합니다!
  pendingCategories?: string[];
}

// ─── 서비스 정의 ───
const BASE_PATH = "/api/community/posts";

export const communityService = {
  getBoardCategories: async (): Promise<BoardCategory[]> => {
    const response = await apiClient.get(`/api/boards`);
    return response.data;
  },

  getPosts: async (boardId: number, page: number, size: number): Promise<{ content: Post[]; totalElements: number }> => {
    // BASE_PATH(/api/community/posts) + /board/boardId
    const response = await apiClient.get(`${BASE_PATH}/board/${boardId}`, {
      params: { page, size }
    });
    return response.data;
  },

  createPost: async (postData: any): Promise<Post> => {
    const response = await apiClient.post(BASE_PATH, postData);
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    // 삭제 경로 수정: /api/community/posts/delete/{postId}
    await apiClient.delete(`${BASE_PATH}/delete/${postId}`);
  },

  toggleLike: async (postId: number, isIncrease: boolean): Promise<Post> => {
    // 좋아요 경로 수정: /api/community/posts/{postId}/like
    const response = await apiClient.post(`${BASE_PATH}/${postId}/like`, null, {
      params: { isIncrease }
    });
    return response.data;
  },

  getReplies: async (threadId: number): Promise<Post[]> => {
    // 기존 경로 오류 수정: ${BASE_PATH} 내부에 이미 /posts가 포함되어 있음
    // 수정 전: `${BASE_PATH} /posts/${threadId}/replies` (공백과 /posts 중복 발생)
    const response = await apiClient.get(`${BASE_PATH}/${threadId}/replies`);
    return response.data;
  },
};