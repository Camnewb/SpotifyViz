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
var d = new Date();
document.getElementById("release-date-select").value = getDateDashFormat(d);
document.getElementById("year-input").value = d.getFullYear();

//Set all checkbox labels to change color when the checkbox is checked
var checkboxes = document.getElementsByClassName("form-check-input mr-2");//Find all carets
for (var i = 0; i < checkboxes.length; i++) {
 checkboxes[i].addEventListener("click", function() {
    document.getElementById(this.id + "-label").classList.toggle("label-active");
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

function getDateDashFormat(d) {
  dateString = "";
  dateString = dateString + d.getFullYear() + "-";
  dateString = dateString + ((d.getMonth() + 1).toString().length < 2 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-";
  dateString = dateString + (d.getDate().toString().length < 2 ?  "0" + d.getDate() : d.getDate());
  return dateString;
}