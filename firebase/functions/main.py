# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import google.cloud.firestore
import os

# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, credentials, firestore
from twilio.rest import Client

cred = credentials.ApplicationDefault()
app = initialize_app(cred)

account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')


twilio_phone_num = '+18336857181'

class PlanTimeInterval:
    def __init__(self, month, day, dayOfWeek, startTime, endTime, duration, startTimeMinutes, endTimeMinutes):
        self.month = month 
        self.day = day
        self.dayOfWeek = dayOfWeek
        self.startTime = startTime
        self.endTime = endTime
        self.duration = duration
        self.startTimeMinutes = startTimeMinutes
        self.endTimeMinutes = endTimeMinutes
    
    def __str__(self):
        return str(self.month) + " " + str(self.day) + " " + str(self.day_of_week) + " " + str(self.time) + " " + str(self.duration)
    
    def planStr(self): 
        return "Looks like you're free on " + str(self.month) + "/" + str(self.day) + " from " + str(self.startTime) + " to " + str(self.endTime)
        + ". Here's an idea for what to do with some friends. "

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def addUserInfo(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        email = json_data['email']
        password = json_date['password']
        username = json_data['username']
        phoneNum = json_data['phoneNumber']
    
    newUser = {
        'username' : username,
        'password' : password,
        'phoneNum' : phoneNum,
        'maxPlans' : 1,
        'minNotice' : 1
    }

    db.collection('users').document(email).set(newUser)


@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getPlans(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        activities_ref = firestore_client.collection('activities')

        planTimeIntervals = [PlanTimeInterval(month=entry['month'], day=entry['day'], dayOfWeek=entry['dayOfWeek'], startTime=entry['startTime'], endTime=entry['endTime'], duration=entry['duration'], startTimeMinutes=entry['startTimeMinutes'], endTimeMinutes=entry['startTimeMinutes']) for entry in json_data['calendar']]
        phoneNum = json_data['phoneNum']
        maxHangouts = json_data['maxHangouts']
        output = "here are some plans for this week: \n"

        intervalsForPlans = sorted(planTimeIntervals, key=lambda x: x.duration, reverse=True)
        i = 0

        for interval in intervalsForPlans:
            if i == maxHangouts:
                break
            
            results = activities_ref.where('StartMinuteTime', '<=', interval.startTimeMinutes).stream()

            for result in results:
                description = result.to_dict()["Description"] + "\n \n"
                if description not in output:
                    output += interval.planStr + "\n* " + result.to_dict()["Activity Name"] + description
                    i+= 1
                    break                
        
        twilio_client = Client(account_sid, auth_token)
        twilio_client.messages.create(body=output,from_=twilio_phone_num,to=phoneNum)
   
    return https_fn.Response("hello world")
