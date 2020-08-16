
$(document).ready(function() {
  $.ajax({
    type: "GET",
    url: "graph_testing_data/song_name_data.csv",
    dataType: "text",
    success: function(data) {
      processData(data);
    }
    });
});

//This code was stolen* from https://www.w3schools.com/howto/howto_js_autocomplete.asp
// *With some modification, of course.
 
function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  autocomplete(document.getElementById("search-input"), allTextLines);
}

var currentFocus;

/*the autocomplete function takes two arguments,
the text field element and an array of possible autocompleted values:*/
function autocomplete(inp, arr) {
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    document.getElementById("autocomplete").setAttribute("style","height:" + 40 + "px");
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    document.getElementById("search-help").style.display = "none";
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    if (collapse) {
      a.style.width = "290px";
      a.style.marginLeft = "44px";
    } else {
      a.style.width = document.getElementById("search-input").offsetWidth * 0.95 + "px";
      a.style.marginLeft = "92px";
    }
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    var matches = new Array();
    for (i = 0; i < arr.length && matches.length < 12; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase() && !matches.includes(arr[i])) {
        matches.push(arr[i]);
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i].replace("'", "&apos;") + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            console.log(this.getElementsByTagName("input")[0].value);
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
            query(inp.value);
          });
        a.appendChild(b);
      }
    }
    document.getElementById("autocomplete").setAttribute("style","height:" + ((matches.length) * 43.4 + 36) + "px;");
  });

  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
    document.getElementById("search-help").style.display = "block";
    document.getElementById("autocomplete").setAttribute("style","height: 36px;");
  }
  
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}