#!/usr/bin/env python3
"""
STREAMS OF COLOR - Art Museum API Integration
==============================================
Fetches paintings from free museum APIs for artists Nechama references.

Supported APIs:
- Metropolitan Museum of Art (Met)
- Art Institute of Chicago
- Rijksmuseum (Amsterdam)
- Cleveland Museum of Art
- Harvard Art Museums (requires free API key)

Usage:
    python fetch_paintings.py --output ./paintings
    python fetch_paintings.py --artist "Monet" --limit 50
    python fetch_paintings.py --all --limit 20
"""

import os
import json
import time
import requests
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from urllib.parse import quote

# =============================================================================
# NECHAMA'S REFERENCED ARTISTS (extracted from algorithm files)
# =============================================================================

NECHAMA_ARTISTS = {
    # Artist name -> search variations for different APIs
    "Monet": ["Claude Monet", "Monet"],
    "Vermeer": ["Johannes Vermeer", "Jan Vermeer", "Vermeer"],
    "Da Vinci": ["Leonardo da Vinci", "Leonardo", "Da Vinci"],
    "Modigliani": ["Amedeo Modigliani", "Modigliani"],
    "Corot": ["Jean-Baptiste-Camille Corot", "Camille Corot", "Corot"],
    "Cassatt": ["Mary Cassatt", "Cassatt"],
    "Renoir": ["Pierre-Auguste Renoir", "Renoir"],
    "Sargent": ["John Singer Sargent", "Sargent"],
    "Rossetti": ["Dante Gabriel Rossetti", "Rossetti"],
    "Degas": ["Edgar Degas", "Degas"],
    "Matisse": ["Henri Matisse", "Matisse"],
    "Picasso": ["Pablo Picasso", "Picasso"],
    "Van Gogh": ["Vincent van Gogh", "Van Gogh"],
    "Gauguin": ["Paul Gauguin", "Gauguin"],
    "Manet": ["Édouard Manet", "Edouard Manet", "Manet"],
    "El Greco": ["El Greco", "Domenikos Theotokopoulos"],
    "Ingres": ["Jean-Auguste-Dominique Ingres", "Ingres"],
    "Odilon Redon": ["Odilon Redon", "Redon"],
}

# Map artists to subtypes they represent
ARTIST_SUBTYPES = {
    "Monet": ["Ballerina Summer", "Water Lily Summer", "Chinoiserie Summer"],
    "Vermeer": ["Summer Rose", "Porcelain Winter", "Renaissance Autumn"],
    "Da Vinci": ["Sunlit Autumn", "Tapestry Winter", "Mediterranean Winter"],
    "Modigliani": ["Mellow Autumn", "Tapestry Winter", "Burnished Autumn"],
    "Corot": ["Burnished Autumn", "Mellow Autumn", "Tapestry Autumn"],
    "Cassatt": ["French Spring", "Ballerina Summer"],
    "Renoir": ["French Spring"],
    "Sargent": ["Cloisonne Autumn", "Renaissance Autumn", "Cameo Summer"],
    "Rossetti": ["Water Lily Summer", "Cloisonne Autumn"],
    "Degas": ["Degas Summer", "Cameo Summer"],
    "Matisse": ["Crystal Winter", "Water Lily Summer"],
    "Picasso": ["Crystal Winter"],
    "Van Gogh": ["Sunlit Autumn"],
    "Gauguin": ["Burnished Autumn", "Multi-Colored Autumn"],
    "Manet": ["Chinoiserie Summer", "Cameo Summer"],
    "El Greco": ["Mediterranean Winter"],
    "Ingres": ["Cameo Summer"],
    "Odilon Redon": ["French Spring"],
}


@dataclass
class Painting:
    """Standardized painting record from any museum API"""
    id: str
    title: str
    artist: str
    date: str
    medium: str
    image_url: str
    thumbnail_url: str
    source: str  # met, chicago, rijks, cleveland, harvard
    source_url: str
    dimensions: Optional[str] = None
    department: Optional[str] = None
    culture: Optional[str] = None
    colors: Optional[List[str]] = None  # Extracted dominant colors if available
    suggested_subtypes: Optional[List[str]] = None


# =============================================================================
# METROPOLITAN MUSEUM OF ART API
# =============================================================================

