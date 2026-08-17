const typeEl = document.getElementById("type");
const severityEl = document.getElementById("severity");

const priorityLabel =
  document.getElementById("priorityLabel");

const priorityText =
  document.getElementById("priorityText");


/* =========================================================
   RECOMMENDED RESPONSE
   ========================================================= */

function recommendedFor(type, severity) {

  const list = [];

  let responder = "Emergency Dispatch";
  let eta = "Pending";


  /* =========================
     RESPONSE TYPE
     ========================= */

  if (
    type === "Medical" ||
    type === "Road Accident"
  ) {

    list.push("🚑 Ambulance");

    responder = "AMB-07";
    eta = "06:30";

  }


  if (
    type === "Crime / Security" ||
    type === "Women Safety"
  ) {

    list.push("🚓 Police");

    responder = "POL-12";
    eta = "05:30";

  }


  if (type === "Fire") {

    list.push("🚒 Fire & Rescue");

    responder = "FIR-04";
    eta = "04:30";

  }


  if (type === "Natural Disaster") {

    list.push(
      "🚑 Ambulance",
      "🚓 Police",
      "🚒 Fire & Rescue"
    );

    responder = "Multi-Agency Dispatch";
    eta = "08:00";

  }


  if (!list.length) {

    list.push(
      "🛟 General Response"
    );

  }


  /* =========================
     PRIORITY
     ========================= */

  let level = severity || "Pending";

  let message =
    "Select a severity to calculate priority.";


  if (severity === "Critical") {

    message =
      "Immediate dispatch recommended.";

  } else if (severity === "High") {

    message =
      "Urgent response recommended.";

  } else if (severity === "Medium") {

    message =
      "Standard response recommended.";

  } else if (severity === "Low") {

    message =
      "Non-urgent assistance recommended.";

  }


  return {
    list,
    level,
    message,
    responder,
    eta
  };
}


/* =========================================================
   UPDATE SMART RESPONSE PREVIEW
   ========================================================= */

function updatePreview() {

  const response =
    recommendedFor(
      typeEl?.value,
      severityEl?.value
    );


  if (priorityLabel) {

    priorityLabel.textContent =
      response.level.toUpperCase();

  }


  if (priorityText) {

    priorityText.textContent =
      response.message +
      (
        response.list.length
          ? " " +
            response.list.join(" • ")
          : ""
      );

  }


  /*
    Highlight critical cases
  */

  if (priorityLabel) {

    priorityLabel.style.color =
      response.level === "Critical"
        ? "#ef3636"
        : "#ffffff";

  }
}


/* =========================================================
   FORM FIELD LISTENERS
   ========================================================= */

[typeEl, severityEl].forEach(
  element => {

    if (!element) {
      return;
    }

    element.addEventListener(
      "change",
      updatePreview
    );

  }
);


/* =========================================================
   CAPTURE LOCATION
   ========================================================= */

function captureLocation() {

  const text =
    document.getElementById(
      "locationText"
    );

  const latInput =
    document.getElementById("lat");

  const lngInput =
    document.getElementById("lng");


  if (!text) {
    return;
  }


  if (
    !("geolocation" in navigator)
  ) {

    text.textContent =
      "Geolocation is not supported.";

    return;
  }


  text.textContent =
    "Getting your location…";


  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;


      if (latInput) {

        latInput.value =
          lat;

      }


      if (lngInput) {

        lngInput.value =
          lng;

      }


      text.textContent =
        `✓ Location captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    },


    error => {

      console.warn(
        "Location error:",
        error.message
      );


      text.textContent =
        "Permission denied or location unavailable.";

    },


    {
      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 0

    }

  );
}


/* =========================================================
   SERVICE PAGE → REPORT PAGE
   ========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );


if (
  params.get("type") &&
  typeEl
) {

  typeEl.value =
    params.get("type");

  updatePreview();

}


/* =========================================================
   REPORT SUBMISSION
   ========================================================= */

const reportForm =
  document.getElementById(
    "reportForm"
  );


if (reportForm) {

  reportForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      /* =========================
         GET FORM VALUES
         ========================= */

      const name =
        document
          .getElementById("name")
          ?.value
          .trim();

      const phone =
        document
          .getElementById("phone")
          ?.value
          .trim();

      const type =
        typeEl?.value || "";

      const severity =
        severityEl?.value || "";

      const description =
        document
          .getElementById(
            "description"
          )
          ?.value
          .trim();


      const lat =
        document
          .getElementById("lat")
          ?.value || null;

      const lng =
        document
          .getElementById("lng")
          ?.value || null;


      /* =========================
         VALIDATION
         ========================= */

      if (
        !name ||
        !phone ||
        !type ||
        !severity ||
        !description
      ) {

        alert(
          "Please complete all required fields."
        );

        return;
      }


      if (
        !/^[0-9]{10}$/.test(phone)
      ) {

        alert(
          "Please enter a valid 10-digit phone number."
        );

        return;
      }


      /* =========================
         SMART RESPONSE
         ========================= */

      const response =
        recommendedFor(
          type,
          severity
        );


      /* =========================
         CREATE INCIDENT
         ========================= */

      const incident =
        createIncident({

          name,

          phone,

          type,

          severity,

          description,

          lat,

          lng,

          recommended:
            response.list,

          responder:
            response.responder,

          eta:
            response.eta

        });


      /* =========================
         SHOW RESULT
         ========================= */

      const box =
        document.getElementById(
          "formResult"
        );


      if (box) {

        box.classList.remove(
          "hidden"
        );


        box.innerHTML = `
          ✓ <strong>${escapeHtml(incident.id)}</strong>
          created successfully.

          <br><br>

          <strong>Priority:</strong>
          ${escapeHtml(severity)}

          <br>

          <strong>Recommended:</strong>
          ${response.list
            .map(item =>
              escapeHtml(item)
            )
            .join(" • ")
          }

          <br>

          <strong>Responder:</strong>
          ${escapeHtml(response.responder)}

          <br>

          <strong>ETA:</strong>
          ${escapeHtml(response.eta)}

          <br><br>

          <a
            href="/dashboard"
            style="
              color:#ef3636;
              font-weight:800;
            "
          >
            Open Dashboard →
          </a>
        `;

      }


      /* =========================
         RESET FORM
         ========================= */

      reportForm.reset();


      const locationText =
        document.getElementById(
          "locationText"
        );


      if (locationText) {

        locationText.textContent =
          "Location not captured";

      }


      const latInput =
        document.getElementById("lat");

      const lngInput =
        document.getElementById("lng");


      if (latInput) {
        latInput.value = "";
      }

      if (lngInput) {
        lngInput.value = "";
      }


      updatePreview();

    }
  );
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
