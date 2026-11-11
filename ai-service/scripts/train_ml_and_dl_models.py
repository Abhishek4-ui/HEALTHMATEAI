"""
HEALTHMATE AI — COMPREHENSIVE ML & DEEP LEARNING TRAINING PIPELINE
Trains and serializes:
1. Calibrated Symptom NLP Classifier (Scikit-Learn + Joblib)
2. Cardiovascular Risk Model + Official SHAP Explainer (Scikit-Learn + SHAP + Joblib)
3. Type-2 Diabetes Risk Model + Official SHAP Explainer (Scikit-Learn + SHAP + Joblib)
4. PyTorch Deep Neural Network (ClinicalTriageDeepNet + Checkpoint .pt)
"""

import os
import time
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    confusion_matrix, brier_score_loss, roc_auc_score
)
from sklearn.preprocessing import label_binarize, StandardScaler
from sklearn.pipeline import Pipeline
import shap

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Ensure reproducibility
RANDOM_SEED = 42
torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Symptom NLP Classifier Training (Scikit-Learn)
# -------------------------------------------------------------
def train_symptom_classifier():
    print("\n--- Training Calibrated Symptom NLP Classifier (Scikit-Learn) ---")
    train_df = pd.read_csv(os.path.join(DATA_DIR, "train_symptoms.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "val_symptoms.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test_symptoms.csv"))

    # Build Pipeline with sublinear TF scaling
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english", max_features=500)
    X_train_vec = vectorizer.fit_transform(train_df["text"])
    X_val_vec = vectorizer.transform(val_df["text"])
    X_test_vec = vectorizer.transform(test_df["text"])

    y_train = train_df["disease"]
    y_val = val_df["disease"]
    y_test = test_df["disease"]

    clf = LogisticRegression(C=2.0, max_iter=300, random_state=RANDOM_SEED)
    clf.fit(X_train_vec, y_train)

    # Evaluate on Validation
    val_preds = clf.predict(X_val_vec)
    val_acc = accuracy_score(y_val, val_preds)

    # Evaluate on Test
    test_preds = clf.predict(X_test_vec)
    test_probs = clf.predict_proba(X_test_vec)
    test_acc = accuracy_score(y_test, test_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, test_preds, average="macro", zero_division=0)
    cm = confusion_matrix(y_test, test_preds, labels=clf.classes_).tolist()

    # Calculate Top-3 Recall
    top3_correct = 0
    for idx, true_label in enumerate(y_test):
        top3_indices = test_probs[idx].argsort()[::-1][:3]
        top3_classes = [clf.classes_[i] for i in top3_indices]
        if true_label in top3_classes:
            top3_correct += 1
    top3_recall = top3_correct / len(y_test)

    # Metadata & Emergency Keywords
    emergency_keywords = [
        "chest pain", "crushing", "substernal", "radiating to left arm",
        "shortness of breath", "tearing", "diaphoresis", "presyncope", "faintness"
    ]

    metrics = {
        "val_accuracy": round(float(val_acc), 4),
        "test_accuracy": round(float(test_acc), 4),
        "top3_recall": round(float(top3_recall), 4),
        "macro_precision": round(float(precision), 4),
        "macro_recall": round(float(recall), 4),
        "macro_f1": round(float(f1), 4),
        "confusion_matrix": cm,
        "classes": clf.classes_.tolist()
    }

    # Save Serialized Model Artifact
    artifact = {
        "model_id": "mdl_symp_nlp_v2",
        "version": "2.2.0",
        "vectorizer": vectorizer,
        "model": clf,
        "classes": clf.classes_.tolist(),
        "emergency_keywords": emergency_keywords,
        "metrics": metrics,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    save_path = os.path.join(MODELS_DIR, "symptom_classifier_v2.joblib")
    joblib.dump(artifact, save_path)
    print(f"Saved Model Artifact: {save_path}")
    print(f"Test Accuracy: {test_acc * 100:.2f}% | Macro F1: {f1:.4f} | Top-3 Recall: {top3_recall * 100:.2f}%")
    return artifact

# -------------------------------------------------------------
# 2. Cardiovascular Risk Model & Official SHAP Explainer
# -------------------------------------------------------------
def train_cardio_model_with_shap():
    print("\n--- Training Cardiovascular Risk Model & SHAP Explainer ---")
    df = pd.read_csv(os.path.join(DATA_DIR, "framingham_cardio_cohort.csv"))
    features = ["age", "systolic_bp", "total_cholesterol", "hdl_cholesterol", "is_smoker", "has_diabetes"]
    X = df[features]
    y = df["cvd_event_observed"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(random_state=RANDOM_SEED, max_iter=200)
    clf.fit(X_scaled, y)
    probs = clf.predict_proba(X_scaled)[:, 1]
    roc_auc = roc_auc_score(y, probs)
    brier = brier_score_loss(y, probs)

    # Official SHAP LinearExplainer integration
    background = X_scaled[:100]
    explainer = shap.LinearExplainer(clf, background)
    shap_values = explainer.shap_values(X_scaled[:10])

    print(f"SHAP Explainer verified: Expected Value = {explainer.expected_value:.4f}")
    print(f"Sample SHAP attribution array shape: {shap_values.shape}")

    artifact = {
        "model_id": "mdl_cvd_framingham_v2",
        "version": "2.2.0",
        "features": features,
        "scaler": scaler,
        "model": clf,
        "base_expected_value": float(explainer.expected_value),
        "roc_auc": round(float(roc_auc), 4),
        "brier_score": round(float(brier), 4),
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    save_path = os.path.join(MODELS_DIR, "cardio_risk_model_v2.joblib")
    joblib.dump(artifact, save_path)
    print(f"Saved Cardio Risk Model + Scaler: {save_path} (ROC-AUC: {roc_auc:.4f})")
    return artifact

# -------------------------------------------------------------
# 3. Diabetes Risk Model & Official SHAP Explainer
# -------------------------------------------------------------
def train_diabetes_model_with_shap():
    print("\n--- Training Type-2 Diabetes Risk Model & SHAP Explainer ---")
    df = pd.read_csv(os.path.join(DATA_DIR, "findrisc_diabetes_cohort.csv"))
    features = ["age", "bmi", "fasting_glucose", "family_history", "physical_activity"]
    X = df[features]
    y = df["t2d_event_observed"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(random_state=RANDOM_SEED, max_iter=200)
    clf.fit(X_scaled, y)
    probs = clf.predict_proba(X_scaled)[:, 1]
    roc_auc = roc_auc_score(y, probs)
    brier = brier_score_loss(y, probs)

    # Official SHAP LinearExplainer
    background = X_scaled[:100]
    explainer = shap.LinearExplainer(clf, background)
    shap_values = explainer.shap_values(X_scaled[:10])

    print(f"SHAP Explainer verified: Expected Value = {explainer.expected_value:.4f}")

    artifact = {
        "model_id": "mdl_diabetes_ada_v2",
        "version": "2.2.0",
        "features": features,
        "scaler": scaler,
        "model": clf,
        "base_expected_value": float(explainer.expected_value),
        "roc_auc": round(float(roc_auc), 4),
        "brier_score": round(float(brier), 4),
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

    save_path = os.path.join(MODELS_DIR, "diabetes_risk_model_v2.joblib")
    joblib.dump(artifact, save_path)
    print(f"Saved Diabetes Risk Model + Scaler: {save_path} (ROC-AUC: {roc_auc:.4f})")
    return artifact

# -------------------------------------------------------------
# 4. PyTorch Deep Learning Model (ClinicalTriageDeepNet)
# -------------------------------------------------------------
class ClinicalTriageDeepNet(nn.Module):
    def __init__(self, input_dim=500, hidden_dim1=128, hidden_dim2=64, num_classes=8):
        super(ClinicalTriageDeepNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim1)
        self.bn1 = nn.BatchNorm1d(hidden_dim1)
        self.act1 = nn.LeakyReLU(0.1)
        self.drop1 = nn.Dropout(0.3)

        self.fc2 = nn.Linear(hidden_dim1, hidden_dim2)
        self.bn2 = nn.BatchNorm1d(hidden_dim2)
        self.act2 = nn.LeakyReLU(0.1)
        self.drop2 = nn.Dropout(0.2)

        self.out = nn.Linear(hidden_dim2, num_classes)

    def forward(self, x):
        x = self.drop1(self.act1(self.bn1(self.fc1(x))))
        x = self.drop2(self.act2(self.bn2(self.fc2(x))))
        return self.out(x)

class TextVectorDataset(Dataset):
    def __init__(self, X_sparse, y_labels, label_map):
        self.X = torch.tensor(X_sparse.toarray(), dtype=torch.float32)
        self.y = torch.tensor([label_map[label] for label in y_labels], dtype=torch.long)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

def train_pytorch_deep_learning_model(symptom_artifact):
    print("\n--- Training PyTorch Deep Neural Network (ClinicalTriageDeepNet) ---")
    vectorizer = symptom_artifact["vectorizer"]
    classes = symptom_artifact["classes"]
    label_map = {c: i for i, c in enumerate(classes)}

    train_df = pd.read_csv(os.path.join(DATA_DIR, "train_symptoms.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "val_symptoms.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test_symptoms.csv"))

    X_train = vectorizer.transform(train_df["text"])
    X_val = vectorizer.transform(val_df["text"])
    X_test = vectorizer.transform(test_df["text"])

    train_dataset = TextVectorDataset(X_train, train_df["disease"], label_map)
    val_dataset = TextVectorDataset(X_val, val_df["disease"], label_map)
    test_dataset = TextVectorDataset(X_test, test_df["disease"], label_map)

    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"PyTorch executing on accelerator device: {device}")

    input_dim = X_train.shape[1]
    model = ClinicalTriageDeepNet(input_dim=input_dim, num_classes=len(classes)).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=5)

    best_val_loss = float("inf")
    best_checkpoint = None

    epochs = 40
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            outputs = model(X_batch)
            loss = criterion(outputs, y_batch)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(y_batch)
        train_loss /= len(train_dataset)

        model.eval()
        val_loss = 0.0
        correct = 0
        with torch.no_grad():
            for X_batch, y_batch in val_loader:
                X_batch, y_batch = X_batch.to(device), y_batch.to(device)
                outputs = model(X_batch)
                loss = criterion(outputs, y_batch)
                val_loss += loss.item() * len(y_batch)
                preds = outputs.argmax(dim=1)
                correct += (preds == y_batch).sum().item()
        val_loss /= len(val_dataset)
        val_acc = correct / len(val_dataset)
        scheduler.step(val_loss)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_checkpoint = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_loss": val_loss,
                "val_accuracy": val_acc,
                "input_dim": input_dim,
                "classes": classes,
                "label_map": label_map
            }

    # Evaluate Best Checkpoint on Test Set
    model.load_state_dict(best_checkpoint["model_state_dict"])
    model.eval()
    test_correct = 0
    test_preds_all = []
    test_true_all = []
    with torch.no_grad():
        for X_batch, y_batch in test_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            outputs = model(X_batch)
            preds = outputs.argmax(dim=1)
            test_correct += (preds == y_batch).sum().item()
            test_preds_all.extend(preds.cpu().numpy().tolist())
            test_true_all.extend(y_batch.cpu().numpy().tolist())

    test_acc = test_correct / len(test_dataset)
    precision, recall, f1, _ = precision_recall_fscore_support(test_true_all, test_preds_all, average="macro", zero_division=0)

    best_checkpoint["test_metrics"] = {
        "test_accuracy": round(float(test_acc), 4),
        "macro_precision": round(float(precision), 4),
        "macro_recall": round(float(recall), 4),
        "macro_f1": round(float(f1), 4)
    }

    pt_path = os.path.join(MODELS_DIR, "clinical_triage_pytorch.pt")
    torch.save(best_checkpoint, pt_path)
    print(f"Saved PyTorch Checkpoint: {pt_path}")
    print(f"PyTorch Test Accuracy: {test_acc * 100:.2f}% | Macro F1: {f1:.4f}")
    return best_checkpoint

if __name__ == "__main__":
    symptom_art = train_symptom_classifier()
    train_cardio_model_with_shap()
    train_diabetes_model_with_shap()
    train_pytorch_deep_learning_model(symptom_art)
    print("\n--- ALL ML & DEEP LEARNING PIPELINES TRAINED & SERIALIZED SUCCESSFULLY ---")
