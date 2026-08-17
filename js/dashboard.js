/* =========================================================
   EMERGENCY RESPONSE PLATFORM
   COMMAND CENTER LOGIC
   ========================================================= */

let map = null;
let markers = [];


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap() {
  if (typeof L === "undefined") {
    console.warn("Leaflet is not loaded.");
    return;
  }

  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.warn("Map element not found.");
    return;
  }

  const defaultCenter = [13.0827, 80.2707];

  map = L.map("map", {
    zoomControl: true
  }).setView(defaultCenter, 12);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);

  refreshDashboard();
}


/* =========================================================
   REFRESH DASHBOARD
   ========================================================= */

function refreshDashboard() {

  const incidents = getIncidents();

  const active = incidents.filter(
    incident => incident.status !== "Resolved"
  );

  const critical = active.filter(
    incident => incident.severity === "Critical"
  );


  /* =========================
     UPDATE METRICS
     ========================= */

  const activeCount = document.getElementById("activeCount");
  const criticalCount = document.getElementById("criticalCount");

  if (activeCount) {
    activeCount.textContent = active.length;
  }

  if (criticalCount) {
    criticalCount.textContent = critical.length;
  }


  /* =========================
     INCIDENT FEED
     ========================= */

  const feed = document.getElementById("incidentFeed");

  if (feed) {

    if (!incidents.length) {

      feed.innerHTML = `
        <div class="empty-state">
          <div>🟢</div>

          <h3>
            No active incidents
          </h3>

          <p>
            Use “Simulate Emergency” or submit a
            report to see the command center in action.
          </p>
        </div>
      `;

    } else {

      feed.innerHTML = incidents
        .map(incident => createIncidentCard(incident))
        .join("");
    }
  }


  /* =========================
     UPDATE MAP
     ========================= */

  updateMap(incidents);
}


/* =========================================================
   INCIDENT CARD
   ========================================================= */

function createIncidentCard(incident) {

  const severity =
    String(incident.severity || "Low").toLowerCase();

  const type =
    escapeHtml(incident.type || "Emergency");

  const status =
    escapeHtml(incident.status || "Reported");

  const description =
    escapeHtml(
      incident.description || "Emergency request"
    );

  const coordinates =
    incident.lat && incident.lng
      ? ` • 📍 ${Number(incident.lat).toFixed(4)}, ${Number(incident.lng).toFixed(4)}`
      : "";

  const responder =
    incident.responder
      ? ` • ${escapeHtml(incident.responder)}`
      : "";

  const eta =
    incident.eta
      ? ` • ETA ${escapeHtml(incident.eta)}`
      : "";


  return `
    <div class="incident-card">

      <div class="incident-top">

        <div class="incident-title">
          ${type}

          <span
            style="
              color:#8b9bad;
              font-weight:600;
            "
          >
            #${escapeHtml(incident.id)}
          </span>
        </div>

        <span
          class="priority-badge priority-${severity}"
        >
          ${escapeHtml(
            incident.severity || "LOW"
          )}
        </span>

      </div>


      <div class="incident-meta">
        ${status}
        • ${timeAgo(incident.createdAt)}
        ${coordinates}
        ${responder}
        ${eta}
      </div>


      <div class="incident-meta">
        ${description}
      </div>

    </div>
  `;
}


/* =========================================================
   MAP UPDATE
   ========================================================= */

function updateMap(incidents) {

  if (!map) {
    return;
  }


  /* Remove old markers */

  markers.forEach(marker => {

    try {
      map.removeLayer(marker);
    } catch (error) {
      console.warn("Unable to remove marker.", error);
    }

  });

  markers = [];


  let firstLocation = null;


  /* Add incident markers */

  incidents.forEach((incident, index) => {

    const lat = Number(incident.lat);
    const lng = Number(incident.lng);


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }


    if (!firstLocation) {
      firstLocation = [lat, lng];
    }


    const severity =
      String(
        incident.severity || "Low"
      ).toLowerCase();


    let markerColor = "#16a36a";

    if (severity === "critical") {
      markerColor = "#ef3636";
    }

    if (severity === "high") {
      markerColor = "#e99a16";
    }


    /*
      Custom circle marker instead of relying
      on external marker images.
    */

    const marker = L.circleMarker(
      [lat, lng],
      {
        radius:
          severity === "critical"
            ? 11
            : 8,

        color: markerColor,

        fillColor: markerColor,

        fillOpacity: 0.85,

        weight: 3
      }
    );


    marker
      .addTo(map)
      .bindPopup(
        `
          <strong>
            ${escapeHtml(
              incident.type || "Emergency"
            )}
          </strong>

          <br>

          Priority:
          ${escapeHtml(
            incident.severity || "Low"
          )}

          <br>

          Status:
          ${escapeHtml(
            incident.status || "Reported"
          )}

          <br>

          Incident:
          ${escapeHtml(
            incident.id || "Unknown"
          )}

          ${
            incident.responder
              ? `<br>Responder: ${escapeHtml(
                  incident.responder
                )}`
              : ""
          }

          ${
            incident.eta
              ? `<br>ETA: ${escapeHtml(
                  incident.eta
                )}`
              : ""
          }
        `
      );


    markers.push(marker);


    /*
      Automatically center the map on the
      newest incident.
    */

    if (index === 0) {

      map.setView(
        [lat, lng],
        14,
        {
          animate: true
        }
      );

    }

  });


  /* If incidents have no GPS, return to default view */

  if (!firstLocation && incidents.length === 0) {

    map.setView(
      [13.0827, 80.2707],
      12
    );

  }
}


