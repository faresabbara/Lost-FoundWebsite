let staffList = [];
document.addEventListener("DOMContentLoaded", function () {

    // Functions to render the staff list
    async function fetchData() {
        try {
            const response = await fetch(`/staff.html`);
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
    // Function to render the staff list
    async function renderStaffList() {
        const staffContainer = document.getElementById("requestsContainer");
        const requestList = document.getElementById("requestList");

        requestList.innerHTML = "";

        staffList.forEach(item => {
            // Format date and extract item details
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
        <button class="btn btn-primary btn-sm me-2 listbtn" data-action="editItem"  data-id="${itemId}">Edit</button>
        <button class="btn btn-info btn-dark btn-sm listbtn" data-action="textStudent"  data-id="${itemId}">Text Student</button>
        <button class="btn btn-secondary btn-sm listbtn" data-action="status"  data-id="${itemId}">Status</button>
    </div>`;

            requestList.appendChild(listItem);
            staffContainer.appendChild(requestList);
        });
    }
    // Fetch staff data when the page loads
    fetchData();

    // Function to view details of a staff item
    function viewDetails(itemId) {
        const selectedItem = staffList.find((item) => item.itemID === itemId);

        if (!selectedItem) {
            console.error(`Item with ID ${itemId} not found.`);
            return;
        }

        const x = new Date(selectedItem.date_lost).toLocaleDateString('en-CA');
        var imageTag = selectedItem.image_path ? `<img src="${selectedItem.image_path}" alt="Item Image" class="img-fluid">` : '<p>No image available</p>';

        // Update the modal content with details
        document.getElementById("viewDetailsUserID").innerText = `User ID: ${selectedItem.user_id}`;
        document.getElementById("viewDetailsItemID").innerText = `Item ID: ${selectedItem.itemID}`;
        document.getElementById("viewDetailsDateLost").innerText = ` Date Lost: ${x}`;
        document.getElementById("viewDetailsItemDescription").innerText = `Description: ${selectedItem.item_description}`;
        document.getElementById("viewDetailsLastLocation").innerText = `Last Location: ${selectedItem.last_loc}`;
        document.getElementById('detailsImageContainer').innerHTML = imageTag;


        const viewDetailsModal = new bootstrap.Modal(document.getElementById("viewDetailsModal"));
        viewDetailsModal.show();
    }

    // Function to edit details of a staff item
    function editItem(itemId) {
        document.getElementById("editItemImage").value = '';
        const selectedItem = staffList.find((item) => item.itemID === itemId);

        // Update the modal inputs with existing details
        document.getElementById("editItemName").value = selectedItem.item_name;
        document.getElementById("editItemCategory").value = selectedItem.category;
        document.getElementById("editLastLocation").value = selectedItem.last_loc;
        document.getElementById("editItemDateLost").value = new Date(selectedItem.date_lost).toLocaleDateString('en-CA');
        document.getElementById("editItemDescription").value = selectedItem.item_description;


        const editItemModal = new bootstrap.Modal(document.getElementById("editItemModal"));

        editItemModal.show();

        const saveChangesBtn = document.getElementById("saveChangesBtn");
        saveChangesBtn.addEventListener('click', () => saveChanges(itemId, editItemModal));

        // Show confirmation modal on "Delete Item" button click
        const deleteItemBtn = document.getElementById("deleteItemBtn");
        deleteItemBtn.addEventListener('click', () => confirmDelete(itemId, editItemModal));
    }

    // Function to save changes to an edited staff item
    function saveChanges(itemId, modalInstance) {
        const selectedItemIndex = staffList.findIndex((item) => item.itemID === itemId);
        if (selectedItemIndex === -1) {
            console.error(`Item with ID ${itemId} not found.`);
            return;
        }

        // Update item details with edited values
        staffList[selectedItemIndex].item_name = document.getElementById("editItemName").value;
        staffList[selectedItemIndex].category = document.getElementById("editItemCategory").value;
        staffList[selectedItemIndex].last_loc = document.getElementById("editLastLocation").value;
        staffList[selectedItemIndex].date_lost = document.getElementById("editItemDateLost").value;
        staffList[selectedItemIndex].item_description = document.getElementById("editItemDescription").value;

        const updatedItem = {
            itemID: itemId,
            item_name: staffList[selectedItemIndex].item_name,
            category: staffList[selectedItemIndex].category,
            last_loc: staffList[selectedItemIndex].last_loc,
            date_lost: staffList[selectedItemIndex].date_lost,
            item_description: staffList[selectedItemIndex].item_description
        };

        fetch('/editItem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
                modalInstance.hide();
                const modalBackdrop = document.querySelector(".modal-backdrop");
                if (modalBackdrop) {
                    modalBackdrop.parentNode.removeChild(modalBackdrop);
                }
                fetchData();
                renderStaffList();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

    }

    // Function to confirm delete before actually deleting
    function confirmDelete(itemId, editItemModal) {
        const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationDeleteItemModal"));

        confirmationModal.show();

        // Handle delete confirmation
        const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
        confirmDeleteBtn.onclick = function () {
           
            deleteItem(itemId);

            editItemModal.hide();

            confirmationModal.hide();

            removeModalBackdrop();
            fetchData();
            renderStaffList();
        };

        // Add an event listener to remove the modal backdrop when closing without confirming deletion
        confirmationModal._element.addEventListener('hidden.bs.modal', function () {
            removeModalBackdrop();
        });
    }
    // Function to delete a staff item
    async function deleteItem(itemId, editItemModal) {
        try {
            const response = await fetch('/deleteItem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemID: itemId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Item deleted successfully:', data);

            const itemIndex = staffList.findIndex((item) => item.itemID === itemId);

            staffList.splice(itemIndex, 1);
            fetchData();
            renderStaffList();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }
    // Function to remove modal backdrop
    function removeModalBackdrop() {
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        modalBackdrops.forEach(backdrop => {
            backdrop.parentNode.removeChild(backdrop);
        });

        document.body.classList.remove('modal-open');
    }
    // Function to sort staff items by date added
    function sortByDateAdded() {
        staffList.sort((a, b) => b.itemID - a.itemID);
        renderStaffList();
    }
    // Function to sort staff items by date lost
    function sortByDateLost() {
        staffList.sort((a, b) => new Date(new Date(a.date_lost).toLocaleDateString('en-CA')) - new Date(new Date(b.date_lost).toLocaleDateString('en-CA')));
        renderStaffList();
    }

    renderStaffList();

    // Event listener for "Add Request" button click
    document.getElementById('addRequestBtn').addEventListener('click', function () {
        document.getElementById('itemName').value = '';
        document.getElementById('category').value = '';
        document.getElementById('lastLocation').value = '';
        document.getElementById('dateLost').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('image').value = '';

        const addRequestModal = new bootstrap.Modal(document.getElementById("addRequestModal"));

        // Ensure the modal is not already shown before showing it again
        if (!addRequestModal._isShown) {
            addRequestModal.show();
        }

        // Add event listeners for handling "Enter" key navigation
        document.getElementById('itemName').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('category').focus();
            }
        });

        document.getElementById('category').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('lastLocation').focus();
            }
        });

        document.getElementById('lastLocation').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('dateLost').focus();
            }
        });

        document.getElementById('dateLost').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById('itemDescription').focus();
            }
        });
    });

    // Event listener for "Submit Request" button click
    document.getElementById('submitRequestBtn').addEventListener('click', function () {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        // Create a hidden input element for the date added and append it to the form 
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'date_added';
        hiddenInput.value = formattedDate;

        document.getElementById('staffReportForm').appendChild(hiddenInput);

        document.getElementById('staffReportForm').submit();
    });


    renderStaffList();
    let selectedStatus = null;
    let selectedStatusOption = null;
    let locationFound = null;
    let dateReturned = null;

    // Update the event listener in requestsContainer to handle the "Status" button and modal
    document.getElementById('requestsContainer').addEventListener('click', function (event) {
        // Get the clicked element
        const target = event.target;
        // Get data-action and data-id attributes from the clicked element
        const action = target.getAttribute('data-action');
        const itemId = target.getAttribute('data-id');
        // Check if both action and itemId are available
        if (action && itemId) {
            // Check the action type
            if (action === 'viewDetails') {
                viewDetails(parseInt(itemId, 10));
            } else if (action === 'editItem') {
                editItem(parseInt(itemId, 10));
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
                        selectedStatus = this.getAttribute('data-status');
                        console.log(`Status selected for item ID ${itemId}: ${selectedStatus}`);
                        // Update button styles based on selectedStatus
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
                        selectedStatusOption = this.getAttribute('data-status-option');
                        console.log(`Status Option selected for item ID ${itemId}: ${selectedStatusOption}`);
                        // Update button styles based on selectedStatusOption
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

                // Handle the "Confirm" button click
                const confirmStatusBtn = document.getElementById('confirmStatusBtn');
                confirmStatusBtn.addEventListener('click', function () {
                    // Get values for locationFound and dateReturned
                    locationFound = document.getElementById('editLastLocation').value;
                    dateReturned = document.getElementById('dateReturned').value;
                    dateFound = document.getElementById('dateFound').value;
                    // Check if Date Found and Location Found are required for 'Found' status
                    const requiresDateFoundAndLocation = selectedStatus === 'Found';
                    // Display alert if required fields are not filled
                    if (requiresDateFoundAndLocation && (!locationFound)) {
                        alert('Please fill in both Date Found and Location Found.');
                    } else {
                        // Map selectedStatusOption for server request
                        const mappedStatusOption = selectedStatusOption === 'Not Returned' ? 'notReturned' : selectedStatusOption;
                        // Prepare data for updating status
                        const requestData = {
                            itemID: itemId,
                            item_status: selectedStatus,
                            return_status: mappedStatusOption,
                            found_loc: locationFound,
                            date_found: dateFound,
                            date_returned: dateReturned,
                        };

                        // Perform a fetch request to update status on the server
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
                                // Hide the status modal and update the UI
                                statusModal.hide();
                                fetchData();
                                renderStaffList();
                            });

                    }

                });
            }
        }
    });
    // Event listener for sorting by date added button click
    document.getElementById('sortByDateAddedBtn').addEventListener('click', function () {
        sortByDateAdded();
    });
    // Event listener for sorting by date lost button click
    document.getElementById('sortByDateLostBtn').addEventListener('click', function () {
        sortByDateLost();
    });
    // Event listener for search button click
    document.getElementById('searchBtn').addEventListener('click', function () {
        performSearch();
    });
    // Event listener for search input keydown
    document.getElementById('searchInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    // Function to perform search based on user input
    function performSearch() {
        searchItems(document.getElementById('searchInput').value.trim().toLowerCase());
    }
    // Function to search for staff items
    function searchItems(searchTerm) {
        if (!searchTerm) {
            renderStaffList();
            return;
        }

        const filteredItems = staffList.filter(item =>
            item.category.toLowerCase().includes(searchTerm) ||
            item.item_name.toLowerCase().includes(searchTerm)
        );

        renderFilteredItems(filteredItems);
    }

    function renderFilteredItems(filteredItems) {
        const staffContainer = document.getElementById("requestsContainer");
        const staffListElement = document.getElementById("requestList");

        staffListElement.innerHTML = "";

        // Render each staff item
        filteredItems.forEach((staffItem) => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item custom-list-item";

            const formattedDateAdded = new Date(staffItem.date_added).toLocaleDateString('en-US');

            // Update the listItem.innerHTML in renderStaffList
            listItem.innerHTML = `
    <div class="custom-list-item-content">
        <h5 class="mb-1">Item Name: ${staffItem.item_name}, Date Added: ${formattedDateAdded}</h5>
        <p class="mb-1">Category: ${staffItem.category}</p>
    </div>
    <div class="custom-list-item-buttons">
        <button class="btn btn-primary btn-sm me-2 listbtn" data-action="viewDetails" data-id="${staffItem.itemID}">View Details</button>
        <button class="btn btn-warning btn-sm me-2 listbtn" data-action="editItem" data-id="${staffItem.itemID}">Edit</button>
        <button class="btn btn-info btn-dark btn-sm listbtn" data-action="textStudent" data-id="${staffItem.itemID}">Text Student</button>
        <button class="btn btn-secondary btn-sm listbtn" data-action="status" data-id="${staffItem.itemID}">Status</button>
    </div>`;
            staffListElement.appendChild(listItem);
        });

        staffContainer.appendChild(staffListElement);
    }

});
// Dark mode functionality
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
// Function to set dark mode preference in cookies
function setDarkModePreference(isDarkMode) {
    document.cookie = `darkMode=${isDarkMode}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}
// Function to logout
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