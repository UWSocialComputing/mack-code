# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import json
import os
import google.cloud.firestore
from dotenv import load_dotenv
# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options, scheduler_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import firestore, initialize_app, credentials

import random
from datetime import datetime, timedelta
import pytz
import os
import pandas as pd
from firebase_admin import firestore, credentials
import networkx as nx
from twilio.rest import Client


twilio_phone_num = '+18336857181'

load_dotenv()
cred = credentials.ApplicationDefault()
app = initialize_app(cred)

account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token =  os.environ.get('TWILIO_AUTH_TOKEN')
twilio_client = Client(account_sid, auth_token)



@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def addOrDeleteFriend(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        user = json_data['email']
        newFriend = json_data['newFriend']
        operation = json_data['operation']

        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        friend_ref = firestore_client.collection('users').document(newFriend)
        doc1 = user_ref.get()
        doc2 = friend_ref.get()
        if doc1.exists and doc2.exists:
            for doc, ref, newFriend in [(doc1, user_ref, newFriend), (doc2, friend_ref, user)]:
                friends = doc.to_dict().get('friends', [])
                if operation == 'add':
                    friends.append(newFriend)
                elif operation == 'delete':
                    friends.remove(newFriend)
                ref.set({
                    'friends': friends
                }, merge=True)
            return https_fn.Response(f"successfully added new friend: {newFriend}")
        
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def addRequest(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        user = json_data['email']
        newRequest = json_data['newRequest']

        # Add request to user        
        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        if doc.exists:
            requestsSent = doc.to_dict().get('requestsSent', [])
            if newRequest not in requestsSent:
                requestsSent.append(newRequest)
                user_ref.set({
                    'requestsSent': requestsSent
                }, merge=True)

        # Add a request received to other user
        user_ref = firestore_client.collection('users').document(newRequest)
        doc = user_ref.get()
        if doc.exists:
            requestsRecieved = doc.to_dict().get('requestsRecieved', [])
            if user not in requestsRecieved:
                requestsRecieved.append(user)
                user_ref.set({
                    'requestsRecieved': requestsRecieved
                }, merge=True)
        
            return https_fn.Response(f"successfully added pending request: {newRequest}")
        
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')
    
@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def deleteRequest(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        user = json_data['email']
        newRequest = json_data['newRequest']

        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        request_ref = firestore_client.collection('users').document(newRequest)
        doc1 = user_ref.get()
        doc2 = request_ref.get()
        if doc1.exists and doc2.exists:
            for doc, ref, req in [(doc1, user_ref, newRequest), (doc2, request_ref, user)]:
                requestsSent = doc.to_dict().get('requestsSent', [])
                requestsRecieved = doc.to_dict().get('requestsRecieved', [])
                if req in requestsSent:
                    requestsSent.remove(req)
                if req in requestsRecieved:
                    requestsRecieved.remove(req)
                ref.set({
                    'requestsSent': requestsSent,
                    'requestsRecieved' : requestsRecieved
                }, merge=True)
            return https_fn.Response(f"successfully deleted pending request: {newRequest}")
        
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')


@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def editSettings(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data and 'email' in json_data:
        user = json_data['email']
        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        if doc.exists:
            try:
                for setting in ['maxPlans', 'minNotice']:
                    if setting in json_data:
                        user_ref.set({
                            setting: json_data[setting]
                        }, merge=True)
                return https_fn.Response("successfully updated settings")
            except:
                raise https_fn.HttpsError('internal', 'failed to change settings in database')
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def editAvailabilityForUser(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data and 'email' in json_data:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        user = json_data['email']
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        if doc.exists:
            try:
                user_ref.set({
                    'calendar': json_data['calendar']   
                }, merge=True)
                return https_fn.Response("successfully updated availability")
            except:
                raise https_fn.HttpsError('internal', 'failed to change settings in database')
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getUserInfo(req: https_fn.Request) -> https_fn.Response:
    user = req.args.get("email")
    if user is not None:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        doc_as_dict = doc.to_dict()
        userInfo = {
            'maxPlans' : doc_as_dict.get('maxPlans', 1),
            'minNotice' : doc_as_dict.get('minNotice', 1),
            'friends' : doc_as_dict.get('friends', []),
            'requestsSent' : doc_as_dict.get('requestsSent', []),
            'requestsRecieved' : doc_as_dict.get('requestsRecieved',[])
        }
        return https_fn.Response(json.dumps(userInfo))
    
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getAvailabilityForUser(req: https_fn.Request) -> https_fn.Response:
    user = req.args.get("email")
    if user is not None:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        response = {'calendar': doc.to_dict().get('calendar', [])}
        return https_fn.Response(json.dumps(response))
    
    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')

@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def addUserInfo(req: https_fn.Request) -> https_fn.Response:
    json_data = req.get_json()
    if json_data:
        firestore_client: google.cloud.firestore.Client = firestore.client()
        email = json_data['email']
        username = json_data['username']
        phoneNum = json_data['phoneNumber']
    
        newUser = {
            'username' : username,
            'phoneNum' : phoneNum,
            'email' : email,
            'maxPlans' : 1,
            'minNotice' : 1,
            'friends' : [],
            'requestsSent' : [],
            'requestsRecieved' : [],
            'calendar' : [],
            'planTimes' : []
        }
        try:
            firestore_client.collection('users').document(email).set(newUser)
            return https_fn.Response("success")
        except:
            raise https_fn.HttpsError('internal', 'failed to add to database')

    raise https_fn.HttpsError('invalid-argument', 'request improperly formatted')


@https_fn.on_request(cors=options.CorsOptions(cors_origins="*", cors_methods=["get", "post"]))
def getPlans(req: https_fn.Request) -> https_fn.Response:
    firestore_client: google.cloud.firestore.Client = firestore.client()
    create_plan_timeslots(account_sid, auth_token, firestore_client)
    return https_fn.Response("success")
    

@scheduler_fn.on_schedule(schedule="every day 06:00")
def sendPlans(event: scheduler_fn.ScheduledEvent) -> None:
    firestore_client: google.cloud.firestore.Client = firestore.client()
    create_plan_timeslots(account_sid, auth_token, firestore_client)

                    
# utility functions for matching that unfortunately can't be in a different file because firebase has issues

class PlanTimeInterval:
    def __init__(self, start_time, start_time_minutes, end_time, end_time_minutes, duration, users_available):
        self.start_time = start_time
        self.start_time_minutes = start_time_minutes
        self.end_time = end_time
        self.end_time_minutes = end_time_minutes
        self.duration = duration
        self.users_available = users_available

# Define a function to retrieve data from Firestore and build the map
def build_user_map(firestore_client):
    user_map = {}

    # Retrieve all documents from the Firestore collection
    users_ref = firestore_client.collection('users')
    docs = users_ref.stream()

    current_date = datetime.now(pytz.timezone('US/Pacific'))

    for doc in docs:
        
        # Access the fields of each document
        data = doc.to_dict()
        email = data['email']
        friends = data.get('friends', [])
        calendar = set(data.get('calendar', []))
        planTimes = set(data.get('planTimes', []))
        daysInAdvance = data['minNotice'] - 1 
        phoneNum  = data['phoneNum']

        # Remove times that have already been marked as busy by a plan
        calendar = calendar - planTimes

        # Remove times that are before the minimimum notice
        threshold_date = current_date + timedelta(days=daysInAdvance)

        # Convert the times from string format to datetime objects
        calendar_obj = [datetime.fromisoformat(cal_str.replace('Z', '+00:00')).astimezone(pytz.timezone('US/Pacific')) for cal_str in calendar]

        # Remove elements with a date less than the threshold date
        filtered_calendar = [time for time in calendar_obj if time >= threshold_date]
        filtered_calendar.sort()
        # Build up the map of users to friends and date/time objects
        user_map[email] = {
            'friends': friends,
            'calendar': set(filtered_calendar),
            'plannedTimes': planTimes,
            'phoneNum': phoneNum
        }

    return user_map

# Return all potential subsets of groupings / friend bubbles. Demonstrate which calendars to compare
def find_cliques(users):
    graph = nx.Graph()
    cliques = []
    for user, data in users.items():
        friends = data['friends']
        graph.add_node(user)
        graph.add_edges_from([(user, friend) for friend in friends])
    
    for clique in nx.find_cliques(graph):
        if len(clique) >= 2:
            cliques.append(set(clique))
    return cliques
    

# Match user availability of a single friend bubble
def planned_times(users, friends):
    # Dictionary to store available users for each time slot
    user_availability = {}  

    for user in friends:
        for time_slot in users[user]['calendar']:
            if time_slot not in user_availability:
                user_availability[time_slot] = set()
            user_availability[time_slot].add(user)

    # List to store the Planned Time objects
    planned_times = [] 

    time_slots = sorted(user_availability.keys())
    i = 0
    while i < len(time_slots):
        start_time = time_slots[i]
        end_time = start_time + timedelta(minutes=30)

        users_available = user_availability[start_time]
        duration = 30

        # While timeslots are consecutive
        j = i
        while j < len(time_slots) - 1 and time_slots[j + 1] == end_time and duration < 360 and len(users_available) > 1:
            same_users_available =  user_availability[time_slots[j + 1]].intersection(users_available)

            # Same users available
            if same_users_available == users_available:
                i += 1
                j += 1
                end_time += timedelta(minutes=30)
                duration += 30
            else:
                break
        
        duration = (end_time - start_time).total_seconds() / 60
        start_time_minutes = start_time.hour * 60 + start_time.minute 
        end_time_minutes = end_time.hour * 60 + end_time.minute
        if duration >= 90:
            planned_time = PlanTimeInterval(
                start_time=start_time,
                start_time_minutes=start_time_minutes,
                end_time=end_time,
                end_time_minutes=end_time_minutes,
                duration=duration, 
                users_available=users_available
            )
            planned_times.append(planned_time)

        i += 1
    
    planned_times.sort(key=lambda x: x.duration / 30 + len(x.users_available) * 2, reverse=True)
    return planned_times

def update_users(users, plan, firestore_client):
    # Create a list of date objects to remove from each users calendar
    time_slots = set()

    current_time = plan.start_time

    # Iterate until current_time reaches or exceeds the end_time
    while current_time <= plan.end_time:
        time_slots.add(current_time)
        current_time += timedelta(minutes=30)

    utc_timezone = pytz.timezone('UTC')

    time_strings = set()
    for time in time_slots:
        utc_datetime = time.astimezone(utc_timezone)
        time_strings.add(utc_datetime.strftime('%Y-%m-%dT%H:%M:%S.000Z'))

    for user in plan.users_available:
        users[user]['calendar'] = users[user]['calendar'] - time_strings
        
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        if doc.exists:           
            plans = time_strings + users[user]['plannedTimes'] 
            user_ref.set({
                'planTimes': plans
            })
            

    return users

# Potentially putting it all together
def create_plan_timeslots(firestore_client):
    # Build users list with preprocessed data
    users = build_user_map()

    # Establish all the friend bubbles that exist
    cliques = find_cliques(users, firestore_client)

    # Randomize order of friend_bubbles
    random.shuffle(cliques)

    activities_ref = list(firestore_client.collection('activities').stream())

    activities_dict = list(map(lambda x: x.to_dict(), activities_ref))
    df = pd.DataFrame(activities_dict)

    # Iterate through all friend bubbles
    for friend_bubble in cliques:
        potential_plans = planned_times(users, friend_bubble)

        if len(potential_plans) == 0:
            continue

        # Pick one plan for each friend bubble
        plan = potential_plans[0] 

        results = df.query("StartMinuteTime <= @plan.start_time_minutes and EndMinuteTime >= @plan.end_time_minutes and MinDuration <= @plan.duration and MaxDuration >= @plan.duration")
        resultsToSend = results.sample(n=min(2, len(results)))
        resultsToSendArr = resultsToSend.to_dict('records')

        description = ""
        
        for result in resultsToSendArr:
            description += result["Activity Name"] + "\n \n" + result["Description"] + "\n \n"
        
        for user in plan.users_available:
            header = "Here's some plans for " + plan.start_time.strftime("%m/%d at %I:%M %p") + " with friends " + str(plan.users_available - set([user]))
        
            message = header + "\n" + description
            formatted_number = "+1" + users[user]['phoneNum']
            twilio_client.messages.create(
                body=message,
                from_=twilio_phone_num,
                to=formatted_number
            )


        # Update users to reflect planned times no longer available for each user in plan
        users = update_users(users, plan, firestore_client)            
