#include <string>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <vector>

// TODO: 
// Build edges using weights and normalizations like in python
// Implement Firebase Auth and Firestore
//
// 


using namespace std;

struct GraphBuilder{
    struct Song
    {
        string acousticness;
        string artists;
        string danceability;
        string duration_ms;
        string energy;
        string is_explicit;
        string id;
        string instrumentalness;
        string key;
        string liveness;
        string loudness;
        string mode;
        string name;
        string popularity;
        string release_date;
        string speechiness;
        string tempo;
        string valence;
        string year;
    };
    
    GraphBuilder();
    void readInCSV();
    void attatch_edges(int start_index);
    void printSongNames();
private:
    vector<Song> allSongs;

    vector<Song> get_similar_songs(Song song, int i);
    double sim_score(Song song1, Song song2);
    void write_edge(Song song1, Song song2);
    string clean_name(string name);
    void readInSingleNormalLine(string line);
    void readInWithoutBackslash(string line);
};

GraphBuilder::GraphBuilder(){
    this->allSongs = vector<Song>();
}

void GraphBuilder::readInCSV(){
    ifstream myFile("data.csv"); // 

    // Make sure the file is open
    if(!myFile.is_open()) throw runtime_error("Could not open file");

    // file has good bits and is not at end of file
    if(!myFile.good())
    {
        throw runtime_error("file has bad bits");
    }
    
    string line, token;
    
    // Extract the header line in the file
    getline(myFile, line);

    // Read data, line by line
    while(getline(myFile, line))
    {
        // Skipping all lines with quotations and backslashes
        if (line.find("\"") != string::npos || line.find("\\") != string::npos){
            continue; 
        }
        
        readInSingleNormalLine(line);

        // if (line.find("\"") != string::npos){
        //     continue; 
        // }
        // readInWithoutBackslash(line);
    }

    // Close file
    myFile.close();
}

void GraphBuilder::attatch_edges(int start_index){
    for (int i = start_index; i < allSongs.size(); i ++){
        if (i % 1000){
            cout << "\n"<< i;
        }
        vector<Song> simNodes = get_similar_songs(allSongs.at(i), i);

        for (Song song : simNodes){
            write_edge(allSongs.at(i), song);
        }
    }
}

void GraphBuilder::printSongNames(){
    for (Song song : allSongs){
        cout << song.name << "\n";
    }
}

vector<GraphBuilder::Song> GraphBuilder::get_similar_songs(Song song, int i){
    vector<Song> simNodes = vector<Song>(5);
    vector<double> minVals = vector<double>(5);
    double maxInResult = 0;
    int maxInResultInd = -1;
    // Initilizing result lists
    for (int j = 0; j < 5; j++){
        Song jSong = allSongs.at(j);
        simNodes.at(j) = jSong;
        double simScore = sim_score(song, allSongs.at(i));
        if (simScore > maxInResult){
            maxInResult = simScore;
            maxInResultInd = j;
        }
        minVals.at(j) = simScore;
    }

    for (int j = 5; j < allSongs.size(); j++){
        Song jSong = allSongs.at(j);
        double simScore = sim_score(song, jSong);
        if (simScore < maxInResult){
            simNodes.at(maxInResultInd) = jSong;
            minVals.at(maxInResultInd) = simScore;

            // find new max element
            for (int k =0; k < 5; k ++){
                if (minVals.at(k) > maxInResult){
                    maxInResult = minVals.at(k);
                    maxInResultInd = k;
                }
            }
        }
    }

    return simNodes;
}

// INCOMPLETE
double GraphBuilder::sim_score(Song song1, Song song2){
    // // Handling atypical features like key and artists
    //     // Handling Artists data. If songs share artist : 1, 0 if they dont.
    //     string artists1 = song1.artists;
    //     string artists2 = song2.artists;

        
    //     for artist1, artist2 in product(node1_artists, node2_artists):
    //         artist1 = self._clean_name(artist1)
    //         artist2 = self._clean_name(artist2)
    //         if artist1 == artist2:
    //             squared_dif["artists"] = 1
    //             break
    //     else:
    //         squared_dif["artists"] = 0

    //     # Handling Key Data. If songs share key then 1, 0 if they dont
    //     squared_dif["key"] = int(node1["key"] == node2["key"])

    //     # Handling typical NUMERICAL features
    //     for attr in self.FEATURES["useful"]["typical"]:
    //         dif = float(node1[attr]) - float(node2[attr])
    //         nomrmalized_dif = (dif) / self.NORMALIZATIONS[attr]
    //         squared_dif[attr] = nomrmalized_dif ** 2

    //     # AT THIS POINT squared_dif SHOULD BE FILLED WITH UNWEIGHTED NORMALIZED SQUARED DIFFERENCES

    //     if weights is None:
    //         weights = self.DEFAULT_WEIGHTS

    //     for attr in self.FEATURES["useful"]["all"]:
    //         score += weights[attr] * squared_dif[attr]
        
    //     return score

    return 0.0;
}

