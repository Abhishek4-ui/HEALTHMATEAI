import re
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, precision_recall_fscore_support, brier_score_loss
from sklearn.preprocessing import label_binarize

from app.services.symptom_classifier import symptom_classifier
from app.services.health_risk_models import health_risk_models

# 40 Independently authored clinical test vignettes across all 8 disease classes (5 diverse held-out cases per class)
HELD_OUT_TEST_CASES = [
    # 0. Acute Bronchitis
    {"text": "Persistent hacking cough for five days with thick yellowish mucus and slight wheeze", "label": "Acute Bronchitis", "is_emergency": False},
    {"text": "Chest feels congested, low grade fever of 100 F, coughing up phlegm and rattling in airways", "label": "Acute Bronchitis", "is_emergency": False},
    {"text": "Deep bronchial cough that gets worse at night, mild fatigue, and clear to white sputum", "label": "Acute Bronchitis", "is_emergency": False},
    {"text": "Raw burning feeling behind sternum when coughing repeatedly, sore throat, and hoarseness", "label": "Acute Bronchitis", "is_emergency": False},
    {"text": "Coughing fits with mucus production, mild shortness of breath when walking upstairs, and tired", "label": "Acute Bronchitis", "is_emergency": False},

    # 1. Hypertension Crisis / Angina Pectoris (Emergency Red-Flag Presentation)
    {"text": "Severe crushing chest pain radiating down my left arm with cold sweats and dizziness", "label": "Hypertension Crisis / Angina Pectoris", "is_emergency": True},
    {"text": "Heavy pressure in chest like an elephant sitting on me, shortness of breath, and nausea", "label": "Hypertension Crisis / Angina Pectoris", "is_emergency": True},
    {"text": "Sudden substernal tightness, rapid palpitations, sweating profusely, and pain shooting into jaw", "label": "Hypertension Crisis / Angina Pectoris", "is_emergency": True},
    {"text": "Chest discomfort during mild exertion with lightheadedness and feeling like passing out", "label": "Hypertension Crisis / Angina Pectoris", "is_emergency": True},
    {"text": "Severe squeezing pain in chest, breathlessness, vomiting, and numbness in left shoulder", "label": "Hypertension Crisis / Angina Pectoris", "is_emergency": True},

    # 2. Migraine with Aura
    {"text": "Pounding throbbing headache on right side of head with zigzag flashing lights in vision", "label": "Migraine with Aura", "is_emergency": False},
    {"text": "Severe unilateral head pain, extreme sensitivity to room light and sounds, feeling nauseous", "label": "Migraine with Aura", "is_emergency": False},
    {"text": "Visual blind spots followed by intense pulsating headache behind my eye and vomiting", "label": "Migraine with Aura", "is_emergency": False},
    {"text": "Hemicranial throbbing pain aggravated by movement, need to lie in a dark silent bedroom", "label": "Migraine with Aura", "is_emergency": False},
    {"text": "Aura of tingling in fingers then excruciating half-head pain with severe photophobia", "label": "Migraine with Aura", "is_emergency": False},

    # 3. Type 2 Diabetes Mellitus (Decompensated)
    {"text": "Drinking gallons of water daily due to unquenchable thirst, waking up five times to urinate", "label": "Type 2 Diabetes Mellitus (Decompensated)", "is_emergency": False},
    {"text": "Lost 7 kilograms without dieting, constantly hungry, blurred eyesight, and chronic fatigue", "label": "Type 2 Diabetes Mellitus (Decompensated)", "is_emergency": False},
    {"text": "Excessive urination and extreme dry mouth, cuts on feet taking weeks to heal", "label": "Type 2 Diabetes Mellitus (Decompensated)", "is_emergency": False},
    {"text": "Polydipsia and polyuria with foggy vision and feeling exhausted after light daily activities", "label": "Type 2 Diabetes Mellitus (Decompensated)", "is_emergency": False},
    {"text": "Persistent thirst, frequent trips to bathroom all night, and tingling sensation in toes", "label": "Type 2 Diabetes Mellitus (Decompensated)", "is_emergency": False},

    # 4. Gastroesophageal Reflux Disease (GERD)
    {"text": "Burning sensation rising from stomach to throat after dinner, sour acidic fluid in mouth", "label": "Gastroesophageal Reflux Disease (GERD)", "is_emergency": False},
    {"text": "Severe heartburn worse when lying flat, painful swallowing, and chronic dry tickling cough", "label": "Gastroesophageal Reflux Disease (GERD)", "is_emergency": False},
    {"text": "Acid regurgitation into back of mouth when bending over, retrosternal burning after spicy foods", "label": "Gastroesophageal Reflux Disease (GERD)", "is_emergency": False},
    {"text": "Epigastric discomfort and burning under breastbone relieved temporarily by antacids", "label": "Gastroesophageal Reflux Disease (GERD)", "is_emergency": False},
    {"text": "Waking up choking on sour acid taste, persistent burning in esophagus, and throat clearing", "label": "Gastroesophageal Reflux Disease (GERD)", "is_emergency": False},

    # 5. Acute Bacterial Pharyngitis / Tonsillitis
    {"text": "Very painful throat when swallowing, swollen tonsils with white pus exudates and high fever", "label": "Acute Bacterial Pharyngitis / Tonsillitis", "is_emergency": False},
    {"text": "Enlarged tender lymph nodes in neck, raspy throat, inability to swallow solids, fever 102 F", "label": "Acute Bacterial Pharyngitis / Tonsillitis", "is_emergency": False},
    {"text": "Severe odynophagia, bright red inflamed pharynx, tonsillar enlargement, and chills", "label": "Acute Bacterial Pharyngitis / Tonsillitis", "is_emergency": False},
    {"text": "Throat feels like razor blades, fever, headache, and visible yellowish patches on back of throat", "label": "Acute Bacterial Pharyngitis / Tonsillitis", "is_emergency": False},
    {"text": "Swollen glands under jaw, intense throat soreness, loss of appetite due to painful swallowing", "label": "Acute Bacterial Pharyngitis / Tonsillitis", "is_emergency": False},

    # 6. Osteoarthritis / Degenerative Joint Disease
    {"text": "Deep aching knee pain that worsens after climbing stairs, cracking popping sound when walking", "label": "Osteoarthritis / Degenerative Joint Disease", "is_emergency": False},
    {"text": "Morning stiffness in finger joints lasting 15 minutes, bony enlargement and limited flexibility", "label": "Osteoarthritis / Degenerative Joint Disease", "is_emergency": False},
    {"text": "Hip pain on weight bearing, joint crepitus, and gradual reduction in walking distance", "label": "Osteoarthritis / Degenerative Joint Disease", "is_emergency": False},
    {"text": "Bilateral knee joint swelling after standing, stiffness eases with gentle warmth and rest", "label": "Osteoarthritis / Degenerative Joint Disease", "is_emergency": False},
    {"text": "Chronic joint stiffness and dull ache in degenerative spinal joints and hands", "label": "Osteoarthritis / Degenerative Joint Disease", "is_emergency": False},

    # 7. Acute Allergic Rhinitis / Atopic Dermatitis
    {"text": "Nonstop bouts of sneezing, clear runny nose, itchy red watery eyes after pollen exposure", "label": "Acute Allergic Rhinitis / Atopic Dermatitis", "is_emergency": False},
    {"text": "Intensely itchy red rash on inner elbows with dry cracked patches and hives", "label": "Acute Allergic Rhinitis / Atopic Dermatitis", "is_emergency": False},
    {"text": "Nasal congestion, roof of mouth itching, itchy conjunctiva, and watery nasal discharge", "label": "Acute Allergic Rhinitis / Atopic Dermatitis", "is_emergency": False},
    {"text": "Pruritic skin flare-ups, allergic hives across arms, and morning sneezing attacks", "label": "Acute Allergic Rhinitis / Atopic Dermatitis", "is_emergency": False},
    {"text": "Constant eye rubbing, allergic shiners, watery rhinitis, and sneezing when dusting", "label": "Acute Allergic Rhinitis / Atopic Dermatitis", "is_emergency": False},
]

