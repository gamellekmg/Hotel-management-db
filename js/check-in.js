document.addEventListener('DOMContentLoaded', function() {
    // Charger les hôtels au chargement de la page
    loadHotels();
    loadRoomFilters();

    // Gestionnaire pour le formulaire de réservation
    document.getElementById('reservationCheckInForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const reservationId = document.getElementById('reservationId').value;

        try {
            const response = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/api/reservations/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reservationId })
            });

            const data = await response.json();

            if (response.ok) {
                // Rediriger vers la page de paiement avec l'ID de la location
                window.location.href = `paiement.html?rentId=${data.rent_id}`;
            } else {
                alert(data.error || 'Erreur lors de l\'enregistrement du client');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la communication avec le serveur');
        }
    });

    // Gestionnaire pour le formulaire de nouveau client
    document.getElementById('newClientForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Récupérer les données du formulaire
        const formData = {
            full_name: document.getElementById('fullName').value,
            nas: document.getElementById('nas').value,
            room_id: document.getElementById('roomId').value,
            address: {
                civic_number: document.getElementById('civicNumber').value,
                postal_code: document.getElementById('postalCode').value,
                street_name: document.getElementById('streetName').value,
                town: document.getElementById('town').value,
                province: document.getElementById('province').value,
                country: document.getElementById('country').value
            }
        };

        try {
            // 1. Créer l'adresse
            const addressResponse = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.address)
            });

            const addressData = await addressResponse.json();

            if (!addressResponse.ok) {
                throw new Error(addressData.error || 'Erreur lors de la création de l\'adresse');
            }

            // 2. Créer le client
            const clientResponse = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    nas: formData.nas,
                    address_id: addressData.address_id
                })
            });

            const clientData = await clientResponse.json();

            if (!clientResponse.ok) {
                throw new Error(clientData.error || 'Erreur lors de la création du client');
            }

            // 3. Créer la réservation
            const reservationResponse = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/reservation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: clientData.client_id,
                    room_id: formData.room_id,
                    reservation_date: new Date().toISOString()
                })
            });

            const reservationData = await reservationResponse.json();

            if (!reservationResponse.ok) {
                throw new Error(reservationData.error || 'Erreur lors de la création de la réservation');
            }

            // 4. Transformer la réservation en location
            const checkInResponse = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/api/reservations/check-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reservationId: reservationData.reservation_id
                })
            });

            const checkInData = await checkInResponse.json();

            if (!checkInResponse.ok) {
                throw new Error(checkInData.error || 'Erreur lors de l\'enregistrement du client');
            }

            // Rediriger vers la page de paiement avec l'ID de la location
            window.location.href = `paiement.html?rentId=${checkInData.rent_id}`;

        } catch (error) {
            console.error('Erreur:', error);
            alert(error.message || 'Erreur lors de l\'enregistrement du client');
        }
    });

    // Gestionnaire pour le changement d'hôtel
    document.getElementById('hotelId').addEventListener('change', function() {
        loadAvailableRooms();
    });

    // Gestionnaires pour les filtres de chambre
    ['appliances', 'capacity', 'extras', 'existing_damage'].forEach(filterId => {
        document.getElementById(filterId).addEventListener('change', loadAvailableRooms);
    });
});

// Fonction pour charger les hôtels
async function loadHotels() {
    try {
        const response = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/hotels');
        const hotels = await response.json();

        const hotelSelect = document.getElementById('hotelId');
        hotelSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez un hôtel --</option>';

        hotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.hotel_id;
            option.textContent = hotel.email_address;
            hotelSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des hôtels:', error);
        alert('Erreur lors du chargement des hôtels');
    }
}

// Fonction pour charger les filtres de chambre
async function loadRoomFilters() {
    try {
        const response = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/roomFilters');
        const filters = await response.json();

        // Remplir les options pour chaque filtre
        ['appliances', 'capacity', 'extras', 'existing_damage'].forEach(filterId => {
            const select = document.getElementById(filterId);
            const values = [...new Set(filters.map(f => f[filterId]).filter(Boolean))];
            
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Erreur lors du chargement des filtres:', error);
        alert('Erreur lors du chargement des filtres de chambre');
    }
}

// Fonction pour charger les chambres disponibles
async function loadAvailableRooms() {
    const hotelId = document.getElementById('hotelId').value;
    if (!hotelId) return;

    const filters = {
        hotel_id: hotelId,
        appliances: document.getElementById('appliances').value,
        capacity: document.getElementById('capacity').value,
        extras: document.getElementById('extras').value,
        existing_damage: document.getElementById('existing_damage').value
    };

    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`https://hotel-management-db-hotel-managment.up.railway.app/availableRooms?${queryParams}`);
        const rooms = await response.json();

        const roomSelect = document.getElementById('roomId');
        roomSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez une chambre --</option>';

        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.room_id;
            option.textContent = `Chambre ${room.room_id} - ${room.room_type} (${room.capacity} personnes)`;
            roomSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des chambres:', error);
        alert('Erreur lors du chargement des chambres disponibles');
    }
} 