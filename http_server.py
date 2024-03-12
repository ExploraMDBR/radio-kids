import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import json
import threading
from os import listdir
from random import randint
import wave
import re

PORT = 8080 + randint(0, 20)

STATIC_DIR = "public/"

last_error = None
error_page = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="30">
    <title>RAI Radio error message</title>
</head>
<body>
    <p>{}</p>
    <p>Retriying in 5 seconds..</p>
</body>
</html>'''

def create_wav(filename, size, data):
    wav_file = wave.open(filename, "w")

    nchannels = 2
    sampwidth = 2
    framerate = 44100
    nframes = size
    comptype = "NONE"
    compname = "not compressed"

    wav_file.setparams((nchannels, sampwidth, framerate, nframes,
        comptype, compname))

    # for f in data:
    wav_file.writeframes( data )

    wav_file.close()


class Request_Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global last_error

        if last_error:
            self.error(last_error)
            return

        self.parsed = urlparse(self.path)

        if self.path == "/status":
            self.respond(json.dumps({"status": "running"}), 200)
            return

        self.path = STATIC_DIR + self.path

        # if self.path.endswith(".mov"):
        #     self.error("not available")
        #     return

        #STATIC SERVER
        http.server.SimpleHTTPRequestHandler.do_GET(self)



    def do_POST(self):
        if not re.match(r"\/recordings\/.*\.wav", self.path):
            print("received not recording POST request at", self.path)
            self.respond(json.dumps({"status": "not expected"}), 401)
            return

        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        
        print("received:", len(self.data_string), "in path:", self.path)

        try:
            if self.path.startswith("/"):
                self.path = self.path[1:]
            create_wav(self.path, int(self.headers['Content-Length']), self.data_string)
            
        except Exception as e:
            self.error("Could not create wave file")

        self.respond(json.dumps({"status": "received", "length":len(self.data_string)}), 200)

        

    def handle_http(self, msg, status_code):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        return msg

    def respond(self, msg, code = 418):
        response = self.handle_http(msg, code)
        self.wfile.write(response.encode('utf-8'))

    def error(self, err):
        self.send_response(500)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        response = error_page.format(err)
        self.wfile.write(response.encode('utf-8'))

http_server = None
def serve_forever():
    global http_server
    http_server = http.server.ThreadingHTTPServer(("", PORT), Request_Handler)

    # http_server = socketserver.TCPServer(("", PORT), Request_Handler)
    http_server.serve_forever()

t = threading.Thread(target = serve_forever)

def start():
    t.start()

    print("Files to serve:")
    for f in listdir(STATIC_DIR):
        print(f)


def close():
    global http_server
    if http_server:
        http_server.shutdown()
        http_server.server_close()
    if t.is_alive():
        t.join()
