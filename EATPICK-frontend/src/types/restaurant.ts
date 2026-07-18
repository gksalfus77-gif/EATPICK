import type { Key } from "react";

// 1. 카테고리 타입 정의 (백엔드 CategoryType Enum과 대소문자 및 단어 완벽 일치)
export type CategoryType = 
  | 'VEGETARIAN'   // 채식
  | 'MAINSTREAM'   // 주류
  | 'EXOTIC'       // 이국요리
  | 'ECCENTRIC'    // 괴식요리
  | 'FAMOUSCHEF'   // 유명셰프
  | 'MICHELIN'     // 미슐랭
  | 'KIDSZONE'     // 키즈존
  | 'PETACCESS';   // 동물출입

// 2. 메뉴 및 이미지 상세 타입
export interface MenuResponse {
  menuId: number;
  pname: string;          // 백엔드 명세인 pName과 매핑 (대소문자 체크)
  price: number;
  isRepresentative: boolean;
}

export interface ImageResponse {
  displayOrder: number;
  imgId: number;
  imgUrl: string;
  thumbUrl?: string;
  category?: CategoryType; 
  isMain?: boolean;
}

export interface TagResponse<T = any> {
  category: CategoryType; 
  customTag: string;
  data: T;   
}

// 3. 식당 인터페이스 (백엔드 RestaurantDto와 100% 동기화 완료)
export interface Restaurant {
  id?: Key | null; 
  restId: number;          // 실제 식당 PK (Integer)
  name: string;
  category: CategoryType;  // 부모 태그에서 넘어오는 Enum string
  customTag?: string;      // 부모 태그에서 넘어오는 해시태그 (예: "#비건인증")
  address: string;
  lat: number;             // BigDecimal 대응 number
  lng: number;             // BigDecimal 대응 number
  geohash: string;
  avgPrice: number;
  minPrice?: number;
  maxPrice?: number;
  
  // 🌟 [리액트단에 새로 추가된 5가지 핵심 필드]
  description?: string;     // 매장 설명
  phone?: string;           // 전화번호
  businessHours?: string;   // 영업시간
  closedDays?: string;      // 휴무일
  snsUrl?: string;          // SNS 주소

  menus?: MenuResponse[];
  images?: ImageResponse[];
  tags?: TagResponse[];     // 레거시 혹은 확장용 태그그릇 유지
  createdAt?: string;
}

// 4. 스프링 페이지 응답 타입 (Pageable 데이터 처리용 공용 규격)
export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
}