#!/usr/bin/env python3
"""No-cache static server for sim development.

`python3 -m http.server` sends Last-Modified and lets Chrome heuristically
cache pages — after an edit, a reload can silently serve the PREVIOUS build
(mtime granularity is 1 s, and Chrome may not revalidate at all). That served
stale mid-edit copies of sims during review and produced phantom "broken sim"
reports. This server sends Cache-Control: no-store so every reload is fresh.

Usage (from the repo root):  python3 tools/serve.py [port]   # default 8734
"""
import http.server, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8734

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()
    def log_message(self, *args):
        pass

with socketserver.TCPServer(('', PORT), NoCacheHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f'serving (no-store) on http://localhost:{PORT}')
    httpd.serve_forever()
