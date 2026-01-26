"""
STREAMS OF COLOR - CelebA-HQ Ingestion Pipeline
================================================
Nechama Yaffe's 30-Subtype Color Analysis System

Usage:
    python ingest.py --max-images 1000 --auto-label
    python ingest.py --max-images 5000 --batch-size 100
"""

import os
import io
import argparse
from typing import Optional, Dict, List
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image
from tqdm import tqdm
import numpy as np

load_dotenv()


# =============================================================================
# NECHAMA'S 30 SUBTYPES
# =============================================================================

SUBTYPES = {
    # SPRING (2)
    "french_spring": {"season": "spring", "undertone": "warm", "depth": "light", "contrast": "low-medium"},
    "porcelain_spring": {"season": "spring", "undertone": "warm-neutral", "depth": "light", "contrast": "medium"},
    
    # SUMMER (7)
    "ballerina_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "low"},
    "cameo_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "medium"},
    "chinoiserie_summer": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "low-medium"},
    "degas_summer": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "low"},
    "summer_rose": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "medium"},
    "sunset_summer": {"season": "summer", "undertone": "cool-neutral", "depth": "medium", "contrast": "medium"},
    "water_lily_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "low"},
    
    # AUTUMN (11)
    "auburn_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "medium"},
    "burnished_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium-deep", "contrast": "medium-high"},
    "cloisonne_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "high"},
    "grecian_autumn": {"season": "autumn", "undertone": "warm-neutral", "depth": "medium", "contrast": "medium"},
    "mellow_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "low"},
    "multi_colored_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "high"},
    "oriental_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium-deep", "contrast": "medium"},
    "renaissance_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "medium-high"},
    "sunlit_autumn": {"season": "autumn", "undertone": "warm", "depth": "light-medium", "contrast": "medium"},
    "tapestry_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium-deep", "contrast": "medium"},
    "topaz_autumn": {"season": "autumn", "undertone": "warm", "depth": "medium", "contrast": "medium-high"},
    
    # WINTER (10)
    "burnished_winter": {"season": "winter", "undertone": "cool", "depth": "medium-deep", "contrast": "high"},
    "cameo_winter": {"season": "winter", "undertone": "cool", "depth": "light-medium", "contrast": "high"},
    "crystal_winter": {"season": "winter", "undertone": "cool", "depth": "light", "contrast": "high"},
    "exotic_winter": {"season": "winter", "undertone": "cool-neutral", "depth": "deep", "contrast": "high"},
    "gemstone_winter": {"season": "winter", "undertone": "cool", "depth": "medium-deep", "contrast": "high"},
    "mediterranean_winter": {"season": "winter", "undertone": "cool-neutral", "depth": "medium-deep", "contrast": "medium-high"},
    "ornamental_winter": {"season": "winter", "undertone": "cool", "depth": "medium", "contrast": "high"},
    "silk_road_winter": {"season": "winter", "undertone": "cool-neutral", "depth": "medium-deep", "contrast": "medium-high"},
    "tapestry_winter": {"season": "winter", "undertone": "cool", "depth": "medium-deep", "contrast": "medium-high"},
    "winter_rose": {"season": "winter", "undertone": "cool", "depth": "light-medium", "contrast": "high"},
}


# =============================================================================
# CONFIG
# =============================================================================

@dataclass
class Config:
    supabase_url: str
    supabase_key: str
    storage_bucket: str = "face-images"
    batch_size: int = 50
    thumbnail_size: tuple = (256, 256)
    max_images: Optional[int] = None
    auto_label_threshold: float = 0.7


# =============================================================================
# DATABASE CLIENT
# =============================================================================

class Database:
    def __init__(self, config: Config):
        self.config = config
        self.client: Client = create_client(config.supabase_url, config.supabase_key)
    
    def upload_image(self, image: Image.Image, filename: str, folder: str = "celeba-hq") -> str:
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=95)
        buffer.seek(0)
        path = f"{folder}/{filename}"
        self.client.storage.from_(self.config.storage_bucket).upload(
            path, buffer.getvalue(), {"content-type": "image/jpeg"}
        )
        return path
    
    def create_thumbnail(self, image: Image.Image) -> Image.Image:
        thumb = image.copy()
        thumb.thumbnail(self.config.thumbnail_size, Image.Resampling.LANCZOS)
        return thumb
    
    def insert_face_images(self, images: List[Dict]) -> List[Dict]:
        result = self.client.table("face_images").insert(images).execute()
        return result.data
    
    def create_label(self, face_image_id: str, data: Dict = None) -> Dict:
        record = {"face_image_id": face_image_id, "label_status": "unlabeled"}
        if data:
            record.update(data)
        result = self.client.table("color_labels").insert(record).execute()
        return result.data[0] if result.data else None
    
    def update_label(self, face_image_id: str, data: Dict) -> Dict:
        data["labeled_at"] = datetime.utcnow().isoformat()
        result = self.client.table("color_labels").update(data).eq("face_image_id", face_image_id).execute()
        return result.data[0] if result.data else None
    
    def get_stats(self) -> Dict:
        result = self.client.table("v_dataset_stats").select("*").execute()
        return result.data[0] if result.data else {}
    
    def get_distribution(self) -> List[Dict]:
        result = self.client.table("v_subtype_distribution").select("*").execute()
        return result.data


