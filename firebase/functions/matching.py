import os
import json
import random

from datetime import datetime, timedelta
import pytz
import firebase_admin
import pandas as pd
from firebase_admin import firestore, credentials
import networkx as nx

# Use the application default credentials.
cred = credentials.ApplicationDefault()

firebase_admin.initialize_app(credentials.Certificate('/Users/corin1/capstone/version2/upload/service-key.json'))
db = firestore.client()

# Access Firestore client
firestore_client = firestore.client()
class PlanTimeInterval:
    def __init__(self, start_time, start_time_minutes, end_time, end_time_minutes, duration, users_available):
        self.start_time = start_time
        self.start_time_minutes = start_time_minutes
        self.end_time = end_time
        self.end_time_minutes = end_time_minutes
        self.duration = duration
        self.users_available = users_available

# Define a function to retrieve data from Firestore and build the map
def build_user_map():
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
            'calendar': filtered_calendar
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
    
    planned_times.sort(key=lambda x: x.duration, reverse=True)
    return planned_times

def update_users(users, plan):
    # Create a list of date objects to remove from each users calendar
    time_slots = set()

    current_time = plan.start_time

    # Iterate until current_time reaches or exceeds the end_time
    while current_time <= plan.end_time:
        time_slots.add(current_time)
        current_time += timedelta(minutes=30)

    time_strings = []
    for time in time_slots:
        time_strings.append(datetime.astimezone(pytz.utc).strftime('%Y-%m-%dT%H:%M:%S.%fZ'))

    for user in plan.users_available:
        users[user]['calendar'] = users[user]['calendar'] - time_slots
        
        user_ref = firestore_client.collection('users').document(user)
        doc = user_ref.get()
        if doc.exists:
            try:
                plans = time_strings + users[user]['plannedTimes'] 
                user_ref.set({
                    'planTimes': plans
                })
                print("Successfully update plans for " + user)
            except:
                print("Error")

    return users

# Potentially putting it all together
def create_plan_timeslots():
    # Build users list with preprocessed data
    users = build_user_map()

    # Establish all the friend bubbles that exist
    cliques = find_cliques(users)

    plans = []

    # Randomize order of friend_bubbles
    random.shuffle(cliques)

    # Iterate through all friend bubbles
    for friend_bubble in cliques:
        potential_plans = planned_times(users, friend_bubble)

        if len(potential_plans) == 0:
            continue

        # Pick one plan for each friend bubble
        plan = potential_plans[0] 

        plans.append(plan)

        # Update users to reflect planned times no longer available for each user in plan
        # users = update_users(users, plan)

    return plans
def create_messages():
    plans = create_plan_timeslots()
    #update users database

    activities_ref = list(firestore_client.collection('activities').stream())

    activities_dict = list(map(lambda x: x.to_dict(), activities_ref))
    df = pd.DataFrame(activities_dict)
    messages_to_send = []


    for plan in plans:
        results = df.query("StartMinuteTime <= @plan.start_time_minutes and EndMinuteTime >= @plan.end_time_minutes and MinDuration <= @plan.duration and MaxDuration >= @plan.duration")
        resultsToSend = results.sample(n=min(2, len(results)))
        resultsToSendArr = resultsToSend.to_dict('records')

        description = ""
        
        for result in resultsToSendArr:
            
            # description += 
            description += result["Activity Name"] + "\n \n" + result["Description"] + "\n \n"
        
        header = "Here's some plans for " + plan.start_time.strftime("%m/%d at %I:%M %p") + " with group " + str(plan.users_available)

        messages_to_send.append(header + "\n" + description)
    return messages_to_send

print(create_messages())