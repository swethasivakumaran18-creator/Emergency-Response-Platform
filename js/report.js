const API_BASE_URL = "https://emergency-backend-o2u2.onrender.com";

const typeEl = document.getElementById("type");
const severityEl = document.getElementById("severity");
const priorityLabel = document.getElementById("priorityLabel");
const priorityText = document.getElementById("priorityText");


/* =========================
   API HELPER
========================= */

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}


/* =========================
   RESPONSE RECOMMENDATION
========================= */

function recommendedFor(type, severity) {
  let responders = [];
  let message = "";

  if (type === "Medical" || type === "Road Accident") {
    responders.push("🚑 Ambulance");
  }

  if (
    type === "Crime / Security" ||
    type === "Women Safety"
  ) {
    responders.push("🚓 Police");
  }

  if (type === "Fire") {
    responders.push("🚒 Fire & Rescue");
  }

  if (type === "Natural Disaster") {
    responders.push(
      "🚑 Ambulance",
      "🚓 Police",
      "🚒 Fire & Rescue"
    );
  }

  if (responders.length === 0) {
    responders.push("🛟 Emergency Response");
  }

  if (severity === "Critical") {
    message = "Immediate response recommended.";
  } else if (severity === "High") {
    message = "Urgent response recommended.";
  } else if (severity === "Medium") {
    message = "Standard response recommended.";
  } else {
    message = "Non-urgent response recommended.";
  }

  return {
    responders,
    message
  };
}


/* =========================
   UPDATE PREVIEW
========================= */

function updatePreview() {
  if (!typeEl || !severityEl) {
    return;
  }

  const result = recommendedFor(
    typeEl.value,
    severityEl.value
  );

  if (priorityLabel) {
    priorityLabel.textContent =
      severityEl.value || "PENDING";
  }

  if (priorityText) {
    priorityText.textContent =
      `${result.message} ${result.responders.join(" • ")}`;
  }
}


if (typeEl) {
  typeEl.addEventListener(
    "change",
    updatePreview
  );
}

if (severityEl) {
  severityEl.addEventListener(
    "change",
    updatePreview
  );
}


/* =========================
   CAPTURE LOCATION
========================= */

function captureLocation() {
  const locationText =
    document.getElementById("locationText");

  const latInput =
    document.getElementById("lat");

  const lngInput =
    document.getElementById("lng");

  if (!navigator.geolocation) {
    if (locationText) {
      locationText.textContent =
        "Geolocation is not supported.";
    }

    return;
  }

  if (locationText) {
    locationText.textContent =
      "Getting your location...";
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      if (latInput) {
        latInput.value = latitude;
      }

      if (lngInput) {
        lngInput.value = longitude;
      }

      if (locationText) {
        locationText.textContent =
          `✓ Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
    },

    (error) => {
      console.error(
        "Location error:",
        error
      );

      if (locationText) {
        locationText.textContent =
          "Unable to get location.";
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}


/* =========================
   URL TYPE
========================= */

const params =
  new URLSearchParams(
    window.location.search
  );

if (params.get("type") && typeEl) {
  typeEl.value =
    params.get("type");

  updatePreview();
}


/* =========================
   FORM SUBMISSION
========================= */

const reportForm =
  document.getElementById("reportForm");

if (reportForm) {
  reportForm.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

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
        typeEl?.value;

      const severity =
        severityEl?.value;

      const description =
        document
          .getElementById("description")
          ?.value
          .trim();

      const latitude =
        Number(
          document
            .getElementById("lat")
            ?.value
        );

      const longitude =
        Number(
          document
            .getElementById("lng")
            ?.value
        );


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
          "Please fill in all required fields."
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

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        alert(
          "Please use your location before submitting the report."
        );

        return;
      }


      /* =========================
         RESULT BOX
      ========================= */

      const resultBox =
        document.getElementById(
          "formResult"
        );

      if (resultBox) {
        resultBox.classList.remove(
          "hidden"
        );

        resultBox.textContent =
          "Sending emergency report...";
      }


      /* =========================
         SEND TO BACKEND
      ========================= */

      try {
        const data =
          await apiRequest(
            "/incidents",
            {
              method: "POST",

              body: JSON.stringify({
                type: type,
                description: description,
                latitude: latitude,
                longitude: longitude
              })
            }
          );


        const incidentId =
          data.incident_id ||
          data.id ||
          "Created";

        if (resultBox) {
  resultBox.innerHTML = `
    <strong>
      ✓ Incident reported successfully
    </strong>

    <br><br>

    <strong>Incident ID:</strong>
    ${escapeHtml(incidentId)}

    <br>

    <strong>Status:</strong>
    ${escapeHtml(data.status || "Reported")}

    <br>

    <strong>Category:</strong>
    ${escapeHtml(data.category || type)}

    <br>

    <strong>Severity:</strong>
    ${escapeHtml(data.severity || severity)}

    <br>

    <strong>Location:</strong>
    ${latitude.toFixed(6)},
    ${longitude.toFixed(6)}

    <br><br>

    <strong>AI Summary:</strong>
    ${escapeHtml(data.summary || "—")}

    <br><br>

    <strong>Recommended Response:</strong>
    ${escapeHtml(data.recommended_response || "—")}

    <br><br>

    <a href="dashboard.html">
      View Command Dashboard →
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

      } catch (error) {
        console.error(
          "Incident submission failed:",
          error
        );

        if (resultBox) {
          resultBox.innerHTML = `
            <strong>
              ⚠️ Report failed
            </strong>

            <br>

            ${escapeHtml(
              error.message
            )}
          `;
        }
      }
    }
  );
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => {
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