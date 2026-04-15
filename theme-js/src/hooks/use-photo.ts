import { useEffect } from "react";
import { BASE_URL } from "../api/piwigo";
import { useEntityStore } from "../store/entities";
import { parseDocDataFromString } from "../utils/parse-doc-data";

export type PhotoPhpImage = {
  id: string;
  info: {
    id: string;
    file: string;
    date_available: string;
    date_creation: string;
    name: string;
    comment: null;
    author: null;
    hit: string;
    filesize: string;
    width: string;
    height: string;
    coi: null;
    representative_ext: null;
    date_metadata_update: string;
    rating_score: null;
    path: string;
    storage_category_id: string;
    level: string;
    md5sum: string;
    added_by: string;
    rotation: string;
    latitude: null;
    longitude: null;
    lastmodified: string;
    is_sphere: string;
    src_image: {
      id: string;
      rel_path: string;
      rotation: number;
    };
    derivatives: {
      square: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      thumb: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      medium: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      xxlarge: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      "2small": {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      xsmall: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      small: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      large: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      xlarge: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
    };
    path_ext: string;
    file_ext: string;
    element_path: string;
    element_url: string;
    download_url: string;
    url: string;
    TITLE: string;
    TITLE_ESC: string;
    U_IMG: string;
    U_DOWNLOAD: string;
    selected_derivative: {
      src_image: {
        id: string;
        rel_path: string;
        rotation: number;
      };
    };
    unique_derivatives: {
      medium: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
      xxlarge: {
        src_image: {
          id: string;
          rel_path: string;
          rotation: number;
        };
      };
    };
  };
  categoryPosition: string;
  nextId: string;
  prevId: string;
  file: string;
  related_tags: {
    id: string;
    name: string;
    url_name: string;
    lastmodified: string;
    counter: string;
    URL: string;
    U_TAG_IMAGE: string;
  }[];
};

export function usePhoto(
  photoId: string | undefined,
  categoryId: string,
): PhotoPhpImage | undefined {
  const photos = useEntityStore((state) => state.getEntities("images"));
  const addEntities = useEntityStore((state) => state.addEntities);
  const hydrateFromDOM = useEntityStore((state) => state.hydrateFromDOM);

  const photo = photoId ? photos[photoId] : undefined;
  

  useEffect(() => {
    // 1. Check the DOM first if the store is totally empty
    if (Object.keys(photos).length === 0) {
      hydrateFromDOM();
    }

    // 2. Fetch if ID is provided but photo isn't in lookup table
    if (photoId && !photo) {
      const fetchPhoto = async () => {
        try {
          const response = await fetch(
            BASE_URL+`/picture.php?/${photoId}/category/${categoryId}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            },
          );
          const html = await response.text();

          const data = parseDocDataFromString(html);

          if (data?.images) {
            addEntities("images", data.images);
          }
        } catch (error) {
          console.error(`Error fetching photo ${photoId}:`, error);
        }
      };

      fetchPhoto();
    }
  }, [categoryId, photoId, photo, photos, hydrateFromDOM, addEntities]);

  return photo;
}
