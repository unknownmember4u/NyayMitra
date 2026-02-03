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
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini (New SDK)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("Gemini Client Initialized (google-genai SDK)")
    except Exception as e:
        print(f"Error initializing Gemini Client: {e}")
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

# Initialize Whisper model
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
    language_code = request.form.get('language')  # Get language code (mr, hi, en)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # Transcribe audio with FORCED language if provided
        segments, info = model_whisper.transcribe(
            tmp_path, 
            beam_size=5, 
            language=language_code if language_code else None
        )
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

import json
import datetime
import re

@app.route('/analyze', methods=['POST'])
def analyze():
    if not client:
        return jsonify({"error": "Gemini Client not initialized (Check API Key)"}), 500
        
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""
    You are a helpful legal assistant for 'NyayMitra'.
    
    INPUT TEXT: "{text}"
    
    TASK:
    1. LANGUAGE: Identify the language (Marathi, Hindi, or English).
    2. DESCRIPTION: Simply correct the grammar and spelling of the input text. 
       - Keep it as a NORMAL, SIMPLE sentence or paragraph. 
       - Do NOT write a formal legal complaint or petition.
       - Do NOT add headers like "Subject:" or "To the Hon'ble Court".
       - STRICTLY keep the output in the SAME language as the input.
    3. CATEGORY: Classify into [civil, criminal, family, consumer].
    4. URGENCY: Classify into [high, medium, low].

    JSON STRUCTURE (Return ONLY raw JSON):
    {{
        "category": "...",
        "description": "...",
        "urgency": "..."
    }}
    """

    # Try a short list of free-tier-friendly / current Gemini models in order
    preferred_models = [
        'gemini-2.5-flash'
    ]

    last_exception = None
    for model_name in preferred_models:
        try:
            print(f"[{datetime.datetime.utcnow().isoformat()}] Trying Gemini model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )

            content = response.text.strip()

            # Clean code-block markdown if present
            if content.startswith("```"):
                content = content.replace("```json", "").replace("```", "").strip()

            # Try to parse JSON from content (either raw JSON or embedded)
            parsed = None
            try:
                parsed = json.loads(content)
            except Exception:
                match = re.search(r"\{[\s\S]*\}", content)
                if match:
                    try:
                        parsed = json.loads(match.group())
                    except Exception:
                        parsed = None

            category = parsed.get('category') if parsed else None
            description_out = parsed.get('description') if parsed else None
            urgency = parsed.get('urgency') if parsed else None

            # Log to terminal with timestamp and small snippet
            print(f"[{datetime.datetime.utcnow().isoformat()}] Gemini model '{model_name}' responded. Snippet: {repr(content[:300])}")

            # Return structured JSON to frontend including model name and raw content
            return jsonify({
                'category': category,
                'description': description_out or content,
                'urgency': urgency,
                'model': model_name,
                'raw': content
            })

        except Exception as e:
            last_exception = e
            print(f"[{datetime.datetime.utcnow().isoformat()}] Gemini model '{model_name}' failed: {e}")
            continue

    # If we get here, all models failed
    return jsonify({"error": "All Gemini models failed", "detail": str(last_exception)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
