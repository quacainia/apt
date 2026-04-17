import os
import random
import time
import piexif
from datetime import datetime, timedelta

# --- CONFIGURATION ---
BASE_DIR = "/Volumes/web/apt/galleries"  # Local folder to sync later
START_YEAR = 2023
END_YEAR = 2025
NUM_CLUSTERS = 5  # How many "events" or "trips" occurred
CLUSTER_STRENGTH = 0.5  # 50% of photos will fall into clusters, 50% are random noise


def generate_random_date(start_yr, end_yr):
    start = datetime(start_yr, 1, 1)
    end = datetime(end_yr, 12, 31)
    delta = end - start
    random_second = random.randrange(int(delta.total_seconds()))
    return start + timedelta(seconds=random_second)


# 1. Generate the random "Anchors" (The events)
# Each anchor is (date, hour_radius)
ANCHORS = [
    (generate_random_date(START_YEAR, END_YEAR), random.randint(24, 168))
    for _ in range(NUM_CLUSTERS)
]


def get_target_date():
    """Determines if a photo belongs to a cluster or is a 'stray'."""
    if random.random() < CLUSTER_STRENGTH:
        # Pick a random cluster anchor
        anchor_date, radius = random.choice(ANCHORS)
        # Scatter within the radius (in hours)
        offset = random.randint(-radius, radius)
        return anchor_date + timedelta(hours=offset)
    else:
        # Pure noise - scattered anywhere in the 3-year range
        return generate_random_date(START_YEAR, END_YEAR)


def update_exif(file_path, target_date):
    """Updates the internal EXIF metadata of the image."""
    try:
        # EXIF date format is strictly "YYYY:MM:DD HH:MM:SS"
        exif_date_str = target_date.strftime("%Y:%m:%d %H:%M:%S")

        # Load existing exif or create empty if none exists
        exif_dict = piexif.load(file_path)

        # Update the standard date tags
        # 0th: General date, Exif: Original and Digitized dates
        exif_dict["0th"][piexif.ImageIFD.DateTime] = exif_date_str
        exif_dict["Exif"][piexif.ExifIFD.DateTimeOriginal] = exif_date_str
        exif_dict["Exif"][piexif.ExifIFD.DateTimeDigitized] = exif_date_str

        exif_bytes = piexif.dump(exif_dict)
        piexif.insert(exif_bytes, file_path)
        return True
    except Exception as e:
        print(f"  [!] Failed to update EXIF for {os.path.basename(file_path)}: {e}")
        return False


def age_gallery():
    print(f"Generated {NUM_CLUSTERS} random event clusters...")
    for date, rad in ANCHORS:
        print(f" - Event near {date.strftime('%Y-%m-%d')} (spread: {rad}hrs)")

    count = 0
    # Added .png to exclusion because PNGs don't support EXIF the same way JPEGs do
    # Most tools (and piexif) focus on JPEG/TIFF for EXIF.
    for root, dirs, files in os.walk(BASE_DIR):
        for name in files:
            if name.lower().endswith((".jpg", ".jpeg")):
                file_path = os.path.join(root, name)
                target_date = get_target_date()
                # Ensure we don't set a date in the future
                if target_date > datetime.now():
                    target_date = datetime.now()

                # 1. Update EXIF (Internal)
                update_exif(file_path, target_date)

                # 2. Update OS Filesystem (External)
                timestamp = time.mktime(target_date.timetuple())
                os.utime(file_path, (timestamp, timestamp))

                count += 1

    print(f"\nSuccessfully aged {count} images (EXIF and OS timestamps).")


if __name__ == "__main__":
    age_gallery()
