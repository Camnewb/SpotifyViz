import networkx as nx
import time
import csv
import os

class Graph:
    def __init__(self):
        # Constants
        self.ATTRIBUTES = ["acousticness","danceability","duration_ms",
                            "energy","instrumentalness",
                            "liveness","loudness","speechiness","tempo",
                            "valence","popularity","key","mode","count"]
        self.USING_CONNECTION_LIMIT = False
        self.NODE_CONNECTION_LIMIT = 0
        self.NODE_CONNECTION_SCORE_THRESHOLD = 100
        self.USING_EDGE_LIMIT = True
        self.EDGE_LIMIT = 0
        self.EDGE_SCORE_THRESHOLD = 0

        # initializing networkX graph
        self.graph = nx.MultiGraph()
        
    def sim_score(self, node1, node2):    
        score = 0
        for attr in self.ATTRIBUTES:
            node1_attr = float(self.graph.nodes[node1][attr])
            node2_attr = float(self.graph.nodes[node2][attr])
            dif = node1_attr - node2_attr
            score += dif ** 2

        return score

    def get_similar_nodes(self, node):
        best = []

        if self.USING_CONNECTION_LIMIT:
            for node2 in self.graph.nodes:
                if len(best) <= self.NODE_CONNECTION_LIMIT + 1:
                    best.append(node2)
                elif self.sim_score(best[0], node2):
                    'RESOLVE LATER'
                    pass 
                    
        else:
            for node2 in self.graph.nodes:
                if self.sim_score(node, node2) < self.NODE_CONNECTION_SCORE_THRESHOLD:
                    best.append(node)
        return best

    # Note: All features are being read in as strings
    def add_all_nodes(self, reader):
        for row in reader:
            self.graph.add_node(row['artists'], **row)

    def attach_edges(self):
        counter = 0
        for node in self.graph.nodes:
            counter += 1
            if counter % 5 == 0:
                print(counter)
            self.get_similar_nodes(node)
        
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
