# Art Museum API Integration for Streams of Color

Fetches paintings from free museum APIs for all artists Nechama references in her color subtypes.

## Supported Museums (FREE APIs)

| Museum | API Key Required | Best For |
|--------|------------------|----------|
| **Metropolitan Museum of Art** | ❌ No | Broad collection, Impressionists |
| **Art Institute of Chicago** | ❌ No | Monet, Impressionists |
| **Cleveland Museum of Art** | ❌ No | European masters |
| **Rijksmuseum** | ✅ Free key | Vermeer, Dutch masters |
| **Harvard Art Museums** | ✅ Free key | Diverse collection |

## Quick Start

```bash
# Install
pip install -r requirements.txt

# Fetch sample (Monet, Vermeer, Sargent) - no API keys needed
python fetch_paintings.py

# Fetch ALL Nechama's artists
python fetch_paintings.py --all --limit 20

# Fetch specific artist
python fetch_paintings.py --artist "Monet" --limit 50

# With API keys for more results
python fetch_paintings.py --all \
  --rijks-key YOUR_RIJKS_KEY \
  --harvard-key YOUR_HARVARD_KEY
```

## Get Free API Keys

1. **Rijksmuseum**: https://www.rijksmuseum.nl/en/rijksstudio (create account)
2. **Harvard Art Museums**: https://harvardartmuseums.org/collections/api

## Nechama's Referenced Artists

Extracted from her algorithm files:

| Artist | Subtypes |
|--------|----------|
| Monet | Ballerina Summer, Water Lily Summer, Chinoiserie Summer |
| Vermeer | Summer Rose, Porcelain Winter, Renaissance Autumn |
| Da Vinci | Sunlit Autumn, Tapestry Winter, Mediterranean Winter |
| Modigliani | Mellow Autumn, Tapestry Winter, Burnished Autumn |
| Corot | Burnished Autumn, Mellow Autumn, Tapestry Autumn |
| Cassatt | French Spring, Ballerina Summer |
| Renoir | French Spring |
| Sargent | Cloisonne Autumn, Renaissance Autumn, Cameo Summer |
| Rossetti | Water Lily Summer, Cloisonne Autumn |
| Degas | Degas Summer, Cameo Summer |
| Matisse | Crystal Winter, Water Lily Summer |
| Picasso | Crystal Winter |
| Van Gogh | Sunlit Autumn |
| Gauguin | Burnished Autumn, Multi-Colored Autumn |
| Manet | Chinoiserie Summer, Cameo Summer |
| El Greco | Mediterranean Winter |
| Ingres | Cameo Summer |
| Odilon Redon | French Spring |

## Output Format

Creates JSON files in `./paintings/`:

```
paintings/
├── monet.json           # All Monet paintings
├── vermeer.json         # All Vermeer paintings
├── ...
├── all_paintings.json   # Combined file
└── summary.json         # Stats
```

Each painting record:

```json
{
  "id": "met_436535",
  "title": "Water Lilies",
  "artist": "Claude Monet",
  "date": "1906",
  "medium": "Oil on canvas",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "source": "met",
  "source_url": "https://www.metmuseum.org/art/collection/search/436535",
  "suggested_subtypes": ["Ballerina Summer", "Water Lily Summer"]
}
```

## Integration with Lovable/Supabase

After fetching paintings:

1. Upload images to Supabase Storage
2. Insert records into `paintings` table
3. Link to subtypes via `painting_subtype_links` table

```sql
-- Example insert
INSERT INTO paintings (title, artist_name, source, source_url, image_url)
VALUES ('Water Lilies', 'Claude Monet', 'met', 'https://...', 'https://...');
```
