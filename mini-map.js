const widthMini = 600,
  heightMini = 400;
const svgMini = d3.select("#mini-map").append("svg").attr("width", widthMini).attr("height", heightMini);

async function draw() {
  const topology = await d3.json("./data/counties-albers-10m.json");

  const topoCounties = topojson.feature(topology, topology.objects.counties);

  const uniqueCountiesArr = d3.groups(topoCounties.features, d => d.properties.name);
  const uniqueCounties = [...new Set(uniqueCountiesArr.filter(d => d[1].length === 1).map(d => d[0]))];
  //console.log(uniqueCounties);

  const projMini = d3.geoIdentity().fitSize([widthMini, heightMini], topoCounties);

  // path generator: translates topojson coordinates into SVG path values
  const pathMini = d3.geoPath().projection(projMini);

  const gMini = svgMini
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

  gMini
    .selectAll("path")
    .data(topoCounties.features)
    .join("path")
    .attr("d", pathMini)
    .attr("fill", "#FFFFE8")
    .attr("stroke", "#818181")
    .attr("stroke-width", "0.4px");

  gMini
    .selectAll("#uniqueCounties")
    .data(topoCounties.features.filter(d => uniqueCounties.indexOf(d.properties.name) >= 0))
    .join("path")
    .attr("d", pathMini)
    .attr("fill", "#8BE884")
    .attr("opacity", "0.5")
    .attr("stroke-width", "0.2px");
}
draw();
