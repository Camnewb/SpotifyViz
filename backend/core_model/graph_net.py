from Graph import Graph
import pickle
import csv
import os

# Constants to change at will
SELECTED_CSV = 'data.csv'

# initialzing paths and csv reader object
CORE_MODEL_FOLDER = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(CORE_MODEL_FOLDER, 'csv', SELECTED_CSV)
pickle_path = os.path.join(CORE_MODEL_FOLDER, "checkpoints", "newest.p")
reader = csv.DictReader(open(csv_path))

# Partial or full graph exists
if os.path.exists(pickle_path):
    print("Reading in from existant graph model")
    # pulling data from pickle object
    data = pickle.load(open(pickle_path, "rb"))
    if not data["done"]:
        print("Continuing edge attatching")
        # pull data from pickle file
        start_index = data["index"]
        graph = data["graph"]
        graph.attach_edges(start_index)
    else:
        print("Graph is complete and ready for use!")
        graph = data["graph"]
else:
    print("Starting construction on a new graph")
    # initialzing Graph
    graph = Graph()

    # creating graph
    graph.add_all_nodes(reader)
    graph.attach_edges()
    
# for v in graph.breadth_first_search('Oh Well', 10):
#     print(v)

# for v in graph.depth_first_search('Oh Well', 10):
#     print(v)

#graph.draw()

