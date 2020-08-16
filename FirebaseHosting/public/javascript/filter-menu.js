//-----------------------------------
//           filter-menu.js
//
//  Javacsript dedicated to the
// functionality of the front-end
//          HTML elements.
//-----------------------------------

function formatMobile() {
  if (window.innerWidth < 800) {
    document.getElementById("outer-card").style.width = "100%";
    document.getElementById("scroll-container").style.width = "100%";
    document.getElementById("filter-settings").style.width = "100%";
    document.getElementById("search-algo").style.width = "100%";
    toggleCollapse(true);
    document.getElementById("btn-menu").style.display = "block";
  } else {
    document.getElementById("outer-card").style.width = "";
    document.getElementById("scroll-container").style.width = "min-content";
    document.getElementById("filter-settings").style.width = "24rem";
    document.getElementById("search-algo").style.width = "24rem";
    toggleCollapse(false);
    document.getElementById("btn-menu").style.display = "none";
  }
  document.dispatchEvent(new Event("click"));
}

var collapse;

function toggleCollapse(collapseTheMenu) {
  if (collapseTheMenu) {
    collapse = false;
    document.getElementById("scroll-container").style.display = "none";
  } else {
    collapse = true;
    document.getElementById("scroll-container").style.display = "block";
    resizeMenu();
  }
}

document.getElementById("btn-menu").addEventListener("click", () => toggleCollapse(collapse));

//Changes the text color of the label when the radio button is selected
var lastRadioLabelId;
var lastRadioChecked;
function radioToggle(radio) {
  var radioLabelId = radio.id + "-label";
  if (radioLabelId == lastRadioLabelId && lastRadioChecked) {
    radio.checked = false;
    if (lastRadioLabelId) document.getElementById(lastRadioLabelId).classList.remove("label-active");
    similarity("none");
  } else {
    document.getElementById(radioLabelId).classList.add("label-active");
    if (lastRadioLabelId && lastRadioLabelId != radioLabelId) document.getElementById(lastRadioLabelId).classList.remove("label-active");
    similarity(document.getElementById(radioLabelId).innerText);
  }
  lastRadioLabelId = radioLabelId;
  lastRadioChecked = radio.checked;
}


//JavaScript for the tree list; Shamelessly stolen from w3schools
var carets = document.getElementsByClassName("caret");//Find all carets
      
//Add event listener to each caret
[...carets].forEach(e => e.addEventListener("click", function() {
  this.parentElement.querySelector(".nested").classList.toggle("active");
  this.classList.toggle("caret-down");
}, ));
[...carets].forEach(e => e.dispatchEvent(new Event("click")));//Open the caret

resizeMenu();//Size the menu on page initialization

//==========================
//    Element Functions
//==========================

//Takes a search request and feeds it into query()
var searchInput = document.getElementById("search-input");
console.log(searchInput.value);
function searchBarInput(button) {
  if (button || event.key == "Enter") {//
    event.preventDefault();//Stops the page from reloading
    query(searchInput.value);
    document.dispatchEvent(new Event("click"));//Close the autocomplete window
  }
}

//Resizes the menu to fit the current screen height
function resizeMenu() {
  var topDivHeight = document.getElementById("filter-settings").getBoundingClientRect().height;
  var bottomDivHeight = document.getElementById("search-algo").getBoundingClientRect().height;
  var container = document.getElementById("scroll-container");
  if (topDivHeight + bottomDivHeight > window.innerHeight - 128) {
    container.style.height = window.innerHeight - 128 + "px";
  } else {
    container.style.height = topDivHeight + bottomDivHeight + 20 + "px";
  }
}

//Changes the text below the search bar for the request status
function searchAlert(status) {
  var alertText = document.getElementById("search-help");
  if (status >= 200 && status < 300) {//Successful responses
    //document.getElementById("search-form").setAttribute("style", "height: 40px; overflow: visible;")
    document.getElementById("scroll-container").style.marginTop = "8px";
    document.getElementById("outer-card").classList.remove("pb-4");
    if (status == 200) {
      alertText.innerText = "";
      alertText.classList.remove("text-danger");
    }
  } else if (status >= 500 && status < 600) {//Server error responses
    document.getElementById("scroll-container").style.marginTop = "28px";
    alertText.classList.add("text-danger");
    document.getElementById("search-form").setAttribute("style", "height: 40px; overflow: visible;")
    document.getElementById("outer-card").classList.add("pb-4");
    if (status == 500) {
      alertText.innerText = "Error: Could not find a song with that name.";
    } else {
      alertText.innerText = "Unknown Server Error - " + status + ": Try again or reload the page."
    }
  } else {//Other error responses
      alertText.innerText = "Unknown Error - " + status + "Try again or reload the page.";
  }
}

//Toggle functions for the loading bar
function showLoader() {
  document.getElementById("loading-bar").style["display"] = "block";
}

function hideLoader() {
  document.getElementById("loading-bar").style["display"] = "none";
}

//Functionality for the search button group
var searchType = 0;
function toggleButton(btn) {
  var btnDepth = document.getElementById("btn-depth");
  var btnBreadth = document.getElementById("btn-breadth");
  if (btn == 1 && !btnDepth.classList.contains("btn-active")) {
    btnDepth.classList.add("btn-active");
    btnBreadth.classList.remove("btn-active");
    //document.getElementById("pre-list").innerText = "Selected Depth-First Search";
    // ^ After the graph is drawn, This line gives me an error: "Uncaught TypeError: Cannot set property 'innerText' of null"
    searchType = 1;
    algoSearch();
  } else if (btn == 2 && !btnBreadth.classList.contains("btn-active")) {
    btnBreadth.classList.add("btn-active");
    btnDepth.classList.remove("btn-active");
    //document.getElementById("pre-list").innerText = "Selected Breadth-First Search";
    searchType = 2;
    algoSearch();
  } else if (btn == 0) {
    btnBreadth.classList.remove("btn-active");
    btnDepth.classList.remove("btn-active");
  }
  resizeMenu();
}

