import csv
import os
from Graph import Graph

# initialzing reader
folder = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(folder, 'csv', 'test.csv')
reader = csv.DictReader(open(file_path))

# initialzing Graph
graph = Graph()

graph.add_all_nodes(reader)

graph.attach_edges()

graph.draw()