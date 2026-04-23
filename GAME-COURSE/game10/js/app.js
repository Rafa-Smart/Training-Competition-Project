import { Graph } from './Graph.js';
import { Viewport } from './Viewport.js';
import { Renderer } from './Renderer.js';
import { AppConfig } from './Config.js';

class MapApp {
  constructor() {
    this.graph = new Graph();
    this.viewport = new Viewport();
    this.renderer = new Renderer(
      document.getElementById('lines-layer'),
      document.getElementById('pinpoints-layer')
    );
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadData();
    this.render();
  }

  setupEventListeners() {
    // Delegate events to small, named methods
    window.addEventListener('wheel', (e) => this.onWheel(e));
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    // ... etc
  }

  onWheel(e) {
    if (!e.ctrlKey) return;
    const factor = e.deltaY < 0 ? MAP_CONFIG.ZOOM_SENSITIVITY : 1 / MAP_CONFIG.ZOOM_SENSITIVITY;
    this.viewport.handleZoom(e.clientX, e.clientY, factor, {
      min: MAP_CONFIG.MIN_SCALE,
      max: MAP_CONFIG.MAX_SCALE
    });
    this.render();
  }

  render() {
    this.renderer.updatePins(this.graph.pins);
    this.renderer.drawConnections(this.graph.conns, this.graph.pins, this.viewport);
    // Apply CSS Transform
    document.getElementById('map-container').style.transform = 
      `translate(${this.viewport.ox}px, ${this.viewport.oy}px) scale(${this.viewport.scale})`;
  }
}

new MapApp();
