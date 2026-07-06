import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        content = step.get("content", "")
        # Print subagent DOM results
        if "Getting DOM structure" in str(step) or "DOM tree" in content:
            if step.get("type") == "TOOL_OUTPUT":
                print(f"=== DOM Output step {step.get('step_index')} ===")
                print(content[:2000])
