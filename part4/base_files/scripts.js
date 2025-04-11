/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/
/*------------------------------------------------------Load content from file for login.html to submit user credentials------------------------*/

document.addEventListener('DOMContentLoaded', () => {  
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          let email = document.getElementById("email");
          let password = document.getElementById("password");
          loginUser(email.value, password.value) //using function loginUser with value of both elements email and password
        });
      }
  checkAuthentication() // check if user is authenticated, if yes login link page disappears
  });
  
/*------------------------------------------------------Load content from file for place.html to submit new reviews------------------------*/

document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  const token = getCookie('token'); // get token for review submission (to assure review's writer is connected)
  const placeId = getPlaceIdFromURL(); //get placeId here to add it as parameter in submitReview


  if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
          event.preventDefault();
        let text = document.getElementById("review");
        const textContent = text.value; //retrieve text from textarea for review submitReview parameter
        let rating = document.getElementById("rating");
        if (rating.value === ""){
          alert("You have to select a rating !") // edge case if rating is on default
        }
        else
        {
          submitReview(token, rating.value, placeId, textContent) // launch of the function with the button submit 
        }
          // Make AJAX request to submit review
          // Handle the response
      });
  }
});

/*-------------------------------------------function to submit new review with POST request ------------------------------------------*/

async function submitReview(token, rating, placeId, reviewText) {

  const decodeJWT = JSON.parse(atob(token.split('.')[1])); // decode user token into database values
  const userId = decodeJWT.sub; //select token Userid
  const UserId = userId.id; // select token userid without the admin boolean
  // data to serialize and to post
  const data = {
    text: reviewText,
    rating: parseFloat(rating),
    user_id: UserId,
    place_id: placeId
    }
    //function to verify if token has expired (dont work properly)
    if (isTokenExpired(token)) {
      localStorage.clear() //clear token from localStorage
      alert('Your session has expired. Please log in again.');
      window.location.href = 'login.html'; //redirect to the login page
    }
    console.log(JSON.stringify(data))
    //send post request with serializing the data object with JSON.stringify
    const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
      method: 'POST',
      headers: {
        'Authorization': "Bearer " + token,
        'Content-Type': 'application/json',
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
      body: JSON.stringify(data)
    });

    handleResponse(response); //function to handle response from post request
  }

/*--------------------------------------------handle the response from the Post request of the review submission--------------------------*/

  function handleResponse(response) {
  //case when review has successfully been added to list of reviews
    if (response.ok) {
        alert('Review submitted successfully!');
        const reviewForm = document.getElementById('review-form');
        reviewForm.innerHTML = "";
//error cases
    }
    else{
      alert('Failed to submit review');
    }
  }

/*------------------------------------------------------Authentication of user function ------------------------------------------------*/

  async function loginUser(email, password) {
    //Post request of email and password to log in
    const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    //check success (user exists in db)
    if (response.ok) {
      const data = await response.json();
      window.location.href = 'index.html';
      localStorage.setItem('token', data.access_token);
      }
    //error (bad input or user dont exist in db) 
      else {
        alert('Login failed: ' + response.statusText);
      }
}

/*-------------------------------------------Function to display elements or not if the user is connected------------------------*/


function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  //check if the current page is place.html
  if (window.location.pathname.includes('place.html')) {
    const addReviewForm = document.getElementById('review-form');
    // dont display review form if user not connected, display login link
    if (!token) {
      alert('You must be logged in to access this page.');
      loginLink.style.display = 'block';
      if (addReviewForm) addReviewForm.style.display = 'none';
      window.location.href = 'index.html'; // Redirect to the index page
    }
    //display review form if connected, dont display login link
     else {
      loginLink.style.display = 'none';
      if (addReviewForm) addReviewForm.style.display = 'block';
      fetchPlaceDetails(token, getPlaceIdFromURL());
    }
  } else {
    if (!token) {
      loginLink.style.display = 'block';
    } else {
      loginLink.style.display = 'none';
      // fetch places only if not on place.html file and only when user is connected
      fetchPlaces(token);
    }
  }
}

/*------------------------------------------------------Get token from localStorage------------------------*/

function getCookie(name) {
  return localStorage.getItem(name);
}

/*------------------------------------------------------Get all places function----------------------------------------*/

async function fetchPlaces(token) {
  // Make a GET request to fetch places data
  const response = await fetch('http://127.0.0.1:5000/api/v1/places/',
    {
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      }
    });
    //handle response
      if (response.ok){
        const data = await response.json();
        displayPlaces(data)
      }
      else {
        alert('data fecth failed: ' + response.statusText);
      }

    }

/*-----------------------------------------------------------function to add new places that we got with fetchPlace function-------------------------*/


function displayPlaces(places) {
  // Clear the current content of the places list
  let arr = document.getElementById('places-list')
  arr.innerHTML = ""
  //create new divs for each element
  places.forEach(element => {
    let newVar = document.createElement('div')
        newVar.innerHTML = `
                <div class="place-card">
                <h2 class="place-name">${element.title}</h2>
                <p class="place-price">$${element.price}</p>
                <button onclick="window.location.href='place.html?placeId=${element.id}';" class="details-button">View Details</button>
            </div>
    `
    //append new divs to original list of places
    arr.appendChild(newVar)
  });
  // Iterate over the places data
  // For each place, create a div element and set its content
  // Append the created element to the places list
}

