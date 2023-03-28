class MainMap {
  constructor(state, setGlobalState) {
    const width = 1250,
      height = 800;

    const svg = d3.select("#counties-map").append("svg").attr("width", width).attr("height", height);
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const topoNation = topojson.feature(state.topology, state.topology.objects.nation);
    const topoStates = topojson.feature(state.topology, state.topology.objects.states);

    // map already has projection so not setting it here, but only fitting map to dimensions of svg
    const projection = d3
      .geoIdentity() // use for projection options when json is also projected: https://stackoverflow.com/questions/42430361/scaling-d3-v4-map-to-fit-svgMap-or-at-all
      .fitSize([width, height], topoNation); // https://stackoverflow.com/questions/69470766/how-to-center-and-scale-using-geopath

    // path generator: translates topojson coordinates into SVG path values
    const path = d3.geoPath().projection(projection);

    this.g = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .style("filter", "drop-shadow(3px 3px 2px rgb(0.5 0.5 0.5 / 0.1))");

    //states();

    this.counties = this.g
      .selectAll("path")
      .data(state.topoCounties.features)
      .join("path")
      .attr("d", path)
      .attr("stroke", "#818181")
      .attr("stroke-width", "0.4px")
      .attr("fill", "#FEFBE9")
      // add drop shadows inside counties
      .style("filter", "drop-shadow(1px 2px 1px rgb(0.5 0.5 0.5 / 0.1))");

    // draw states
    this.g.append("path").attr("d", path(topoStates)).attr("stroke-width", "0.7px");

    // draw country
    this.g.append("path").attr("d", path(topoNation)).attr("stroke-width", "0.75px").attr("stroke", "#ea710c");

    // tooltips
    this.counties
      .on("mouseover", (e, d) => {
        const countyName = d.properties.name;

        const stateName = state.stateValues.get(d.id.slice(0, 2)); // https://observablehq.com/@joeknittel/county-map-with-mouseover-effect

        const selectedCountyArr = state.topoCounties.features.filter(d => d.properties.name === countyName);
        //const selectedCountyCount = state.topoCounties.features.filter(d => d.properties.name === countyName).length;

        const selectedCountyCountText =
          selectedCountyArr.length > 1
            ? `<div class="county-count"><strong>${selectedCountyArr.length}</strong> counties have this name</div>`
            : `<div class="county-count">No other county has this name</div>`;

        let tooltipContent = `<div class="state-name">${stateName}</div>
        <div class="county-name">${countyName}</div>
        ${selectedCountyCountText}`;

        tooltip.html(tooltipContent).style("visibility", "visible");
        //console.log(e.toElement.attributes.fill.nodeValue);
      })
      .on("mouseout", e => {
        tooltip.style("visibility", "hidden");
        //d3.select(e.target).attr("fill", "#FEFBE9");
      })
      .on("mousemove", e => {
        if (window.innerWidth - d3.pointer(e)[0] > 375) {
          tooltip.style("transform", `translate(${e.pageX + 20}px,${e.pageY + 20}px)`);
        } else {
          tooltip.style("transform", `translate(${e.pageX - 200}px,${e.pageY - 100}px)`);
        }
      });
  }

  draw(state) {
    this.counties.exit().remove();
    this.counties
      .transition()
      // works but Lake for Red Lake
      // .attr(
      //   "fill",
      //   state.selectedCounty
      //     ? d => (state.selectedCounty.includes(d.properties.name.toLowerCase()) ? "#5D9C59" : "#FEFBE9")
      //     : "#FEFBE9"
      // )
      // works but only for one input county name
      // .attr(
      //   "fill",
      //   state.selectedCounty
      //     ? d => (d.properties.name.toLowerCase().includes(state.selectedCounty) ? "#5D9C59" : "#FEFBE9")
      //     : "#FEFBE9"
      // )

      // works but all county name versions show up
      // .attr(
      //   "fill",
      //   state.selectedCounty
      //     ? d =>
      //         state.selectedCounty.indexOf(d.properties.name.toLowerCase()) >= 0 &&
      //         state.selectedCounty.includes(d.properties.name.toLowerCase())
      //           ? "#5D9C59"
      //           : "#FEFBE9"
      //     : "#FEFBE9"
      // )
      .attr(
        "fill",
        state.selectedCounty || state.allUniqueCounties
          ? state.selectedCounty && !state.allUniqueCounties
            ? d => (d.properties.name.toLowerCase() === state.selectedCounty ? "#5D9C59" : "#FEFBE9")
            : d => (state.allUniqueCounties.indexOf(d.properties.name.toLowerCase()) >= 0 ? "#5D9C59" : "#FEFBE9")
          : "#FEFBE9"
      )
      .style("opacity", "0.85");

    // if (state.selectedCounty) {
    //   this.counties
    //     .transition()
    //     //.attr("fill", d => (state.selectedCounty.indexOf(d.properties.name) >= 0 ? "#5D9C59" : "#FEFBE9"))
    //     .attr("fill", d =>
    //       d.properties.name.toLowerCase().match(state.selectedCounty.toLowerCase()) ? "#5D9C59" : "#FEFBE9"
    //     )
    //     .style("opacity", "0.85");
    // }
  }
}

export { MainMap };