class MetMuseumAPI:
    """
    Met Museum Open Access API
    Docs: https://metmuseum.github.io/
    No API key required
    """
    BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1"
    
    def search(self, query: str, limit: int = 20) -> List[Painting]:
        """Search Met collection and return paintings with images"""
        paintings = []
        
        # Search for object IDs
        search_url = f"{self.BASE_URL}/search?q={quote(query)}&hasImages=true"
        resp = requests.get(search_url)
        
        if resp.status_code != 200:
            print(f"Met search failed: {resp.status_code}")
            return paintings
        
        data = resp.json()
        object_ids = data.get("objectIDs", [])[:limit * 2]  # Get extra to filter
        
        for obj_id in object_ids:
            if len(paintings) >= limit:
                break
                
            painting = self._get_object(obj_id)
            if painting:
                paintings.append(painting)
            
            time.sleep(0.1)  # Rate limiting
        
        return paintings
    
    def _get_object(self, object_id: int) -> Optional[Painting]:
        """Fetch single object details"""
        url = f"{self.BASE_URL}/objects/{object_id}"
        resp = requests.get(url)
        
        if resp.status_code != 200:
            return None
        
        obj = resp.json()
        
        # Only include if has primary image and is a painting
        if not obj.get("primaryImage"):
            return None
        
        # Filter to paintings (not sculptures, etc)
        classification = obj.get("classification", "").lower()
        if classification and "painting" not in classification and "canvas" not in obj.get("medium", "").lower():
            # Be more lenient - include if it has an image
            pass
        
        return Painting(
            id=f"met_{object_id}",
            title=obj.get("title", "Untitled"),
            artist=obj.get("artistDisplayName", "Unknown"),
            date=obj.get("objectDate", ""),
            medium=obj.get("medium", ""),
            image_url=obj.get("primaryImage", ""),
            thumbnail_url=obj.get("primaryImageSmall", obj.get("primaryImage", "")),
            source="met",
            source_url=obj.get("objectURL", ""),
            dimensions=obj.get("dimensions"),
            department=obj.get("department"),
            culture=obj.get("culture"),
        )


# =============================================================================
# ART INSTITUTE OF CHICAGO API
# =============================================================================

class ChicagoArtAPI:
    """
    Art Institute of Chicago API
    Docs: https://api.artic.edu/docs/
    No API key required
    """
    BASE_URL = "https://api.artic.edu/api/v1"
    IIIF_URL = "https://www.artic.edu/iiif/2"
    
    def search(self, query: str, limit: int = 20) -> List[Painting]:
        """Search Chicago Art Institute collection"""
        paintings = []
        
        url = f"{self.BASE_URL}/artworks/search"
        params = {
            "q": query,
            "limit": limit,
            "fields": "id,title,artist_display,date_display,medium_display,image_id,dimensions,department_title,color",
        }
        
        resp = requests.get(url, params=params)
        
        if resp.status_code != 200:
            print(f"Chicago search failed: {resp.status_code}")
            return paintings
        
        data = resp.json()
        
        for item in data.get("data", []):
            image_id = item.get("image_id")
            if not image_id:
                continue
            
            # Extract colors if available
            colors = None
            if item.get("color"):
                colors = [item["color"].get("h"), item["color"].get("s"), item["color"].get("l")]
            
            paintings.append(Painting(
                id=f"chicago_{item['id']}",
                title=item.get("title", "Untitled"),
                artist=item.get("artist_display", "Unknown"),
                date=item.get("date_display", ""),
                medium=item.get("medium_display", ""),
                image_url=f"{self.IIIF_URL}/{image_id}/full/843,/0/default.jpg",
                thumbnail_url=f"{self.IIIF_URL}/{image_id}/full/200,/0/default.jpg",
                source="chicago",
                source_url=f"https://www.artic.edu/artworks/{item['id']}",
                dimensions=item.get("dimensions"),
                department=item.get("department_title"),
                colors=colors,
            ))
        
        return paintings


# =============================================================================
# RIJKSMUSEUM API
# =============================================================================

class RijksmuseumAPI:
    """
    Rijksmuseum API (Amsterdam)
    Docs: https://data.rijksmuseum.nl/object-metadata/api/
    Requires free API key: https://www.rijksmuseum.nl/en/rijksstudio
    """
    BASE_URL = "https://www.rijksmuseum.nl/api/en/collection"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("RIJKS_API_KEY")
    
    def search(self, query: str, limit: int = 20) -> List[Painting]:
        """Search Rijksmuseum collection"""
        if not self.api_key:
            print("Rijksmuseum requires API key. Set RIJKS_API_KEY env var.")
            print("Get free key at: https://www.rijksmuseum.nl/en/rijksstudio")
            return []
        
        paintings = []
        
        params = {
            "key": self.api_key,
            "q": query,
            "ps": limit,  # page size
            "imgonly": "true",
            "type": "painting",
        }
        
        resp = requests.get(self.BASE_URL, params=params)
        
        if resp.status_code != 200:
            print(f"Rijksmuseum search failed: {resp.status_code}")
            return paintings
        
        data = resp.json()
        
        for item in data.get("artObjects", []):
            web_image = item.get("webImage", {})
            if not web_image:
                continue
            
            # Extract colors if available
            colors = None
            if item.get("colors"):
                colors = [c.get("hex") for c in item["colors"][:5]]
            
            paintings.append(Painting(
                id=f"rijks_{item['objectNumber']}",
                title=item.get("title", "Untitled"),
                artist=item.get("principalOrFirstMaker", "Unknown"),
                date=item.get("longTitle", "").split(",")[-1].strip() if "," in item.get("longTitle", "") else "",
                medium="Oil on canvas",  # Rijks doesn't always provide this in search
                image_url=web_image.get("url", ""),
                thumbnail_url=item.get("headerImage", {}).get("url", web_image.get("url", "")),
                source="rijksmuseum",
                source_url=item.get("links", {}).get("web", ""),
                colors=colors,
            ))
        
        return paintings


