import csv
import os
from Graph import Graph

# initialzing path and csv reader object
folder = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(folder, 'csv', 'test.csv')
reader = csv.DictReader(open(file_path))

# initialzing Graph
graph = Graph()

graph.add_all_nodes(reader)

graph.attach_edges()

for v in graph.breadth_first_search('Oh Well', 50):
    print(v)

for v in graph.depth_first_search('Oh Well', 50):
    print(v)

graph.draw()
