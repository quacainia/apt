import { useMutation, useQuery } from "@tanstack/react-query";
import piwigoAPI from "./piwigo";
import * as Types from "./types";

const QUERY_KEYS = {
  session: ["session"],
  sessionStatus: ["session", "status"],
  categories: ["categories"],
  categoriesList: (
    params?: Parameters<typeof piwigoAPI.getCategoriesList>[0],
  ) => ["categories", "list", params],
  categoriesImages: (
    cat_id?: number,
    params?: Parameters<typeof piwigoAPI.getCategoriesImages>[0],
  ) => ["categories", "images", cat_id, params],
  images: ["images"],
  imageInfo: (imageId: number) => ["images", imageId],
  search: (query: string) => ["search", query],
};

// Session Hooks
export function useSessionStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.sessionStatus,
    queryFn: async () => {
      const response = await piwigoAPI.getStatus();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return piwigoAPI.login(credentials.username, credentials.password);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      return piwigoAPI.logout();
    },
  });
}

// Category Hooks
export function useCategoriesList(
  params?: Parameters<typeof piwigoAPI.getCategoriesList>[0],
) {
  return useQuery({
    queryKey: QUERY_KEYS.categoriesList(params),
    queryFn: () => piwigoAPI.getCategoriesList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategoriesImages(
  catId?: number,
  params?: Parameters<typeof piwigoAPI.getCategoriesImages>[0],
  onProgress?: (percent: number) => void,
) {
  return useQuery({
    queryKey: QUERY_KEYS.categoriesImages(catId, params),
    queryFn: () =>
      piwigoAPI.getCategoriesImages({ cat_id: catId, ...params }, onProgress),
    enabled: !!catId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Image Hooks
export function useImageInfo(imageId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.imageInfo(imageId),
    queryFn: () => piwigoAPI.getImageInfo(imageId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRateImage() {
  return useMutation({
    mutationFn: async (params: { imageId: number; rate: number }) => {
      return piwigoAPI.rateImage(params.imageId, params.rate);
    },
  });
}

export function useSearchImages(query?: string, params?: Types.SearchOptions) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query!),
    queryFn: () => piwigoAPI.searchImages({ query: query!, options: params }),
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
