# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
import google.cloud.firestore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, firestore, credentials
from twilio.rest import Client

cred = credentials.ApplicationDefault()
app = initialize_app(cred)
twilio_phone_num = '+18336857181'


@https_fn.on_request()
def getPlans(req: https_fn.Request) -> https_fn.Response:
    account_sid = os.environ['TWILIO_ACCOUNT_SID']
    auth_token = os.environ['TWILIO_AUTH_TOKEN']
    twilio_client = Client(account_sid, auth_token)

    firestore_client = firestore.client()

    # Get all the activities in the db
    # once we implement tagging/have actual entries we can use .where() to filter for specific entries
    results = firestore_client.collection(u'activities').stream()

    # build the message we send to the user
    output = ""
    for result in results:
        output += result.to_dict()["description"]
    
    # send the messaage 
    message = twilio_client.messages.create(
        body=output,
        from_=twilio_phone_num,
        to='+12065579398'
    )
    
    # we should map out what we want the response to look like with success/failure etc
    return https_fn.Response("success")