# =============================================================================
# COLOR ANALYSIS
# =============================================================================

class ColorAnalyzer:
    def __init__(self):
        self.has_mediapipe = False
        try:
            import mediapipe as mp
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5
            )
            self.has_mediapipe = True
        except ImportError:
            print("MediaPipe not available, using fallback color extraction")
    
    def extract(self, image: Image.Image) -> Dict:
        img = np.array(image)
        h, w = img.shape[:2]
        
        # Skin: center face region
        skin_region = img[int(h*0.3):int(h*0.6), int(w*0.3):int(w*0.7)]
        skin_rgb = np.mean(skin_region.reshape(-1, 3), axis=0).astype(int)
        skin_hex = '#{:02x}{:02x}{:02x}'.format(*skin_rgb[:3])
        
        # Hair: top region
        hair_region = img[0:int(h*0.15), int(w*0.25):int(w*0.75)]
        hair_rgb = np.mean(hair_region.reshape(-1, 3), axis=0).astype(int)
        hair_hex = '#{:02x}{:02x}{:02x}'.format(*hair_rgb[:3])
        
        return {
            "skin_hex": skin_hex,
            "skin_rgb": list(map(int, skin_rgb[:3])),
            "hair_hex": hair_hex,
            "hair_rgb": list(map(int, hair_rgb[:3])),
        }
    
    def analyze_undertone(self, skin_rgb: List[int]) -> Dict:
        r, g, b = skin_rgb
        warmth = (r - b) / 255.0
        
        if warmth > 0.1:
            undertone = "warm"
        elif warmth < -0.05:
            undertone = "cool"
        else:
            undertone = "neutral"
        
        return {"undertone": undertone, "confidence": min(abs(warmth) * 2, 1.0)}
    
    def analyze_depth(self, skin_rgb: List[int]) -> Dict:
        luminance = (0.299 * skin_rgb[0] + 0.587 * skin_rgb[1] + 0.114 * skin_rgb[2]) / 255.0
        
        if luminance > 0.75:
            depth = "light"
        elif luminance > 0.6:
            depth = "light-medium"
        elif luminance > 0.45:
            depth = "medium"
        elif luminance > 0.3:
            depth = "medium-deep"
        else:
            depth = "deep"
        
        return {"depth": depth, "luminance": luminance}
    
    def analyze_contrast(self, skin_rgb: List[int], hair_rgb: List[int]) -> Dict:
        def lum(rgb): return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255.0
        contrast_val = abs(lum(skin_rgb) - lum(hair_rgb))
        
        if contrast_val > 0.5:
            level = "high"
        elif contrast_val > 0.35:
            level = "medium-high"
        elif contrast_val > 0.2:
            level = "medium"
        elif contrast_val > 0.1:
            level = "low-medium"
        else:
            level = "low"
        
        return {"contrast_level": level, "contrast_value": contrast_val}


# =============================================================================
# SUBTYPE PREDICTOR
# =============================================================================

class Predictor:
    def __init__(self):
        self.subtypes = SUBTYPES
    
    def predict(self, undertone: str, depth: str, contrast: str, confidence: float = 1.0) -> Dict:
        scores = {}
        
        for code, info in self.subtypes.items():
            score = 0.0
            
            # Undertone (40%)
            if info["undertone"] == undertone:
                score += 0.4
            elif self._compatible_undertone(info["undertone"], undertone):
                score += 0.2
            
            # Depth (30%)
            if info["depth"] == depth:
                score += 0.3
            elif self._adjacent(info["depth"], depth, ["light", "light-medium", "medium", "medium-deep", "deep"]):
                score += 0.15
            
            # Contrast (30%)
            if info["contrast"] == contrast:
                score += 0.3
            elif self._adjacent(info["contrast"], contrast, ["low", "low-medium", "medium", "medium-high", "high"]):
                score += 0.15
            
            score *= (0.5 + 0.5 * confidence)
            scores[code] = score
        
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top = sorted_scores[0]
        
        return {
            "subtype": top[0],
            "confidence": round(top[1], 3),
            "season": self.subtypes[top[0]]["season"],
            "alternatives": [{"subtype": s[0], "confidence": round(s[1], 3)} for s in sorted_scores[1:5]]
        }
    
    def _compatible_undertone(self, expected: str, actual: str) -> bool:
        compat = {
            "warm": ["warm-neutral"], "cool": ["cool-neutral"], "neutral": ["warm-neutral", "cool-neutral"],
            "warm-neutral": ["warm", "neutral"], "cool-neutral": ["cool", "neutral"]
        }
        return actual in compat.get(expected, [])
    
    def _adjacent(self, a: str, b: str, order: List[str]) -> bool:
        try:
            return abs(order.index(a) - order.index(b)) == 1
        except ValueError:
            return False


# =============================================================================
# INGESTION
# =============================================================================

