document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const rentId = urlParams.get('rentId');
    
    if (!rentId) {
        alert('Aucune information de location trouvée. Veuillez revenir à la page précédente.');
        return;
    }

    // Charger les détails de la location
    loadRentDetails(rentId);

    // Gestionnaire pour le changement de méthode de paiement
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const cardDetails = document.getElementById('cardDetails');
        if (this.value === 'credit' || this.value === 'debit') {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });

    // Gestionnaire pour le formulaire de paiement
    document.getElementById('paymentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const paymentMethod = document.getElementById('paymentMethod').value;
        const specialRequests = document.getElementById('specialRequests').value;
        
        let paymentDetails = {
            rent_id: rentId,
            payment_method: paymentMethod,
            special_requests: specialRequests
        };
        
        // Ajouter les détails de carte si nécessaire
        if (paymentMethod === 'credit' || paymentMethod === 'debit') {
            paymentDetails.card_number = document.getElementById('cardNumber').value;
            paymentDetails.expiry_date = document.getElementById('expiryDate').value;
            paymentDetails.cvv = document.getElementById('cvv').value;
            paymentDetails.card_name = document.getElementById('cardName').value;
        }
        
        try {
            const response = await fetch('https://hotel-management-db-hotel-managment.up.railway.app/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentDetails)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Afficher un message de succès
                alert('Paiement effectué avec succès !');
                
                // Rediriger vers la page de confirmation
                window.location.href = `confirmation.html?paymentId=${data.payment_id}`;
            } else {
                alert(data.error || 'Erreur lors du traitement du paiement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la communication avec le serveur');
        }
    });
});

// Fonction pour charger les détails de la location
async function loadRentDetails(rentId) {
    try {
        const response = await fetch(`https://hotel-management-db-hotel-managment.up.railway.app/api/rents/${rentId}`);
        const rentData = await response.json();
        
        if (!response.ok) {
            throw new Error(rentData.error || 'Erreur lors de la récupération des détails de la location');
        }
        
        // Remplir les détails de la location
        document.getElementById('clientName').textContent = rentData.client_name;
        document.getElementById('clientNas').textContent = rentData.client_nas;
        document.getElementById('hotelName').textContent = rentData.hotel_name;
        document.getElementById('roomInfo').textContent = `${rentData.room_type} (${rentData.capacity} personnes)`;
        
        // Formater les dates
        const checkInDate = new Date(rentData.check_in_date);
        const checkOutDate = new Date(rentData.check_out_date);
        
        document.getElementById('checkInDate').textContent = checkInDate.toLocaleDateString('fr-FR');
        document.getElementById('checkOutDate').textContent = checkOutDate.toLocaleDateString('fr-FR');
        
        // Calculer le nombre de nuits
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        document.getElementById('numberOfNights').textContent = nights;
        
        // Afficher le prix par nuit
        document.getElementById('pricePerNight').textContent = `${rentData.price_per_night}$`;
        
        // Calculer les coûts
        const accommodationCost = rentData.price_per_night * nights;
        const additionalServices = rentData.additional_services || 0;
        const taxes = accommodationCost * 0.15; // 15% de taxes
        const totalCost = accommodationCost + additionalServices + taxes;
        
        // Afficher les coûts
        document.getElementById('accommodationCost').textContent = `${accommodationCost.toFixed(2)}$`;
        document.getElementById('additionalServices').textContent = `${additionalServices.toFixed(2)}$`;
        document.getElementById('taxes').textContent = `${taxes.toFixed(2)}$`;
        document.getElementById('totalCost').textContent = `${totalCost.toFixed(2)}$`;
        
        // Mettre à jour le résumé du paiement
        document.getElementById('summaryAccommodation').textContent = `${accommodationCost.toFixed(2)}$`;
        document.getElementById('summaryServices').textContent = `${additionalServices.toFixed(2)}$`;
        document.getElementById('summaryTaxes').textContent = `${taxes.toFixed(2)}$`;
        document.getElementById('summaryTotal').textContent = `${totalCost.toFixed(2)}$`;
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des détails de la location');
    }
} 