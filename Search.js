class Search {
  // setup: how object is initialized
  constructor(state, setGlobalState) {
    // search elements
    this.countySearch = document.getElementById("county-search-input");
    this.submitButton = document.getElementById("county-submit-btn");
    this.clearButton = document.getElementById("clear-map-btn");
  }

  // autocomplete county search box: code and comments from
  // https://www.w3schools.com/howto/howto_js_autocomplete.asp
  autocomplete(inp, arr) {
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
      var a,
        b,
        i,
        val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) {
        return false;
      }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          // apostrophe fix: https://stackoverflow.com/questions/54790891/escaping-apostrophes-in-javascript
          b.innerHTML += "<input type='hidden' value='" + arr[i].replace(/'/g, "&#x27;") + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
            closeAllLists();
          });

          a.appendChild(b);
        }
      }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode === 40) {
        /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode === 38) {
        //up
        /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode === 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }

        if (e.keyCode === "Enter") {
          this.submitButton.click();
          closeAllLists();
          e.preventDefault();
        }
      }
    });
    function addActive(x) {
      console.log(x);
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
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
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });

    // make dropdown list disappear after you click enter w/o manually selecting dropdown option
    this.countySearch.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Enter") {
          closeAllLists();
          e.preventDefault();
        }
      },
      false
    );
  }

  // user interaction
  draw(state, setGlobalState) {
    // search box list
    new Search().autocomplete(this.countySearch, state.countyNameList);

    // search box
    this.countySearch.onkeyup = e => {
      if (e.key === "Enter") {
        setGlobalState({ selectedCounty: this.countySearch.value.toLowerCase() });
        outputMsg(this.countySearch.value.toLowerCase());

        e.preventDefault();
        setGlobalState({ allUniqueCounties: null });
      }
    };

    this.submitButton.onclick = e => {
      setGlobalState({ selectedCounty: this.countySearch.value.toLowerCase() });
      outputMsg(this.countySearch.value.toLowerCase());
      e.preventDefault();
      setGlobalState({ allUniqueCounties: null });
    };

    // msg under search box
    function outputMsg(countyValue) {
      // return topology data filtered to input county
      const countyArr = state.topoCounties.features.filter(d => d.properties.name.toLowerCase() === countyValue);

      const facts = d3.select("#output-msg");
      facts.selectAll("text").remove();

      if (countyArr.length > 1) {
        facts.append("text").html(`${countyArr.length} counties found`).style("color", "#ea710c");
      } else if (countyArr.length === 1) {
        countyArr.forEach(d => {
          facts
            .append("text")
            .text(`One county found in ${state.stateValues.get(d.id.slice(0, 2))}`)
            .style("color", "#ea710c");
        });
      } else if (countyValue.includes("County")) {
        facts.append("text").html('Remove "county" from your search term');
      } else if (countyValue === "") {
        facts.selectAll("text").remove();
      } else if (countyArr.length === 0) {
        facts.append("text").text("No results. Select a county name from the dropdown list.");
      }
    }
    // clear county selections
    if (!state.selectedCounty) {
      this.countySearch.value = "";
      outputMsg("");
    }

    if (!state.selectedCounty && !state.allUniqueCounties && this.countySearch.value === "") {
      document.querySelector("#clear-map-btn").style.display = "none";
    } else {
      document.querySelector("#clear-map-btn").style.display = "inline-block";
    }

    this.clearButton.onclick = e => {
      this.countySearch.value = "";
      setGlobalState({ selectedCounty: null });
      setGlobalState({ allUniqueCounties: null });
      outputMsg("");
      e.preventDefault();
      console.log("testclear");
    };
  }
}

export { Search };
