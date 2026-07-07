import json
import os

SETTINGS_FILE = "settings.json"

DEFAULT_SETTINGS = {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "top_k": 5,
    "min_similarity": 0.45,
    "temperature": 0.0,
    "max_tokens": 500
}

def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        save_settings(DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
    try:
        with open(SETTINGS_FILE, "r") as f:
            settings = json.load(f)
            # Ensure all keys exist
            for k, v in DEFAULT_SETTINGS.items():
                if k not in settings:
                    settings[k] = v
            return settings
    except Exception:
        return DEFAULT_SETTINGS

def save_settings(settings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)
