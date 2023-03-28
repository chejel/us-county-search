class Table {
  constructor(state, setGlobalState) {
    const data = [
      { county: "Washington", count: 31 },
      { county: "Franklin", count: 26 },
      { county: "Jefferson", count: 26 },
      { county: "Jackson", count: 24 },
      { county: "Lincoln", count: 24 },
      { county: "Madison", count: 20 },
      { county: "Clay", count: 18 },
      { county: "Montgomery", count: 18 },
      { county: "Union", count: 18 },
      { county: "Marion", count: 17 },
      { county: "Monroe", count: 17 },
    ];

    // html table: table > thead > tr > th > tbody > tr > td > tfoot > tr > td
    // https://www.w3schools.com/tags/tag_thead.asp

    // create svg canvas/container
    const table = d3.select("#table-top");

    // header row
    const thead = table.append("thead");

    thead
      .append("tr")
      .selectAll("th")
      .data(Object.keys(data[0]))
      .join("td")
      .text(d => d)
      .style("text-transform", "capitalize")
      .attr("class", "top-counties")
      .style("background-color", "#ea710c")
      .style("font-weight", "700")
      .style("color", "hsla(0, 0%, 93%, 1)");

    // body rows
    this.rows = table.append("tbody").selectAll("tr").data(data).join("tr");

    // cells (each data point goes into a cell, and each cell falls within a row)
    this.rows
      .selectAll("td")
      .data(d => Object.values(d))
      .join("td")
      .text(d => d)
      .attr("class", "top-counties");

    this.rows.on("click", (e, d) => {
      setGlobalState({ selectedCounty: d.county.toLowerCase() });
    });

    // rows.on("click", function (d) {
    //   let tableCounty = d.target.innerHTML;
    //   console.log(tableCounty);
    // });
  }
}

export { Table };
