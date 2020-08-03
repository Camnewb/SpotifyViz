//-----------------------------------
//           filter-menu.js
//
//  Javacsript dedicated to the
// functionality of the front-end
//          HTML elements.
//-----------------------------------

//Set all checkbox labels to change color when the checkbox is checked
//Uses a stack of all the colors and pops each off to give them to a checkbox label when checked
var checkboxes = document.getElementsByClassName("form-check-input mr-2");//Find all carets
var colors = ["label-active-1", "label-active-2", "label-active-3", 
"label-active-4", "label-active-5", "label-active-6", 
"label-active-7", "label-active-8", "label-active-9", 
"label-active-10", "label-active-11", "label-active-12"];
[...checkboxes].forEach(e => e.addEventListener("click", function() {
  //checkboxLabel refers to the id of the checkbox label
  var checkboxLabel = this.id + "-label";
  if (document.getElementById(this.id).checked) {
    //Add the color to the checkbox label and remove the label from the list of active labels
    document.getElementById(checkboxLabel).className = colors.shift(checkboxLabel);
  } else {
    colors.unshift(document.getElementById(checkboxLabel).className);//Add the label back to the list of active labels
    document.getElementById(checkboxLabel).className = "";//Remove the color from the checkbox label
  }
}, ));

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

function searchBarInput(song) {
  if (event.key === 'Enter') {
    event.preventDefault();//Stops the page from reloading
    query(song)
  }
}

function resizeMenu() {
  var topDivHeight = document.getElementById("filter-settings").getBoundingClientRect().height;
  var bottomDivHeight = document.getElementById("search-algo").getBoundingClientRect().height;
  var container = document.getElementById("scroll-container");
  if (topDivHeight + bottomDivHeight > window.innerHeight - 120) {
    container.style.height = window.innerHeight - 120+ "px";
  } else {
    container.style.height = topDivHeight + bottomDivHeight + 20 + "px";
  }
}

//Changes the text below the search bar for the request status
function searchAlert(status) {
  var alertText = document.getElementById("searchHelp");
  if (status >= 200 && status < 300) {//Successful responses
    if (status == 200) {
      alertText.innerText = "";
      alertText.classList.remove("text-danger");
    }
  } else if (status >= 500 && status < 600) {//Server error responses
    alertText.classList.add("text-danger");
    if (status == 500) {
      alertText.innerText = "Error: Could not find a song with that name. Remember search requests are case-sensitive.";
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

        for (var key in node) {
          //Do not show these properties
          if (key == "name" || 
          key == "x" || 
          key == "y" || 
          key == "vx" || 
          key == "vy" || 
          key == "index") continue;
          var property = document.createTextNode("- " + key + ": " + node[key]);
          ul.appendChild(property);

          var br = document.createElement("br");
          ul.appendChild(br);
        }

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

        var link = document.createElement("a");
        link.innerText = "Search this song";
        link.href = "javascript:query(\"" + node.name + "\");";
        link.style.color = "#72c0ff";
        link.classList.add("ml-2");
        ul.appendChild(link);

        var br = document.createElement("br");
        ul.appendChild(br);
        ul.appendChild(br);
  });
}

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
var isAnimationActive
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
    songDropdown.style.color = "rgb(255, 92, 92)";
    selectNode(node);
  }, index * 200);
}

//Reclose all the dropdowns and deselect the nodes
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
