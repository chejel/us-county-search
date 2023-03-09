// dimensions
const width = 1250,
  height = 800;

const svg = d3.select("#counties-map").append("svg").attr("width", width).attr("height", height);

let topology;

async function draw() {
  // import data
  topology = await d3.json("./data/counties-albers-10m.json");

  // map boundary to set dimensions
  const topoNation = topojson.feature(topology, topology.objects.nation);
  const topoStates = topojson.feature(topology, topology.objects.states);
  const topoCounties = topojson.feature(topology, topology.objects.counties);
  // fix encoding
  topoCounties.features.forEach(d => {
    if (d.properties.name === "DoÃ±a Ana") {
      d.properties.name = "Doña Ana";
    }
  });

  const countyNames = [...new Set(topoCounties.features.map(d => d.properties.name))];
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");
  console.log(Object.values(topoCounties.features.filter(d => d.properties.name === "Doña Ana")));

  // map already has projection so not setting it here, but only fitting map to dimensions of svg
  const projection = d3
    .geoIdentity() // use for projection options when json is also projected: https://stackoverflow.com/questions/42430361/scaling-d3-v4-map-to-fit-svgMap-or-at-all
    .fitSize([width, height], topoNation); // https://stackoverflow.com/questions/69470766/how-to-center-and-scale-using-geopath

  // path generator: translates topojson coordinates into SVG path values
  const path = d3.geoPath().projection(projection);

  const g = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .style("filter", "drop-shadow(3px 3px 2px rgb(0.5 0.5 0.5 / 0.1))");

  const nation = () => {
    g.append("path").attr("d", path(topoNation)).attr("stroke-width", "0.75px").attr("stroke", "#ea710c");
  };

  const states = () => {
    g.append("path").attr("d", path(topoStates)).attr("stroke-width", "0.7px");
  };

  const counties = g
    .selectAll("path")
    .data(topoCounties.features)
    .join("path")
    .attr("d", path)
    .attr("stroke", "#818181")
    .attr("stroke-width", "0.4px")
    .attr("fill", "#FEFBE9");
  counties.style("filter", "drop-shadow(1px 2px 1px rgb(0.5 0.5 0.5 / 0.1))");

  counties
    .on("mouseover", (e, d) => {
      const stateValues = new Map(topology.objects.states.geometries.map(d => [d.id, d.properties.name]));
      const countyName = d.properties.name;
      const stateName = stateValues.get(d.id.slice(0, 2)); // https://observablehq.com/@joeknittel/county-map-with-mouseover-effect
      const selectedCountyCount = topoCounties.features.filter(d => d.properties.name === countyName).length;

      const selectedCountyCountText =
        selectedCountyCount > 1
          ? `<div class="county-count"><strong>${selectedCountyCount}</strong> counties have this name</div>`
          : `<div class="county-count">No other county has this name</div>`;

      let tooltipContent = `<div class="state-name">${stateName}</div>`;
      tooltipContent += `<div class="county-name">${countyName} County</div>`;
      tooltipContent += selectedCountyCountText;
      tooltipContent += tooltip.html(tooltipContent).style("visibility", "visible");
    })
    .on("mouseout", e => {
      tooltip.style("visibility", "hidden");
    })
    .on("mousemove", e => {
      if (window.innerWidth - d3.pointer(e)[0] > 375) {
        tooltip.style("transform", `translate(${e.pageX + 20}px,${e.pageY + 20}px)`);
      } else {
        tooltip.style("transform", `translate(${e.pageX - 200}px,${e.pageY - 100}px)`);
      }
    });

  states();
  nation();

  // search elements
  const countySearch = document.getElementById("county-search-btn");
  const submitButton = document.getElementById("county-submit-btn");
  const clearButton = document.getElementById("clear-map-btn");
  const toggleUnique = document.getElementById("map-show-btn");

  // click submit button on search
  submitButton.addEventListener(
    "click",
    () => {
      countyInput(toTitleCase(countySearch.value));
      colorMap(toTitleCase(countySearch.value));
    },
    false
  );

  // pressing return on search
  countySearch.addEventListener(
    "keyup",
    e => {
      if (e.key === "Enter") {
        countyInput(toTitleCase(e.target.value));
        colorMap(toTitleCase(e.target.value));
        e.preventDefault();
        //submitButton.click();
      }
    },
    false
  );

  // clear county selections
  clearButton.addEventListener(
    "click",
    () => {
      countySearch.value = "";
      submitButton.click();
    },
    false
  );

  // show all counties that don't share a name with any other
  const uniqueCountiesArr = d3.groups(topoCounties.features, d => d.properties.name);
  const uniqueCounties = [...new Set(uniqueCountiesArr.filter(d => d[1].length === 1).map(d => d[0]))];

  toggleUnique.addEventListener(
    "click",
    () => {
      countyInput(uniqueCounties);
      colorMap(uniqueCounties);
    },
    false
  );

  autocomplete(countySearch, countyNames);

  function autocomplete(inp, arr) {
    // text input, array of counties

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
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

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
          submitButton.click();
          closeAllLists();
          e.preventDefault();
        }
      }
    });
    function addActive(x) {
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

    countySearch.addEventListener("keydown", function (e) {
      if (e.key == "Enter") {
        closeAllLists();
        submitButton.click();
        //e.preventDefault();
      }
    });
  }

  // msg under search box
  function countyInput(countyValue) {
    let selectedCountyCount = topoCounties.features.filter(d => d.properties.name === countyValue).length;
    const facts = d3.select("#output-msg");
    facts.selectAll("text").remove();

    if (selectedCountyCount > 1) {
      facts.append("text").html(`${selectedCountyCount} counties found`).style("color", "#ea710c");
    } else if (selectedCountyCount === 1) {
      facts.append("text").text("One county found").style("color", "#ea710c");
    } else if (countyValue.includes("County")) {
      facts.append("text").html('Remove "county" from your search term');
    } else if (!countyValue) {
      facts.selectAll("text").remove();
    } else if (countyValue == uniqueCounties) {
      facts
        .append("text")
        .html("These 1,390 counties do not share a name with any other county.")
        .style("color", "#ea710c");
    } else {
      facts.append("text").text("No results. Select a county name from the dropdown list.");
    }
  }

  function colorMap(countyValue) {
    g.selectAll("path").data(topoCounties.features);

    counties.exit().remove();

    counties
      //.join("path")
      //.merge(selectedCounties)
      .transition()
      //.duration(500)
      //.ease(d3.easeLinear)
      //.attr("d", path)
      //.style("filter", "drop-shadow(1px 2px 1px rgb(0.5 0.5 0.5 / 0.1))")
      //.attr("fill", d => (d.properties.name === countyValue ? "#5D9C59" : "#FEFBE9"))
      .attr("fill", d => (countyValue.indexOf(d.properties.name) >= 0 ? "#5D9C59" : "#FEFBE9"))
      .style("opacity", "0.85");
  }

  function showUniqueCounties() {
    g.selectAll("path").data(topoCounties.features);

    counties
      .transition()
      .attr("fill", d => (d.properties.name === countyValue ? "#5D9C59" : "#FEFBE9"))
      .style("opacity", "0.85");
  }

  // convert string to title case
  // https://www.geeksforgeeks.org/convert-string-to-title-case-in-javascript/
  function toTitleCase(countyValue) {
    return countyValue
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }
}

draw();
