/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const addReviewForm = document.getElementById('add-review-link');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          let email = document.getElementById("email");
          let password = document.getElementById("password");

          if (email.value == "" || password.value == "") {
            alert("Ensure you input a value in both fields!");
          } else {
          loginUser(email.value, password.value)
          console.log('Cookie set:', document.cookie);
        }

      });
  }
  checkAuthentication()
  });

  async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      window.location.href = 'index.html';
      localStorage.setItem('token', data.access_token);
      console.log('Stored token:', data.access_token);
      } 
      else {
        alert('Login failed: ' + response.statusText);
      }
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  // Check if the current page is place.html
  if (window.location.pathname.includes('place.html')) {
    const addReviewForm = document.getElementById('add-review-link');

    if (!token) {
      loginLink.style.display = 'block';
      if (addReviewForm) addReviewForm.style.display = 'none';
    } else {
      loginLink.style.display = 'none';
      if (addReviewForm) addReviewForm.style.display = 'block';
      fetchPlaceDetails(token, getPlaceIdFromURL());
    }
  } else {
    if (!token) {
      loginLink.style.display = 'block';
    } else {
      loginLink.style.display = 'none';
      fetchPlaces(token);
    }
  }
}


function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
       cookie = cookie.trim();
       if (cookie.startsWith(name + '=')) {
          return cookie.substring(name.length + 1);
       }
    }
 return null;
}

async function fetchPlaces(token) {
  // Make a GET request to fetch places data
  const response = await fetch('http://127.0.0.1:5000/api/v1/places/',
    {
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': "Token" + token
      }
    });
      if (response.ok){
        const data = await response.json();
        displayPlaces(data)
      }
      else {
        alert('data fecth failed: ' + response.statusText);
      }

    }

function displayPlaces(places) {
  // Clear the current content of the places list
  let arr = document.getElementById('places-list')
  arr.innerHTML = ""
  places.forEach(element => {
    let newVar = document.createElement('div')
        newVar.innerHTML = `
                <div class="place-card">
                <h2 class="place-name">${element.title}</h2>
                <p class="place-price">$${element.price}</p>
                <button onclick="window.location.href='place.html?placeId=${element.id}';" class="details-button">View Details</button>
            </div>
    `
    arr.appendChild(newVar)
  });
  // Iterate over the places data
  // For each place, create a div element and set its content
  // Append the created element to the places list
}
if (window.location.pathname.includes('index.html')){
document.getElementById('price-filter').addEventListener('change', () => {
  // Get the selected price value
  const PriceSelect = document.querySelector('#price-filter');
  const PriceValue = PriceSelect.value === "All" ? Infinity : Number(PriceSelect.value);
  const PlaceCollection = document.getElementsByClassName('place-card');
  const PlaceArr = Array.from(PlaceCollection);
  PlaceArr.forEach(element => {
    const StringPrice = element.querySelector('.place-price').textContent;
    const NumberPrice = Number(StringPrice.replace("$", ""));
    if (NumberPrice > PriceValue) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });
});
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search); // Parse the query string
  return params.get('placeId'); // Get the value of the 'placeId' parameter
}

async function fetchPlaceDetails(token, placeId) {
  // Make a GET request to fetch place details
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`,
    {
      method:'GET',
      headers:{
        'Content-Type': 'application/json',
        'Authorization': "Token" + token
      }
    });
      if (response.ok){
        const data = await response.json();
        displayPlaceDetails(data)
      }
      else {
        alert('data fecth failed: ' + response.statusText);
      }

    }
  // Include the token in the Authorization header
  // Handle the response and pass the data to displayPlaceDetails function


async function displayPlaceDetails(place) {
  // Clear the current content of the place details section
  let arr = document.querySelector('#place-details');
  let amenities = [];
  let reviews = document.querySelector('#reviews')


  // Iterate over the amenities and extract their names
  place.amenities.forEach(element => {
    amenities.push(element.name);
  });
  const Reviews = await getReviewsforPlace(getPlaceIdFromURL())
  if (Reviews.length == 0){
    reviews.innerHTML = `
    <div class= "review-card">
    <br>
    <p> <strong>No reviews for this place yet.<strong></p>
    <br>
    </div>`
  }
  else{
  Reviews.forEach(re => {
    const star = "★"
    const rating = star.repeat(re.rating) 
    console.log(rating)
    const PromiseUser = getUserDetails(re.user_id)
    PromiseUser.then((value) =>{
      let first_name = value.first_name;
      let last_name = value.last_name;
      reviews.innerHTML += `
      <div class="review-card">
      <p><strong>${first_name} ${last_name}:</strong></p>
      <p>Description: ${re.text}</p>
      <p>Rating: ${rating}</p>
      </div>
    `;
    });
  });
}
  arr.innerHTML = "";
  if(amenities.length !== 0){
  arr.innerHTML = `
    <h2 class="place-name">${place.title}</h2>
    <div class="place-card">
      <p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
      <p><strong>Price:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities:</strong> ${amenities}</p>
    </div>
      `
  }else{
    arr.innerHTML = `
    <h2 class="place-name">${place.title}</h2>
    <div class="place-card">
      <p><strong>Host:</strong> ${place.owner.first_name} ${place.owner.last_name}</p>
      <p><strong>Price:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities</strong>: No amenities for this place</p>
    </div>
    `
  }
  };



function addReview() {
  alert('Add review functionality is not implemented yet.');
}

async function getReviewsforPlace(placeId) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

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

async function getUserDetails(userId){
  try{
  const response = await fetch(`http://127.0.0.1:5000/api/v1/users/${userId}`,
  {
    method:'GET',
    headers:{
      'Content-Type': 'application/json',
    }
  });
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
