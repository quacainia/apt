// Piwigo API Response Types

export interface Category {
  id: number;
  name: string;
  comment?: string;
  nb_categories: number;
  nb_images: number;
  total_nb_images?: number;
  representative_picture_id?: number;
  date_last?: string;
  max_date_last?: string;
  dir?: string;
  status: "public" | "private";
  uppercats: string;
  global_rank?: string;
  id_uppercat?: number | null;
  has_children?: boolean;
  sub_categories?: Category[];
}

export interface Image {
  id: number;
  name: string;
  comment?: string;
  author?: string;
  file: string;
  date_available: string;
  date_creation?: string;
  width: number;
  height: number;
  hit: number;
  rating_score?: number;
  tags?: Tag[];
  categories?: CategoryRef[];
  element_url?: string;
  derivatives?: ImageDerivatives;
  rotation?: number;
}

export interface ImageDerivative {
  height: number;
  url: string;
  width: number;
}

export interface ImageDerivatives {
  square?: ImageDerivative;
  thumb?: ImageDerivative;
  small?: ImageDerivative;
  medium?: ImageDerivative;
  large?: ImageDerivative;
  xlarge?: ImageDerivative;
  xxlarge?: ImageDerivative;
}

export interface CategoryRef {
  id: number;
  name: string;
  url?: string;
}

export interface Tag {
  id: number;
  name: string;
  url_name?: string;
  counter?: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  status: string;
  level: number;
  language?: string;
  theme?: string;
}

export type SessionStatus = ApiResponse<{
  status: "webmaster" | "admin" | "generic" | "guest" | "normal" | "ko";
  username?: string;
  user_id?: number;
  pwg_token?: string;
}>;

export interface ApiResponse<T> {
  // "noop" is a local response so we can tell that no API query was actually called, but the function returned.
  stat: "ok" | "fail" | "noop";
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export type PaginatedResult<K extends string, T = object> = {
  paging?: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
  };
} & {
  [P in K]: T[];
};

export type PaginatedApiResponse<K extends string, T> = ApiResponse<
  PaginatedResult<K, T>
>;

export type CategoriesListResponse = ApiResponse<{
  categories: Category[];
}>;

export type CategoriesImagesResponse = PaginatedResult<"images", Image>;

export interface TagsListResponse {
  tags: Tag[];
}

export type TagsImagesResponse = PaginatedResult<"images", Image>;

export type IMAGE_ORDER =
  | "id"
  | "file"
  | "name"
  | "hit"
  | "rating_score"
  | "date_creation"
  | "date_available"
  | "random";

export interface SearchOptions {
  all?: boolean;
  image_fields?: string[];
  derivatives?: string[];
  per_page?: number;
  page?: number;
  order?: IMAGE_ORDER;
}

export type ImagesSearchResponse = PaginatedResult<"images", Image>;

export type ImagesGetInfoResponse = ApiResponse<
  Image & {
    current_rank?: number;
    total_nb_images?: number;
    prev_image?: { id: number; url: string };
    next_image?: { id: number; url: string };
    comments?: string[];
  }
>;

export type ImagesRateResponse =
  | {
      score: number;
      average: number;
      count: number;
    }
  | false;
