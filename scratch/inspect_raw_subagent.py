import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        content = step.get("content", "")
        # Print subagent outputs that might contain the logs
        if "capture_browser_console_logs" in content or "console_logs" in content or "DOM" in content:
            print(f"=== Step {step.get('step_index')} ===")
            print(content[:1500])
