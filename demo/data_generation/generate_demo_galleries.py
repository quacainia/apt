import os
import requests

PEXELS_API_KEY = ""
BASE_DIR = "/path/to/instance/galleries"  # Local folder to sync later
CATEGORIES = ["Nature", "Dogs", "Cats"]
IMAGES_PER_CAT = 50

headers = {"Authorization": PEXELS_API_KEY}


def download_pexels_images():
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)

    for category in CATEGORIES:
        print(f"--- Processing: {category} ---")
        cat_path = os.path.join(BASE_DIR, category)
        if not os.path.exists(cat_path):
            os.makedirs(cat_path)

        # Search Pexels
        url = f"https://api.pexels.com/v1/search?query={category}&per_page={IMAGES_PER_CAT}"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            for i, photo in enumerate(data.get("photos", [])):
                img_url = photo["src"]["original"]
                img_ext = img_url.split(".")[-1].split("?")[0]  # get clean extension
                if len(img_ext) > 4:
                    img_ext = "jpg"  # fallback

                filename = f"{category.lower()}_{i+1}.{img_ext}"
                filepath = os.path.join(cat_path, filename)

                print(f"Downloading {filename}...")
                img_data = requests.get(img_url).content
                with open(filepath, "wb") as f:
                    f.write(img_data)
        else:
            print(f"Error fetching {category}: {response.status_code}")


if __name__ == "__main__":
    download_pexels_images()
