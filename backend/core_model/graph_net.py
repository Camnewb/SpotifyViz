from Graph import Graph
import pickle
import csv
import os

# initialzing path and csv reader object
CORE_MODEL_FOLDER = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(CORE_MODEL_FOLDER, 'csv', 'data.csv')
reader = csv.DictReader(open(file_path))

pickle_path = os.path.join(CORE_MODEL_FOLDER, "checkpoints", "newest.p")

# Partial or full graph exists
if os.path.exists(pickle_path):
    print("Reading in from existant graph model")
    # pulling data from pickle object
    data = pickle.load(open(pickle_path, "rb"))
    if not data["done"]:
        # pull data from pickle
        start_index = data["index"]
        graph = data["graph"]
        graph.attach_edges(start_index)
else:
    print("Starting construction on a new graph")
    # initialzing Graph
    graph = Graph()

    # creating graph
    graph.add_all_nodes(reader)
    graph.attach_edges()
    
for v in graph.breadth_first_search('Oh Well', 10):
    print(v)

for v in graph.depth_first_search('Oh Well', 10):
    print(v)
#graph.draw()

