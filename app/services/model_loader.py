import os
import torch
import kagglehub
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Define where the Gemma 3n model will be stored
MODEL_PATH = "google/gemma-3n-e2b"  # You can change this path if needed

def download_model():
    """
    Download the Gemma 3n model using KaggleHub, only if it's not already downloaded.
    """
    if not os.path.exists(MODEL_PATH):
        print("Downloading the Gemma 3n model...")
        path = kagglehub.model_download("google/gemma-3n/transformers/gemma-3n-e2b")
        print(f"Model downloaded to: {path}")
        return path
    else:
        print("Model is already downloaded.")
        return MODEL_PATH

def load_model():
    """
    Load the Gemma 3n model and tokenizer from the downloaded files.
    Moves the model to GPU if available.
    """
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

    # Move the model to GPU (if available)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"Model loaded on device: {device}")
    return model, tokenizer

# Ensure model is downloaded and loaded when this file is imported
download_model()
model, tokenizer = load_model()
