from fastapi import FastAPI, UploadFile, File, HTTPException
from app.database import engine
from app.models.user import User, Base
from app.api import user  # <-- Make sure you import the 'user' router correctly
from app.services.stt_service import transcribe_audio
from app.services.tts_service import text_to_speech

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to On Mute Backend"}

# STT endpoint
@app.post("/stt/")
async def stt(file: UploadFile = File(...)):
    try:
        audio_content = await file.read()
        audio_path = "temp_audio.wav"

        with open(audio_path, "wb") as f:
            f.write(audio_content)
        
        # Transcribe audio to text
        transcript = transcribe_audio(audio_path)
        return {"transcript": transcript}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Speech-to-text conversion failed")

# TTS endpoint
@app.post("/tts/")
async def tts(text: str):
    try:
        # Convert text to speech
        audio_content = text_to_speech(text)
        return {"audio_content": audio_content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Text-to-speech conversion failed")