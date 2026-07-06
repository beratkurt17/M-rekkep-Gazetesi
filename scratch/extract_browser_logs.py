import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        if "capture_browser_console_logs" in str(step):
            # Check if this step is a done tool output
            if step.get("type") == "TOOL_OUTPUT" or step.get("status") == "DONE":
                content = step.get("content", "")
                if "console_logs" in str(step) or "page" in str(step) or "log" in str(step).lower():
                    print(f"=== Log output from step {step.get('step_index')} ===")
                    print(content[:1500])
