import os
import json
import random

from datetime import datetime, timedelta
import pytz
import firebase_admin
from firebase_admin import firestore, credentials

# Use the application default credentials.
cred = credentials.ApplicationDefault()

firebase_admin.initialize_app(credentials.Certificate('')) # to run this locally pass in the service key json file
db = firestore.client()

# Access Firestore client
firestore_client = firestore.client()

# Define a function to retrieve data from Firestore and build the map
def build_user_map():
    user_map = {}

    # Retrieve all documents from the Firestore collection
    users_ref = firestore_client.collection('users')
    docs = users_ref.stream()

    current_date = pytz.timezone("America/Los_Angeles").localize(datetime.now())

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
        calendar_obj = [datetime.fromisoformat(cal_str.replace('Z', '+00:00')).replace(tzinfo=pytz.timezone("America/Los_Angeles")) for cal_str in calendar]

        # Remove elements with a date less than the threshold date
        filtered_calendar = [time for time in calendar_obj if time >= threshold_date]

        # Build up the map of users to friends and date/time objects
        user_map[email] = {
            'friends': friends,
            'calendar': filtered_calendar
        }

    return user_map

# Return all potential subsets of groupings / friend bubbles. Demonstrate which calendars to compare
def find_friend_bubbles(users):
    friend_bubbles = []
    visited = set()

    # Define a helper function to perform depth-first search (DFS)
    def dfs(user, bubble):
        visited.add(user)
        bubble.add(user)

        for friend in users[user]['friends']:
            if friend not in visited:
                dfs(friend, bubble)

    # Iterate through each user
    for user in users:
        if user not in visited:
            bubble = set()
            dfs(user, bubble)

            # Check if all users within the bubble are friends with each other
            is_bubble_valid = True
            for u1 in bubble:
                for u2 in bubble:
                    if u2 != u1 and u2 not in users[u1]['friends']:
                        is_bubble_valid = False
                        break
                if not is_bubble_valid:
                    break

            # Add the bubble to the list if it is valid
            if is_bubble_valid:
                friend_bubbles.append(bubble)

    return friend_bubbles

# Match user availability of a single friend bubble
def planned_times(users, friends):
    # Dictionary to store available users for each time slot
    user_availability = {}  

    for user in friends:
        for time_slot in users[user]['calendar']:
            if time_slot not in user_availability:
                user_availability[time_slot] = set()
            user_availability[time_slot].add(user['email'])

    # List to store the Planned Time objects
    planned_times = [] 

    time_slots = sorted(user_availability.keys())
    i = 0
    while i < len(time_slots):
        start_time = time_slots[i]
        end_time = start_time + timedelta(minutes=30)

        users_available = user_availability[start_time]

        # While timeslots are consecutive
        j = i
        while j < len(time_slots) - 1 and time_slots[j + 1] == end_time:
            same_users_available =  user_availability[time_slots[j + 1]].intersection(users_available)

            # Same users available
            if same_users_available == users_available:
                i += 1
                j += 1
                end_time += timedelta(minutes=30)
            else:
                break
        
        duration = (start_time - end_time).total_seconds() / 60
        start_time_minutes = start_time.hour * 60 + start_time.minute 
        end_time_minutes = end_time.hour * 60 + end_time.minute
        if duration >= 90:
            planned_time = {
                'start_time': start_time,
                'start_time_minutes': start_time_minutes,
                'end_time': end_time,
                'end_time_minutes': end_time_minutes,
                'duration' : (start_time - end_time).total_seconds() / 60, 
                'users_available': users_available
            }

            planned_times.append(planned_time)

        i += 1
    
    return planned_times.sort(key=lambda x: x.duration, reverse=True)

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
        time_strings.append(datetime.strftime('%Y-%m-%dT%H:%M:%S.%fZ'))

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
    friend_bubbles = find_friend_bubbles(users)

    plans = []

    # Randomize order of friend_bubbles
    random.shuffle(friend_bubbles)

    # Iterate through all friend bubbles
    for friend_bubble in friend_bubbles:
        potential_plans = planned_times(users, friend_bubble)

        if len(plan) == 0:
            break

        # Pick one plan for each friend bubble
        plan = potential_plans[0] 

        plans.append(plan)

        # Update users to reflect planned times no longer available for each user in plan
        users = update_users(users, plan)

    return plan

# test
# Build users list with preprocessed data
users = build_user_map()

# Establish all the friend bubbles that exist
friend_bubbles = find_friend_bubbles(users)

plans = []

# Randomize order of friend_bubbles
random.shuffle(friend_bubbles)

print(friend_bubbles)
