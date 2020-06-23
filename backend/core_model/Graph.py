import networkx as nx
import time
import csv
from itertools import product, combinations
import pickle
import matplotlib.pyplot as plt 

class Graph:
    def __init__(self):

        # Constants
        self.DEFAULT_WEIGHTS = { # 0's make feature not matter
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
        self.NORMALIZATIONS = {
            "acousticness" : 1.0,
            "artists" : 1.0,
            "danceability" : 1.0,
            "duration_ms" : 263000.0, #75 percentile. Dunno if this is good. Oh well.
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
        self.NEIGHBOR_LIMIT = 6
        self.ATTRIBUTES = {
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

        # initializing networkX graph
        self.graph = nx.Graph()

    # Note: All features are being read in as strings
    def add_all_nodes(self, reader):
        for row in reader:
            self.graph.add_node(row['name'], **row)

    # 
    def attach_edges(self):
        for node1_name in self.graph.nodes:
            for node2_name in self._get_similar_nodes(node1_name):
                self.graph.add_edge(node1_name, node2_name)

    def _get_similar_nodes(self, node_name, weights = None):
        # both following lists will be sorted least similar to most similar
        # which is greatest score to least score
        most_similar = ["NONE"] * (self.NEIGHBOR_LIMIT + 1)
        most_similar_dif_scores = [float("inf")] * (self.NEIGHBOR_LIMIT + 1)

        for node2_name in self.graph.nodes:
            # look where to add itself in the list
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

    # the similarity  score uses all attributes EXCEPT , "", "id", "name", "release_date"
    # therefore, the similarity score is calculated based on 15 features.
    # Low score is more similar. 0 should be the exact same.
    def _sim_score(self, node1_name, node2_name, weights = None):
        score = 0

        node1 = self.graph.nodes[node1_name]
        node2 = self.graph.nodes[node2_name]

        squared_dif = dict()
        
        # Handling Atypical attributes like key and Artists

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

        # Handling Key Data. If song share key : 1, 0 if they dont
        squared_dif["key"] = int(node1["key"] == node2["key"])

        # Handling typical NUMERICAL attributes
        for attr in self.ATTRIBUTES["useful"]["typical"]:
            dif = float(node1[attr]) - float(node2[attr])
            nomrmalized_dif = (dif) / self.NORMALIZATIONS[attr]
            # normalized_dif should be value between 0 and 1 (with exception of attr=duration)

            squared_dif[attr] = nomrmalized_dif ** 2

        # AT THIS POINT squared_dif SHOULD BE FILLED WITH UNWEIGHTED NORMALIZED SQUARED DIFFERENCES

        if weights is None:
            weights = self.DEFAULT_WEIGHTS

        for attr in self.ATTRIBUTES["useful"]["all"]:
            score += weights[attr] * squared_dif[attr]
        
        return score
        
    def _clean_name(self, name):
        bad_chars = ["'", '"', "[", "]"]
        for char in bad_chars:
            name = name.replace(char, "")
        return name

    
    def draw(self):
        # nx.draw_circular(self.graph, with_labels=True)
        # nx.draw_shell(self.graph, with_labels=True)
        # nx.draw_spectral(self.graph, with_labels=True)
        nx.draw_kamada_kawai(self.graph, with_labels=True)

        plt.show()

    
        
    def save_progress(self):
        pass