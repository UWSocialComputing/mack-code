
import google.cloud.firestore
import os
import json

import google.cloud.firestore
import os
import json

from google.cloud import firestore
from firebase_admin import initialize_app
from firebase_admin import credentials
from google.cloud import firestore


# Access Firestore client
firestore_client: google.cloud.firestore.Client = firestore.client()

# Define a function to retrieve data from Firestore and build the map
def build_user_map(request):
    user_map = {}

    # Retrieve all documents from the Firestore collection
    users_ref = firestore_client.collection('users')
    docs = users_ref.stream()

    current_date = datetime.now()

    for doc in docs:
        
        # Access the fields of each document
        data = doc.to_dict()
        email = data['email']
        friends = data['friends']
        calendar = set(data['calendar'])
        planTimes = set(data['planTimes'])
        daysInAdvance = data['minNotice'] - 1 

        # Remove times that have already been marked as busy by a plan
        calendar = calendar - planTimes

        # Remove times that are before the minimimum notice
        threshold_date = current_date + timedelta(days=daysInAdvance)

        # Convert the times from string format to datetime objects
        calendar_obj = [datetime.fromisoformat(cal_str.replace('Z', '+00:00')) for cal_str in calendar]

        # Remove elements with a date less than the threshold date
        filtered_calendar = [time for time in calendar_obj if time >= threshold_date]

        # Build up the map of users to friends and date/time objects
        user_map[email] = {
            'friends': friends,
            'calendar': filtered_calendar
        }

    return user_map

# Return all potential subsets of groupings / friend bubbles. Demonstrate which calendars to compare
def findFriendsBubbles(users):
    visited = set()
    friend_bubbles = []

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
def plannedTimes(users, friends):
    # Dictionary to store available users for each time slot
    user_availability = {}  

    for user in friends:
        for time_slot in users[user]['calendar']:
            if time_slot not in user_availability:
                user_availability[time_slot] = set()
            user_availability[time_slot].add(user['email'])

    # List to store the Planned Time objects
    planned_times = [] 

    available_slots = sorted(user_availability.keys())
    i = 0
    while i < len(available_slots):
        start_time = available_slots[i]
        end_time = start_time

        users_available = user_availability[start_time]

        # Extend the time slot if the next slot is also available for the same users
        j = i
        while i < len(available_slots) - 1 and available_slots[j + 1] - end_time <= timedelta(minutes=30):
            # Same users available
            if user_availability[available_slots[j + 1]] == users_available:
                i += 1
                j += 1
                end_time = available_slots[i + 1]
            # Less users available afterwards
            else:
                users_available_sub =  user_availability[available_slots[j + 1]].intersection(users_available)
                break
                # if len(users_available_sub) < 2:
                #     break
                # Potential if statement to continue with smaller group

        duration = (start_time - end_time).total_seconds() / 60
        if duration > 90:
            planned_time = {
                'start_time': start_time,
                'end_time': end_time,
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

    for user in plan.users_available:
        users[user]['calendar'] = users[user]['calendar'] - time_slots
    
    return users

# Potentially putting it all together
def main():
    # Build users list with preprocessed data
    users = build_user_graph()

    # Establish all the friend bubbles that exist
    friend_bubbles = establish_friend_bubbles(users)

    plans = []
    # Iterate through all friend bubbles
    for friend_bubble in friend_bubbles:
        potential_plans = plannedTimes(users, friend_bubble)

        # Method / Rules to determine if any plans are good or not
        plan = potential_plans[0] # REPLACE WITH ACTUAL CHECKING SYSTEM

        potential_plans.append(plan)

        # Update users to reflect planned times no longer available for each user in plan
        users = update_users(users, plan)

    # Send messages to Twillio