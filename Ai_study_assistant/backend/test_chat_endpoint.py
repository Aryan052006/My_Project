import requests
import time
import subprocess

print("Starting server...")
proc = subprocess.Popen([r".\venv\Scripts\uvicorn", "main:app", "--port", "8005"])
time.sleep(10) # wait for models to load

print("Sending request 1...")
res1 = requests.post("http://127.0.0.1:8005/chat", json={"question": "What is the difference between primary market vs secondary market?"})
print("Res 1:", res1.json())

print("Sending request 2...")
res2 = requests.post("http://127.0.0.1:8005/chat", json={"question": "Tell me what is the case study given on this topic."})
print("Res 2:", res2.json())

proc.terminate()
