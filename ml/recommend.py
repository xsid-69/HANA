"""Train Hana's collaborative-filtering model and publish recommendations."""

import os
import sys

import numpy as np
import pandas as pd
import requests
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds

APP_URL = os.environ.get("APP_URL", "").rstrip("/")
API_SECRET = os.environ.get("ML_API_SECRET", "")
REQUEST_TIMEOUT_SECONDS = 60


def _headers():
    if not APP_URL or not API_SECRET:
        raise RuntimeError("APP_URL and ML_API_SECRET must be set")
    return {"Authorization": f"Bearer {API_SECRET}"}


def fetch_interactions():
    """Fetch all user-companion interactions from the app."""
    response = requests.post(
        f"{APP_URL}/api/ml/interactions",
        headers=_headers(),
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise ValueError("Interactions endpoint did not return an array")
    return payload


def build_matrix(interactions):
    """Build a sparse user-item interaction matrix."""
    df = pd.DataFrame(interactions)
    required = {"userId", "companionId", "weight"}
    if df.empty or not required.issubset(df.columns):
        return None, None, None, None

    df = df.dropna(subset=list(required)).copy()
    df["weight"] = pd.to_numeric(df["weight"], errors="coerce").fillna(0)
    df_agg = df.groupby(["userId", "companionId"], as_index=False)["weight"].sum()
    df_agg["weight"] = df_agg["weight"].clip(lower=0)

    users = df_agg["userId"].unique()
    companions = df_agg["companionId"].unique()
    if not len(users) or not len(companions):
        return None, None, None, None

    user_idx = {user_id: index for index, user_id in enumerate(users)}
    comp_idx = {companion_id: index for index, companion_id in enumerate(companions)}
    rows = df_agg["userId"].map(user_idx).to_numpy()
    cols = df_agg["companionId"].map(comp_idx).to_numpy()
    data = df_agg["weight"].to_numpy(dtype=float)
    matrix = csr_matrix((data, (rows, cols)), shape=(len(users), len(companions)))
    return matrix, users, companions, user_idx


def train_svd(matrix, n_factors=20):
    """Train a truncated SVD model."""
    max_factors = min(matrix.shape) - 1
    if max_factors < 1:
        return None
    factors = min(n_factors, max_factors)
    left, singular_values, right = svds(matrix.astype(float), k=factors)
    return left @ np.diag(singular_values) @ right


def generate_recommendations(matrix, predicted, users, companions, user_idx, top_n=10):
    """Generate top-N positive recommendations for every represented user."""
    recommendations = []
    matrix_dense = matrix.toarray()

    for user_id in users:
        index = user_idx[user_id]
        positive_interactions = matrix_dense[index]
        predicted_ratings = predicted[index]
        candidates = np.where(positive_interactions == 0)[0]
        if not len(candidates):
            continue

        candidate_scores = predicted_ratings[candidates]
        order = np.argsort(candidate_scores, kind="stable")[::-1][:top_n]
        for companion_index in candidates[order]:
            score = float(predicted_ratings[companion_index])
            if np.isfinite(score) and score > 0:
                recommendations.append({
                    "userId": str(user_id),
                    "companionId": str(companions[companion_index]),
                    "score": round(score, 4),
                })

    return recommendations


def save_recommendations(recommendations):
    """Save generated recommendations back to the app."""
    response = requests.post(
        f"{APP_URL}/api/ml/recommendations",
        headers={**_headers(), "Content-Type": "application/json"},
        json={"recommendations": recommendations},
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()


def main():
    print("Fetching interactions...")
    interactions = fetch_interactions()
    print(f"Got {len(interactions)} interactions")
    if len(interactions) < 10:
        print("Not enough data yet. Need at least 10 interactions.")
        return 0

    print("Building matrix...")
    matrix, users, companions, user_idx = build_matrix(interactions)
    if matrix is None:
        print("No valid interactions found.")
        return 0
    print(f"Matrix shape: {matrix.shape}")

    print("Training SVD model...")
    predicted = train_svd(matrix)
    if predicted is None:
        print("Need interactions from at least two users and two companions.")
        return 0

    print("Generating recommendations...")
    recommendations = generate_recommendations(
        matrix, predicted, users, companions, user_idx
    )
    print(f"Generated {len(recommendations)} recommendations")
    if not recommendations:
        print("No positive unseen recommendations were generated.")
        return 0

    print("Saving recommendations...")
    result = save_recommendations(recommendations)
    print("Done!", result)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (requests.RequestException, RuntimeError, ValueError) as error:
        print(f"Recommendation job failed: {error}", file=sys.stderr)
        sys.exit(1)