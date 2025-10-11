document.addEventListener("DOMContentLoaded", () => {
   const chainBtnContainer = document.getElementById("hotelChainButtons");
   const roomGallery = document.getElementById("hotelChainRooms");
   const hotelListBox = document.getElementById("hotelList");

   const folderMap = {
      "Luxury Hotels": "luxury hotels",
      "Luxury hotel": "luxury hotel",
      "Perfect stay": "perfect stay",
      "Resort world": "resort world",
      "The Inns": "the inns",
      "Cozy retreat": "cozy retreat"
   };

   fetch("http://hotel-management-db-hotel-managment.up.railway.app/hotelChains")
      .then(res => res.json())
      .then(data => {
         if (data.length === 0) return;

         data.forEach((chain, index) => {
            const fakeStars = (chain.hotelchain_id % 3) + 3; // simulate 1 to 5 stars
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-primary m-2";
            btn.textContent = `${chain.hotel_chain_name} (${fakeStars}★)`;
            btn.onclick = () => displayChainInfo(chain);
            chainBtnContainer.appendChild(btn);

            if (index === 0) displayChainInfo(chain); // display first chain by default
         });
      });

      function displayChainInfo(chain) {
         roomGallery.innerHTML = "";
      
         const folderName = chain.hotel_chain_name.trim().toLowerCase().replace(/\s+/g, "_");
         console.log("Folder used:", folderName);
      
         for (let i = 1; i <= 6; i++) {
            const capacity = 2 + (i % 4);
            const price = 160 + i * 20;
            const imagePath = `images/${folderName}/room${i}.jpg`;
            console.log("Trying image:", imagePath); // 🔍 Log the image path
      
            let col = document.createElement("div");
            col.className = "col-md-4 mb-4";
            col.innerHTML = `
               <div class="card shadow">
                  <img src="${imagePath}" class="card-img-top" alt="room${i}" onerror="this.style.display='none'; console.warn('Missing image:', this.src)">
                  <div class="card-body">
                     <h5 class="card-title">Room Capacity: ${capacity} guests</h5>
                     <p class="card-text">Estimated price: $${price} - $${price + 40}</p>
                  </div>
               </div>
            `;
            roomGallery.appendChild(col);
         }
      
      

      // 🏨 Display Hotel List
      fetch(`http://hotel-management-db-hotel-managment.up.railway.app/hotels?hotelchain_id=${chain.hotelchain_id}`)
   .then(res => res.json())
   .then(hotels => {
      hotelListBox.innerHTML = `
         <h4 class="text-center mb-4">${chain.hotel_chain_name} Hotels</h4>
         <div class="row">
            ${hotels.map(h => `
               <div class="col-md-6 mb-4">
                  <div class="card border-primary shadow-sm h-100">
                     <div class="card-body">
                        <h5 class="card-title">
                           <i class="fa fa-envelope text-primary mr-2"></i>${h.email_address}
                        </h5>
                        <p class="card-text mb-1">
                           <i class="fa fa-map-marker text-danger mr-2"></i>${h.street_name}, ${h.town}
                        </p>
                        <p class="card-text mb-1">
                           <i class="fa fa-globe text-success mr-2"></i>${h.province}, ${h.country}
                        </p>
                     </div>
                  </div>
               </div>
            `).join("")}
         </div>
      `;
   });

   }
});
