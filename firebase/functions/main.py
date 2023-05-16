# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import os
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

class Availability:
    def __init__(self, month, day, day_of_week, time, duration):
        self.month = month 
        self.day = day
        self.day_of_week = day_of_week
        self.time = time
        self.duration = duration
    
    def __str__(self):
        return str(self.month) + " " + str(self.day) + " " + str(self.day_of_week) + " " + str(self.time) + " " + str(self.duration)



@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getPlans(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    output = ""
    if json_data:
        calendar = [dateutil.parser.parse(entry) for entry in json_data['calendar']]
        calendar.sort()
        start_time = calendar[0]
        i = 1
        availabilities = []
        while i < len(calendar):
            diff = calendar[i] - start_time
            while(i < len(calendar) and diff.total_seconds() == 1800):
                diff = calendar[i] - start_time
                i += 1
            
            i += 1
            availability = Availability(month=start_time.month, day=start_time.day, day_of_week=start_time.weekday(), time=(str(start_time.hour) + ":" + str(start_time.min).zfill(2)), duration=diff.total_seconds() / 60)
            availabilities.append(availability)
        
        availabilities.append(Availability(month=start_time.month, day=start_time.day, day_of_week=start_time.weekday(), time=(str(start_time.hour) + ":" + str(start_time.min).zfill(2)), duration=diff.total_seconds() / 60))        
        
        for availability in availabilities:
            print(availability)
        
    return https_fn.Response(output)
        
    #account_sid = os.environ['TWILIO_ACCOUNT_SID']
    #auth_token = os.environ['TWILIO_AUTH_TOKEN']
    #twilio_client = Client(account_sid, auth_token)
    

    #firestore_client = firestore.client()

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
    #    to='+12065579398'
    #)
    
    # we should map out what we want the response to look like with success/failure etc