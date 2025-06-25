from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
import subprocess
import tempfile
import os
import shutil

from waitress import serve

""" 
source_file = 'example.txt'

with tempfile.TemporaryDirectory() as tmpdirname:
    destination = os.path.join(tmpdirname, os.path.basename(source_file))
    shutil.copy(source_file, destination)
    print(f"Copied to: {destination}")

"""

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Serve static files (like images) from the root directory
@app.route('/<path:filename>')
def serve_static_file(filename):
    return send_from_directory('.', filename)

@app.route('/compile-groovy', methods=['POST'])
def compile_groovy():
    data = request.get_json()
    # data = request.data.decode('utf-8')
    print('received data:',data.__str__()[:20],'...')

    code = data['data']
    # print(code)
    if not code:
        return jsonify({'error': 'No code provided'}), 400

    with tempfile.TemporaryDirectory() as tmpdirname:
        file_path = os.path.join(tmpdirname, 'iworkflow_execution.groovy')
        with open(file_path, 'w') as f:
            f.write(code)

        try:
            result = subprocess.run(
                f'groovyc "{file_path}"',
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            output = result.stdout + result.stderr
            print('output:',output)
            return jsonify({'output': output})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = 8003
    print(f'''
•       ┓  ┏┓               •┓    
┓┓┏┏┏┓┏┓┃┏ ╋┃┏┓┓┏┏  ┏┏┓┏┳┓┏┓┓┃┏┓┏┓
┗┗┻┛┗┛┛ ┛┗ ┛┗┗┛┗┻┛  ┗┗┛┛┗┗┣┛┗┗┗ ┛ 
                          ┛       
Local compiler service for studio - joel.eldo@tcs.com

Agent is running on port http://localhost:{port}/
    ''')
    # app.run(host='0.0.0.0', port=8003, debug=True)
    serve(app, host='0.0.0.0', port=port)
