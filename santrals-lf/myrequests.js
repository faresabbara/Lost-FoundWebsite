// Function to fetch and display items associated with the user
async function displayMyItems(){

    try {
      const response =  await fetch(`/myrequests.html`);

        if (response.ok) {
            const items = await response.json();
// Iterate through items and display them
        items.forEach(item => {
      
            const formattedDate = new Date(item.date_lost).toLocaleDateString('en-CA');

            const itemId = item.itemID || 'Not Available';
            const itemName = item.item_name || 'Not Available';
            const itemDescription = item.item_description || 'Not Available';
            const category = item.category || 'Not Available';
            const dateLost = formattedDate || 'Not Available';
            const lastLocation = item.last_loc || 'Not Available';
            const itemStatus = item.item_status || 'Not Available';
            const returnStatus = item.return_status || 'Not Available';
            const dateFound = item.date_found || 'Not Available';
            const dateReturned = item.date_returned || 'Not Available';
            const foundLoc = item.found_loc || 'Not Available';
            const dateAdded = item.date_added || 'Not Available';
            const formattedDateAdded = new Date(dateAdded).toLocaleDateString('en-US');
            const formattedDateFound = item.date_found ? new Date(item.date_found).toLocaleDateString('en-CA') : 'Not Available';
// Create and append list item for each item
                var currentDate = new Date();
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
                        <button class="btn btn-secondary mt-2 view-details-btn listbtn" 
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
                        <button class="btn btn-secondary mt-2 view-status-btn listbtn" 
                        data-bs-toggle="modal" 
                        data-bs-target="#viewStatusModal"
                        data-item-status= "${itemStatus}"
                        data-return-status = "${returnStatus}"
                        data-date-found= "${formattedDateFound}"
                        data-date-returned= "${dateReturned}"
                        data-found-loc= "${foundLoc}">
                    Item Status
                </button>
                    </div>
                `;
             // Set additional properties for sorting
                newItem.dateLost = new Date(dateLost);
                newItem.dateFound = currentDate;
                newItem.dateTimeAdded = currentDate;
                requestList.appendChild(newItem);
            
        });
        } else {
            console.error('Error fetching item details:', response.statusText);
            
        }
    } catch (error) {
        console.error('Error fetching item details:', error.message);
    }
 }
// Event listener when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {

   displayMyItems();
   
    var viewDetailsModal = new bootstrap.Modal(document.getElementById('viewDetailsModal'), {
        backdrop: 'static',
        keyboard: false,
    });

    var viewStatusModal = new bootstrap.Modal(document.getElementById('viewStatusModal'), {
        backdrop: 'static',
        keyboard: false,
    });

    var requestList = document.getElementById('requestList');
    var sortByDateLost = document.getElementById('sortByDateLost');
    var sortByDateFound = document.getElementById('sortByDateFound');
    var originalItemList = Array.from(requestList.children);

    function renderRequestList(items) {
        requestList.innerHTML = "";
        items.forEach(item => {
            requestList.appendChild(item.cloneNode(true));
        });
    }
    // Event listeners for sorting and handling modals
    sortByDateLost.addEventListener('click', function () {
        sortItems('dateLost');
    });

    sortByDateFound.addEventListener('click', function () {
        sortItems('dateTimeAdded');
    });
// Event listener for handling details
    requestList.addEventListener('click', function (event) {
        if (event.target.classList.contains('view-details-btn')) {
            var dateLost = event.target.dataset.dateLost;
            var itemDescription = event.target.dataset.itemDescription;
            var lastLocation = event.target.dataset.lastLocation;
            var item_id = event.target.dataset.itemId;
            const imageUrl = event.target.dataset.imageUrl;
    
            var imageTag = imageUrl ? `<img src="${imageUrl}" alt="Item Image" class="img-fluid">` : '<p>No image available</p>';

            document.getElementById('detailsImageContainer').innerHTML = imageTag;
            document.getElementById('viewDetailsItemId').textContent = `Item ID: ${item_id}`;
            document.getElementById('viewDetailsLastLocation').textContent = `Last Location: ${lastLocation}`;
            document.getElementById('viewDetailsDateLost').textContent = `Date Lost: ${dateLost}`;
            document.getElementById('viewDetailsItemDescription').textContent = `Item Description: ${itemDescription}`;

            var imageView = document.getElementById('detailsImageContainer');
            imageView.innerHTML = imageUrl ? `<img src="${imageUrl}" alt="Item Image" class="img-fluid">` : '<p>No image available</p>';

            viewDetailsModal.show(); 

            originalItemList = Array.from(requestList.children);
        }
    });
// Event listener for handling status modals
    requestList.addEventListener('click', function (event) {
        if (event.target.classList.contains('view-status-btn')) {
            const itemId = event.target.dataset.itemId;
            const itemStatus = event.target.dataset.itemStatus;
            const returnStatus = event.target.dataset.returnStatus;
            const dateFound = event.target.dataset.dateFound;
            const dateReturned = event.target.dataset.dateReturned;
            const foundLoc = event.target.dataset.foundLoc;
    
            console.log(itemStatus, returnStatus, dateFound, dateReturned, foundLoc);

            document.getElementById('viewItemStatus').textContent = `Item Status: ${itemStatus}`;
            document.getElementById('viewReturnStatus').textContent = `Return Status: ${returnStatus}`;
            document.getElementById('viewDateFound').textContent = `Date Found: ${dateFound}`;
            document.getElementById('viewDateReturned').textContent = `Date Returned: ${dateReturned}`;
            document.getElementById('viewFoundLoc').textContent = `Location Found: ${foundLoc}`;
            viewStatusModal.show();
    
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
    // Function to perform search based on user input
    function performSearch() {
        var searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
// Filter items based on search term
        if (!searchTerm) {
            renderRequestList(originalItemList);
        } else {
            var filteredItems = originalItemList.filter(item =>
                item.textContent.toLowerCase().includes(searchTerm)
            );
            renderRequestList(filteredItems);
        }

        document.getElementById('searchInput').value = '';
    }
    // Function to sort items based on date
    function sortItems(sortCriterion) {
        var items = Array.from(requestList.children);

        items.sort(function (a, b) {
            var dateA = a[sortCriterion];
            var dateB = b[sortCriterion];

            return dateB - dateA;
        });

        items.forEach(function (item) {
            requestList.removeChild(item);
        });

        items.forEach(function (item) {
            requestList.appendChild(item);
        });
    }

});
// Function to sort items based on date
const darkModeCookie = document.cookie.split('; ').find(row => row.startsWith('darkMode='));
    if (darkModeCookie) {
        const isDarkMode = darkModeCookie.split('=')[1] === 'true';
        document.body.style.display = 'block'; 
        document.body.classList.toggle('dark-theme', isDarkMode); 
    } else {
        document.body.style.display = 'block';
    }
// Event listener for dark mode button
var darkmode = document.getElementById("darkModeBtn");
    if (darkmode) {
        darkmode.onclick = function() {
            document.body.classList.toggle("dark-theme");
            setDarkModePreference(document.body.classList.contains("dark-theme"));
        };
    }
// Function to set dark mode preference in cookies
function setDarkModePreference(isDarkMode) {
    document.cookie = `darkMode=${isDarkMode}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}
// Function to logout
function logout(){
    var form = $('<form action="/logout" method="POST"></form>');
    $('body').append(form);
    form.submit().remove()
}

  // inserting the session information into the profile modal
  $(document).ready(function() {
    $.ajax({
      url: '/profile',
      method: 'GET',
      dataType: 'json',
      success: function(data) {
        // Update the content of the modal with the fetched user information
        $('#userFirstName').text(data.userFirstName);
        $('#userID').text(data.userID);
      },
      error: function(error) {
        console.error('Error fetching user information:', error);
      }
    });
  });