var searchResults;
//Invoke the search algorithms and give the data to the loadList function
function algoSearch() {
  if (getData() == undefined) {
    document.getElementById("pre-list").innerText = "No data to list";
    return;
  }
  else {
    searchResults = getSearchResultsAsList();
    loadList(searchResults);
    document.getElementById("btn-animate").style.display = "block";
  }
}

//Create a list of songs with dropdowns revealing the json properties
function loadList(nodes) {
  //Find the parent element for the list, and clear any previous data
  var parent = document.getElementById("search-list");

  parent.innerHTML = "";//Clear all HTML

  var parentList = document.createElement("ul");
  parent.appendChild(parentList);

  [...nodes].forEach(node => {
    var li = document.createElement("li");
    parentList.appendChild(li);

      var span = document.createElement("span");
      span.classList.add("caret")
      span.innerText = node.name + " - " + node.artists[0];
      li.appendChild(span);

      var ul = document.createElement("ul");
      ul.classList.add("nested");
      ul.classList.add("ml-2");
      li.appendChild(ul);

        var linkSpotify = document.createElement("a");
        linkSpotify.innerText = "Open this song in Spotify";
        linkSpotify.href = "javascript:window.open(\"spotify:track:" + node.id + "\");";
        linkSpotify.style.color = "#72c0ff";
        ul.appendChild(linkSpotify);

        var br = document.createElement("br");
        ul.appendChild(br);

        var linkSearch = document.createElement("a");
        linkSearch.innerText = "Search this song here";
        linkSearch.href = "javascript:query(\"" + node.name + "\");";
        linkSearch.style.color = "#72c0ff";
        ul.appendChild(linkSearch);

        var br = document.createElement("br");
        ul.appendChild(br);

        var keys = new Map();
        for (var key in node) {
          //Do not show these properties
          if (key == "name" || 
          key == "x" || 
          key == "y" ||
          key == "fx" ||
          key == "fy" || 
          key == "vx" || 
          key == "vy" || 
          key == "index" ||
          key == "sim" ||
          key == "graph_node" || 
          key == "album_cover") continue;
          else keys.set(key + '', node[key]);
        }
        //Sort Map
        //https://stackoverflow.com/questions/31158902/is-it-possible-to-sort-a-es6-map-object/44109065
        var orderedKeys = new Map([...keys.entries()].sort());
        for (key of orderedKeys) {
          var property = document.createTextNode("- " + key[0] + ": " + key[1]);
          ul.appendChild(property);

          var br = document.createElement("br");
          ul.appendChild(br);
        }

        //Eventlistener for the tree list dropdowns
        span.addEventListener("click", function() {
          this.parentElement.querySelector(".nested").classList.toggle("active-list");
          this.classList.toggle("caret-down");
          //Toggle the color of the song dropdown and toggle the node selected
          if (this.style.color == "rgb(245, 245, 245)" || this.style.color == "") {
            this.style.color = "rgb(255, 92, 92)"; 
            selectNode(node);
          } else {
            this.style.color = "rgb(245, 245, 245)";
            deselectNode(node);
          }
        }, );

        var br = document.createElement("br");
        ul.appendChild(br);
        ul.appendChild(br);
  });
}

//Clears the search display of songs
function clearSearchDisplay() {
  var searchDisplay = document.getElementById("search-list");
  //Clear the search window
  searchDisplay.innerHTML = "";
  //Add the select search method text
  var span = document.createElement("span");
  span.innerText = "Select a search method";
  span.classList.add("text-muted");
  searchDisplay.appendChild(span);
}

//Highlights successive nodes after a short delay, demonstrating the search methods in real-time
var isAnimationActive;
function animateSearch() {
  if (isAnimationActive) return;
  else isAnimationActive = true;
  console.log("Starting animation");
  var searchList = document.getElementById("search-list");
  var songDropdowns = searchList.children[0].children;
  //console.log(searchedSongs);
  //Animate each node by openening each dropdown and selecting each node
  for (let index = 0; index < songDropdowns.length; index++) {
    animationFrame(songDropdowns[index], searchResults[index], index);
  }

  //Finish the animation by closing the dropdowns and deselecting the songs
  cleanUpAnimation(songDropdowns);
}

//Javascript is a strange language, so all 50 animationFrame() calls actually happen (mostly) concurrently.
//To get around this, the timeout for each frame is set at 200 * index, which adds an extra 0.2s of delay per frame index.
//So even though they execute concurrently, they are still spaced out with a delay of 0.2s
//Credit to the website below for helping me understand this 
//https://www.freecodecamp.org/news/thrown-for-a-loop-understanding-for-loops-and-timeouts-in-javascript-558d8255d8a4/ 
function animationFrame(songDropdown, node, index) {
  setTimeout(function() {
    songDropdown.style.color = "rgb(255, 92, 92)";//Color dropdown red
    selectNode(node);//Color node red
  }, index * 200);//Wait 200ms
}

//Reccolor all the dropdowns and deselect the nodes
function cleanUpAnimation(songDropdowns) {
  setTimeout(function() {
    console.log("Animation done.");
    for (let index = 0; index < songDropdowns.length; index++) {
      songDropdowns[index].style.color = "rgb(245, 245, 245)";
    }
    deselectAll();
    isAnimationActive = false;
  }, songDropdowns.length * 200 + 100);
}
