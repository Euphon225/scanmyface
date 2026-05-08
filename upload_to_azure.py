import os
import time
from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from msrest.authentication import ApiKeyCredentials

# ==========================================
# CONFIGURATION AZURE
# ==========================================
ENDPOINT = "https://germanywestcentral.api.cognitive.microsoft.com/"
TRAINING_KEY = "3dd611a1ddb14c67b9813dfd083ef188" # Remets ta clé ici
PROJECT_ID = "b7287d8c-9ede-46c9-9c56-ecc6acb7120d"

DATASET_PATH = "dataset_azure/"

# Connexion
credentials = ApiKeyCredentials(in_headers={"Training-key": TRAINING_KEY})
trainer = CustomVisionTrainingClient(ENDPOINT, credentials)

def upload_dataset():
    print(f"🚀 Début de l'envoi sécurisé vers Azure...")
    
    for root, dirs, files in os.walk(DATASET_PATH):
        image_list = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not image_list: continue
            
        tag_name = os.path.basename(root.rstrip(os.sep))
        if not tag_name or tag_name == "dataset_azure": continue

        print(f"\n📦 Traitement du tag : {tag_name}")
        
        tags = trainer.get_tags(PROJECT_ID)
        tag = next((t for t in tags if t.name == tag_name), None)
        if not tag:
            tag = trainer.create_tag(PROJECT_ID, tag_name)
        
        count = 0
        for img_name in image_list:
            file_path = os.path.join(root, img_name)
            
            # --- BOUCLE DE RETENTATIVE ---
            success = False
            while not success:
                try:
                    with open(file_path, mode="rb") as img_data:
                        trainer.create_images_from_data(PROJECT_ID, img_data.read(), tag_ids=[tag.id])
                    count += 1
                    print(f" ✅ Envoyé : {count} / {len(image_list)} images pour {tag_name}", end="\r")
                    success = True
                    # Petite pause pour ne pas saturer Azure
                    time.sleep(0.5) 
                except Exception as e:
                    if "Too Many Requests" in str(e):
                        print("\n⏳ Azure sature... Pause de 5 secondes...")
                        time.sleep(5) # On attend plus longtemps si Azure bloque
                    else:
                        print(f"\n⚠️ Erreur sur {img_name} : {e}")
                        success = True # On passe à la suivante quand même

    print("\n\n✨ TERMINÉ ! Le cerveau d'Azure a reçu toutes ses données.")

if __name__ == "__main__":
    upload_dataset()