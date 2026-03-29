import axios, { type AxiosInstance, AxiosError } from "axios";
import * as Types from "./types";

class ApiError extends Error {
  public code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

const BASE_URL = import.meta.env.DEV ? "/piwigo" : "./";

class PiwigoAPI {
  private client: AxiosInstance;
  private baseUrl: string;
  private SEARCH_METHOD = "apt.images.search";
  private CATEGORIES_GET_IMAGES_METHOD = "apt.categories.getImages";

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      params: {
        format: "json",
      },
      withCredentials: true, // Important: includes cookies for session
    });

    // Response interceptor to unwrap Piwigo's response format
    this.client.interceptors.response.use(
      (response) => {
        const data = response.data as Types.ApiResponse<object>;
        if (data.stat !== "ok") {
          console.error("error response!", response);
          throw new ApiError(
            data.error?.message || "API Error",
            data.error?.code,
          );
        }

        return response;
      },
      (error: AxiosError) => {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
      },
    );
  }

  /**
   *
   * @param method
   * @param baseParams
   * @param key
   * @param onProgress callback to update the current percent progress from 0 to 1
   * @param perPage
   * @returns
   */
  private async fetchAllPages<
    K extends string,
    T extends Types.PaginatedResult<K>,
  >(
    method: string,
    baseParams: object,
    key: K,
    onProgress?: (percent: number) => void,
    perPage: number = 500,
  ): Promise<Types.ApiResponse<T>> {
    const perPageToUse = perPage > 500 ? 500 : perPage;

    // 1. Fetch the first page to get the total count
    const res = await this.client.get<Types.ApiResponse<T>>("/ws.php", {
      params: { ...baseParams, method, page: 0, per_page: perPageToUse },
    });

    const firstResponse: Types.ApiResponse<T> = res.data;
    if (firstResponse.stat !== "ok" || !firstResponse.result?.paging) {
      onProgress?.(1);
      return firstResponse;
    }

    const totalCount = firstResponse.result.paging.total_count;
    const totalPages = Math.ceil(totalCount / perPageToUse);
    onProgress?.(1 / totalPages);
    let totalPagesLoaded = 0;

    // If there's only one page, we're already done!
    if (totalPages <= 1) return firstResponse;

    // 2. Create requests for the REMAINING pages (1 to n)
    const remainingPageIndexes = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 1,
    );

    const requests = remainingPageIndexes.map((page) =>
      this.client
        .get<Types.ApiResponse<T>>("/ws.php", {
          params: { ...baseParams, method, page, per_page: perPageToUse },
        })
        .then((result) => {
          totalPagesLoaded += 1;
          onProgress?.(totalPagesLoaded / totalPages);
          return result;
        }),
    );

    const axioisResponses = await Promise.all(requests);

    onProgress?.(1);

    // 3. Combine the first page results with all subsequent pages
    const allResults = [
      firstResponse,
      ...axioisResponses.map((res) => res.data),
    ];

    for (const res of allResults) {
      if (res.stat !== "ok") {
        return res;
      }
    }

    const mappedValues = allResults.flatMap<T[K][0]>(
      (res) => res.result?.[key] ?? [],
    ) as T[K];

    return {
      stat: "ok",
      result: {
        [key]: mappedValues,
      } as { [P in K]: typeof mappedValues } as T,
    };
  }

  // Session Methods
  async getStatus(): Promise<Types.SessionStatus> {
    const response = await this.client.get<Types.SessionStatus>("/ws.php", {
      params: { method: "pwg.session.getStatus" },
    });
    return response.data;
  }

  async login(
    username: string,
    password: string,
  ): Promise<Types.SessionStatus> {
    console.log("login");
    const body = new URLSearchParams();
    body.append("username", username);
    body.append("password", password);

    // This is unsupported at the moment
    body.append("remember_me", "1");

    const response = await this.client.post<Types.SessionStatus>(
      "/ws.php",
      body,
      {
        params: {
          method: "pwg.session.login",
        },
      },
    );

    return response.data;
  }

  async logout(): Promise<Types.ApiResponse<boolean>> {
    console.log("logout");
    const response = await this.client.get("/ws.php", {
      params: { method: "pwg.session.logout" },
    });
    return response.data;
  }

  // Category Methods
  async getCategoriesList(params?: {
    cat_id?: number;
    recursive?: boolean;
    public?: boolean;
    tree_output?: boolean;
    fullname?: boolean;
    search?: string;
    limit?: number;
  }): Promise<Types.CategoriesListResponse> {
    console.log("getCategoriesList");
    const response = await this.client.get("/ws.php", {
      params: {
        method: "pwg.categories.getList",
        ...params,
      },
    });
    return response.data;
  }

  async getCategoriesImages(
    params: {
      cat_id?: number | number[];
      all?: boolean;
      recursive?: boolean;
      per_page?: number;
      page?: number;
      image_fields?: string[];
      derivatives?: string[];
      order?: Types.IMAGE_ORDER;
    },
    onProgress?: (percent: number) => void,
  ): Promise<Types.ApiResponse<Types.CategoriesImagesResponse>> {
    console.log("getCategoriesImages");
    const {
      all,
      derivatives,
      image_fields: image_fields,
      ...queryParams
    } = params;
    const processedParams = {
      image_fields: image_fields?.join(", "),
      derivatives: derivatives?.join(", "),
      ...queryParams,
    };
    if (all) {
      const results = await this.fetchAllPages<
        "images",
        Types.ImagesSearchResponse
      >(
        this.CATEGORIES_GET_IMAGES_METHOD,
        processedParams,
        "images",
        onProgress,
      );
      return results;
    }
    const response = await this.client.get("/ws.php", {
      params: {
        method: this.CATEGORIES_GET_IMAGES_METHOD,
        ...processedParams,
      },
    });
    return response.data;
  }

  // Image Methods
  async getImageInfo(
    imageId: number,
    params?: {
      comments_page?: number;
      comments_per_page?: number;
    },
  ): Promise<Types.ImagesGetInfoResponse> {
    console.log("getImageInfo");
    const response = await this.client.get("/ws.php", {
      params: {
        method: "pwg.images.getInfo",
        image_id: imageId,
        ...params,
      },
    });
    return response.data;
  }

  async rateImage(
    imageId: number,
    rate: number,
  ): Promise<Types.ApiResponse<Types.ImagesRateResponse>> {
    console.log("rateImage");
    const response = await this.client.post("/ws.php", null, {
      params: {
        method: "pwg.images.rate",
        image_id: imageId,
        rate,
      },
    });
    return response.data;
  }

  async searchImages(params: {
    query: string;
    options?: Types.SearchOptions;
  }): Promise<Types.ApiResponse<Types.ImagesSearchResponse>> {
    const { all, ...options } = params.options ?? {};
    const getParams = { query: params.query, ...options };

    if (all) {
      const results = await this.fetchAllPages<
        "images",
        Types.ImagesSearchResponse
      >(this.SEARCH_METHOD, getParams, "images");
      return results;
    }

    const response = await this.client.get<
      Types.ApiResponse<Types.ImagesSearchResponse>
    >("/ws.php", {
      params: {
        method: this.SEARCH_METHOD,
        ...getParams,
      },
    });
    return response.data;
  }

  // Tag Methods
  async getTagsList(params?: {
    sort_by_counter?: boolean;
  }): Promise<Types.TagsListResponse> {
    console.log("getTagsList");
    const response = await this.client.get("/ws.php", {
      params: {
        method: "pwg.tags.getList",
        ...params,
      },
    });
    return response.data;
  }

  async getTagsImages(params: {
    tag_id?: number[];
    tag_url_name?: string[];
    tag_name?: string[];
    tag_mode_and?: boolean;
    per_page?: number;
    page?: number;
    order?: string;
  }): Promise<Types.TagsImagesResponse> {
    console.log("getTagsImages");
    const response = await this.client.get("/ws.php", {
      params: {
        method: "pwg.tags.getImages",
        ...params,
      },
    });
    return response.data;
  }

  // Public API instance
  getClient() {
    return this.client;
  }
}

export const piwigoAPI = new PiwigoAPI();
export default piwigoAPI;
