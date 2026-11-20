/**
 * HealthMate AI — Comprehensive All-Body X-Ray & Radiology Examination Catalogue
 * Strictly maps anatomical regions, specific examinations, standard radiographic views,
 * and genuine AI model compatibility.
 */

export const RADIOLOGY_CATALOGUE = [
  {
    id: 'CHEST_THORAX',
    regionName: 'Chest and Thorax',
    examinations: [
      { id: 'CXR_STANDARD', name: 'Chest X-Ray (Standard)', views: ['PA View', 'AP View', 'Lateral View', 'Not Sure'], aiModelSupported: true, modelId: 'alg_cxr_anatomical_screen_v1' },
      { id: 'CXR_PORTABLE', name: 'Portable Chest X-Ray', views: ['AP View', 'Lateral Decubitus', 'Not Sure'], aiModelSupported: true, modelId: 'alg_cxr_anatomical_screen_v1' },
      { id: 'RIBS', name: 'Ribs Radiograph', views: ['Oblique View', 'AP View', 'PA View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'STERNUM', name: 'Sternum X-Ray', views: ['Lateral View', 'RAO Oblique', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'CLAVICLE', name: 'Clavicle X-Ray', views: ['AP View', 'Axial (Lordotic)', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'SCAPULA', name: 'Scapula X-Ray', views: ['AP View', 'Scapular Y-View', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'HEAD_FACE',
    regionName: 'Head and Face',
    examinations: [
      { id: 'SKULL', name: 'Skull X-Ray', views: ['AP View', 'Lateral View', 'Townes View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'FACIAL_BONES', name: 'Facial Bones X-Ray', views: ['Waters View', 'Caldwell View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'NASAL_BONES', name: 'Nasal Bones X-Ray', views: ['Lateral View (Bilateral)', 'Waters View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'PARANASAL_SINUSES', name: 'Paranasal Sinuses (PNS)', views: ['Waters View', 'Caldwell View', 'Open Mouth Waters', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ORBITS', name: 'Orbits X-Ray', views: ['Modified Waters', 'Rheese View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'MANDIBLE', name: 'Mandible X-Ray', views: ['PA Mandible', 'Oblique Lateral', 'Towne View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'MASTOIDS', name: 'Mastoids X-Ray', views: ['Schuller View', 'Mayer View', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'SPINE',
    regionName: 'Spine and Vertebrae',
    examinations: [
      { id: 'CERVICAL_SPINE', name: 'Cervical Spine', views: ['AP View', 'Lateral View', 'Open Mouth Odontoid', 'Flexion/Extension', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'THORACIC_SPINE', name: 'Thoracic (Dorsal) Spine', views: ['AP View', 'Lateral View', 'Swimmers View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'LUMBAR_SPINE', name: 'Lumbar Spine', views: ['AP View', 'Lateral View', 'Oblique View (L1-L5)', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'LUMBOSACRAL', name: 'Lumbosacral Spine (LS Spine)', views: ['AP View', 'Lateral View', 'L5-S1 Spot Lateral', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'SACRUM_COCCYX', name: 'Sacrum and Coccyx', views: ['AP Axial Sacrum', 'AP Axial Coccyx', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'WHOLE_SPINE_SCOLIOSIS', name: 'Whole Spine / Scoliosis Series', views: ['Full Spine Standing PA', 'Full Spine Standing Lateral', 'Bending Views', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'SHOULDER_UPPER_LIMB',
    regionName: 'Shoulder and Upper Limb',
    examinations: [
      { id: 'SHOULDER', name: 'Shoulder Joint', views: ['AP External Rotation', 'AP Internal Rotation', 'Axillary View', 'Y-Scapular View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'HUMERUS', name: 'Humerus (Arm)', views: ['AP View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ELBOW', name: 'Elbow Joint', views: ['AP View', 'Lateral (90 deg)', 'Oblique View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'FOREARM', name: 'Forearm (Radius & Ulna)', views: ['AP View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'WRIST', name: 'Wrist Joint', views: ['PA View', 'Lateral View', 'Scaphoid Views', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'HAND', name: 'Hand', views: ['PA View', 'Oblique View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'FINGERS_THUMB', name: 'Fingers / Thumb', views: ['PA View', 'Lateral View', 'Oblique View', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'PELVIS_HIP',
    regionName: 'Pelvis and Hip',
    examinations: [
      { id: 'PELVIS_AP', name: 'Pelvis (Standard)', views: ['AP View', 'Inlet View', 'Outlet View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'HIP_JOINT', name: 'Hip Joint (Unilateral)', views: ['AP View', 'Frog-Leg Lateral', 'Cross-Table Lateral', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'BILATERAL_HIPS', name: 'Bilateral Hips', views: ['AP Pelvis & Hips', 'Bilateral Frog-Leg', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'SACROILIAC_JOINTS', name: 'Sacroiliac (SI) Joints', views: ['AP Axial (30 deg cephalic)', 'Oblique Views', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ACETABULUM', name: 'Acetabulum (Judet Views)', views: ['Iliac Oblique', 'Obturator Oblique', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'LOWER_LIMB',
    regionName: 'Lower Limb',
    examinations: [
      { id: 'FEMUR', name: 'Femur (Thigh)', views: ['AP View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'KNEE_STANDARD', name: 'Knee Joint (Standard)', views: ['AP View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'KNEE_WEIGHT_BEARING', name: 'Weight-Bearing Knee (Bilateral)', views: ['Standing AP View', 'Rosenberg View (45 deg flexion)', 'Skyline View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'PATELLA', name: 'Patella (Kneecap)', views: ['PA View', 'Lateral View', 'Skyline (Merchant/Sunrise)', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'TIBIA_FIBULA', name: 'Tibia and Fibula (Leg)', views: ['AP View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ANKLE', name: 'Ankle Joint', views: ['AP View', 'Mortise View (15-20 deg internal)', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'CALCANEUS', name: 'Calcaneus (Heel)', views: ['Axial Plantodorsal', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'FOOT', name: 'Foot', views: ['AP / Dorsoplantar', 'Medial Oblique', 'Lateral View', 'Weight-Bearing Foot', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'TOES', name: 'Toes', views: ['AP View', 'Oblique View', 'Lateral View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'LEG_LENGTH_SCANOGRAM', name: 'Leg Length Measurement (Scanogram)', views: ['Bilateral Standing Long Leg View', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'ABDOMEN',
    regionName: 'Abdomen and Pelvis',
    examinations: [
      { id: 'ABDOMEN_KUB', name: 'Abdomen KUB (Kidney, Ureters, Bladder)', views: ['Supine AP View', 'Erect AP View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ABDOMEN_ACUTE', name: 'Acute Abdomen Series', views: ['Erect Chest PA', 'Erect Abdomen AP', 'Supine Abdomen AP', 'Left Lateral Decubitus', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'ABDOMEN_DECUBITUS', name: 'Abdominal Decubitus View', views: ['Left Lateral Decubitus (Horizontal Beam)', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
  {
    id: 'DENTAL',
    regionName: 'Dental and Maxillofacial',
    examinations: [
      { id: 'DENTAL_OPG', name: 'Orthopantomogram (OPG / Panoramic)', views: ['Full Panoramic Tomography', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'DENTAL_IOPA', name: 'Intraoral Periapical (IOPA)', views: ['Periapical View', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'DENTAL_BITEWING', name: 'Bitewing Radiograph', views: ['Premolar Bitewing', 'Molar Bitewing', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'DENTAL_OCCLUSAL', name: 'Occlusal Radiograph', views: ['Maxillary Occlusal', 'Mandibular Occlusal', 'Not Sure'], aiModelSupported: false, modelId: null },
      { id: 'CEPHALOMETRIC', name: 'Lateral Cephalogram', views: ['Lateral Cephalometric Projection', 'PA Cephalometric', 'Not Sure'], aiModelSupported: false, modelId: null },
    ],
  },
];

/**
 * Separate catalogues for CT, MRI, Ultrasound, and ECG
 */
export const CT_STUDIES = [
  'CT Brain / Head (Non-Contrast)',
  'CT Brain / Head (Contrast-Enhanced)',
  'CT Chest / HRCT Thorax',
  'CT Abdomen and Pelvis (Triphasic)',
  'CT Cervical Spine',
  'CT Lumbar Spine',
  'CT Angiography (Coronary / Cerebral / Peripheral)',
  'CT Paranasal Sinuses (PNS) Coronal / Axial',
  'CT Temporal Bones / Mastoid',
  'CT Musculoskeletal Joint Evaluation',
];

export const MRI_STUDIES = [
  'MRI Brain (T1, T2, FLAIR, DWI/ADC)',
  'MRI Cervical Spine',
  'MRI Lumbo-Sacral Spine',
  'MRI Knee Joint (Meniscus & Ligaments)',
  'MRI Shoulder Joint (Rotator Cuff)',
  'MRI Hip Joint (Avascular Necrosis Screen)',
  'MRI Abdomen / MRCP (Biliary Tree)',
  'MRI Pelvis (Prostate / Uterine)',
  'MRI Cardiac Morphology & Function',
];

export const ULTRASOUND_STUDIES = [
  'Ultrasound Whole Abdomen & Pelvis',
  'Ultrasound KUB & Prostate',
  'Obstetric Sonography (Anomaly Scan / Growth)',
  'Ultrasound Neck & Thyroid Gland',
  'High-Resolution Breast Ultrasound (Sonomammography)',
  'Scrotal / Testicular Doppler Ultrasound',
  'Carotid Doppler & Peripheral Vascular Ultrasound',
  'Musculoskeletal (MSK) Ultrasound (Tendons/Joints)',
];

export const ECG_RECORDING_TYPES = [
  { id: 'STANDARD_12_LEAD', name: 'Standard ECG Sheet (Lead II Rhythm Strip Extraction)' },
  { id: 'DIGITAL_PDF', name: 'Digital Hospital ECG PDF Export (Holter / Resting Trace)' },
  { id: 'RAW_SIGNAL_CSV', name: 'Raw Discrete Signal Stream (PhysioNet / CSV Data)' },
  { id: 'WEARABLE_SINGLE_LEAD', name: 'Wearable Single-Lead Rhythm Trace (Smartwatch Lead I Photo)' },
];
