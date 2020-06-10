import networkx as nx
import time
import csv
import os

class Graph:
    def __init__(self):
        # Constants
        self.USING_CONNECTION_LIMIT = True
        self.NODE_CONNECTION_LIMIT = 0
        self.NODE_CONNECTION_SCORE_THRESHOLD = 0
        self.USING_EDGE_LIMIT = True
        self.EDGE_LIMIT = 0
        self.EDGE_SCORE_THRESHOLD = 0
        self.SEED_NODES = 5

        # initializing networkX graph
        self.graph = nx.MultiGraph()
        
    def similarity_score(self, node1, node2):
        pass

    # Note: All features are being read in as strings
    def add_all_nodes(self, reader):
        for row in reader:
            self.graph.add_node(row['artists'], attr_dict=dict(row))

    def attach_edges(self, reader):
        # iterate through 


    def save_graph(self, type=0):
        os.chdir("./core_model/saved_models/") # moving wd to saved_models

        time_str = time.strftime("%H:%M:%S", time.localtime())
        if type == 0:
            nx.write_gexf(self.graph, f"graph{time_str}.gexf", version="1.2draft")
        elif type == 1:
            nx.write_edgelist(self.graph, f"edgeList{time_str}.csv")
        elif type == 2:
            nx.write_weighted_edgelist(self.graph, f"wEdegList{time_str}.csv")

        os.chdir('./../..') # moving working directory back to default
        
        
    
