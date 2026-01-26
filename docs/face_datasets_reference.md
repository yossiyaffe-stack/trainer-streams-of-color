# Consented Face Datasets - Download & API Reference

## Quick Summary Table

| Dataset | Images | Resolution | License | API/Direct Download |
|---------|--------|------------|---------|---------------------|
| FFHQ | 70,000 | 1024×1024 | CC BY-NC-SA 4.0 | Google Drive + Python script |
| CelebA | 202,599 | Varies | Non-commercial research | Google Drive |
| CelebA-HQ | 30,000 | 1024×1024 | Non-commercial research | Google Drive (requires CelebA + deltas) |
| LFW | 13,233 | 250×250 | Research use | Direct download, TensorFlow, scikit-learn |

---

## 1. Flickr-Faces-HQ (FFHQ) - NVIDIA

### Overview
- **70,000** high-quality face images at **1024×1024** resolution
- Created by NVIDIA for StyleGAN research
- Diverse ages, ethnicities, lighting conditions
- Includes eyeglasses, sunglasses, hats, and other accessories
- Images sourced from Flickr under permissive licenses
- Aligned and cropped using dlib face detector

### ⚠️ License Warning
**Non-commercial use only.** Images have mixed licenses:
- Creative Commons BY 2.0
- Creative Commons BY-NC 2.0
- Public Domain Mark 1.0
- Public Domain CC0 1.0
- U.S. Government Works

Dataset itself: **CC BY-NC-SA 4.0** - requires citation and same license for derivatives.

### Download Links (Google Drive)

| Content | Size | Files | URL |
|---------|------|-------|-----|
| **Full Dataset** | 2.56 TB | 210,014 | https://drive.google.com/open?id=1u2xu7bSrWxrbUxk-dT-UvEJq8IjdmNTP |
| Metadata JSON | 255 MB | 1 | https://drive.google.com/open?id=16N0RV4fHI6joBuKbQAoG34V_cQk7vxSA |
| 1024×1024 Images | 89.1 GB | 70,000 | https://drive.google.com/open?id=1tZUcXDBeOibC6jcMCtgRRz67pzrAHeHL |
| 128×128 Thumbnails | 1.95 GB | 70,000 | https://drive.google.com/open?id=1tg-Ur7d4vk1T8Bn0pPpUSQPxlPGBlGfv |
| Original Wild Images | 955 GB | 70,000 | https://drive.google.com/open?id=1ZX7QOy6LZuTLTnsOtQk-kmKq2-69l5hu |
| TFRecords (StyleGAN) | 273 GB | 9 | https://drive.google.com/open?id=1LTBpJ0W_WLjqza3zdayligS8Dh1V1gA6 |
| ZIP Archives | 1.28 TB | 4 | https://drive.google.com/open?id=1WocxvZ4GEZ1DI8dOz30aSj2zT6pkATYS |

### Python Download Script
```bash
# Clone the repository
git clone https://github.com/NVlabs/ffhq-dataset.git
cd ffhq-dataset

# Download options
python download_ffhq.py --json          # Metadata only (254 MB)
python download_ffhq.py --thumbs        # 128x128 thumbnails (1.95 GB)
python download_ffhq.py --images        # 1024x1024 images (89.1 GB)
python download_ffhq.py --wilds         # Original images (955 GB)
python download_ffhq.py --tfrecords     # TFRecords for StyleGAN (273 GB)

# Full options
python download_ffhq.py -h
```

### Script Parameters
```
--num_threads NUM     # Concurrent downloads (default: 32)
--status_delay SEC    # Status update interval (default: 0.2)
--chunk_size KB       # Download chunk size (default: 128)
--num_attempts NUM    # Retries per file (default: 10)
```