/*------------------------------------------------------Price filter-------------------------------------------*/

if (window.location.pathname.includes('index.html')){ //verify current location
document.getElementById('price-filter').addEventListener('change', () => {
  const PriceSelect = document.querySelector('#price-filter'); 
  const PriceValue = PriceSelect.value === "All" ? Infinity : Number(PriceSelect.value); //retrieve value of price, select max value if default option "all" is selected, else convert the option selected to string
  const PlaceCollection = document.getElementsByClassName('place-card'); //select all places cards from list of places
  const PlaceArr = Array.from(PlaceCollection);
  //treat each element of place array
  PlaceArr.forEach(element => {
    const StringPrice = element.querySelector('.place-price').textContent;
    const NumberPrice = Number(StringPrice.replace("$", "")); // convert price of a place to int by also removing the "$"
    //hide place if its price is superior to selected option
    if (NumberPrice > PriceValue) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });
});
}

/*------------------------------------------------------Retrieve place_id from URL----------------------------------------------------*/

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search); // Parse the query string
  return params.get('placeId'); // Get the value of the 'placeId' parameter
}

/*--------------------------------------------------------Get details for place from one place with place id----------------------------------------*/

async function fetchPlaceDetails(token, placeId) {
  // Make a GET request to fetch place details
      //function to verify if token has expired (dont work properly)
  if (isTokenExpired(token)) {
      localStorage.clear() //clear token from localStorage
      alert('Your session has expired. Please log in again.');
      window.location.href = 'login.html'; //redirect to the login page
  }
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`,
    {
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      }
    });
    //handle response
      if (response.ok){
        const data = await response.json();
        displayPlaceDetails(data)
      }
      else {
        alert('data fecth failed: ' + response.statusText);
      }

    }


/*-----------------------------------------------function to display place details for particular place -------------------------------*/

async function displayPlaceDetails(place) {
  //select section #place-details
  let arr = document.querySelector('#place-details');
  let amenities = [];
  let reviews = document.querySelector('#reviews')


  //Iterate over the amenities and extract their names
  place.amenities.forEach(element => {
    amenities.push(element.name);
  });
  const Reviews = await getReviewsforPlace(getPlaceIdFromURL()) //get reviews from specific place
  if (Reviews.length === 0){// check if there are any reviews
    //if not replace content with default not found HTML div element
    reviews.innerHTML = `
    <div class= "review-card">
      <br>
      <p><strong>No reviews for this place yet.</strong></p>
      <br>
    </div>`
  }
  else{
  //loop through each reviews
  Reviews.forEach( re => {
    const star = "★"
    const rating = star.repeat(re.rating) //add star depending of the review rating
    const PromiseUser = getUserDetails(re.user_id) //fetch user details
    //if promise is fufilled
    PromiseUser.then((value) =>{
      let first_name = value.first_name;
      let last_name = value.last_name;
      //add new div element with attributes for each review 
      reviews.innerHTML += `
      <div class="review-card">
      <p><strong>${first_name} ${last_name}</strong></p>
      <p><strong>Description:</strong> ${re.text}</p>
      <p><strong>Rating:</strong> ${rating}</p>
      </div>
    `;
    });
  });
}
//part for place details
  arr.innerHTML = "";
  if(amenities.length !== 0){ //check if amenities list of name are not empty
  //replace content of arr (#place-details)
  arr.innerHTML = `
  <h2 class="place-name">${place.title}</h2>
    <div class="place-details">
      <p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
      <p><strong>Price:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities:</strong> ${amenities}</p>
    </div>
      `
  //case if amenities are empty
  }else{
    arr.innerHTML = `
    <h2 class="place-title">${place.title}</h2>
    <div class="place-details">
      <p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
      <p><strong>Price:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities</strong>: No amenities for this place</p>
    </div>
    `
  }
  };

/*------------------------------------------------------Function to get reviews for specific place------------------------*/


async function getReviewsforPlace(placeId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    //handle response
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return []; // Return an empty array if the response is not ok
    }
  } catch (error) { // Log the error for debugging
    return []; // Return an empty array in case of a network error
  }
}

/*------------------------------------------------------Function to fetch user details------------------------*/

async function getUserDetails(userId){
  try{
  const response = await fetch(`http://127.0.0.1:5000/api/v1/users/${userId}`,
  {
    method:'GET',
    headers:{
      'Content-Type': 'application/json',
    }
  });
  //handle response
    if (response.ok){
      const data = await response.json();
      return data;
    }
   else {
      return []; // Return an empty array to handle failure gracefully
    }
  }
  catch (error){
    return []; // Return empty array to prevent get error
  }
}

/*------------------------------------------------------Function to see if token is expired or not ------------------------*/

function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode the payload
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return payload.exp < currentTime; // Check if the token has expired
}
