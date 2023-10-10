from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    httpd = HTTPServer(('localhost', 8082), CORSHTTPRequestHandler)
    httpd.serve_forever()
