import csv
import os
from Graph import Graph

# initialzing reader
folder = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(folder, 'csv/data_by_artist.csv')
reader = csv.DictReader(open(file_path))

# initialzing Graph
graph = Graph()

graph.add_all_nodes(reader)
# graph.save_graph()
graph.attach_edges()


# Least squares it against all other nodes
# Pick CONNECTIONS nodes with lowest difference squared score (maybe consider using a threshold)
# Add node and add edges to create graph
# Go through each feature, find the difference squared and assign that feature as an edge if its under the threshold
