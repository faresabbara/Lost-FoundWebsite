// Define an empty staffList array to store items
let staffList = [];

document.addEventListener("DOMContentLoaded", function () {

    // Functions to retrieve item data and render the items
    async function fetchData() {
        try {
            const response = await fetch(`/Itemsfound.html`);
            if (response.ok) {
                staffList = await response.json();
                renderStaffList();
            } else {
                console.error('Error fetching item details:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching item details:', error.message);
        }
    }

    async function renderStaffList() {

        const staffContainer = document.getElementById("requestsContainer");
        const requestList = document.getElementById("requestList");

        requestList.innerHTML = "";
        // Iterate through each item in staffList and create list items
        staffList.forEach(item => {
         
            const formattedDate = new Date(item.date_lost).toLocaleDateString('en-CA');
          
            const userID = item.user_id || '';
            const itemId = item.itemID || '';
            const itemName = item.item_name || '';
            const itemDescription = item.item_description || '';
            const category = item.category || '';
            const dateLost = formattedDate || '';
            const lastLocation = item.last_loc || '';
            const imagePath = item.image_path || '';
            const dateAdded = item.date_added || '';
            const itemStatus = item.item_status || '';
            const returnStatus = item.return_status || '';
            const foundLocation = item.found_loc || '';
            const dateReturned = item.date_returned || '';
            const dateFound = item.date_found || '';
            // Create a list item element
            const listItem = document.createElement("li");
            listItem.className = "list-group-item custom-list-item";

            const formattedDateAdded = new Date(dateAdded).toLocaleDateString('en-US');

            // Update the listItem.innerHTML in renderStaffList
            listItem.innerHTML = `
    <div class="custom-list-item-content">
        <h5 class="mb-1">Item Name: ${itemName}, Date Added: ${formattedDateAdded}</h5>
        <p class="mb-1">Category: ${category}</p>
    </div>
    <div class="custom-list-item-buttons">
        <button class="btn btn-primary btn-sm me-2 listbtn" data-action="viewDetails"  data-id="${itemId}">View Details</button>
        <button class="btn btn-primary btn-sm me-2 listbtn" data-action="itemStatus"  data-id="${itemId}">Item status</button>
        <button class="btn btn-info btn-dark btn-sm listbtn" data-action="textStudent"  data-id="${itemId}">Text Student</button>
        <button class="btn btn-secondary btn-sm listbtn" data-action="status"  data-id="${itemId}">Status</button>
    </div>`;
            // Append the listItem to the requestList
            requestList.appendChild(listItem);
            staffContainer.appendChild(requestList);
        });
    }
    // Initial fetch of item details when the page loads
    fetchData();

    // Function to view details of a selected item
    function viewDetails(itemId) {

        const selectedItem = staffList.find((item) => item.itemID === itemId);

        if (!selectedItem) {
            console.error(`Item with ID ${itemId} not found.`);
            return;
        }
     
        const x = new Date(selectedItem.date_lost).toLocaleDateString('en-CA');
        // Generate HTML for the image tag (if available)
        var imageTag = selectedItem.image_path ? `<img src="${selectedItem.image_path}" alt="Item Image" class="img-fluid">` : '<p>No image available</p>';

        // Update the modal content with details
        document.getElementById("viewDetailsUserID").innerText = `User ID: ${selectedItem.user_id}`;
        document.getElementById("viewDetailsItemID").innerText = `Item ID: ${selectedItem.itemID}`;
        document.getElementById("viewDetailsDateLost").innerText = ` Date Lost: ${x}`;
        document.getElementById("viewDetailsItemDescription").innerText = `Description: ${selectedItem.item_description}`;
        document.getElementById("viewDetailsLastLocation").innerText = `Last Location: ${selectedItem.last_loc}`;
        document.getElementById('detailsImageContainer').innerHTML = imageTag;

        // Show the viewDetails modal
        const viewDetailsModal = new bootstrap.Modal(document.getElementById("viewDetailsModal"));
        viewDetailsModal.show();
    }

    // Function to view status of a selected item
    function viewStatus(itemId) {
        
        const selectedItem = staffList.find((item) => item.itemID === itemId);
    
        if (!selectedItem) {
            console.error(`Item with ID ${itemId} not found.`);
            return;
        }
       
        const dateFound = selectedItem.date_found ? new Date(selectedItem.date_found).toLocaleDateString('en-CA') : 'Not Available';
        const dateReturned = selectedItem.date_returned ? selectedItem.date_returned : 'Not Available';
    
        // Update the modal content with status
        document.getElementById("viewItemStatus").innerText = `Item Status: ${selectedItem.item_status}`;
        document.getElementById("viewReturnStatus").innerText = `Return Status: ${selectedItem.return_status}`;
        document.getElementById("viewDateFound").innerText = ` Date Found: ${dateFound}`;
        document.getElementById("viewDateReturned").innerText = `Date Returned: ${dateReturned}`;
        document.getElementById("viewFoundLoc").innerText = `Found Location: ${selectedItem.found_loc}`;

        // Show the viewStatus modal
        const viewStatusModal = new bootstrap.Modal(document.getElementById("viewStatusModal"));
        viewStatusModal.show();
    }

    // Function to remove modal backdrop
    function removeModalBackdrop() {
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.parentNode.removeChild(backdrop);
        });

        // Ensure the body doesn't have the modal-open class
        document.body.classList.remove('modal-open');
    }
    // Function to sort the staff list by date added
    function sortByDateAdded() {
        staffList.sort((a, b) => b.itemID - a.itemID);
        renderStaffList();
    }
    // Function to sort the staff list by date lost
    function sortByDateLost() {
        staffList.sort((a, b) => new Date(new Date(a.date_lost).toLocaleDateString('en-CA')) - new Date(new Date(b.date_lost).toLocaleDateString('en-CA')));
        renderStaffList();
    }

    renderStaffList();


    renderStaffList();
    let selectedStatus = null;
    let selectedStatusOption = null;
    let locationFound = null;
    let dateReturned = null;

    // Update the event listener in requestsContainer to handle the "Status" button and modal
    document.getElementById('requestsContainer').addEventListener('click', function (event) {
        const target = event.target;
        // Get the action and item ID from the clicked button's data attributes
        const action = target.getAttribute('data-action');
        const itemId = target.getAttribute('data-id');

        if (action && itemId) {
            // Check the action type and perform corresponding actions
            if (action === 'viewDetails') {
                viewDetails(parseInt(itemId, 10));
            } else if (action === 'itemStatus') {
                viewStatus(parseInt(itemId, 10));
            } else if (action === 'textStudent') {
                const staffChatModal = new bootstrap.Modal(document.getElementById("staffChatModal"));
                staffChatModal.show();
            } else if (action === 'status') {
                const statusModal = new bootstrap.Modal(document.getElementById("statusModal"));
                statusModal.show();

                // Handle status selection
                const statusButtons = document.querySelectorAll('#statusModal button[data-status]');
                statusButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        // Update the selectedStatus based on user's choice
                        selectedStatus = this.getAttribute('data-status');
                        console.log(`Status selected for item ID ${itemId}: ${selectedStatus}`);
                        // Toggle active class for status buttons
                        if (selectedStatus === 'Found') {
                            document.querySelector('.lost-btn').classList.remove('active');
                            document.querySelector('.found-btn').classList.add('active');
                        } else {
                            document.querySelector('.found-btn').classList.remove('active');
                            document.querySelector('.lost-btn').classList.add('active');
                        }
                        // Show/hide options based on selectedStatus
                        const foundOptions = document.getElementById('foundOptions');
                        const returnedOptions = document.getElementById('returnedOptions');

                        if (selectedStatus === 'Found') {
                            foundOptions.style.display = 'block';
                            returnedOptions.style.display = 'none';
                        } else {
                            foundOptions.style.display = 'none';
                            returnedOptions.style.display = 'none';
                        }
                    });
                });

                // Handle "Returned" and "Not Returned" options
                const statusOptionButtons = document.querySelectorAll('#statusModal button[data-status-option]');
                statusOptionButtons.forEach(optionButton => {
                    optionButton.addEventListener('click', function () {
                        // Update the selectedStatusOption based on user's choice
                        selectedStatusOption = this.getAttribute('data-status-option');
                        console.log(`Status Option selected for item ID ${itemId}: ${selectedStatusOption}`);
                        // Toggle active class for status option buttons
                        if (selectedStatusOption === 'Returned') {
                            document.querySelector('.not-returned-btn').classList.remove('active');
                            document.querySelector('.returned-btn').classList.add('active');
                        } else {
                            document.querySelector('.returned-btn').classList.remove('active');
                            document.querySelector('.not-returned-btn').classList.add('active');
                        }
                        // Show/hide options based on selectedStatusOption
                        const returnedOptions = document.getElementById('returnedOptions');
                        if (selectedStatusOption === 'Returned') {
                            returnedOptions.style.display = 'block';
                        } else {
                            returnedOptions.style.display = 'none';
                        }
                    });
                });

                const confirmStatusBtn = document.getElementById('confirmStatusBtn');
                confirmStatusBtn.addEventListener('click', function () {
                    // Get user inputs for location found and date returned
                    locationFound = document.getElementById('editLastLocation').value;
                    dateReturned = document.getElementById('dateReturned').value;
                    dateFound = document.getElementById('dateFound').value;
         
                    const requiresDateFoundAndLocation = selectedStatus === 'Found';

                    if (requiresDateFoundAndLocation && (!locationFound)) {
                        alert('Please fill in both Date Found and Location Found.');
                    } else {
                        const mappedStatusOption = selectedStatusOption === 'Not Returned' ? 'notReturned' : selectedStatusOption;

                        const requestData = {
                            itemID: itemId,
                            item_status: selectedStatus,
                            return_status: mappedStatusOption,
                            found_loc: locationFound,
                            date_found: dateFound,
                            date_returned: dateReturned,
                        };

                        // Send a fetch request to update item status on the server
                        fetch('/updateStatus', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestData),
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Status updated successfully:', data);
                            })
                            .catch(error => {
                                console.error('Error updating status:', error);
                            })
                            .finally(() => {
                                // Hide the status modal, fetch updated data, and render the staff list
                                statusModal.hide();
                                fetchData();
                                renderStaffList();
                            });

                    }

                });
            }
        }
    });
    // Event listener for sorting by date added button
    document.getElementById('sortByDateAddedBtn').addEventListener('click', function () {
        sortByDateAdded();
    });
    // Event listener for sorting by date lost button
    document.getElementById('sortByDateLostBtn').addEventListener('click', function () {
        sortByDateLost();
    });
    // Event listener for search button
    document.getElementById('searchBtn').addEventListener('click', function () {
        performSearch();
    });
    // Event listener for search input 
    document.getElementById('searchInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    // Function to perform search based on input
    function performSearch() {
        searchItems(document.getElementById('searchInput').value.trim().toLowerCase());
    }
    // Function to search items based on category or item name
    function searchItems(searchTerm) {
        if (!searchTerm) {
            renderStaffList();
            return;
        }
        // Filter items based on search term
        const filteredItems = staffList.filter(item =>
            item.category.toLowerCase().includes(searchTerm) ||
            item.item_name.toLowerCase().includes(searchTerm)
        );
        // Render the filtered items
        renderFilteredItems(filteredItems);
    }
    // Function to render filtered items
    function renderFilteredItems(filteredItems) {
        const staffContainer = document.getElementById("requestsContainer");
        const staffListElement = document.getElementById("requestList");

        staffListElement.innerHTML = "";

        // Render each staff item
        filteredItems.forEach((staffItem) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item custom-list-item";

            const formattedDateAdded = new Date(staffItem.date_added).toLocaleDateString('en-US');

            listItem.innerHTML = `
    <div class="custom-list-item-content">
        <h5 class="mb-1">Item Name: ${staffItem.item_name}, Date Added: ${formattedDateAdded}</h5>
        <p class="mb-1">Category: ${staffItem.category}</p>
    </div>
    <div class="custom-list-item-buttons">
        <button class="btn btn-primary btn-sm me-2 listbtn" data-action="viewDetails" data-id="${staffItem.itemID}">View Details</button>
        <button class="btn btn-warning btn-sm me-2 listbtn" data-action="itemStatus" data-id="${staffItem.itemID}">Item Status</button>
        <button class="btn btn-info btn-dark btn-sm listbtn" data-action="textStudent" data-id="${staffItem.itemID}">Text Student</button>
        <button class="btn btn-secondary btn-sm listbtn" data-action="status" data-id="${staffItem.itemID}">Status</button>
    </div>`;
            staffListElement.appendChild(listItem);
        });

        staffContainer.appendChild(staffListElement);
    }

});
// Function to set dark mode preference in cookies
const darkModeCookie = document.cookie.split('; ').find(row => row.startsWith('darkMode='));
if (darkModeCookie) {
    const isDarkMode = darkModeCookie.split('=')[1] === 'true';
    document.body.style.display = 'block';
    document.body.classList.toggle('dark-theme', isDarkMode);
} else {
    document.body.style.display = 'block';
}

var darkmode = document.getElementById("darkModeBtn");
if (darkmode) {
    darkmode.onclick = function () {
        document.body.classList.toggle("dark-theme");
        setDarkModePreference(document.body.classList.contains("dark-theme"));
    };
}

function setDarkModePreference(isDarkMode) {
    document.cookie = `darkMode=${isDarkMode}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}
// Function to perform user logout
function logout() {
    var form = $('<form action="/logout" method="POST"></form>');
    $('body').append(form);
    form.submit().remove()
}


// inserting the session information into the profile modal
$(document).ready(function () {
    // Make an AJAX request to fetch user information
    $.ajax({
        url: '/profile',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // Update the content of the modal with the fetched user information
            $('#userFirstName').text(data.userFirstName);
            $('#userID').text(data.userID);
        },
        error: function (error) {
            console.error('Error fetching user information:', error);
        }
    });
});