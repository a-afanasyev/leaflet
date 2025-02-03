const backendURL = "http://localhost:8080/api/buildings";

// Fetch data and populate the table
async function loadData() {
    try {
        const response = await fetch(backendURL);
        const data = await response.json();

        const tableBody = document.querySelector("#data-table tbody");
        tableBody.innerHTML = "";

        data.forEach((building) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${building.building_id}</td>
                <td contenteditable="true">${building.name}</td>
                <td contenteditable="true">${building.latitude}</td>
                <td contenteditable="true">${building.longitude}</td>
                <td>
                    <button onclick="updateBuilding(${building.building_id}, this)">Save</button>
                    <button onclick="deleteBuilding(${building.building_id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Add new building
document.getElementById("add-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const name = document.getElementById("name").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    try {
        const response = await fetch(backendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, latitude, longitude }),
        });

        if (response.ok) {
            alert("Building added successfully!");
            loadData();
        } else {
            alert("Failed to add building.");
        }
    } catch (error) {
        console.error("Error adding building:", error);
    }
});

// Update a building
async function updateBuilding(building_id, button) {
    const row = button.parentElement.parentElement;
    const name = row.cells[1].innerText;
    const latitude = row.cells[2].innerText;
    const longitude = row.cells[3].innerText;

    try {
        const response = await fetch(`${backendURL}/${building_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, latitude, longitude }),
        });

        if (response.ok) {
            alert("Building updated successfully!");
        } else {
            alert("Failed to update building.");
        }
    } catch (error) {
        console.error("Error updating building:", error);
    }
}

// Delete a building
async function deleteBuilding(building_id) {
    if (!confirm("Are you sure you want to delete this building?")) return;

    try {
        const response = await fetch(`${backendURL}/${building_id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Building deleted successfully!");
            loadData();
        } else {
            alert("Failed to delete building.");
        }
    } catch (error) {
        console.error("Error deleting building:", error);
    }
}

// Load data on page load
loadData();
