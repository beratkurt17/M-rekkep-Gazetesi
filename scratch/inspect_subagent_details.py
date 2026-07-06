import json

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        if step.get("type") == "BROWSER_SUBAGENT":
            content = step.get("content", "")
            if "capture_browser_console_logs" in content:
                # Find where it lists Step 24 or Step 46 or Step 58 etc.
                parts = content.split("capture_browser_console_logs")
                for part in parts[1:]:
                    print("--- CAPTURED LOG ---")
                    print(part[:1500])