void GraphBuilder::readInSingleNormalLine(string line){
    stringstream ss(line);

    Song s = Song();
    string val;

    // burn initial row number
    getline(ss, val, ',');

    // accousticness
    getline(ss, val, ',');
    s.acousticness = val;

    // artists
    getline(ss, val, ',');
    s.artists = val;

    // danceability
    getline(ss, val, ',');
    s.danceability = val;

    // duration_ms
    getline(ss, val, ',');
    s.duration_ms = val;

    // energy
    getline(ss, val, ',');
    s.energy = val;

    // is_explicit
    getline(ss, val, ',');
    s.is_explicit = val;

    // id
    getline(ss, val, ',');
    s.id = val;

    // instrumentalness
    getline(ss, val, ',');
    s.instrumentalness = val;

    // key
    getline(ss, val, ',');
    s.key = val;

    // liveness
    getline(ss, val, ',');
    s.liveness = val;

    // loudness
    getline(ss, val, ',');
    s.loudness = val;

    // mode
    getline(ss, val, ',');
    s.mode = val;

    // name
    getline(ss, val, ',');
    s.name = val;

    // popularity
    getline(ss, val, ',');
    s.popularity = val;

    // release_date
    getline(ss, val, ',');
    s.release_date = val;

    // speechiness
    getline(ss, val, ',');
    s.speechiness = val;

    // tempo
    getline(ss, val, ',');
    s.tempo = val;

    // valence
    getline(ss, val, ',');
    s.valence = val;

    // year
    getline(ss, val, ',');
    s.year = val;

    // might need extra read to complete the line
    
    allSongs.push_back(s);
}

// INCOMPLETE
void GraphBuilder::readInWithoutBackslash(string line){
    
    Song song = Song();
    stringstream ss(line);
    string constructed = "";
    char curLetter;

    int column = -1;
    while (column <= 18){
        ss >> curLetter;
        constructed += curLetter;

        if (curLetter == ','){
            switch (column)
            {
            case 0:
                song.acousticness = constructed;
                constructed = "";
                break;
            case 1:
                song.artists = constructed;
                constructed = "";
                break;
            case 2:
                song.danceability = constructed;
                constructed = "";
                break;
            case 3:
                song.duration_ms = constructed;
                constructed = "";
                break;
            case 4:
                song.energy = constructed;
                constructed = "";
                break;
            case 5:
                song.is_explicit = constructed;
                constructed = "";
                break;
            case 6:
                song.id = constructed;
                constructed = "";
                break;
            case 7:
                song.instrumentalness = constructed;
                constructed = "";
                break;
            case 8:
                song.key = constructed;
                constructed = "";
                break;
            case 9:
                song.liveness = constructed;
                constructed = "";
                break;
            case 10:
                song.loudness = constructed;
                constructed = "";
                break;
            case 11:
                song.mode = constructed;
                constructed = "";
                break;
            case 12:
                song.name = constructed;
                constructed = "";
                break;
            case 13:
                song.popularity = constructed;
                constructed = "";
                break;
            case 14:
                song.release_date = constructed;
                constructed = "";
                break;
            case 15:
                song.speechiness = constructed;
                constructed = "";
                break;
            case 16:
                song.tempo = constructed;
                constructed = "";
                break;
            case 17:
                song.valence = constructed;
                constructed = "";
                break;
            case 18:
                song.year = constructed;
                constructed = "";
                break;
            default:
                constructed = "";
                break;
            }

            column += 1;
        }
    }
    
}

int main(){
  
    GraphBuilder gC = GraphBuilder();
    gC.readInCSV();
    gC.attatch_edges(0);
    return 0;
}

// PLAN:
// Use Python for reading in the CSV
// Use C++ for computing all the relationships
// Use C++ for writing relationships back out
// Use Python for uploading to firestore