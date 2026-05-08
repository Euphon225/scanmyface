import os
import pandas as pd
import shutil

# ==========================================
# 1. CONFIGURATION DES CHEMINS (AUTO-LEVEL)
# ==========================================
CELEBA_IMG_DIR = "/Users/loriekeita/Downloads/archive/img_align_celeba/"
CELEBA_ATTR_FILE = "/Users/loriekeita/Downloads/archive/list_attr_celeba.csv"

# Chemin vers LFW avec le double dossier détecté
LFW_IMG_DIR = "/Users/loriekeita/Downloads/archive 2/lfw-deepfunneled/lfw-deepfunneled/"
LFW_ATTR_FILE = "/Users/loriekeita/Downloads/archive 2/lfw_attributes.txt"

OUTPUT_DIR = "dataset_azure/"

MAPPING_REGLES = {
    "Zone_Nez/Nez_Large": ("Big_Nose", "Big_Nose", 1.0),
    "Zone_Nez/Nez_Fin": ("Pointy_Nose", "Pointy_Nose", 1.2),
    "Zone_Levres/Levres_Pleines": ("Big_Lips", "Big_Lips", 1.0),
    "Zone_Yeux/Yeux_Fins": ("Narrow_Eyes", "Narrow_Eyes", 1.5),
    "Zone_Pommettes/Pommettes_Hautes": ("High_Cheekbones", "High_Cheekbones", 1.0)
}
LIMIT_PER_SOURCE = 300 

print("🚀 FUSION FINALE : CELEBA + LFW (DIVERSITÉ)")

# ==========================================
# 2. EXTRACTION CELEBA (On saute si déjà fait)
# ==========================================
for dossier in MAPPING_REGLES.keys():
    os.makedirs(os.path.join(OUTPUT_DIR, dossier), exist_ok=True)

print("\n--- ÉTAPE 1 : CELEBA ---")
df_celeba = pd.read_csv(CELEBA_ATTR_FILE)
actual_celeba = CELEBA_IMG_DIR if os.path.exists(os.path.join(CELEBA_IMG_DIR, "000001.jpg")) else os.path.join(CELEBA_IMG_DIR, "img_align_celeba")

for dossier, (attr_celeba, _, _) in MAPPING_REGLES.items():
    dest = os.path.join(OUTPUT_DIR, dossier)
    if len([f for f in os.listdir(dest) if "celeba_" in f]) >= LIMIT_PER_SOURCE:
        print(f"  ✅ {dossier} déjà rempli.")
    else:
        filtre = df_celeba[(df_celeba[attr_celeba] == 1) & (df_celeba['Smiling'] == -1)].head(LIMIT_PER_SOURCE)
        count = 0
        for img in filtre['image_id']:
            src = os.path.join(actual_celeba, img)
            if os.path.exists(src):
                shutil.copy(src, os.path.join(dest, f"celeba_{img}"))
                count += 1
        print(f"  -> {count} images CelebA copiées.")

# ==========================================
# 3. ÉTAPE 2 : LFW (Correction du décalage)
# ==========================================
print("\n--- ÉTAPE 2 : LFW (INCLUSIVITÉ) ---")
# On lit LFW SANS en-tête pour gérer le décalage manuellement
df_lfw = pd.read_csv(LFW_ATTR_FILE, sep='\t', skiprows=2, header=None)

# On définit les noms de colonnes manuellement (Basé sur ton fichier)
# Index 0 = Nom, Index 1 = Numéro, Index 40 = Big_Nose, Index 42 = Big_Lips, etc.
LFW_COLS = {
    "Big_Nose": 40,
    "Pointy_Nose": 41,
    "Big_Lips": 42,
    "Narrow_Eyes": 38,
    "High_Cheekbones": 70
}

for dossier, (_, attr_name, seuil) in MAPPING_REGLES.items():
    col_idx = LFW_COLS[attr_name]
    print(f"Analyse LFW pour {attr_name} (Colonne {col_idx})...")
    
    # Filtrage sur la colonne numérique
    filtre = df_lfw[df_lfw[col_idx] > seuil].head(LIMIT_PER_SOURCE)
    
    count = 0
    for _, row in filtre.iterrows():
        # Index 0 = Le nom (ex: Aaron Eckhart)[cite: 1]
        p_name = str(row[0]).strip().replace(' ', '_')
        # Index 1 = Le numéro de l'image[cite: 1]
        i_num = str(int(float(row[1]))).zfill(4)
        img_file = f"{p_name}_{i_num}.jpg"
        
        src = os.path.join(LFW_IMG_DIR, p_name, img_file)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(OUTPUT_DIR, dossier, f"lfw_{img_file}"))
            count += 1
            
    print(f"  -> {count} images LFW copiées pour {dossier}.")

print("\n✅ OPÉRATION TERMINÉE ! Ton dataset hybride et inclusif est prêt.")