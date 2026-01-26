"""
STREAMS OF COLOR - Color Utilities
===================================
Color extraction and analysis tools for Nechama's methodology.
"""

import numpy as np
from PIL import Image
from typing import Dict, List, Tuple, Optional


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB to hex color."""
    return '#{:02x}{:02x}{:02x}'.format(*rgb)


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex to RGB."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def calculate_luminance(rgb: Tuple[int, int, int]) -> float:
    """Calculate perceived luminance (0-1)."""
    r, g, b = rgb
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255.0


def calculate_warmth(rgb: Tuple[int, int, int]) -> float:
    """Calculate color warmth (-1 to 1, positive = warm)."""
    r, g, b = rgb
    return (r - b) / 255.0


class ColorExtractor:
    """Extract colors from face images."""
    
    def __init__(self, use_mediapipe: bool = True):
        self.use_mediapipe = use_mediapipe
        self.face_mesh = None
        
        if use_mediapipe:
            try:
                import mediapipe as mp
                self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=True,
                    max_num_faces=1,
                    min_detection_confidence=0.5
                )
            except ImportError:
                print("MediaPipe not available, using region-based extraction")
                self.use_mediapipe = False
    
    def extract_all(self, image: Image.Image) -> Dict:
        """Extract all color information from image."""
        img_array = np.array(image.convert("RGB"))
        
        skin = self._extract_skin(img_array)
        hair = self._extract_hair(img_array)
        
        return {
            "skin": skin,
            "hair": hair,
            "undertone": self._analyze_undertone(skin["rgb"]),
            "depth": self._analyze_depth(skin["rgb"]),
            "contrast": self._analyze_contrast(skin["rgb"], hair["rgb"]),
        }
    
    def _extract_skin(self, img: np.ndarray) -> Dict:
        """Extract skin color from face region."""
        h, w = img.shape[:2]
        
        # Center face region (approximation)
        y1, y2 = int(h * 0.3), int(h * 0.65)
        x1, x2 = int(w * 0.3), int(w * 0.7)
        region = img[y1:y2, x1:x2]
        
        # Get dominant color
        rgb = self._dominant_color(region)
        
        return {
            "rgb": rgb,
            "hex": rgb_to_hex(rgb),
            "luminance": calculate_luminance(rgb),
            "warmth": calculate_warmth(rgb),
        }
    
    def _extract_hair(self, img: np.ndarray) -> Dict:
        """Extract hair color from top region."""
        h, w = img.shape[:2]
        
        # Top of head region
        y1, y2 = 0, int(h * 0.15)
        x1, x2 = int(w * 0.25), int(w * 0.75)
        region = img[y1:y2, x1:x2]
        
        rgb = self._dominant_color(region)
        
        return {
            "rgb": rgb,
            "hex": rgb_to_hex(rgb),
            "luminance": calculate_luminance(rgb),
        }
    
    def _dominant_color(self, region: np.ndarray) -> Tuple[int, int, int]:
        """Get dominant color from region."""
        pixels = region.reshape(-1, 3)
        avg = np.mean(pixels, axis=0).astype(int)
        return tuple(avg)
    
    def _analyze_undertone(self, rgb: Tuple[int, int, int]) -> Dict:
        """Analyze undertone from skin color."""
        warmth = calculate_warmth(rgb)
        
        if warmth > 0.12:
            undertone = "warm"
            confidence = min(warmth * 2, 1.0)
        elif warmth < -0.05:
            undertone = "cool"
            confidence = min(abs(warmth) * 2, 1.0)
        elif warmth > 0.05:
            undertone = "warm-neutral"
            confidence = 0.6
        elif warmth < -0.02:
            undertone = "cool-neutral"
            confidence = 0.6
        else:
            undertone = "neutral"
            confidence = 0.7
        
        return {
            "undertone": undertone,
            "confidence": round(confidence, 3),
            "warmth_score": round(warmth, 3),
        }
    
    def _analyze_depth(self, rgb: Tuple[int, int, int]) -> Dict:
        """Analyze depth/value from skin color."""
        lum = calculate_luminance(rgb)
        
        if lum > 0.75:
            depth = "light"
        elif lum > 0.62:
            depth = "light-medium"
        elif lum > 0.48:
            depth = "medium"
        elif lum > 0.32:
            depth = "medium-deep"
        else:
            depth = "deep"
        
        return {
            "depth": depth,
            "luminance": round(lum, 3),
        }
    
    def _analyze_contrast(
        self,
        skin_rgb: Tuple[int, int, int],
        hair_rgb: Tuple[int, int, int]
    ) -> Dict:
        """Analyze contrast between skin and hair."""
        skin_lum = calculate_luminance(skin_rgb)
        hair_lum = calculate_luminance(hair_rgb)
        
        contrast_val = abs(skin_lum - hair_lum)
        
        if contrast_val > 0.5:
            level = "high"
        elif contrast_val > 0.38:
            level = "medium-high"
        elif contrast_val > 0.25:
            level = "medium"
        elif contrast_val > 0.12:
            level = "low-medium"
        else:
            level = "low"
        
        return {
            "contrast_level": level,
            "contrast_value": round(contrast_val, 3),
            "skin_luminance": round(skin_lum, 3),
            "hair_luminance": round(hair_lum, 3),
        }


class SubtypePredictor:
    """Predict Nechama subtype from color features."""
    
    SUBTYPES = {
        # SPRING
        "french_spring": {"season": "spring", "undertone": "warm", "depth": "light", "contrast": "low-medium"},
        "porcelain_spring": {"season": "spring", "undertone": "warm-neutral", "depth": "light", "contrast": "medium"},
        # SUMMER
        "ballerina_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "low"},
        "cameo_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "medium"},
        "chinoiserie_summer": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "low-medium"},
        "degas_summer": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "low"},
        "summer_rose": {"season": "summer", "undertone": "cool", "depth": "light-medium", "contrast": "medium"},
        "sunset_summer": {"season": "summer", "undertone": "cool-neutral", "depth": "medium", "contrast": "medium"},
        "water_lily_summer": {"season": "summer", "undertone": "cool", "depth": "light", "contrast": "low"},
        # AUTUMN
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
        # WINTER
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
    
    DEPTH_ORDER = ["light", "light-medium", "medium", "medium-deep", "deep"]
    CONTRAST_ORDER = ["low", "low-medium", "medium", "medium-high", "high"]
    
    def predict(
        self,
        undertone: str,
        depth: str,
        contrast: str,
        undertone_confidence: float = 1.0
    ) -> Dict:
        """Predict best matching subtype."""
        scores = {}
        
        for code, info in self.SUBTYPES.items():
            score = 0.0
            
            # Undertone match (40% weight)
            if info["undertone"] == undertone:
                score += 0.4
            elif self._undertone_compatible(info["undertone"], undertone):
                score += 0.2
            
            # Depth match (30% weight)
            if info["depth"] == depth:
                score += 0.3
            elif self._adjacent(info["depth"], depth, self.DEPTH_ORDER):
                score += 0.15
            
            # Contrast match (30% weight)
            if info["contrast"] == contrast:
                score += 0.3
            elif self._adjacent(info["contrast"], contrast, self.CONTRAST_ORDER):
                score += 0.15
            
            # Weight by undertone confidence
            score *= (0.5 + 0.5 * undertone_confidence)
            scores[code] = score
        
        # Sort
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best = ranked[0]
        
        return {
            "subtype": best[0],
            "display_name": best[0].replace("_", " ").title(),
            "confidence": round(best[1], 3),
            "season": self.SUBTYPES[best[0]]["season"],
            "alternatives": [
                {"subtype": s[0], "confidence": round(s[1], 3)}
                for s in ranked[1:5]
            ]
        }
    
    def _undertone_compatible(self, expected: str, actual: str) -> bool:
        compat = {
            "warm": ["warm-neutral"],
            "cool": ["cool-neutral"],
            "neutral": ["warm-neutral", "cool-neutral"],
            "warm-neutral": ["warm", "neutral"],
            "cool-neutral": ["cool", "neutral"],
        }
        return actual in compat.get(expected, [])
    
    def _adjacent(self, a: str, b: str, order: List[str]) -> bool:
        try:
            return abs(order.index(a) - order.index(b)) == 1
        except ValueError:
            return False


def analyze_image(image: Image.Image) -> Dict:
    """Complete analysis of a face image."""
    extractor = ColorExtractor(use_mediapipe=False)
    predictor = SubtypePredictor()
    
    colors = extractor.extract_all(image)
    
    prediction = predictor.predict(
        undertone=colors["undertone"]["undertone"],
        depth=colors["depth"]["depth"],
        contrast=colors["contrast"]["contrast_level"],
        undertone_confidence=colors["undertone"]["confidence"]
    )
    
    return {
        "colors": colors,
        "prediction": prediction
    }


# =============================================================================
# NECHAMA'S COLOR NAMES
# =============================================================================

EYE_COLORS = {
    "brown": ["dark_brown", "chocolate_brown", "golden_brown", "amber", "topaz", "honey"],
    "green": ["emerald", "jade", "olive", "sage", "moss", "teal"],
    "blue": ["sapphire", "sky_blue", "steel_blue", "periwinkle", "navy"],
    "gray": ["charcoal", "silver", "slate", "pewter"],
    "hazel": ["hazel_green", "hazel_brown", "hazel_gold"],
    "other": ["black", "violet", "mixed"],
}

HAIR_COLORS = {
    "black": ["blue_black", "soft_black", "black_brown"],
    "brown": ["espresso", "dark_chocolate", "milk_chocolate", "chestnut", "walnut", 
              "caramel", "toffee", "golden_brown", "mousy_brown"],
    "red": ["auburn", "copper", "ginger", "strawberry", "burgundy", "mahogany"],
    "blonde": ["platinum", "ash_blonde", "golden_blonde", "honey_blonde", 
               "champagne", "dirty_blonde", "dark_blonde"],
    "gray": ["silver", "pewter", "salt_pepper", "white", "steel_gray"],
}

SKIN_TONES = {
    "very_light": ["porcelain", "ivory", "alabaster", "fair"],
    "light": ["peaches_cream", "cream", "light_beige", "rose_beige"],
    "light_medium": ["warm_beige", "golden_beige", "nude", "sand"],
    "medium": ["honey", "caramel", "olive", "tan", "bronze"],
    "medium_deep": ["amber", "cinnamon", "toffee", "mocha"],
    "deep": ["espresso", "mahogany", "cocoa", "ebony", "onyx"],
}


def classify_eye_color(hex_color: str) -> str:
    """Classify eye color into Nechama's categories."""
    rgb = hex_to_rgb(hex_color)
    r, g, b = rgb
    
    # Simple heuristic classification
    if r > 150 and g > 100 and b < 100:
        return "amber"
    elif g > r and g > b:
        return "jade" if g > 150 else "olive"
    elif b > r and b > g:
        return "sapphire" if b > 150 else "steel_blue"
    elif abs(r - g) < 30 and abs(g - b) < 30:
        return "charcoal" if r < 100 else "silver"
    else:
        return "chocolate_brown" if r < 150 else "golden_brown"


def classify_hair_color(hex_color: str) -> str:
    """Classify hair color into Nechama's categories."""
    rgb = hex_to_rgb(hex_color)
    lum = calculate_luminance(rgb)
    warmth = calculate_warmth(rgb)
    
    if lum < 0.15:
        return "blue_black" if warmth < 0 else "soft_black"
    elif lum < 0.25:
        return "espresso"
    elif lum < 0.35:
        return "dark_chocolate" if warmth < 0.1 else "auburn"
    elif lum < 0.45:
        return "chestnut" if warmth < 0.15 else "copper"
    elif lum < 0.55:
        return "caramel" if warmth > 0.1 else "mousy_brown"
    elif lum < 0.7:
        return "golden_blonde" if warmth > 0.1 else "ash_blonde"
    else:
        return "platinum" if warmth < 0.05 else "champagne"
