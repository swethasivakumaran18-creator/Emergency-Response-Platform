const INCIDENT_KEY = "erp_incidents_v1";


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function toggleMenu() {

  const nav = document.querySelector(".nav-links");

  if (!nav) {
    return;
  }

  nav.classList.toggle("open");
}


/* Close mobile menu after navigation */

document.addEventListener("click", (event) => {

  const nav = document.querySelector(".nav-links");

  if (!nav) {
    return;
  }

  const clickedLink =
    event.target.closest(".nav-links a");

  if (clickedLink) {
    nav.classList.remove("open");
  }

});


/* =========================================================
   INCIDENT STORAGE
   ========================================================= */

function getIncidents() {

  try {

    const stored =
      localStorage.getItem(INCIDENT_KEY);

    if (!stored) {
      return [];
    }

    const incidents =
      JSON.parse(stored);

    return Array.isArray(incidents)
      ? incidents
      : [];

  } catch (error) {

    console.error(
      "Unable to read incident data:",
      error
    );

    return [];
  }
}


/* =========================================================
   SAVE INCIDENTS
   ========================================================= */

function saveIncidents(items) {

  try {

    localStorage.setItem(
      INCIDENT_KEY,
      JSON.stringify(items)
    );

  } catch (error) {

    console.error(
      "Unable to save incident data:",
      error
    );

  }
}


/* =========================================================
   CREATE INCIDENT
   ========================================================= */

function createIncident(data) {

  const incident = {

    id:
      "ER-" +
      Date.now()
        .toString()
        .slice(-6),

    createdAt:
      new Date().toISOString(),

    status:
      "Reported",

    ...data
  };


  const incidents =
    getIncidents();


  incidents.unshift(
    incident
  );


  /*
    Keep only the latest 50
    incidents in the prototype.
  */

  saveIncidents(
    incidents.slice(0, 50)
  );


  return incident;
}


/* =========================================================
   SOS MODAL
   ========================================================= */

function openSOS() {

  const modal =
    document.getElementById(
      "sosModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "hidden"
  );


  /*
    Reset previous SOS result
  */

  const result =
    document.getElementById(
      "sosResult"
    );

  if (result) {

    result.classList.add(
      "hidden"
    );

    result.innerHTML = "";

  }

}


function closeSOS() {

  const modal =
    document.getElementById(
      "sosModal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   SEND SOS
   ========================================================= */

function confirmSOS() {

  const result =
    document.getElementById(
      "sosResult"
    );


  /*
    Create incident after
    location is available.
  */

  const finishSOS = (
    lat = null,
    lng = null
  ) => {


    const incident =
      createIncident({

        name:
          "SOS User",

        phone:
          "Not provided",

        type:
          "SOS Emergency",

        severity:
          "Critical",

        description:
          "One-tap SOS emergency request.",

        lat:
          lat,

        lng:
          lng,

        recommended: [
          "🚑 Ambulance",
          "🚓 Police",
          "🚒 Emergency Response"
        ],

        responder:
          "Emergency Dispatch",

        eta:
          "Pending"

      });


    /*
      Show confirmation
    */

    if (result) {

      result.classList.remove(
        "hidden"
      );


      const locationText =
        lat !== null &&
        lng !== null
          ? `Location captured: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
          : "Location not available";


      result.innerHTML = `
        ✓ SOS <strong>${incident.id}</strong> created.<br>
        ${locationText}<br>
        Redirecting to the Command Center...
      `;

    }


    /*
      Go to clean URL.
    */

    setTimeout(() => {

      closeSOS();

      window.location.href =
        "/dashboard";

    }, 1400);

  };


  /*
    Request GPS
  */

  if (
    "geolocation" in navigator
  ) {

    if (result) {

      result.classList.remove(
        "hidden"
      );

      result.textContent =
        "Requesting your location…";

    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        finishSOS(
          position.coords.latitude,
          position.coords.longitude
        );

      },

      (error) => {

        console.warn(
          "GPS unavailable:",
          error.message
        );

        /*
          Create SOS anyway.
          Location is optional in this prototype.
        */

        finishSOS();

      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 0

      }

    );

  } else {

    finishSOS();

  }

}


/* =========================================================
   SHARE LOCATION
   ========================================================= */

function shareLocation() {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (
    !("geolocation" in navigator)
  ) {

    if (status) {

      status.textContent =
        "Geolocation is not supported by this browser.";

    }

    return;
  }


  if (status) {

    status.textContent =
      "Requesting your location…";

  }


  navigator.geolocation.getCurrentPosition(

    (position) => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;


      if (status) {

        status.textContent =
          `✓ Location captured: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      }

    },

    (error) => {

      console.warn(
        "Location error:",
        error.message
      );


      if (status) {

        status.textContent =
          "Location permission was not granted.";

      }

    },

    {
      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 0

    }

  );

}


/* =========================================================
   CLOSE SOS WHEN CLICKING BACKDROP
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {

    if (
      event.target.classList.contains(
        "modal"
      )
    ) {

      closeSOS();

    }

  }
);


/* =========================================================
   ESC KEY CLOSES SOS MODAL
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape"
    ) {

      closeSOS();

    }

  }
);