class Ingestion:
    def __init__(self, db: Database, config: Config):
        self.db = db
        self.config = config
        self.analyzer = ColorAnalyzer()
        self.predictor = Predictor()
    
    def run(self, auto_label: bool = False):
        from datasets import load_dataset
        
        print("Loading CelebA-HQ dataset...")
        dataset = load_dataset("huggan/CelebA-HQ", split="train", streaming=True)
        
        batch = []
        processed = 0
        pbar = tqdm(desc="Ingesting", unit="images")
        
        try:
            for sample in dataset:
                if self.config.max_images and processed >= self.config.max_images:
                    break
                
                image = sample["image"]
                if not isinstance(image, Image.Image):
                    continue
                if image.mode != "RGB":
                    image = image.convert("RGB")
                
                source_id = f"{processed:06d}"
                filename = f"{source_id}.jpg"
                thumb_filename = f"{source_id}_thumb.jpg"
                
                # Upload
                storage_path = self.db.upload_image(image, filename)
                thumbnail = self.db.create_thumbnail(image)
                thumb_path = self.db.upload_image(thumbnail, thumb_filename, "celeba-hq/thumbnails")
                
                # File size
                buf = io.BytesIO()
                image.save(buf, format="JPEG", quality=95)
                
                batch.append({
                    "record": {
                        "source": "celeba_hq",
                        "source_id": source_id,
                        "storage_path": storage_path,
                        "thumbnail_path": thumb_path,
                        "width": image.width,
                        "height": image.height,
                        "file_size_bytes": buf.tell(),
                        "is_processed": auto_label
                    },
                    "image": image if auto_label else None
                })
                
                processed += 1
                pbar.update(1)
                
                if len(batch) >= self.config.batch_size:
                    self._process_batch(batch, auto_label)
                    batch = []
        
        finally:
            if batch:
                self._process_batch(batch, auto_label)
            pbar.close()
        
        print(f"\nDone! Processed {processed} images.")
        return processed
    
    def _process_batch(self, batch: List[Dict], auto_label: bool):
        records = [item["record"] for item in batch]
        results = self.db.insert_face_images(records)
        
        for i, result in enumerate(results):
            if auto_label and batch[i]["image"]:
                label_data = self._auto_label(batch[i]["image"])
                self.db.create_label(result["id"], label_data)
            else:
                self.db.create_label(result["id"])
    
    def _auto_label(self, image: Image.Image) -> Dict:
        try:
            colors = self.analyzer.extract(image)
            undertone = self.analyzer.analyze_undertone(colors["skin_rgb"])
            depth = self.analyzer.analyze_depth(colors["skin_rgb"])
            contrast = self.analyzer.analyze_contrast(colors["skin_rgb"], colors["hair_rgb"])
            prediction = self.predictor.predict(
                undertone["undertone"], depth["depth"], contrast["contrast_level"], undertone["confidence"]
            )
            
            status = "ai_predicted" if prediction["confidence"] >= self.config.auto_label_threshold else "needs_review"
            
            return {
                "skin_hex": colors["skin_hex"],
                "skin_rgb": colors["skin_rgb"],
                "hair_hex": colors["hair_hex"],
                "hair_rgb": colors["hair_rgb"],
                "undertone": undertone["undertone"],
                "undertone_confidence": undertone["confidence"],
                "depth": depth["depth"],
                "depth_value": depth["luminance"],
                "contrast_level": contrast["contrast_level"],
                "contrast_value": contrast["contrast_value"],
                "ai_predicted_subtype": prediction["subtype"],
                "ai_confidence": prediction["confidence"],
                "ai_alternatives": prediction["alternatives"],
                "label_status": status
            }
        except Exception as e:
            print(f"Auto-label error: {e}")
            return {"label_status": "unlabeled"}


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Streams of Color - CelebA-HQ Ingestion")
    parser.add_argument("--max-images", type=int, default=1000)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--auto-label", action="store_true")
    parser.add_argument("--bucket", default="face-images")
    args = parser.parse_args()
    
    config = Config(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        storage_bucket=args.bucket,
        batch_size=args.batch_size,
        max_images=args.max_images
    )
    
    if not config.supabase_url or not config.supabase_key:
        print("Error: Set SUPABASE_URL and SUPABASE_KEY in .env file")
        return
    
    print("=" * 60)
    print("STREAMS OF COLOR - CelebA-HQ Ingestion")
    print("=" * 60)
    print(f"Max images: {args.max_images}")
    print(f"Batch size: {args.batch_size}")
    print(f"Auto-label: {args.auto_label}")
    print()
    
    db = Database(config)
    ingestion = Ingestion(db, config)
    count = ingestion.run(auto_label=args.auto_label)
    
    print("\n" + "=" * 60)
    print("STATISTICS")
    print("=" * 60)
    stats = db.get_stats()
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    if args.auto_label:
        print("\nTop Subtypes:")
        for row in db.get_distribution()[:10]:
            print(f"  {row['confirmed_subtype'] or row.get('ai_predicted_subtype', 'N/A')}: {row['count']}")


if __name__ == "__main__":
    main()
