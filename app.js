import { Search } from "./Search.js";
import { MainMap } from "./MainMap.js";
import { MiniMap } from "./MiniMap.js";
import { Table } from "./Table.js";

let search, mainMap, miniMap, table;

// global state: elements that will change based on user interaction
let state = {
  topology: [], // array
  topoCounties: [],
  countyNameList: [],
  selectedCounty: null, // single data point
  stateValues: [],
  allUniqueCounties: null,
};

// load data and initiate app
async function loadData() {
  // import data
  state.topology = await d3.json("./data/counties-albers-10m.json");

  // all counties array to lay out map
  state.topoCounties = topojson.feature(state.topology, state.topology.objects.counties);
  // fix encoding:
  state.topoCounties.features.forEach(d => {
    if (d.properties.name === "DoÃ±a Ana") {
      d.properties.name = "Doña Ana";
    }
  });

  // generate list of counties to populate search box autocomplete
  state.countyNameList = [...new Set(state.topoCounties.features.map(d => d.properties.name))];

  // list of states for tooltip + search result text
  state.stateValues = new Map(state.topology.objects.states.geometries.map(d => [d.id, d.properties.name]));

  init();
}
loadData();

// initial load
function init() {
  search = new Search(state, setGlobalState);
  mainMap = new MainMap(state, setGlobalState);
  miniMap = new MiniMap(state, setGlobalState);
  table = new Table(state, setGlobalState);

  draw();
}

// when user input changes
function draw() {
  search.draw(state, setGlobalState);
  mainMap.draw(state); // this will be changed based on user interaction
  miniMap.draw(state, setGlobalState);
}

// updates states, to pass to components so they can update the global state object
function setGlobalState(nextState) {
  state = { ...state, ...nextState }; // previous state, updated state
  draw();
}
