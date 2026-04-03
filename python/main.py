"""
NexusTrade AI – Core Logic Module
- ParcelFlow: Graph-based routing (NetworkX)
- GreenChain: Carbon emission calculation
- TradeMind AI: Delay prediction (scikit-learn LinearRegression)
"""

import json
import numpy as np
import networkx as nx
from sklearn.linear_model import LinearRegression

# ─────────────────────────────────────────────
# 1. PARCELFLOW – Graph-Based Routing
# ─────────────────────────────────────────────

def build_graph():
    """Create a weighted graph of logistics hubs."""
    G = nx.Graph()
    edges = [
        ("A", "B", 10),
        ("A", "C", 15),
        ("B", "C", 12),
        ("B", "D", 15),
        ("C", "D", 10),
        ("C", "E", 20),
        ("D", "E", 8),
        ("A", "D", 25),
        ("B", "E", 22),
    ]
    for u, v, w in edges:
        G.add_edge(u, v, weight=w)
    return G


def get_all_routes(G, source, destination):
    """Generate all simple paths and their total distances."""
    routes = []
    for path in nx.all_simple_paths(G, source, destination):
        distance = sum(
            G[path[i]][path[i + 1]]["weight"] for i in range(len(path) - 1)
        )
        routes.append({"path": path, "distance": distance})
    return routes


# ─────────────────────────────────────────────
# 2. GREENCHAIN – Carbon Calculation
# ─────────────────────────────────────────────

EMISSION_FACTOR = 0.2  # kg CO2 per unit distance


def calculate_carbon(distance):
    """CO2 = distance × emission_factor"""
    return round(distance * EMISSION_FACTOR, 2)


# ─────────────────────────────────────────────
# 3. TRADEMIND AI – Delay Prediction
# ─────────────────────────────────────────────

def _generate_training_data(n=200):
    """Create synthetic dataset for delay prediction."""
    np.random.seed(42)
    distances = np.random.uniform(5, 50, n)
    traffic_levels = np.random.randint(1, 11, n)

    # Delay formula (ground truth with noise):
    #   delay = 0.5*distance + 3*traffic + noise
    delays = (
        0.5 * distances
        + 3.0 * traffic_levels
        + np.random.normal(0, 2, n)
    )
    delays = np.clip(delays, 0, None)

    X = np.column_stack([distances, traffic_levels])
    return X, delays


def train_delay_model():
    """Train a Linear Regression model for delay prediction."""
    X, y = _generate_training_data()
    model = LinearRegression()
    model.fit(X, y)
    return model


def predict_delay(model, distance, traffic_level=5):
    """Predict delay (minutes) for a given route distance."""
    X = np.array([[distance, traffic_level]])
    delay = model.predict(X)[0]
    return round(max(delay, 0), 2)


# ─────────────────────────────────────────────
# 4. DECISION LOGIC – Route Scoring
# ─────────────────────────────────────────────

def score_route(carbon, distance, delay):
    """score = 0.4×carbon + 0.3×distance + 0.3×delay"""
    return round(0.4 * carbon + 0.3 * distance + 0.3 * delay, 2)


def optimize():
    """Run full pipeline: routes → carbon → delay → scoring."""
    source = "A"
    destination = "E"

    G = build_graph()
    model = train_delay_model()

    routes = get_all_routes(G, source, destination)
    if not routes:
        return {"error": f"No routes found from {source} to {destination}"}

    # Enrich each route with carbon, delay, and score
    for route in routes:
        route["carbon"] = calculate_carbon(route["distance"])
        route["delay"] = predict_delay(model, route["distance"])
        route["score"] = score_route(
            route["carbon"], route["distance"], route["delay"]
        )

    # Select best route (lowest score)
    best = min(routes, key=lambda r: r["score"])

    return {
        "routes": [
            {
                "path": r["path"],
                "distance": r["distance"],
                "carbon": r["carbon"],
                "delay": r["delay"],
                "score": r["score"],
            }
            for r in routes
        ],
        "bestRoute": best["path"],
        "metrics": {
            "distance": best["distance"],
            "carbon": best["carbon"],
            "delay": best["delay"],
            "score": best["score"],
        },
    }


# ─────────────────────────────────────────────
# CLI Entry Point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    result = optimize()
    print(json.dumps(result))
