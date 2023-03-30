class MiniMap {
  constructor(state, setGlobalState) {
    // show all counties that don't share a name with any other
    const uniqueCountiesArr = d3.groups(state.topoCounties.features, d => d.properties.name);

    // generates list of names
    this.uniqueCounties = [...new Set(uniqueCountiesArr.filter(d => d[1].length === 1).map(d => d[0]))];
    this.toggleUnique = document.getElementById("map-show-btn");

    const width = 600,
      height = 400;

    const svg = d3.select("#mini-map").append("svg").attr("width", width).attr("height", height);

    const projection = d3.geoIdentity().fitSize([width, height], state.topoCounties);

    // path generator: translates topojson coordinates into SVG path values
    const path = d3.geoPath().projection(projection);

    const g = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    g.selectAll("path")
      .data(state.topoCounties.features)
      .join("path")
      .attr("d", path)
      .attr("fill", "#FFFFE8")
      .attr("stroke", "#818181")
      .attr("stroke-width", "0.4px");

    g.selectAll("#uniqueCounties")
      .data(state.topoCounties.features.filter(d => this.uniqueCounties.indexOf(d.properties.name) >= 0))
      .join("path")
      .attr("d", path)
      .attr("fill", "#8BE884")
      .attr("opacity", "0.5")
      .attr("stroke-width", "0.2px");

    this.toggleUnique.addEventListener(
      "click",
      () => {
        setGlobalState({ selectedCounty: null });
        setGlobalState({ allUniqueCounties: this.uniqueCounties.map(d => d.toLowerCase()) });
        console.log("fire toggle");
      },
      false
    );
  }
}

export { MiniMap };
