# app/services/stt_service.py

import librosa
import torch
from app.services.model_loader import model, tokenizer, device

def preprocess_audio(audio_file_path):
    """Preprocess the audio file to spectrogram"""
    audio, sr = librosa.load(audio_file_path, sr=16000)
    spectrogram = librosa.stft(audio)  # Converts to spectrogram
    spectrogram_tensor = torch.tensor(spectrogram).unsqueeze(0).to(device)  # Convert to tensor
    return spectrogram_tensor

def transcribe_audio(audio_file_path):
    """Transcribe audio to text using Gemma 3n"""
    audio_input = preprocess_audio(audio_file_path)

    # Forward pass through the model
    with torch.no_grad():
        output = model.generate(audio_input)

    # Decode the output into text
    transcript = tokenizer.decode(output[0], skip_special_tokens=True)
    return transcript
