from flask import Flask, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# MongoDB client setup
client = MongoClient('mongodb://localhost:27017/')  # Adjust the URI as needed

db = client['luxus_brecho_db']  # Use your database name

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify(status='UP'), 200

if __name__ == '__main__':
    app.run(debug=True)
