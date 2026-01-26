# Streams of Color - AI Training Pipeline

Train Nechama Yaffe's personal color analysis AI using CelebA-HQ faces.

## Quick Start

### Step 1: Setup Supabase

1. Create a Supabase project at https://supabase.com
2. Go to **SQL Editor** and paste the entire contents of `schema.sql`
3. Click **Run**
4. Go to **Storage** → Create bucket named `face-images`

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
- `SUPABASE_URL`: Found in Project Settings → API
- `SUPABASE_KEY`: Use the **service_role** key (not anon)

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run Ingestion

```bash
# Start with 1000 images, auto-label them
python ingest.py --max-images 1000 --auto-label

# Or without auto-labeling (label manually later)
python ingest.py --max-images 1000
```

## Nechama's 30 Subtypes

| Season | Subtypes |
|--------|----------|
| **Spring** (2) | French, Porcelain |
| **Summer** (7) | Ballerina, Cameo, Chinoiserie, Degas, Summer Rose, Sunset, Water Lily |
| **Autumn** (11) | Auburn, Burnished, Cloisonne, Grecian, Mellow, Multi-Colored, Oriental, Renaissance, Sunlit, Tapestry, Topaz |
| **Winter** (10) | Burnished, Cameo, Crystal, Exotic, Gemstone, Mediterranean, Ornamental, Silk Road, Tapestry, Winter Rose |

## Label Workflow

```
unlabeled → ai_predicted → manually_labeled → expert_verified → nechama_verified
```

### Review AI Predictions

```sql
-- Get images needing review (high confidence first)
SELECT * FROM v_labeling_queue LIMIT 50;
```

### Confirm a Label

```sql
UPDATE color_labels 
SET 
    confirmed_subtype = 'tapestry_winter',
    label_status = 'manually_labeled',
    labeled_by = 'your_name'
WHERE face_image_id = 'uuid-here';
```

### Check Progress

```sql
SELECT * FROM v_dataset_stats;
SELECT * FROM v_subtype_distribution;
```

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Run in Supabase SQL Editor |
| `ingest.py` | Main ingestion script |
| `color_utils.py` | Color extraction utilities |
| `requirements.txt` | Python dependencies |
| `.env.example` | Environment template |

## Architecture

```
Supabase
├── Storage: face-images/
│   └── celeba-hq/
│       ├── 000001.jpg
│       └── thumbnails/
└── Database
    ├── face_images (uploaded photos)
    ├── color_labels (training data)
    ├── subtype_definitions (30 subtypes)
    ├── paintings (style references)
    └── vocabulary_terms (Nechama's terms)
```

## License

- CelebA-HQ: Non-commercial research only
- This code: MIT
