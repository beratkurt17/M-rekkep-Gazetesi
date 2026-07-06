import json

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        if "test_live_connection" in str(step) or "verify_timeout_fallback" in str(step):
            # Print steps of type TOOL_OUTPUT to find console logs
            if step.get("type") == "TOOL_OUTPUT":
                content = step.get("content", "")
                if "console" in str(step).lower() or "error" in str(step).lower():
                    print(f"=== TOOL OUTPUT Step {step.get('step_index')} ===")
                    print(content[:2000])
