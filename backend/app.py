from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import calculate_points, calculate_performance, field_events, thons

app = Flask(__name__)
CORS(app)

@app.route("/api/calculate-points", methods=["POST"])
def points_endpoint():
    try:
        data = request.json
        event_type = data.get('event_type')
        performance = float(data.get('performance'))
        gender = data.get('gender', 'mens')
        season = data.get('season', 'outdoor')
        
        points = calculate_points(event_type, performance, gender, season)
        return jsonify({"points": points})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/calculate-performance", methods=["POST"])
def performance_endpoint():
    try:
        data = request.json
        event_type = data.get('event_type')
        points = int(data.get('points'))
        gender = data.get('gender', 'mens')
        season = data.get('season', 'outdoor')
        
        performance = calculate_performance(event_type, points, gender, season)
        return jsonify({"performance": performance})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001, debug=True)