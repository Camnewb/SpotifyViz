import csv
import os
import json

# Constants to change at will
SELECTED_CSV = 'data.csv'

# initialzing paths and csv reader object
PUSHTOFIRESTORE = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(PUSHTOFIRESTORE, 'csv', SELECTED_CSV)

# writeFile
formatted_file1 = open( os.path.join(PUSHTOFIRESTORE, "formatted1.json") , "w")
formatted_file2 = open( os.path.join(PUSHTOFIRESTORE, "formatted2.json") , "w")
formatted_file3 = open( os.path.join(PUSHTOFIRESTORE, "formatted3.json") , "w")
formatted_file4 = open( os.path.join(PUSHTOFIRESTORE, "formatted4.json") , "w")

# intialize reader
reader = csv.DictReader(open(csv_path))
index = 0

songs1 = []
songs2 = []
songs3 = []
songs4 = []
for row in reader:
    if (index % 10000 == 0):
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

    if index < 40000:
        songs1.append(songDict)
    elif index < 80000:
        songs2.append(songDict)
    elif index < 120000:
        songs3.append(songDict)
    else:
        songs4.append(songDict)
    
    index += 1

formatted_file1.write(json.dumps(songs1, indent=4))
formatted_file2.write(json.dumps(songs2, indent=4))
formatted_file3.write(json.dumps(songs3, indent=4))
formatted_file4.write(json.dumps(songs4, indent=4))
