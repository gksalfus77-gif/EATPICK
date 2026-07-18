import apiClient from './apiClient'; 
import type { Restaurant } from '../types/restaurant';

const extractContent = (resData: any): Restaurant[] => {
  if (resData && resData.content) return resData.content;   // Spring Pageable 구조
  if (resData && resData.data) return resData.data;         // { data: [...] } 구조
  if (Array.isArray(resData)) return resData;               // 일반 배열 구조
  return [];
};

export const restaurantService = {
  
  // --- [ 유저 / 공용 기능 ] ---

  /**
   * 1. 식당 전체 조회
   */
  getRestaurantList: async (searchKeyword = '', page = 0, size = 5): Promise<any> => {
  try {
    const response = await apiClient.get('/api/restaurants', {
      params: { searchKeyword, page, size }
    });
    // 백엔드에서 Page<RestaurantDto>를 주므로 객체 그대로 반환
    return response.data; 
  } catch (error) {
    console.error("식당 목록 로드 실패:", error);
    return { content: [], totalPages: 1, totalElements: 0 };
  }
},

  /**
   * 2. 카테고리별 식당 목록 조회
   */
  getRestaurantListByCategory: async (category: string, page = 0, size = 10): Promise<Restaurant[]> => {
    try {
      const response = await apiClient.get(`/api/restaurants/category/${category}`, {
        params: { page, size }
      });
      return extractContent(response.data);
    } catch (error) {
      console.error(`카테고리(${category}) 식당 목록 로드 실패:`, error);
      return [];
    }
  },

  /**
   * 3. 식당 단건 상세 조회
   */
  getRestaurantDetail: async (restId: number): Promise<Restaurant | null> => {
    try {
      const response = await apiClient.get(`/api/restaurants/${restId}`);
      return response.data;
    } catch (error) {
      console.error(`식당 상세 조회 실패 (ID: ${restId}):`, error);
      return null;
    }
  },


  // --- [ 관리자 전용 기능 ] ---

  /**
   * 4. 식당 신규 등록
   */
  createRestaurant: async (createDto: any): Promise<number | null> => {
    try {
      const response = await apiClient.post('/api/restaurants', createDto);
      return response.data;
    } catch (error) {
      console.error("식당 신규 등록 실패:", error);
      return null;
    }
  },

  /**
   * 5. 식당 정보 수정
   */
  updateRestaurant: async (id: number, updateDto: any): Promise<boolean> => {
    try {
      await apiClient.put(`/api/restaurants/${id}`, updateDto);
      return true;
    } catch (error) {
      console.error(`식당 정보 수정 실패 (ID: ${id}):`, error);
      return false;
    }
  },

  /**
   * 6. 식당 삭제
   */
  deleteRestaurant: async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/restaurants/${id}`);
      return true;
    } catch (error) {
      console.error(`식당 삭제 실패 (ID: ${id}):`, error);
      return false;
    }
  },

  /**
   * 7. 카테고리 마스터 정보 수정
   */
  updateCategoryInfo: async (tagId: number, customTag: string): Promise<boolean> => {
    try {
      await apiClient.put(`/api/restaurants/categories/${tagId}`, null, {
        params: { customTag }
      });
      return true;
    } catch (error) {
      console.error(`카테고리 마스터 정보 수정 실패 (TagID: ${tagId}):`, error);
      return false;
    }
  },

  /**
   * 8. 이미지 업로드
   */
  uploadImages: async (formData: FormData): Promise<string[]> => {
    try {
      const response = await apiClient.post('/api/restaurants/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("다중 이미지 업로드 실패:", error);
      throw error;
    }
  },
};