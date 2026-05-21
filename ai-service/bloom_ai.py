import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Using Qwen2.5-1.5B-Instruct. 
# It is extremely lightweight (requires <4GB RAM) and highly accurate for text transformation.
MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

# Force models to be downloaded into the local workspace instead of the default global cache
os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "models")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from contextlib import asynccontextmanager

# Global variables to hold the loaded model and tokenizer
ai_model = None
ai_tokenizer = None

def load_local_model():
    print(f"Downloading/Loading {MODEL_NAME} into local workspace...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype="auto", # using torch_dtype as dtype is deprecated
        device_map="auto"
    )
    return model, tokenizer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    global ai_model, ai_tokenizer
    print("Initializing Exam Governance AI Engine (FastAPI)...")
    ai_model, ai_tokenizer = load_local_model()
    yield
    # Clean up the ML model and release the resources
    print("Shutting down AI Engine...")
    ai_model = None
    ai_tokenizer = None
    torch.cuda.empty_cache()

app = FastAPI(lifespan=lifespan)

class Question(BaseModel):
    id: int
    text: str
    targetLevel: str

class GenerateRequest(BaseModel):
    questions: List[Question]
    subject: Optional[str] = None

class GenerateResponse(BaseModel):
    questions: List[dict]

def transform_bloom_question(model, tokenizer, original_question: str, target_bloom_level: str, subject: Optional[str] = None):
    subject_context = f" for the subject of {subject}" if subject else ""
    system_prompt = f"""You are an expert academic evaluator for university examinations{subject_context}.
You must write sophisticated, formal examination questions.
CRITICAL CONSTRAINT: Do NOT start your questions with simple or elementary words such as 'Describe', 'Explain', 'Why', 'How', 'What', or 'Define'.
Instead, use advanced academic framing appropriate for the requested Bloom's taxonomy level (e.g., 'Evaluate the impact of...', 'Analyze the structural differences between...', 'Critique the approach to...', 'Formulate a strategy for...').

You MUST output your response in valid JSON format with exactly two keys:
1. "reasoning": Briefly explain how you will adapt the question to meet the requirements of the '{target_bloom_level}' level of Bloom's Taxonomy without using simple questioning words.
2. "upgraded_question": The final formulated question.

Example JSON output:
{{
  "reasoning": "To reach the Evaluate level, the student must assess a scenario. I will frame the question around comparing architectures.",
  "upgraded_question": "Critique the architectural differences between X and Y."
}}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Upgrade the following question to the '{target_bloom_level}' level of Bloom's Taxonomy. Return ONLY valid JSON.\n\nQuestion: '{original_question}'"}
    ]
    
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=250,
        temperature=0.7
    )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    # Parse JSON chain of thought
    import json
    import re
    try:
        match = re.search(r'\{.*\}', response.replace('\n', ' '), re.DOTALL)
        if match:
            parsed = json.loads(match.group(0))
            return parsed.get("upgraded_question", response.strip())
        else:
            parsed = json.loads(response)
            return parsed.get("upgraded_question", response.strip())
    except Exception as e:
        print(f"Failed to parse JSON: {e}, Raw response: {response}")
        return response.strip()

@app.post("/generate", response_model=GenerateResponse)
async def generate_questions(data: GenerateRequest):
    if ai_model is None or ai_tokenizer is None:
        raise HTTPException(status_code=503, detail="AI Model is not loaded yet.")
    
    final_questions = []
    for q in data.questions:
        print(f"Transforming question {q.id} to {q.targetLevel}...")
        try:
            transformed = transform_bloom_question(ai_model, ai_tokenizer, q.text, q.targetLevel, data.subject)
        except Exception as e:
            print(f"Error transforming question {q.id}: {e}")
            transformed = q.text # fallback to original
            
        final_questions.append({
            "id": q.id,
            "text": q.text,
            "targetLevel": q.targetLevel,
            "transformedText": transformed
        })
        
    return {"questions": final_questions}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
