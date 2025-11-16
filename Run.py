#!/usr/bin/env python3
"""
Run.py

Starts the backend (`npm run dev`) and opens an ngrok tunnel to the configured port (default 5000).
It waits for the ngrok local API and prints the public forwarding URL.
"""
import subprocess
import time
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 5000


def which_bin(name):
    from shutil import which
    return which(name) is not None


def start_server():
    print('Starting dev server: `npm run dev`')
    # Start in a new process; user can stop with Ctrl+C in this terminal
    return subprocess.Popen('npm run dev', shell=True)


def start_ngrok():
    print('Starting ngrok tunnel to port', PORT)
    if which_bin('ngrok'):
        cmd = f'ngrok http {PORT} --log=stdout'
    else:
        # Fall back to npx if available
        cmd = f'npx ngrok http {PORT} --log=stdout'
    return subprocess.Popen(cmd, shell=True)


def get_ngrok_url(retries=10, delay=1):
    api = 'http://127.0.0.1:4040/api/tunnels'
    import requests
    for i in range(retries):
        try:
            r = requests.get(api, timeout=2)
            if r.status_code == 200:
                data = r.json()
                tunnels = data.get('tunnels', [])
                if tunnels:
                    # Prefer https tunnel
                    for t in tunnels:
                        public = t.get('publicUrl') or t.get('public_url') or t.get('public_url')
                        if public and public.startswith('https'):
                            return public
                    # fallback to first
                    public = tunnels[0].get('publicUrl') or tunnels[0].get('public_url')
                    if public:
                        return public
        except Exception:
            pass
        time.sleep(delay)
    return None


def main():
    try:
        import requests
    except Exception:
        print('The `requests` library is required. Install it with `pip install requests`')
        sys.exit(1)

    server = start_server()
    # wait a little for server to boot
    time.sleep(3)
    ngrok = start_ngrok()
    print('Waiting for ngrok to report a public URL...')
    url = get_ngrok_url(retries=30, delay=1)
    if url:
        print('\nngrok public URL:', url)
        print('Health check:', f'{url}/api/health')
    else:
        print('Could not determine ngrok public URL. Check ngrok process logs or run `ngrok http 5000` manually.')
    try:
        server.wait()
    except KeyboardInterrupt:
        print('Interrupted, terminating processes...')
        server.terminate()
        ngrok.terminate()
