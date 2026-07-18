export interface BlogPost {
  id: number;
  restaurant: string;
  category: string;
  area: string;
  title: string;
  content: string;
  rating: number;
  photos: string[];
  tags: string[];
  author: string;
  authorColor: string;
  date: string;
  likes: number;
  liked?: boolean;
}

export interface BlogForm {
  restaurant: string;
  category: string;
  area: string;
  title: string;
  content: string;
  rating: number;
  photos: string[];
  tags: string[];
}