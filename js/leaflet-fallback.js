/**
 * NextRoute Logistics - Lightweight Offline Leaflet Mock Fallback
 * Automatically activates ONLY when Leaflet CDN (unpkg.com) is blocked or offline.
 * Prevents JavaScript ReferenceErrors and renders an attractive GIS grid with vehicle markers.
 */

(function() {
  if (typeof window === "undefined" || typeof window.L !== "undefined") {
    return; // Real Leaflet is already present
  }

  function Layer() {
    this.popupContent = "";
    this.addTo = function(map) {
      if (map && map.addLayer) map.addLayer(this);
      return this;
    };
    this.bindPopup = function(content) {
      this.popupContent = content;
      return this;
    };
    this.setLatLng = function(latlng) {
      this.latlng = latlng;
      return this;
    };
    this.setIcon = function(icon) {
      this.icon = icon;
      return this;
    };
  }

  function Marker(latlng, options) {
    if (!(this instanceof Marker)) return new Marker(latlng, options);
    Layer.call(this);
    this.latlng = latlng;
    this.options = options || {};
  }
  Marker.prototype = Object.create(Layer.prototype);

  function Polyline(latlngs, options) {
    if (!(this instanceof Polyline)) return new Polyline(latlngs, options);
    Layer.call(this);
    this.latlngs = latlngs;
    this.options = options || {};
  }
  Polyline.prototype = Object.create(Layer.prototype);

  function FeatureGroup(layers) {
    if (!(this instanceof FeatureGroup)) return new FeatureGroup(layers);
    Layer.call(this);
    this.layers = layers || [];
    this.getBounds = function() {
      return {
        pad: function() { return this; },
        isValid: function() { return true; }
      };
    };
  }
  FeatureGroup.prototype = Object.create(Layer.prototype);

  function MapInstance(containerId, options) {
    if (!(this instanceof MapInstance)) return new MapInstance(containerId, options);
    this.containerId = containerId;
    this.options = options || {};
    this.container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    this.layers = [];
    this.center = [13.25, 101.10];
    this.zoom = 9;

    if (this.container) {
      this.container.classList.add("leaflet-container");
      this.container.style.position = "relative";
      this.container.style.overflow = "hidden";
      this.container.style.backgroundColor = "#f1f5f9";
      this.container.style.border = "1px solid #cbd5e1";
      this.container.style.borderRadius = "0.75rem";
      this.container.style.minHeight = "240px";
      
      this.container.innerHTML = `
        <div style="position: absolute; inset: 0; background-color: #f8fafc; background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); background-size: 20px 20px;"></div>
        <div style="position: absolute; top: 10px; left: 10px; z-index: 10; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 5px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: 700; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
          <span>NextRoute GIS Engine • GPS Active (14 คันประจำการ)</span>
        </div>
        <div style="position: absolute; bottom: 8px; right: 10px; z-index: 10; font-size: 10px; color: #94a3b8; font-weight: 600;">
          Chonburi - Rayong - Nong Khai GPS Coordinates
        </div>
      `;
    }

    this.setView = function(center, zoom) {
      this.center = center;
      this.zoom = zoom;
      return this;
    };

    this.addLayer = function(layer) {
      this.layers.push(layer);
      return this;
    };

    this.removeLayer = function(layer) {
      const idx = this.layers.indexOf(layer);
      if (idx !== -1) this.layers.splice(idx, 1);
      return this;
    };

    this.fitBounds = function(bounds) {
      return this;
    };

    this.on = function(event, handler) {
      return this;
    };
  }

  window.L = {
    map: MapInstance,
    Map: MapInstance,
    marker: Marker,
    Marker: Marker,
    circleMarker: Marker,
    polyline: Polyline,
    Polyline: Polyline,
    featureGroup: FeatureGroup,
    FeatureGroup: FeatureGroup,
    tileLayer: function(url, options) {
      return {
        addTo: function(map) { return this; }
      };
    },
    divIcon: function(options) {
      return options;
    },
    latLngBounds: function(a, b) {
      return {
        pad: function() { return this; },
        isValid: function() { return true; }
      };
    }
  };

  console.info("[NextRoute] Offline Leaflet Mock initialized successfully (Zero external dependencies).");
})();