# Out-of-Distribution & Ambiguous Boundary Inputs
OOD_TEST_CASES = [
    {"text": "I feel somewhat tired and run down today", "category": "Ambiguous Symptom"},
    {"text": "My dog has a bad limp on its rear leg and refuses to eat", "category": "Veterinary Domain"},
    {"text": "I need to schedule an oil filter change for my Honda Civic", "category": "Non-Medical Car Maintenance"},
    {"text": "Severe throbbing wisdom tooth ache and gum swelling", "category": "Dental Out-of-Scope"},
    {"text": "qwerty uioplkjh gfdsazxcv bnm", "category": "Nonsense Gibberish"},
]

def run_evaluation():
    diseases = symptom_classifier.diseases
    y_true = []
    y_pred = []
    y_prob = []
    top3_correct = 0
    emergency_true = []
    emergency_pred = []

    print("=================================================================")
    print("HEALTHMATE AI — CLINICAL NLP & RISK MODEL STATISTICAL EVALUATION")
    print(f"Total Held-Out Clinical Test Cases: {len(HELD_OUT_TEST_CASES)}")
    print(f"Total Disease Classes: {len(diseases)}")
    print("=================================================================\n")

    for case in HELD_OUT_TEST_CASES:
        res = symptom_classifier.analyze_symptoms(case["text"])
        true_label = case["label"]
        y_true.append(true_label)

        # Top-1 prediction
        top1 = res["differential_diagnoses"][0]["condition"] if res.get("differential_diagnoses") else "UNKNOWN"
        y_pred.append(top1)

        # Top-3 predictions
        top3_list = [d["condition"] for d in res.get("differential_diagnoses", [])[:3]]
        if true_label in top3_list:
            top3_correct += 1

        # Class probabilities
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", case["text"]).lower().strip()
        vec = symptom_classifier.vectorizer.transform([cleaned])
        probs = symptom_classifier.model.predict_proba(vec)[0]
        y_prob.append(probs)

        # Emergency detection
        emergency_true.append(case["is_emergency"])
        emergency_pred.append(res.get("is_emergency_flagged", False))

    y_true_np = np.array(y_true)
    y_pred_np = np.array(y_pred)
    y_prob_np = np.array(y_prob)

    # 1. Confusion Matrix
    cm = confusion_matrix(y_true, y_pred, labels=diseases)
    print("1. CONFUSION MATRIX (Rows: True Class, Columns: Predicted Class):")
    print("-" * 75)
    for i, disease in enumerate(diseases):
        short_name = disease[:20].ljust(20)
        row_str = " ".join(f"{val:3d}" for val in cm[i])
        print(f"[{i}] {short_name} | {row_str}")
    print("-" * 75)
    print("Legend: " + ", ".join([f"[{i}] {d[:12]}" for i, d in enumerate(diseases)]))
    print()

    # 2. Precision, Recall, F1 per class
    precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred, labels=diseases, zero_division=0)
    print("2. CLASS-WISE PERFORMANCE METRICS:")
    print(f"{'Class':<32} {'Precision':<10} {'Recall (Sens)':<14} {'Specificity':<12} {'F1-Score':<10} {'Support'}")
    print("-" * 88)

    specificities = []
    for i, disease in enumerate(diseases):
        # Calculate specificity: TN / (TN + FP)
        tn = np.sum(cm) - (np.sum(cm[i, :]) + np.sum(cm[:, i]) - cm[i, i])
        fp = np.sum(cm[:, i]) - cm[i, i]
        spec = tn / (tn + fp) if (tn + fp) > 0 else 1.0
        specificities.append(spec)
        print(f"{disease[:30]:<32} {precision[i]:<10.3f} {recall[i]:<14.3f} {spec:<12.3f} {f1[i]:<10.3f} {support[i]}")

    macro_prec = np.mean(precision)
    macro_rec = np.mean(recall)
    macro_f1 = np.mean(f1)
    macro_spec = np.mean(specificities)
    top1_acc = np.mean(y_true_np == y_pred_np)
    top3_acc = top3_correct / len(HELD_OUT_TEST_CASES)

    print("-" * 88)
    print(f"{'MACRO AVERAGE':<32} {macro_prec:<10.3f} {macro_rec:<14.3f} {macro_spec:<12.3f} {macro_f1:<10.3f} {len(HELD_OUT_TEST_CASES)}")
    print(f"\nTop-1 Categorical Accuracy: {top1_acc * 100:.2f}%")
    print(f"Top-3 Differential Inclusion Recall: {top3_acc * 100:.2f}%")

    # 3. Emergency Red-Flag Triage Performance
    em_cm = confusion_matrix(emergency_true, emergency_pred)
    em_tn, em_fp, em_fn, em_tp = em_cm.ravel()
    em_sens = em_tp / (em_tp + em_fn) if (em_tp + em_fn) > 0 else 0
    em_spec = em_tn / (em_tn + em_fp) if (em_tn + em_fp) > 0 else 0
    print("\n3. EMERGENCY RED-FLAG TRIAGE SAFETY:")
    print(f"Total Emergency Presentations Tested: {sum(emergency_true)}")
    print(f"Emergency Sensitivity (True Positive Rate): {em_sens * 100:.2f}% ({em_tp}/{em_tp + em_fn})")
    print(f"Emergency Specificity (True Negative Rate): {em_spec * 100:.2f}% ({em_tn}/{em_tn + em_fp})")

    # 4. Multi-class Brier Score (Calibration)
    y_true_bin = label_binarize(y_true, classes=diseases)
    brier_scores = [brier_score_loss(y_true_bin[:, i], y_prob_np[:, i]) for i in range(len(diseases))]
    mean_brier = np.mean(brier_scores)
    print(f"\n4. MODEL CALIBRATION (Brier Score):")
    print(f"Mean Brier Loss across 8 classes: {mean_brier:.4f} (Lower is better; 0.0 is perfect calibration)")

    # 5. Out-of-Distribution & Uncertainty Evaluation
    print("\n5. OUT-OF-DISTRIBUTION (OOD) & EPISTEMIC UNCERTAINTY HANDLING:")
    print(f"{'Query Text':<45} {'Category':<22} {'Max Prob':<10} {'Entropy':<8} {'Status'}")
    print("-" * 95)
    for ood in OOD_TEST_CASES:
        cleaned = re.sub(r"[^a-zA-Z\s]", " ", ood["text"]).lower().strip()
        vec = symptom_classifier.vectorizer.transform([cleaned])
        probs = symptom_classifier.model.predict_proba(vec)[0]
        max_p = np.max(probs)
        # Shannon Entropy in nats
        entropy = -np.sum(probs * np.log(probs + 1e-12))
        # High entropy or max_p <= 0.30 indicates high uncertainty
        is_uncertain = max_p < 0.35 or entropy > 1.8
        status = "HIGH_UNCERTAINTY" if is_uncertain else "OVERCONFIDENT"
        print(f"{ood['text'][:42]:<45} {ood['category']:<22} {max_p:<10.3f} {entropy:<8.3f} {status}")

    print("\n=================================================================")
    print("EVALUATION COMPLETE — ALL METRICS COMPUTED ON HELD-OUT DATA")
    print("=================================================================")

if __name__ == "__main__":
    run_evaluation()
