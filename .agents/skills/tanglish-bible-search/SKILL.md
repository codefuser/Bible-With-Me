---
name: tanglish-bible-search
description: Tanglish, Phonetic Tamil, and English multi-tier search engine for Bible Web App
---

# Tanglish & Phonetic Bible Search Skill

This skill defines the multi-tier search architecture:

## Pipeline Tiers
1. **Reference Detection**: Parse queries like `John 3:16`, `yovan 3 16`, `gen 1:1`, `sangitham 23`.
2. **Exact Text Matching**: Substring matching in English and Tamil text.
3. **Phonetic Transliteration**: Map Tanglish keywords (e.g. `anbu` → `அன்பு`, `devan` → `தேவன்`, `yesu` → `இயேசு`, `karthar` → `கர்த்தர்`, `ratham` → `ரத்தம்`, `vishwasam` → `விசுவாசம்`) to Tamil Unicode equivalents.
4. **Prefix & Fuzzy Search**: Substring matching across normalized text tokens.
