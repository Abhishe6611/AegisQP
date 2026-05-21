import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
os.environ["HF_HOME"] = os.path.join(os.path.dirname(__file__), "models")

print(f"Loading {MODEL_NAME}...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype="auto", 
    device_map="auto"
)

prompt = "rephrase this question as level 5 blooms taxonomy question : explain polymorphism in java with example ?"
messages = [
    {"role": "user", "content": prompt}
]

text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)

model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

print("Running Inference...")
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=150,
    temperature=0.7
)

generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(f"\nResponse:\n{response}")
