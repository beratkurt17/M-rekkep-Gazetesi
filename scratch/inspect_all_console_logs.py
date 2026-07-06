import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

log_path = r"C:\Users\WOOLF\.gemini\antigravity-ide\brain\79ba6373-7b9d-434c-99ea-4f73434bf375\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        step = json.loads(line)
        content = step.get("content", "")
        # Look for BROWSER_SUBAGENT results that contain the word "logs" or errors
        if step.get("type") == "BROWSER_SUBAGENT" and "verify_timeout_fallback" in step.get("content", ""):
            print("=== SUBAGENT SUMMARY ===")
            print(content)
        # Search for any browser step that output logs
        if "console" in content.lower() and "error" in content.lower():
            print(f"Step {step.get('step_index')} content:")
            print(content[:1000])
