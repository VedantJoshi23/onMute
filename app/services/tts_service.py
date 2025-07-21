# app/services/tts_service.py

from app.services.model_loader import model, tokenizer, device

def text_to_speech(text):
    """Convert text to speech using Gemma 3n"""
    inputs = tokenizer(text, return_tensors="pt").to(device)

    # Generate audio output (Here it's text generation for simplicity)
    with torch.no_grad():
        audio_output = model.generate(**inputs, max_length=500)

    # Decode the audio output
    audio_content = tokenizer.decode(audio_output[0], skip_special_tokens=True)
    return audio_content