### Metadata Structure (JSON)
```json
{
  "0": {
    "category": "training",
    "metadata": {
      "photo_url": "https://www.flickr.com/photos/...",
      "photo_title": "DSCF0899.JPG",
      "author": "Jeremy Frumkin",
      "license": "Attribution-NonCommercial License",
      "license_url": "https://creativecommons.org/...",
      "date_uploaded": "2007-08-16",
      "date_crawled": "2018-10-10"
    },
    "image": {
      "file_url": "https://drive.google.com/...",
      "file_path": "images1024x1024/00000/00000.png",
      "file_size": 1488194,
      "file_md5": "ddeaeea6ce59569643715759d537fd1b",
      "pixel_size": [1024, 1024],
      "face_landmarks": [...]  // 68 dlib landmarks
    },
    "thumbnail": {...},
    "in_the_wild": {
      "face_rect": [667, 410, 1438, 1181],
      "face_landmarks": [...],
      "face_quad": [...]
    }
  }
}
```

### Training/Validation Split
- **Training**: Images 0-59,999 (60,000 images)
- **Validation**: Images 60,000-69,999 (10,000 images)

### GitHub Repository
- https://github.com/NVlabs/ffhq-dataset
- Contact: researchinquiries@nvidia.com

### Privacy/Removal
- Search if your photo is included: https://nvlabs.github.io/ffhq-dataset/search/
- Removal: Tag photo with `no_cv` on Flickr, then email NVIDIA

---

## 2. CelebA (Large-scale CelebFaces Attributes)

### Overview
- **202,599** face images
- **10,177** unique identities (celebrities)
- **40 binary attribute annotations** per image
- **5 facial landmark locations** per image
- Created by CUHK Multimedia Laboratory

### ⚠️ License Warning
**Non-commercial research purposes ONLY.**
- No reproduction, duplication, copying for commercial purposes
- No redistribution or publishing
- Single-site internal use only

### Available Annotations
| Type | Description |
|------|-------------|
| Landmarks | 5 points (eyes, nose, mouth corners) |
| Attributes | 40 binary (glasses, smile, gender, hair color, etc.) |
| Identity | 10,177 celebrity identities |
| Bounding Box | Face detection boxes |

### 40 Attributes
```
5_o_Clock_Shadow, Arched_Eyebrows, Attractive, Bags_Under_Eyes,
Bald, Bangs, Big_Lips, Big_Nose, Black_Hair, Blond_Hair, Blurry,
Brown_Hair, Bushy_Eyebrows, Chubby, Double_Chin, Eyeglasses,
Goatee, Gray_Hair, Heavy_Makeup, High_Cheekbones, Male,
Mouth_Slightly_Open, Mustache, Narrow_Eyes, No_Beard, Oval_Face,
Pale_Skin, Pointy_Nose, Receding_Hairline, Rosy_Cheeks, Sideburns,
Smiling, Straight_Hair, Wavy_Hair, Wearing_Earrings, Wearing_Hat,
Wearing_Lipstick, Wearing_Necklace, Wearing_Necktie, Young
```

### Download Links (Google Drive)
**Primary**: https://drive.google.com/drive/folders/0B7EVK8r0v71pWEZsZE9oNnFzTm8

| File | Description |
|------|-------------|
| `img_celeba.7z` | In-the-wild images (original) |
| `img_align_celeba.zip` | Aligned & cropped images (178×218) |
| `list_landmarks_align_celeba.txt` | Landmark annotations |
| `list_attr_celeba.txt` | 40 attribute annotations |
| `identity_CelebA.txt` | Identity labels |
| `list_eval_partition.txt` | Train/Val/Test splits |

### Alternative Download
- **Baidu Drive**: https://pan.baidu.com/s/1CRxxhoQ97A5qbsKO7iaAJg (password: rp0s)

### Data Splits
| Split | Images |
|-------|--------|
| Training | 162,770 |
| Validation | 19,867 |
| Testing | 19,962 |

### Related Datasets
| Dataset | Description | URL |
|---------|-------------|-----|
| CelebA-HQ | High-quality 1024×1024 subset | See below |
| CelebAMask-HQ | Semantic segmentation masks | https://github.com/switchablenorms/CelebAMask-HQ |
| CelebA-Spoof | Anti-spoofing dataset | https://github.com/Davidzhangyuanhan/CelebA-Spoof |
| CelebA-Dialog | Text-guided editing | https://github.com/yumingj/Talk-to-Edit |
| LFWA+ | LFW-style version | Same Drive folder |

### Citation
```bibtex
@inproceedings{liu2015faceattributes,
  title = {Deep Learning Face Attributes in the Wild},
  author = {Liu, Ziwei and Luo, Ping and Wang, Xiaogang and Tang, Xiaoou},
  booktitle = {ICCV},
  year = {2015}
}
```

