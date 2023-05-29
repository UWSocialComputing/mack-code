# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

import json
import google.cloud.firestore
# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import https_fn, options, scheduler_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import firestore, initialize_app, credentials

import sys
from pathlib import Path

sys.path.insert(0, Path(__file__).parent.as_posix())

from localpackage import matching

cred = credentials.ApplicationDefault()
app = initialize_app(cred)



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
    matching.create_plan_timeslots(firestore_client)
    return https_fn.Response("success")
    

@scheduler_fn.on_schedule(schedule="every day 06:00")
def sendPlans(event: scheduler_fn.ScheduledEvent) -> None:
    firestore_client: google.cloud.firestore.Client = firestore.client()
    matching.create_plan_timeslots(firestore_client)

                    