# =============================================================================
# CLEVELAND MUSEUM OF ART API
# =============================================================================

class ClevelandMuseumAPI:
    """
    Cleveland Museum of Art Open Access API
    Docs: https://openaccess-api.clevelandart.org/
    No API key required
    """
    BASE_URL = "https://openaccess-api.clevelandart.org/api/artworks"
    
    def search(self, query: str, limit: int = 20) -> List[Painting]:
        """Search Cleveland Museum collection"""
        paintings = []
        
        params = {
            "q": query,
            "has_image": 1,
            "limit": limit,
            "type": "Painting",
        }
        
        resp = requests.get(self.BASE_URL, params=params)
        
        if resp.status_code != 200:
            print(f"Cleveland search failed: {resp.status_code}")
            return paintings
        
        data = resp.json()
        
        for item in data.get("data", []):
            images = item.get("images", {})
            if not images or not images.get("web"):
                continue
            
            paintings.append(Painting(
                id=f"cleveland_{item['id']}",
                title=item.get("title", "Untitled"),
                artist=item.get("creators", [{}])[0].get("description", "Unknown") if item.get("creators") else "Unknown",
                date=item.get("creation_date", ""),
                medium=item.get("technique", ""),
                image_url=images.get("web", {}).get("url", ""),
                thumbnail_url=images.get("print", {}).get("url", images.get("web", {}).get("url", "")),
                source="cleveland",
                source_url=item.get("url", ""),
                dimensions=item.get("dimensions", {}).get("framed"),
                department=item.get("department"),
                culture=item.get("culture", [None])[0] if item.get("culture") else None,
            ))
        
        return paintings


# =============================================================================
# HARVARD ART MUSEUMS API
# =============================================================================

class HarvardArtAPI:
    """
    Harvard Art Museums API
    Docs: https://harvardartmuseums.org/collections/api
    Requires free API key
    """
    BASE_URL = "https://api.harvardartmuseums.org"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("HARVARD_API_KEY")
    
    def search(self, query: str, limit: int = 20) -> List[Painting]:
        """Search Harvard Art Museums collection"""
        if not self.api_key:
            print("Harvard requires API key. Set HARVARD_API_KEY env var.")
            print("Get free key at: https://harvardartmuseums.org/collections/api")
            return []
        
        paintings = []
        
        params = {
            "apikey": self.api_key,
            "q": query,
            "size": limit,
            "hasimage": 1,
            "classification": "Paintings",
        }
        
        resp = requests.get(f"{self.BASE_URL}/object", params=params)
        
        if resp.status_code != 200:
            print(f"Harvard search failed: {resp.status_code}")
            return paintings
        
        data = resp.json()
        
        for item in data.get("records", []):
            primary_image = item.get("primaryimageurl")
            if not primary_image:
                continue
            
            # Extract colors if available
            colors = None
            if item.get("colors"):
                colors = [c.get("color") for c in item["colors"][:5]]
            
            paintings.append(Painting(
                id=f"harvard_{item['id']}",
                title=item.get("title", "Untitled"),
                artist=item.get("people", [{}])[0].get("name", "Unknown") if item.get("people") else "Unknown",
                date=item.get("dated", ""),
                medium=item.get("medium", ""),
                image_url=primary_image,
                thumbnail_url=primary_image.replace("full/full", "full/200,") if "full/full" in primary_image else primary_image,
                source="harvard",
                source_url=item.get("url", ""),
                dimensions=item.get("dimensions"),
                department=item.get("division"),
                culture=item.get("culture"),
                colors=colors,
            ))
        
        return paintings


# =============================================================================
# MAIN FETCHER
# =============================================================================