### Contact
- Ziwei Liu: https://liuziwei7.github.io/
- Ping Luo: http://personal.ie.cuhk.edu.hk/~pluo/

---

## 3. CelebA-HQ (High Quality)

### Overview
- **30,000** high-quality images at **1024×1024** resolution
- Subset of CelebA with enhanced quality
- Created by NVIDIA for Progressive GAN paper
- Requires CelebA base dataset + delta files to reconstruct

### ⚠️ License Warning
**Non-commercial use only (CC BY-NC 4.0)**

### Reconstruction Process
CelebA-HQ is NOT directly downloadable. You must:
1. Download original CelebA dataset
2. Download delta files (27.6 GB)
3. Run reconstruction script

### Delta Files
**Google Drive**: Available in Progressive GAN repository
- Repository: https://github.com/tkarras/progressive_growing_of_gans
- Delta location: `datasets/celeba-hq-deltas`
- Size: 27.6 GB

### Reconstruction Command
```bash
# Clone Progressive GAN repo
git clone https://github.com/tkarras/progressive_growing_of_gans.git
cd progressive_growing_of_gans

# Download CelebA to ./datasets/celeba/
# Download deltas to ./datasets/celeba-hq-deltas/

# Create CelebA-HQ TFRecords
python dataset_tool.py create_celebahq datasets/celebahq-tfr datasets/celeba datasets/celeba-hq-deltas
```

### Alternative: Pre-built Downloads

#### Hugging Face
```python
from datasets import load_dataset

# Full resolution
dataset = load_dataset("huggan/CelebA-HQ")

# 256x256 version
dataset = load_dataset("korexyz/celeba-hq-256x256")
```

#### Kaggle
- Full HQ: https://www.kaggle.com/datasets/lamsimon/celebahq
- 256×256: https://www.kaggle.com/datasets/badasstechie/celebahq-resized-256x256
- Multi-Modal: https://www.kaggle.com/datasets/kashyapkvh/mm-celeba-hq-dataset

### Related Extensions

#### CelebAMask-HQ
- 30,000 images with **19-class semantic segmentation masks** (512×512)
- Classes: skin, nose, eyes, eyebrows, ears, mouth, lip, hair, hat, eyeglass, earring, necklace, neck, cloth
- GitHub: https://github.com/switchablenorms/CelebAMask-HQ

#### Multi-Modal-CelebA-HQ
- 30,000 images with:
  - Semantic masks
  - Sketches
  - 10 text descriptions per image
  - Transparent background versions
- GitHub: https://github.com/IIGROUP/MM-CelebA-HQ-Dataset

### Citation
```bibtex
@inproceedings{karras2017progressive,
  title={Progressive Growing of GANs for Improved Quality, Stability, and Variation},
  author={Karras, Tero and Aila, Timo and Laine, Samuli and Lehtinen, Jaakko},
  booktitle={ICLR},
  year={2018}
}
```

---

## 4. LFW (Labeled Faces in the Wild)

### Overview
- **13,233** face images
- **5,749** unique individuals
- **1,680** individuals with 2+ images
- Created by UMass Amherst
- Standard benchmark for face verification

### ⚠️ License
**Research use only**

### Download Links

#### Official (UMass)
- Homepage: http://vis-www.cs.umass.edu/lfw/
- Original images: `lfw.tgz`
- Funneled images: `lfw-funneled.tgz`
- Deep funneled: `lfw-deepfunneled.tgz`

#### Kaggle
https://www.kaggle.com/datasets/jessicali9530/lfw-dataset

### Image Versions
| Version | Description | Alignment |
|---------|-------------|-----------|
| Original | Raw web images | None |
| Funneled | Basic alignment | Eyes/nose aligned |
| Deep Funneled | Enhanced alignment | Better pose normalization |
| LFW-a | Alternative alignment | Different method |

### Programmatic Access

#### TensorFlow Datasets
```python
import tensorflow_datasets as tfds

# Load dataset
dataset = tfds.load('lfw', split='train')

# Dataset info
# - 13,233 images
# - 250×250 resolution
# - Labels: person names
```

