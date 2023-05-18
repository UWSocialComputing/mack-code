import csv
import firescript
from firebase_admin import initialize_app, firestore, credentials

# Define your Firebase configuration
# firebase_config = {
#     "apiKey": "YOUR_API_KEY",
#     "authDomain": "YOUR_AUTH_DOMAIN",
#     "projectId": "YOUR_PROJECT_ID",
#     "storageBucket": "YOUR_STORAGE_BUCKET",
#     "appId": "YOUR_APP_ID"
# }

# Initialize Firebase
cred = credentials.ApplicationDefault()
firescript.initialize_app(cred)


# Get a reference to your database collection
db = firescript.firestore().collection('activities')

# Read the CSV file
with open('data.csv', 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    # Skip the header row
    next(csv_reader)
    
    # Add entries to the database
    for row in csv_reader:
        try:
            db.add(row)
            print('Entry added:', row)
        except Exception as e:
            print('Error adding entry:', e)