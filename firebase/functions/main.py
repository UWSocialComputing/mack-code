# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
import csv
import google.cloud.firestore

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options, firestore_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, credentials, firestore
from twilio.rest import Client

cred = credentials.ApplicationDefault()
app = initialize_app(cred)

account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')


twilio_phone_num = '+18336857181'

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
        firestore_client = firestore.client()
        activities_ref = firestore_client.collection('activities')

        planTimeIntervals = [PlanTimeInterval(month=entry['month'], day=entry['day'], dayOfWeek=entry['dayOfWeek'], startTime=entry['startTime'], endTime=entry['endTime'], duration=entry['duration']) for entry in json_data['calendar']]
        phoneNum = json_data['phoneNum']
        maxHangouts = json_data['maxHangouts']
        daysInAdvance = json_data['daysInAdvance']

        print(planTimeIntervals[0].startTime)

        intervalsForPlans = sorted(planTimeIntervals, key=lambda x: x.duration, reverse=True)
        output = ""
        i = 0

        for interval in intervalsForPlans:
            if i == maxHangouts:
                break
    
            # results = activities_ref.where('StartTime', '<=', interval.startTime).where('EndTime', '>=', interval.endTime).where('MaxDuration', '>=', interval.duration).where('MinDuration', '<=', interval.duration).limit(1).stream()
            results = activities_ref.where('StartTime', '=', interval.startTime).where('EndTime', '>=', interval.endTime).where('MaxDuration', '>=', interval.duration).where('MinDuration', '<=', interval.duration).limit(1).stream()

            for result in results:
                output += result.to_dict()["Description"] + "\n"
                i+= 1
        
        twilio_client = Client(account_sid, auth_token)
        message = twilio_client.messages.create(body=output,from_=twilio_phone_num,to=phoneNum)
   
    return https_fn.Response("hello world")
