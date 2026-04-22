const W = 982;
const H = 450;

const TR = {
  train: {
    color: "#33E339",
    speed: 120,
    cost: 500,
    label: "Train",
  },
  bus: {
    color: "#A83BE8",
    speed: 80,
    cost: 100,
    label: "Bus",
  },
  airPlane: {
    color: "#000000",
    speed: 800,
    cost: 1000,
    label: "AirPlane",
  },
};

class App {
    constructor(){
        this.view = new View(
            document.getElementById('map-area'),
            document.getElementById('map-container'),
            document.getElementById('lines-layer'),
            document.getElementById('pinpoints-layer')
        ) 
    } 
}

window.addEventListener("load", new App());