class ArtFetcher:
    """Main class to fetch art from all APIs"""
    
    def __init__(self, rijks_key: str = None, harvard_key: str = None):
        self.met = MetMuseumAPI()
        self.chicago = ChicagoArtAPI()
        self.rijks = RijksmuseumAPI(rijks_key)
        self.cleveland = ClevelandMuseumAPI()
        self.harvard = HarvardArtAPI(harvard_key)
    
    def fetch_artist(self, artist_name: str, limit_per_source: int = 10) -> List[Painting]:
        """Fetch paintings by a specific artist from all sources"""
        all_paintings = []
        search_terms = NECHAMA_ARTISTS.get(artist_name, [artist_name])
        
        for term in search_terms:
            print(f"  Searching for: {term}")
            
            # Met Museum
            paintings = self.met.search(term, limit_per_source)
            print(f"    Met: {len(paintings)} paintings")
            all_paintings.extend(paintings)
            
            # Chicago
            paintings = self.chicago.search(term, limit_per_source)
            print(f"    Chicago: {len(paintings)} paintings")
            all_paintings.extend(paintings)
            
            # Cleveland
            paintings = self.cleveland.search(term, limit_per_source)
            print(f"    Cleveland: {len(paintings)} paintings")
            all_paintings.extend(paintings)
            
            # Rijksmuseum (if key available)
            paintings = self.rijks.search(term, limit_per_source)
            if paintings:
                print(f"    Rijksmuseum: {len(paintings)} paintings")
                all_paintings.extend(paintings)
            
            # Harvard (if key available)
            paintings = self.harvard.search(term, limit_per_source)
            if paintings:
                print(f"    Harvard: {len(paintings)} paintings")
                all_paintings.extend(paintings)
            
            time.sleep(0.5)  # Be nice to APIs
        
        # Add suggested subtypes
        subtypes = ARTIST_SUBTYPES.get(artist_name, [])
        for p in all_paintings:
            p.suggested_subtypes = subtypes
        
        # Deduplicate by title similarity
        unique = {}
        for p in all_paintings:
            key = f"{p.artist.lower()}_{p.title.lower()[:30]}"
            if key not in unique:
                unique[key] = p
        
        return list(unique.values())
    
    def fetch_all_nechama_artists(self, limit_per_source: int = 10) -> Dict[str, List[Painting]]:
        """Fetch paintings for all artists Nechama references"""
        results = {}
        
        for artist in NECHAMA_ARTISTS.keys():
            print(f"\n🎨 Fetching: {artist}")
            paintings = self.fetch_artist(artist, limit_per_source)
            results[artist] = paintings
            print(f"  Total: {len(paintings)} unique paintings")
        
        return results
    
    def save_results(self, results: Dict[str, List[Painting]], output_dir: str):
        """Save results to JSON files"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save per-artist files
        for artist, paintings in results.items():
            filename = output_path / f"{artist.lower().replace(' ', '_')}.json"
            with open(filename, 'w') as f:
                json.dump([asdict(p) for p in paintings], f, indent=2)
            print(f"Saved: {filename} ({len(paintings)} paintings)")
        
        # Save combined file
        all_paintings = []
        for paintings in results.values():
            all_paintings.extend(paintings)
        
        combined_file = output_path / "all_paintings.json"
        with open(combined_file, 'w') as f:
            json.dump([asdict(p) for p in all_paintings], f, indent=2)
        print(f"\nSaved combined: {combined_file} ({len(all_paintings)} total paintings)")
        
        # Save summary
        summary = {
            "total_paintings": len(all_paintings),
            "artists": {artist: len(paintings) for artist, paintings in results.items()},
            "sources": {},
        }
        for p in all_paintings:
            summary["sources"][p.source] = summary["sources"].get(p.source, 0) + 1
        
        summary_file = output_path / "summary.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"Saved summary: {summary_file}")
        
        return combined_file


def main():
    parser = argparse.ArgumentParser(description="Fetch paintings from museum APIs")
    parser.add_argument("--output", "-o", default="./paintings", help="Output directory")
    parser.add_argument("--artist", "-a", help="Fetch specific artist only")
    parser.add_argument("--all", action="store_true", help="Fetch all Nechama's artists")
    parser.add_argument("--limit", "-l", type=int, default=10, help="Limit per source per artist")
    parser.add_argument("--rijks-key", help="Rijksmuseum API key")
    parser.add_argument("--harvard-key", help="Harvard Art Museums API key")
    
    args = parser.parse_args()
    
    fetcher = ArtFetcher(
        rijks_key=args.rijks_key,
        harvard_key=args.harvard_key
    )
    
    if args.artist:
        print(f"🎨 Fetching paintings by: {args.artist}")
        paintings = fetcher.fetch_artist(args.artist, args.limit)
        results = {args.artist: paintings}
    elif args.all:
        print("🎨 Fetching all Nechama's referenced artists...")
        results = fetcher.fetch_all_nechama_artists(args.limit)
    else:
        # Default: fetch a sample
        print("🎨 Fetching sample (Monet, Vermeer, Sargent)...")
        results = {}
        for artist in ["Monet", "Vermeer", "Sargent"]:
            paintings = fetcher.fetch_artist(artist, args.limit)
            results[artist] = paintings
    
    fetcher.save_results(results, args.output)
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
