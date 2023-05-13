# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, firestore, credentials
import google.cloud.firestore

cred = credentials.ApplicationDefault()
app = initialize_app(cred)


@https_fn.on_request()
def getPlans(req: https_fn.Request) -> https_fn.Response:
    firestore_client = firestore.client()

    # Push the new message into Cloud Firestore using the Firebase Admin SDK.
    results = firestore_client.collection(u'activities').stream()
    output = ""
    for result in results:
        output += result.to_dict()["description"]
    
    
    return https_fn.Response(output)