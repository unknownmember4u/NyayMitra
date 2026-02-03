import os
import sys

# Workaround for ctranslate2/faster-whisper WinError 3 bug on Windows
if os.name == 'nt':
    orig_add_dll_directory = os.add_dll_directory
    def patched_add_dll_directory(path):
        if os.path.exists(path):
            return orig_add_dll_directory(path)
        return None # Ignore paths that don't exist
    os.add_dll_directory = patched_add_dll_directory

import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model_gemini = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")
    model_gemini = None

# Initialize Whisper model
# 'base' is good for multi-language (Hindi/Marathi)
print("Loading Whisper model...")
try:
    model_whisper = WhisperModel("base", device="cpu", compute_type="int8")
except Exception as e:
    print(f"Error loading Whisper: {e}")
    model_whisper = None

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if not model_whisper:
        return jsonify({"error": "Whisper model not loaded"}), 500
        
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file"}), 400
    
    audio_file = request.files['audio']
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # Transcribe audio (Hindi, Marathi, etc. are supported)
        segments, info = model_whisper.transcribe(tmp_path, beam_size=5)
        text = " ".join([segment.text for segment in segments])
        
        return jsonify({
            "text": text.strip(),
            "language": info.language,
            "probability": info.language_probability
        })
    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/analyze', methods=['POST'])
def analyze():
    if not model_gemini:
        return jsonify({"error": "Gemini API key not configured"}), 500
        
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""
    You are a legal assistant for 'NyayMitra', an Indian legal aid platform.
    Analyze the following legal complaint (it might be a transcription of Hindi/Marathi).
    
    Text: "{text}"
    
    Task:
    1. Determine the category: MUST BE one of [civil, criminal, family, consumer].
    2. Professional Description: Rewrite the input into a clear, professional legal summary in English.
    3. Urgency: Determine urgency level: MUST BE one of [high, medium, low].
    
    Return ONLY a JSON object like this:
    {{
        "category": "...",
        "description": "...",
        "urgency": "..."
    }}
    """

    try:
        response = model_gemini.generate_content(prompt)
        content = response.text.strip()
        
        # Clean markdown if present
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:].strip()
        
        return content # Gemini usually returns valid JSON if prompted correctly
    except Exception as e:
        print(f"Gemini error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
