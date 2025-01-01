import math
from coefficients import coeffs, field_events, thons

def calculate_points(event, performance, gender='mens', season='outdoor'):
    """Calculate points from performance"""
    try:
        a = coeffs[gender][season][event]['a']
        b = coeffs[gender][season][event]['b']
        c = coeffs[gender][season][event]['c']
        
        if event in field_events:
            points = math.floor(a * (performance - b) ** c)
        else:
            points = math.floor(a * (b - performance) ** c)
            
        return max(0, min(1400, points))
    except Exception as e:
        raise ValueError(f"Error calculating points: {str(e)}")

def calculate_performance(event, points, gender='mens', season='outdoor'):
    """Calculate performance from points"""
    try:
        a = coeffs[gender][season][event]['a']
        b = coeffs[gender][season][event]['b']
        c = coeffs[gender][season][event]['c']
        
        if points < 0 or points > 1400:
            raise ValueError("Points must be between 0 and 1400")
            
        if event in thons:
            return round(b + (points/a)**(1/c))
        elif event in field_events:
            return round(b + (points/a)**(1/c), 2)
        else:
            return round(b - (points/a)**(1/c), 2)
    except Exception as e:
        raise ValueError(f"Error calculating performance: {str(e)}")