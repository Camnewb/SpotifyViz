import networkx as nx
import matplotlib.pyplot as plt
import csv

CONNECTIONS = 3
EDGE_THRESHOLD = 0

# initiliazing file reader and graph
filePath = './csv/test.csv'
inFile = open(filePath)
reader = csv.DictReader(inFile)
G = nx.Graph()

# get new artist
for _ in range(60):
    print(reader.next)
# Least squares it against all other nodes
# Pick CONNECTIONS nodes with lowest difference squared score (maybe consider using a threshold)
# Add node and add edges to create graph
    # Go through each feature, find the difference squared and assign that feature as an edge if its under the threshold
    # 



# nx.draw(G, with_labels=True, font_weight='bold')
# plt.show()