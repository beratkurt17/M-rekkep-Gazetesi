import json

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        if "capture_browser_console_logs" in line:
            # Look at this step or its sibling result steps
            print(f"Step {step.get('step_index')}:")
            print(json.dumps(step, indent=2)[:2000])
