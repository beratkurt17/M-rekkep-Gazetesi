import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        if step.get("type") == "BROWSER_SUBAGENT":
            content = step.get("content", "")
            if "verify_app_booted" in content:
                print(content)
