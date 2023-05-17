# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
import json 
import dateutil.parser
import google.cloud.firestore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn, options

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, firestore, credentials
from twilio.rest import Client
from datetime import timedelta

cred = credentials.ApplicationDefault()
app = initialize_app(cred)

twilio_phone_num = '+18336857181'

[{'month': 5, 'day': 19, 'dayOfWeek': 5, 'startTime': '11:0', 'duration': 300, 'endTime': '16:0'}]

class PlanTimeInterval:
    def __init__(self, month, day, dayOfWeek, startTime, endTime, duration):
        self.month = month 
        self.day = day
        self.dayOfWeek = dayOfWeek
        self.startTime = startTime
        self.endTime = endTime
        self.duration = duration
    
    def __str__(self):
        return str(self.month) + " " + str(self.day) + " " + str(self.day_of_week) + " " + str(self.time) + " " + str(self.duration)


@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getPlans(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        planTimeIntervals = [PlanTimeInterval(month=entry['month'], day=entry['day'], dayOfWeek=entry['dayOfWeek'], startTime=entry['startTime'], endTime=entry['endTime'], duration=entry['duration']) for entry in json_data['calendar']]
        phoneNum = json_data['phoneNum']
        maxHangouts = json_data['maxHangouts']
        daysInAdvance = json_data['daysInAdvance']
        print(phoneNum)
        print(maxHangouts)
        print(daysInAdvance)
        print(planTimeIntervals)
        
        
    return https_fn.Response("hello world")
    

    #firestore_client = firestore.client()

    # twilio setup
    #account_sid = os.environ['TWILIO_ACCOUNT_SID']
    #auth_token = os.environ['TWILIO_AUTH_TOKEN']
    #twilio_client = Client(account_sid, auth_token)

    # Get all the activities in the db
    # once we implement tagging/have actual entries we can use .where() to filter for specific entries
    #results = firestore_client.collection(u'activities').stream()

    # build the message we send to the user
    #output = ""
    #for result in results:
    #    output += result.to_dict()["description"]
    
    # send the messaage 
    #message = twilio_client.messages.create(
    #    body=output,
    #    from_=twilio_phone_num,
    #    to=phoneNum
    #)
    
    # we should map out what we want the response to look like with success/failure etc