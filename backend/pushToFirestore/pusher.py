import firebase_admin
from firebase_admin import credentials, firestore
import csv
import os

# firebase stuffs
cred = credentials.Certificate("./spotifyviz-68e56-firebase-adminsdk-gqzp8-0e7479645a.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Constants to change at will
SELECTED_CSV = 'data.csv'

# initialzing paths and csv reader object
PUSHTOFIRESTORE = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(PUSHTOFIRESTORE, 'csv', SELECTED_CSV)

# intialize reader
reader = csv.DictReader(open(csv_path))
index = 0
for row in reader:
    if (index % 10 == 0):
        print(index)
    
    songDict = dict(row)

    # All cleaning up data
    # remove empty key
    songDict.pop("")
    songDict["acousticness"] = float(songDict["acousticness"])
    songDict["danceability"] = float(songDict["danceability"])
    songDict["duration_ms"] = int(songDict["duration_ms"])
    songDict["energy"] = float(songDict["energy"])
    songDict["explicit"] = int(songDict["explicit"])
    # songDict["id"] = songDict["id"] # already a string
    songDict["instrumentalness"] = float(songDict["instrumentalness"])
    songDict["key"] = int(songDict["key"])
    songDict["liveness"] = float(songDict["liveness"])
    songDict["loudness"] = float(songDict["loudness"])
    songDict["mode"] = int(songDict["mode"])
    # songDict["name"] = songDict["name"] # already a string
    songDict["popularity"] = int(songDict["popularity"])
    # songDict["release_date"] = songDict["release_date"] # already a string
    songDict["speechiness"] = float(songDict["speechiness"])
    songDict["tempo"] = float(songDict["tempo"])
    songDict["valence"] = float(songDict["valence"])
    songDict["year"] = int(songDict["year"])

    # assigning artist as an array
    songDict["artists"] = [artist.strip('[]').strip("'") for artist in songDict["artists"].split(', ')]
    
    collection_ref = db.collection("raw_songs").document(songDict["id"]).set(songDict)

    index += 1