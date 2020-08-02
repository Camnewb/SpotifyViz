//-----------------------------------
//           filter-menu.js
//
//  Javacsript dedicated to the
// functionality of the front-end
//          HTML elements.
//-----------------------------------

//JavaScript for the tree list; Shamelessly stolen from w3schools
var carets = document.getElementsByClassName("caret");//Find all carets
      
//Add event listener to each caret
[...carets].forEach(e => e.addEventListener("click", function() {
  this.parentElement.querySelector(".nested").classList.toggle("active");
  this.classList.toggle("caret-down");
}, ));
[...carets].forEach(e => e.dispatchEvent(new Event("click")));//Open the caret

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

resizeMenu();//Size the menu on page initialization

//==========================
//    Element Functions
//==========================

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

//Check if enter key is pressed, then query a song
function search(value) {
  if (event.key === 'Enter') {
      event.preventDefault();//Stops the page from reloading
      query(value);
  }
}

//Takes a range value (0-100) and returns an easily readable quartic power of the value
function quarticSliderDisplay(sliderValue) {
  var value = Math.pow(sliderValue, 4) * 10;//This is the new value to be represented
  //Add commas or prefixes to make it readable
  var display = value.toString();
  if (value < 10000000) {
    if (value > 999) display = insertAt(display, ",", display.length - 3);
    if (value > 999999) display = insertAt(display, ",", display.length - 7);
  } else if (value < 999999999) {
    display = (value / 1000000).toFixed(1) + " million";
  } else {
    display = "1 billion";
  }
  return display;
}

//Functionality for the search button group
function toggleButton(btn) {
  var btnDepth = document.getElementById("btn-depth");
  var btnBreadth = document.getElementById("btn-breadth");
  if (btn == 1 && !btnDepth.classList.contains("btn-active")) {
    btnDepth.classList.add("btn-active");
    btnBreadth.classList.remove("btn-active");
    document.getElementById("pre-list").innerText = "Selected Depth-First Search";
    // ^ After the graph is drawn, This line gives me an error: "Uncaught TypeError: Cannot set property 'innerText' of null"
    searchType = 1;
  } else if (btn == 2 && !btnBreadth.classList.contains("btn-active")) {
    btnBreadth.classList.add("btn-active");
    btnDepth.classList.remove("btn-active");
    document.getElementById("pre-list").innerText = "Selected Breadth-First Search";
    searchType = 2;
  }
}

var searchType = 0;
//Invoke the search algorithms and give the data to the loadList function
function algoSearch() {
  if (getData() == undefined) {
    document.getElementById("pre-list").innerText = "No data to list";
    return;
  }
  if (searchType == 1) {
    loadList(searchResults);
  } else if (searchType == 2) {
    loadList(searchResults);
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
      li.appendChild(ul);

        for (var key in node) {
          //Do not show these properties
          if (key == "name" || 
          key == "x" || 
          key == "y" || 
          key == "vx" || 
          key == "vy") continue;
          var property = document.createTextNode(key + ": " + node[key]);
          ul.appendChild(property);
          //property.setAttribute("style", "textIndent: 5px;")

          var br = document.createElement("br");
          ul.appendChild(br);
        }
        var br = document.createElement("br");
          ul.appendChild(br);
  });
  //Attach event listeners to all the dropdown songs
  var carets = document.getElementsByClassName("caret");//Find all carets
  [...carets].forEach(e => e.addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  }, ));
}

//==========================
//    Utility Functions
//==========================

//Inserts a string at the desired index
function insertAt(str, insert, index) {
  return str.slice(0, index) + insert + str.slice(index, str.length);
}

//Changes the inner text of the target element
function editInnerText(text, target) {
  document.getElementById(target).innerText = text;
}