#### scikit-learn
```python
from sklearn.datasets import fetch_lfw_people, fetch_lfw_pairs

# Face identification (classification)
lfw_people = fetch_lfw_people(
    min_faces_per_person=70,  # Only people with 70+ images
    resize=0.4,               # Resize ratio
    color=False               # Grayscale
)
print(lfw_people.data.shape)  # (1288, 1850) by default
print(lfw_people.target_names)

# Face verification (pairs)
lfw_pairs = fetch_lfw_pairs(
    subset='train'  # 'train', 'test', '10_folds'
)
```

#### Deep Lake / Activeloop
```python
import deeplake

# Load dataset
ds = deeplake.load("hub://activeloop/lfw")

# Iterate
for sample in ds:
    image = sample['images'].numpy()
    label = sample['labels'].text()
```

### Benchmark Pairs
- Standard test: 6,000 pairs (3,000 matched, 3,000 mismatched)
- 10-fold cross-validation recommended
- Pairs files available on official site

### Statistics
| Metric | Value |
|--------|-------|
| Total images | 13,233 |
| Unique people | 5,749 |
| People with ≥2 images | 1,680 |
| People with ≥10 images | 158 |
| Image size | 250×250 |

### Citation
```bibtex
@TechReport{LFWTech,
  author = {Gary B. Huang and Manu Ramesh and Tamara Berg and Erik Learned-Miller},
  title = {Labeled Faces in the Wild: A Database for Studying 
           Face Recognition in Unconstrained Environments},
  institution = {University of Massachusetts, Amherst},
  year = {2007},
  number = {07-49},
  month = {October}
}
```

---

## Comparison: Which Dataset to Use?

### For Training GANs / Diffusion Models
1. **FFHQ** - Best quality, diverse, 1024×1024
2. **CelebA-HQ** - High quality, celebrity faces

### For Face Recognition Research
1. **LFW** - Standard benchmark, verification pairs
2. **CelebA** - Larger scale, identity labels

### For Attribute Prediction
1. **CelebA** - 40 attribute annotations
2. **CelebAMask-HQ** - Semantic segmentation

### For Quick Prototyping
1. **LFW** (smallest, easy scikit-learn integration)
2. **FFHQ thumbnails** (1.95 GB for 128×128)

---

## Legal Considerations Summary

| Dataset | Commercial Use | Attribution Required | Redistribution |
|---------|----------------|---------------------|----------------|
| FFHQ | ❌ No | ✅ Yes (citation) | ⚠️ Same license |
| CelebA | ❌ No | ✅ Yes | ❌ No |
| CelebA-HQ | ❌ No | ✅ Yes | ⚠️ Same license |
| LFW | ❌ Research only | ✅ Yes | ⚠️ Check terms |

**For commercial applications, consult legal counsel before using any of these datasets.**

---

## Quick Start Code Examples

### Download FFHQ Thumbnails
```python
import requests
import os

# Using the official script is recommended
# pip install gdown
import gdown

# Download thumbnails ZIP
url = "https://drive.google.com/uc?id=1tg-Ur7d4vk1T8Bn0pPpUSQPxlPGBlGfv"
output = "ffhq_thumbs128x128.zip"
gdown.download(url, output, quiet=False)
```

### Load CelebA with PyTorch
```python
from torchvision.datasets import CelebA
from torch.utils.data import DataLoader

# Download to ./data (requires manual Google Drive download first)
dataset = CelebA(
    root='./data',
    split='train',
    target_type='attr',  # or 'identity', 'bbox', 'landmarks'
    download=False  # Manual download required
)

loader = DataLoader(dataset, batch_size=32, shuffle=True)
```

### Load LFW with scikit-learn
```python
from sklearn.datasets import fetch_lfw_people
import matplotlib.pyplot as plt

# Auto-downloads on first use
faces = fetch_lfw_people(min_faces_per_person=70)

# Display sample
fig, axes = plt.subplots(2, 5, figsize=(12, 6))
for i, ax in enumerate(axes.flat):
    ax.imshow(faces.images[i], cmap='gray')
    ax.set_title(faces.target_names[faces.target[i]])
    ax.axis('off')
plt.show()
```