/* =========================================================
   SIMULATE EMERGENCY
   ========================================================= */

function simulateEmergency() {

  const demoLocations = [

    {
      lat: 13.0827,
      lng: 80.2707,
      area: "Chennai Central"
    },

    {
      lat: 13.0475,
      lng: 80.2090,
      area: "Anna Nagar"
    },

    {
      lat: 13.0108,
      lng: 80.2350,
      area: "Guindy"
    },

    {
      lat: 12.9716,
      lng: 80.2209,
      area: "Velachery"
    }

  ];


  const location =
    demoLocations[
      Math.floor(
        Math.random() *
        demoLocations.length
      )
    ];


  const emergencyTypes = [
    "Road Accident",
    "Medical",
    "Fire"
  ];


  const type =
    emergencyTypes[
      Math.floor(
        Math.random() *
        emergencyTypes.length
      )
    ];


  let recommended = [];
  let responder = "";
  let eta = "";


  /* =========================
     RESPONSE ASSIGNMENT
     ========================= */

  if (type === "Medical") {

    recommended = [
      "🚑 Ambulance"
    ];

    responder = "AMB-07";

    eta = "06:20";

  } else if (type === "Fire") {

    recommended = [
      "🚒 Fire & Rescue"
    ];

    responder = "FIR-04";

    eta = "04:30";

  } else {

    recommended = [
      "🚑 Ambulance",
      "🚓 Police"
    ];

    responder = "AMB-07";

    eta = "05:10";
  }


  /* =========================
     CREATE INCIDENT
     ========================= */

  const incident = createIncident({

    name: "Demo Citizen",

    phone: "9000000000",

    type,

    severity: "Critical",

    description:
      `Simulated critical ${type.toLowerCase()} near ${location.area} for hackathon demonstration.`,

    lat: location.lat,

    lng: location.lng,

    recommended,

    responder,

    eta

  });


  /* =========================
     REFRESH
     ========================= */

  refreshDashboard();


  /* =========================
     START STATUS ANIMATION
     ========================= */

  setTimeout(
    () => animateStatus(incident.id),
    800
  );
}


/* =========================================================
   INCIDENT STATUS ANIMATION
   ========================================================= */

function animateStatus(id) {

  const stages = [

    {
      status: "Reported",
      responder: "Dispatch Center",
      eta: "—"
    },

    {
      status: "AI Prioritized",
      responder: "Dispatch Center",
      eta: "—"
    },

    {
      status: "Responder Assigned",
      responder: "Unit Assigned",
      eta: "08:00"
    },

    {
      status: "En Route",
      responder: "Responder Unit",
      eta: "04:30"
    }

  ];


  let index = 0;


  const timer =
    setInterval(() => {

      const incidents =
        getIncidents();


      const item =
        incidents.find(
          incident => incident.id === id
        );


      if (!item) {

        clearInterval(timer);

        return;
      }


      const stage =
        stages[index];


      item.status =
        stage.status;


      item.eta =
        stage.eta;


      /*
        Keep the original assigned
        responder where possible.
      */

      if (
        stage.responder !==
        "Dispatch Center"
        &&
        stage.responder !==
        "Unit Assigned"
        &&
        item.responder
      ) {

        item.responder =
          item.responder;

      } else if (
        stage.status ===
        "Responder Assigned"
      ) {

        item.responder =
          item.responder ||
          "Responder Unit";

      }


      saveIncidents(incidents);

      refreshDashboard();


      index++;


      if (
        index >= stages.length
      ) {

        clearInterval(timer);

      }

    }, 1800);
}


/* =========================================================
   CLEAR INCIDENTS
   ========================================================= */

function clearIncidents() {

  if (
    confirm(
      "Clear all demo incidents?"
    )
  ) {

    localStorage.removeItem(
      INCIDENT_KEY
    );

    refreshDashboard();

  }
}


/* =========================================================
   TIME AGO
   ========================================================= */

function timeAgo(iso) {

  if (!iso) {
    return "just now";
  }


  const created =
    new Date(iso).getTime();


  if (
    Number.isNaN(created)
  ) {

    return "just now";
  }


  const seconds =
    Math.max(
      1,
      Math.floor(
        (Date.now() - created) /
        1000
      )
    );


  if (seconds < 60) {

    return `${seconds}s ago`;

  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  if (minutes < 60) {

    return `${minutes}m ago`;

  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {

    return `${hours}h ago`;

  }


  const days =
    Math.floor(
      hours / 24
    );


  return `${days}d ago`;
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      character => {

        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        };

        return entities[character];
      }
    );
}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initMap
);
