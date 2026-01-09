

// Fonction exécutée au chargement de la page
window.onload = async function () {
  //  Liste déroulante pour suppression d’hôtel
  const hotelDeleteSelect = document.getElementById("Hotel_id");
  if (hotelDeleteSelect) {
    try {
      const response = await fetch("http://localhost:3000/hotels");
      const hotels = await response.json();
      hotels.forEach(hotel => {
        const option = document.createElement("option");
        option.value = hotel.hotel_id;
        option.textContent = hotel.email_address;
        hotelDeleteSelect.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Erreur chargement hôtels (suppression):", err);
    }
  }

  // Listes déroulantes pour ajout employé
  const hotelAddSelect = document.getElementById("hotelEmail");
  const addressSelect = document.getElementById("addressDisplay");

  if (hotelAddSelect) {
    try {
      const response = await fetch("http://localhost:3000/hotels");
      const hotels = await response.json();
      hotels.forEach(hotel => {
        const option = document.createElement("option");
        option.value = hotel.hotel_id;
        option.textContent = hotel.email_address;
        hotelAddSelect.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Erreur chargement hôtels (employé):", err);
    }
  }

  if (addressSelect) {
    try {
      const response = await fetch("http://localhost:3000/addresses");
      const addresses = await response.json();
      addresses.forEach(addr => {
        const option = document.createElement("option");
        option.value = addr.address_id;
        option.textContent = `${addr.civic_number} ${addr.street_name}, ${addr.town}`;
        addressSelect.appendChild(option);
      });
    } catch (err) {
      console.error("❌ Erreur chargement adresses:", err);
    }
  }
};

//Suppression d’un hôtel
async function deleteHotel() {
  const hotelId = document.getElementById("Hotel_id").value;

  if (!hotelId) {
    alert("Veuillez selectionner un hôtel");
    return;
  }

  const confirmation = confirm("⚠️ Voulez-vous vraiment supprimer cet hôtel ? Cette action est irréversible !");
  if (!confirmation) return;

  try {
    const response = await fetch(`http://localhost:3000/delete-hotel/${hotelId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    if (data.success) {
      alert("✅ Hôtel supprimé avec succès !");
      location.reload();
    } else {
      alert("❌ Erreur : " + data.message);
    }
  } catch (error) {
    alert("❌ Erreur de connexion au serveur.");
  }
}

window.deleteHotel = deleteHotel;

//Ajout d’un employé
async function addEmployee(event) {
  event.preventDefault();

  const full_name = document.getElementById("full_name").value;
  const NAS = document.getElementById("NAS").value;
  const Position = document.getElementById("Position").value;
  const Hotel_Id = document.getElementById("hotelEmail").value;
  const Address_Id = document.getElementById("addressDisplay").value;

  try {
    const response = await fetch("http://localhost:3000/add-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, NAS, Position, Hotel_Id, Address_Id })
    });

    const data = await response.json();
    if (data.success) {
      alert("✅ Employé ajouté avec succès !");
      location.reload();
    } else {
      alert("❌ Erreur : " + data.message);
    }
  } catch (err) {
    alert("❌ Erreur de connexion au serveur.");
  }
}

window.addEmployee = addEmployee;

// Authentification
async function signup(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.success) {
    alert("✅ Compte créé avec succès !");
    window.location.href = "login.html";
  } else {
    alert("❌ " + data.message);
  }
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      sessionStorage.setItem("employeeLoggedIn", "true");
      const redirectPage = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectPage || "mise à jour.html";
    } else {
      alert("❌ Identifiants incorrects !");
    }
  } catch (err) {
    alert("❌ Erreur serveur !");
  }
}

function logout() {
  sessionStorage.removeItem("employeeLoggedIn");
  window.location.href = "index.html";
}

function goToProtectedPage(targetPage) {
  const isAuthenticated = sessionStorage.getItem("employeeLoggedIn");
  if (isAuthenticated === "true") {
    window.location.href = targetPage;
  } else {
    sessionStorage.setItem("redirectAfterLogin", targetPage);
    window.location.href = "login.html";
  }
}

window.signup = signup;
window.login = login;
window.logout = logout;
window.goToProtectedPage = goToProtectedPage;
