import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Using Qwen2.5-1.5B-Instruct. 
# It is extremely lightweight (requires <4GB RAM) and highly accurate for text transformation.
MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

# Force models to be downloaded into the local workspace instead of the default global cache
os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "models")

def load_local_model():
    print(f"Downloading/Loading {MODEL_NAME} into local workspace...")
    
    # Auto-detect if a GPU is available (CUDA)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        dtype="auto", 
        device_map="auto"
    )
    return model, tokenizer

def transform_bloom_question(model, tokenizer, original_question: str, target_bloom_level: str):
    messages = [
        {"role": "system", "content": "You are an expert academic evaluator for university examinations."},
        {"role": "user", "content": f"Upgrade the following question to the '{target_bloom_level}' level of Bloom's Taxonomy. Return ONLY the upgraded question text, without any explanations.\n\nQuestion: '{original_question}'"}
    ]
    
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)
    
    print("\n--- Running AI Inference ---")
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=100,
        temperature=0.7
    )
    
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    
    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return response

if __name__ == "__main__":
    print("Initializing Exam Governance AI Engine...\n")
    model, tokenizer = load_local_model()
    
    question = "Define Operating System."
    target_level = "Analyze"
    
    print(f"Original Question: {question}")
    print(f"Target Level: {target_level}")
    
    upgraded_q = transform_bloom_question(model, tokenizer, question, target_level)
    print(f"\nResult: {upgraded_q}")
