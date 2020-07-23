# for iterating through lists in neat ways
from itertools import product, combinations, islice
# for displaying graph for debugging
import matplotlib.pyplot as plt 
# queue data structure
from collections import deque 
# library holds the graph model
import networkx as nx
# library serializes and saves python variable to a file
import pickle
# time functions
import time
# good for reading in csv files
import csv
# used for file reading and managing file paths
import os

class Graph:
    def __init__(self):
    # Constants
        # These are the coefficients I multiply each feature by before I compare
        # small coefficient -> feature matters less, large coefficient -> feature matters more
        self.DEFAULT_WEIGHTS = { 
            "acousticness" : 1.0,
            "artists" : 2.0,
            "danceability" : 1.0,
            "duration_ms" : 0.25, 
            "energy" : 1.0,
            "explicit" : 0.5,
            "instrumentalness" : 1.0,
            "key" : 0.25, 
            "liveness" : 1.0,
            "loudness" : 1.0,
            "mode" : 0.25, 
            "popularity" : 0.25,
            "speechiness" : 1.0,
            "tempo" : 1.0,
            "valence" : 1.0,
            "year" : 1.0
        }

        # These are the constants I have to divide features by to get them in or around the range [0,1]
        # I put features between [0,1] for the sake of easy and clean math
        # Most of these values are the min - max for that feature
        self.NORMALIZATIONS = {
            "acousticness" : 1.0,
            "artists" : 1.0,
            "danceability" : 1.0,
            "duration_ms" : 263000.0, #Since duration doesn't have a clean min and max, I chose the 75 percentile. Dunno if this is good. Oh well.
            "energy" : 1.0,
            "explicit" : 1.0,
            "instrumentalness" : 1.0,
            "key" : 1.0, # will be binary value
            "liveness" : 1.0,
            "loudness" : 63.85,
            "mode" : 1.0, 
            "popularity" : 100.0,
            "speechiness" : 1.0,
            "tempo" : 2441.0,
            "valence" : 1.0,
            "year" : 99.0
        }

        # All the features sorted and accessible for convenience
        self.FEATURES = {
            "all" : ["", "acousticness", "artists", "danceability","duration_ms",
                        "energy", "explicit", "id", "instrumentalness",
                        "key", "liveness", "loudness", "mode", "name",
                        "popularity", "release_date", "speechiness",
                        "tempo", "valence", "year"],

            "useful" : {
                "all" : ["acousticness", "artists", "danceability","duration_ms",
                        "energy", "explicit", "instrumentalness",
                        "key", "liveness", "loudness", "mode", 
                        "popularity", "speechiness",
                        "tempo", "valence", "year"],
                "atypical" : ["artists", "key"],
                "typical" : ["acousticness", "danceability","duration_ms",
                        "energy", "explicit", "instrumentalness",
                        "liveness", "loudness", "mode", 
                        "popularity", "speechiness",
                        "tempo", "valence", "year"]
            }
        }

        # When constructing the graph every node looks for this many nodes most similar to it and creates an edge
        self.NEIGHBOR_LIMIT = 6
        
        # initializing networkX graph
        self.graph = nx.Graph()

    # Takes each row from the CSV file, turns it into a node, and adds it to the graph. (No edges are added)
    def add_all_nodes(self, reader):
        
        for row in reader:
            # Note: All features are being read in as strings
            self.graph.add_node(row['name'], **row)

    # Goes through each node, finds the most similar, and adds an edge between them
    # The slowest part of the algorithm, O(V^2)

    def attach_edges(self, start_index = 0):
        # number_of_nodes = len(self.graph.nodes)
        # the itertools.islice efficiently skips to an index in the iterable
        remaining_portion = enumerate(islice(self.graph.nodes, start_index, None), start_index)
        for i, node in remaining_portion:
            print(f"Index is {i}")
            if (i % 10 == 0):
                self.save_progress(i, False)

            similar_nodes = self._get_similar_nodes(node)
            for similar_node in similar_nodes:
                self.graph.add_edge(node, similar_node)
        self.save_progress(-1, True)


    # Helper function for attatch_edges. Given a node, it finds the NEIGHBOR_LIMIT most similar
    # Large potential for code refactoring to make it neater. possibly involving queues.
    def _get_similar_nodes(self, node_name, weights = None):
        # lists will end up sorted least similar to most similar (greatest score to least score)
        most_similar = ["NONE"] * (self.NEIGHBOR_LIMIT + 1)
        most_similar_dif_scores = [float("inf")] * (self.NEIGHBOR_LIMIT + 1)

        for node2_name in self.graph.nodes:
            dif_score = self._sim_score(node_name, node2_name, weights)
            for i in range(0, self.NEIGHBOR_LIMIT + 1):
                if dif_score > most_similar_dif_scores[i]: 
                    if i == 0:
                        break
                    most_similar_dif_scores.insert(i, dif_score)
                    most_similar.insert(i, node2_name)
                    most_similar_dif_scores.pop(0)
                    most_similar.pop(0)
            else:
                most_similar_dif_scores.append(dif_score)
                most_similar.append(node2_name)
                most_similar_dif_scores.pop(0)
                most_similar.pop(0)

        return most_similar[:-1] # last entry will be itself

    # Helper Function for _get_similar_nodes. Calculates similarity score between two nodes.
    # The similarity score uses all features EXCEPT , "", "id", "name", "release_date".
    # Low score is more similar. 0 should be the exact same.
    def _sim_score(self, node1_name, node2_name, weights = None):

        score = 0
        node1 = self.graph.nodes[node1_name]
        node2 = self.graph.nodes[node2_name]
        squared_dif = dict()

    # Handling atypical features like key and artists
        # Handling Artists data. If songs share artist : 1, 0 if they dont.
        node1_artists = node1["artists"].split(",")
        node2_artists = node2["artists"].split(",")
        for artist1, artist2 in product(node1_artists, node2_artists):
            artist1 = self._clean_name(artist1)
            artist2 = self._clean_name(artist2)
            if artist1 == artist2:
                squared_dif["artists"] = 1
                break
        else:
            squared_dif["artists"] = 0

        # Handling Key Data. If songs share key then 1, 0 if they dont
        squared_dif["key"] = int(node1["key"] == node2["key"])

        # Handling typical NUMERICAL features
        for attr in self.FEATURES["useful"]["typical"]:
            dif = float(node1[attr]) - float(node2[attr])
            nomrmalized_dif = (dif) / self.NORMALIZATIONS[attr]
            squared_dif[attr] = nomrmalized_dif ** 2

        # AT THIS POINT squared_dif SHOULD BE FILLED WITH UNWEIGHTED NORMALIZED SQUARED DIFFERENCES

        if weights is None:
            weights = self.DEFAULT_WEIGHTS

        for attr in self.FEATURES["useful"]["all"]:
            score += weights[attr] * squared_dif[attr]
        
        return score
    
    # helper fucnction to _sim_score. Since artist names are formatted weird in CSV, this cleans that up.
    def _clean_name(self, name):
        bad_chars = ["'", '"', "[", "]"]
        for char in bad_chars:
            name = name.replace(char, "")
        return name

    # function that quickly draws graph for debug purposes
    # can only handle small graphs of about < 50 nodes or so
    def draw(self):
        nx.draw_kamada_kawai(self.graph, with_labels=True)

        plt.show()


    # given a node, this function will perform bfs and return a list of size num_results
    def breadth_first_search(self, node_name, num_results):
        print("breadth first search with " + node_name + ":")
        return_list = []

        q = deque()
        q.append(node_name)

        visited = []
        visited.append(node_name)
        
        while (len(q) > 0):

            if len(return_list) == num_results + 1:
                break

            cur_name = q.popleft()
            return_list.append(cur_name)

            for v in self.graph.neighbors(cur_name):
                if v not in visited:
                    visited.append(v)
                    q.append(v)

        return_list.remove(node_name)

        return return_list


# given a node, this function will perform dfs and return a list of size num_results
    def depth_first_search(self, node_name, num_results):
        print("depth first search with " + node_name + ":")
        return_list = []

        stack = deque()
        stack.append(node_name)

        visited = []
        visited.append(node_name)
        
        while (len(stack) > 0):

            if len(return_list) == num_results + 1:
                break

            cur_name = stack.pop()
            return_list.append(cur_name)

            for v in self.graph.neighbors(cur_name):
                if v not in visited:
                    visited.append(v)
                    stack.append(v)

        return_list.remove(node_name)

        return return_list



    def save_progress(self, index, done=False):
        print("Saving!")
        path = os.path.join(os.path.dirname(__file__), "checkpoints", "newest.p")
        dump = dict()
        dump["done"] = done
        dump["index"] = index
        dump["graph"] = self
        pickle.dump(dump, open(path, "wb"))
        print("Saved!")
