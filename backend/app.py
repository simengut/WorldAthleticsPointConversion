from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import calculate_points, calculate_performance, field_events, thons

app = Flask(__name__)
CORS(app)

# Add the COMPETITION_POINTS dictionary
COMPETITION_POINTS = {
    'OW': { # Olympic/World Championships
        1: 375, 2: 330, 3: 300, 4: 270, 5: 250, 6: 230, 7: 215, 8: 200,
        9: 130, 10: 120, 11: 110, 12: 100, 13: 95, 14: 90, 15: 85, 16: 80
    },
    'DF': { # Diamond Final
        1: 240, 2: 210, 3: 185, 4: 170, 5: 155, 6: 145, 7: 135, 8: 125,
        9: 90, 10: 80, 11: 70, 12: 60
    },
    'GW': { # Diamond League
        1: 200, 2: 170, 3: 150, 4: 140, 5: 130, 6: 120, 7: 110, 8: 100,
        9: 70, 10: 60, 11: 50, 12: 45
    },
    'GL': { # Continental Gold
        1: 170, 2: 145, 3: 130, 4: 120, 5: 110, 6: 100, 7: 90, 8: 80,
        9: 60, 10: 50, 11: 45, 12: 40
    },
    'A': { # Category A
        1: 140, 2: 120, 3: 110, 4: 100, 5: 90, 6: 80, 7: 70, 8: 60
    },
    'B': { # Category B
        1: 100, 2: 80, 3: 70, 4: 60, 5: 55, 6: 50, 7: 45, 8: 40
    },
    'C': { # Category C
        1: 60, 2: 50, 3: 45, 4: 40, 5: 35, 6: 30, 7: 27, 8: 25
    },
    'D': { # Category D
        1: 40, 2: 35, 3: 30, 4: 25, 5: 22, 6: 19, 7: 17, 8: 15
    },
    'E': { # Category E
        1: 25, 2: 21, 3: 18, 4: 15, 5: 12, 6: 10
    },
    'F': { # Category F
        1: 15, 2: 10, 3: 5
    }
}

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

@app.route("/api/calculate-performances-batch", methods=["POST"])
def performances_batch_endpoint():
    try:
        data = request.json
        print("Received data:", data)
        
        base_points = data.get('base_points')
        event_type = data.get('event_type')
        gender = data.get('gender', 'mens')
        season = data.get('season', 'outdoor')
        
        if not all([base_points, event_type, gender, season]):
            return jsonify({
                "error": "Missing required fields",
                "received": {
                    "base_points": base_points,
                    "event_type": event_type,
                    "gender": gender,
                    "season": season
                }
            }), 400
            
        results = {}
        for meet in COMPETITION_POINTS:
            meet_results = {}
            for place, bonus in COMPETITION_POINTS[meet].items():
                try:
                    # Calculate the required points for this position
                    required_points = base_points + bonus
                    
                    # Try to calculate performance
                    try:
                        performance = calculate_performance(event_type, required_points, gender, season)
                        meet_results[place] = performance
                    except ValueError as e:
                        # If calculation fails due to points being too high
                        print(f"Performance calculation failed for {required_points} points: {e}")
                        meet_results[place] = None
                        
                except Exception as e:
                    print(f"Error calculating performance: {e}")
                    meet_results[place] = None
            results[meet] = meet_results
            
        return jsonify({"performances": results})
    except Exception as e:
        print(f"Error in batch endpoint: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001, debug=True)