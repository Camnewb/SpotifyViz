//JavaScript for the tree list; Shamelessly stolen from w3schools
var carets = document.getElementsByClassName("caret");//Find all carets
      
for (var i = 0; i < carets.length; i++) {
  //Add event listener to each caret
 carets[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  }, );
 carets[i].dispatchEvent(new Event("click"));//Open the caret
}

//Set the current date for the date select and year input box
// var d = new Date();
// document.getElementById("release-date-select").value = getDateDashFormat(d);
// document.getElementById("year-input").value = d.getFullYear();

//Set all checkbox labels to change color when the checkbox is checked
var checkboxes = document.getElementsByClassName("form-check-input mr-2");//Find all carets
var colors = ["label-active-1", "label-active-2", "label-active-3", 
"label-active-4", "label-active-5", "label-active-6", 
"label-active-7", "label-active-8", "label-active-9", 
"label-active-10", "label-active-11", "label-active-12"];
for (var i = 0; i < checkboxes.length; i++) {
 checkboxes[i].addEventListener("click", function() {
    //checkboxLabel refers to the id of the checkbox label
    var checkboxLabel = this.id + "-label";
    if (document.getElementById(this.id).checked) {
      document.getElementById(checkboxLabel).className = colors.shift(checkboxLabel);
    } else {
      colors.unshift(document.getElementById(checkboxLabel).className);//Remove the label from the list of active labels
      document.getElementById(checkboxLabel).className = "";
    }
    //colors.sort();
  }, );
}

//====================================================================

//Edits the innerText of the document element with an id of target
function editInnerText(value, target) {
  document.getElementById(target).innerText = value;
}

//Takes a range value (0-100) and returns an easily readable quartic power of the value
function quarticSliderDisplay(sliderValue) {
  var value = Math.pow(sliderValue, 4) * 10;
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

function insertAt(str, insert, index) {
  return str.slice(0, index) + insert + str.slice(index, str.length);
}

// function getDateDashFormat(d) {
//   dateString = "";
//   dateString = dateString + d.getFullYear() + "-";
//   dateString = dateString + ((d.getMonth() + 1).toString().length < 2 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-";
//   dateString = dateString + (d.getDate().toString().length < 2 ?  "0" + d.getDate() : d.getDate());
//   return dateString;
// }