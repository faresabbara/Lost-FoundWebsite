// display items on the user homepage
async function displayItems() {

    try {
        // Fetch item details from /user.html
        const response = await fetch(`/user.html`);

        if (response.ok) {
            // Convert response to JSON
            const items = await response.json();
            // Iterate over items and create HTML elements for each
            items.forEach(item => {
                const formattedDate = new Date(item.date_lost).toLocaleDateString('en-CA');
                // Extract item details or set defaults if not available
                const itemId = item.itemID || 'Not Available';
                const itemName = item.item_name || 'Not Available';
                const itemDescription = item.item_description || 'Not Available';
                const category = item.category || 'Not Available';
                const dateLost = formattedDate || 'Not Available';
                const lastLocation = item.last_loc || 'Not Available';
                const dateAdded = item.date_added || 'Not Available';
                const formattedDateAdded = new Date(dateAdded).toLocaleDateString('en-US');
                var currentDate = new Date();
                // Create a new list item element
                var newItem = document.createElement("li");
                newItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");
                newItem.innerHTML = `
        <div class="d-flex align-items-start">
            <div>
                <h5 class="mb-1">Item Name: ${itemName}, Date Added: ${formattedDateAdded}</h5>
                <p class="mb-1" style="font-weight: normal;">Category: ${category}</p>
            </div>
        </div>
        <div class="text-end">
            <button class="btn btn-light mt-2 view-details-btn listbtn" 
                    data-bs-toggle="modal" 
                    data-bs-target="#viewDetailsModal" 
                    data-item-name="${itemName}" 
                    data-category="${category}" 
                    data-item-id="${itemId}"
                    data-date-lost="${dateLost}" 
                    data-item-description="${itemDescription}"
                    data-last-location="${lastLocation}"
                    data-image-url="${item.image_url}"> 
                View Details
            </button>
   
      
        </div>`;
                // Set additional properties on the new item
                newItem.dateLost = new Date(dateLost);
                newItem.dateFound = currentDate;
                newItem.dateTimeAdded = currentDate;
                // Append the new item to the request list
                requestList.appendChild(newItem);

            });

        } else {
            console.error('Error fetching item details:', response.statusText);
        }

    } catch (error) {
        console.error('Error fetching item details:', error.message);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Display items when the page is loaded
    displayItems();

    // Create Bootstrap Modals for add request
    var addRequestModal = new bootstrap.Modal(document.getElementById('addRequestModal'), {
        backdrop: 'static',
        keyboard: true,
    });
    // Create Bootstrap Modals for view details
    var viewDetailsModal = new bootstrap.Modal(document.getElementById('viewDetailsModal'), {
        backdrop: 'static',
        keyboard: true,
    });
    // Open chat modal on click
    document.getElementById('openChatModal').addEventListener('click', function () {
        var chatModal = new bootstrap.Modal(document.getElementById('chatModal'), {
            backdrop: 'static',
            keyboard: true,
        });
        chatModal.show();
    });
    // Initialize variables for sorting and handling the request list
    var requestList = document.getElementById('requestList');
    var sortByDateLost = document.getElementById('sortByDateLost');
    var sortByDateFound = document.getElementById('sortByDateFound');
    var originalItemList = Array.from(requestList.children);

    // Function to render the request list with given items
    function renderRequestList(items) {
        requestList.innerHTML = "";
        items.forEach(item => {
            requestList.appendChild(item.cloneNode(true));
        });
    }
    
    document.getElementById('addRequestBtn').addEventListener('click', function () {
        addRequestModal.show();
    });
    // Event listeners for sorting items based on date lost and date added
    sortByDateLost.addEventListener('click', function () {
        sortItems('dateLost');
    });
    sortByDateFound.addEventListener('click', function () {
        sortItems('dateTimeAdded');
    });
    // Event listeners for handling key presses on input fields
    document.getElementById('itemName').addEventListener('keydown', function (event) {
        handleEnterKeyPress(event, 'category');
    });

    document.getElementById('category').addEventListener('keydown', function (event) {
        handleEnterKeyPress(event, 'lastLocation');
    });

    document.getElementById('lastLocation').addEventListener('keydown', function (event) {
        handleEnterKeyPress(event, 'dateLost');
    });

    document.getElementById('dateLost').addEventListener('keydown', function (event) {
        handleEnterKeyPress(event, 'itemDescription');
    });

    // Event listener for handling clicks on items in the request list
    requestList.addEventListener('click', function (event) {
        if (event.target.classList.contains('view-details-btn')) {
            const itemId = event.target.dataset.itemId;
            const dateLost = event.target.dataset.dateLost;
            const itemDescription = event.target.dataset.itemDescription;
            const lastLocation = event.target.dataset.lastLocation;
            const imageUrl = event.target.dataset.imageUrl;

            var imageTag = imageUrl ? `<img src="${imageUrl}" alt="Item Image" class="img-fluid">` : '<p>No image available</p>';

            document.getElementById('viewDetailsItemId').textContent = `Item ID: ${itemId}`;
            document.getElementById('detailsImageContainer').innerHTML = imageTag;
            document.getElementById('viewDetailsLastLocation').textContent = `Last Location: ${lastLocation}`;
            document.getElementById('viewDetailsDateLost').textContent = `Date Lost: ${dateLost}`;
            document.getElementById('viewDetailsItemDescription').textContent = `Item Description: ${itemDescription}`;
            viewDetailsModal.show();

            originalItemList = Array.from(requestList.children);
        }
    });
    // Event listeners for search functionality
    document.getElementById('searchBtn').addEventListener('click', function () {
        performSearch();
    });

    document.getElementById('searchInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    // Array to store sorted items
    var sortedItemList = [];
    // Function to perform search based on user input
    function performSearch() {
        var searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

        if (!searchTerm) {
            renderRequestList(originalItemList);
            sortedItemList = [];
        } else {
            var filteredItems = originalItemList.filter(item =>
                item.textContent.toLowerCase().includes(searchTerm)
            );
            renderRequestList(filteredItems);
            sortedItemList = filteredItems.slice();
        }
        console.log('searched');
    }
    // Functions to handle and trigger the 'Enter' key press and move to the next input field
    function handleEnterKeyPress(event, nextInputId) {
        if (event.key === 'Enter') {
            event.preventDefault();
            triggerEnterKeyPress(nextInputId);
        }
    }
    function triggerEnterKeyPress(nextInputId) {
        var nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
    // Function to sort items based on the specified criterion
    function sortItems(sortCriterion) {
        var items = sortedItemList.length ? sortedItemList.slice() : originalItemList.slice(); // Use sorted items or original items

        items.sort(function (a, b) {
            var dateA = a[sortCriterion];
            var dateB = b[sortCriterion];

            return dateB - dateA;
        });

        renderRequestList(items); // Render the sorted items
        sortedItemList = items.slice(); // Update the sorted items after sorting
    }
    const settingsForm = document.getElementById('settingsForm');

    // Set retrieved user information in the settings modal fields
    document.getElementById('settingsEmail').value = storedEmail || '';
    document.getElementById('settingsFirstName').value = storedFirstName || '';
    document.getElementById('settingsLastName').value = storedLastName || '';
    document.getElementById('settingsPhoneNumber').value = storedPhoneNumber || '';
    document.getElementById('settingsPassword').value = storedpass || '';


    const newPhoneNumberField = document.getElementById('settingsPhoneNumber');
    newPhoneNumberField.addEventListener('input', function (event) {
        // Get the entered value and remove any non-numeric characters
        var enteredValue = event.target.value;
        var numericValue = enteredValue.replace(/\D/g, '');

        // Update the input value with the cleaned numeric value
        event.target.value = numericValue;
    });


    settingsForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Retrieve values from the settings form
        const newEmail = document.getElementById('settingsEmail').value.trim();
        const newPhoneNumber = newPhoneNumberField.value.trim();
        const newPassword = document.getElementById('settingsPassword').value.trim();
        const confirmPassword = document.getElementById('settingsConfirmPassword').value.trim();
        let finalPassword = localStorage.getItem('userPassword');


        // Validate phone numbers
        if (newPhoneNumber.length !== 10) {
            alert('Phone number should be 10 characters');
            return;
        }

        // Check if the passwords match and are within the specified length range
        if ((newPassword !== confirmPassword && newPassword !== '') ||
            (newPassword.length > 0 && (newPassword.length < 8 || newPassword.length > 300))) {
            alert('Passwords should be equal and between 8 and 300 characters');
            return;
        }
        if (newPassword !== '' && confirmPassword !== '') {
            finalPassword = newPassword;
        }

        const isConfirmed = confirm('Are you sure you want to save the changes?');

        if (isConfirmed) {
            // If the user confirms, proceed to save the updated information
            localStorage.setItem('userEmail', newEmail);
            localStorage.setItem('userPhoneNumber', newPhoneNumber);
            localStorage.setItem('userPassword', finalPassword);

            // Close the settings modal
            const modalElement = document.getElementById('settingsModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        } else {
            // If the user cancels, do not save the changes, revert email to the stored value
            document.getElementById('settingsEmail').value = storedEmail || '';
            document.getElementById('settingsPhoneNumber').value = storedPhoneNumber || '';
            document.getElementById('settingsPassword').value = storedpass || '';
            alert('Changes not saved');
            const modalElement = document.getElementById('settingsModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        }
    });

    document.getElementById('settingsModal').addEventListener('hidden.bs.modal', function () {
        const newPasswordField = document.getElementById('settingsPassword');
        const confirmPasswordField = document.getElementById('settingsConfirmPassword');

        newPasswordField.value = '';
        confirmPasswordField.value = '';
    });

    document.getElementById('settingsModal').addEventListener('hide.bs.modal', function () {
        document.getElementById('settingsEmail').value = storedEmail || '';
        document.getElementById('settingsFirstName').value = storedFirstName || '';
        document.getElementById('settingsLastName').value = storedLastName || '';
        document.getElementById('settingsPhoneNumber').value = storedPhoneNumber || '';
        const newPasswordField = document.getElementById('settingsPassword');
        const confirmPasswordField = document.getElementById('settingsConfirmPassword');

        newPasswordField.value = '';
        confirmPasswordField.value = '';
    });

});

// Dark mode initialization and toggle button
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

function logout() {
    var form = $('<form action="/logout" method="POST"></form>');
    $('body').append(form);
    form.submit().remove()
}

// inserting the session information into the profile modal
$(document).ready(function () {
    $.ajax({
        url: '/profile',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            $('#userFirstName').text(data.userFirstName);
            $('#userID').text(data.userID);
        },
        error: function (error) {
            console.error('Error fetching user information:', error);
        }
    });
});