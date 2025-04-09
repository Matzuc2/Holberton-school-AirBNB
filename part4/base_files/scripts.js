/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

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

  if (!token) {
      loginLink.style.display = 'block';
  } else {
      loginLink.style.display = 'none';
      fetchPlaces(token);
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
                <button class="details-button">View Details</button>
            </div>
    `
    arr.appendChild(newVar)
  });
  // Iterate over the places data
  // For each place, create a div element and set its content
  // Append the created element to the places list
}

document.getElementById('price-filter').addEventListener('change', () => {
  // Get the selected price value
  const box = document.querySelector('#price-filter');
  const value = box.value === "All" ? Infinity : Number(box.value);
  const priceArr = document.getElementsByClassName('place-card');
  const newArr = Array.from(priceArr);
  newArr.forEach(element => {
    const new2 = element.querySelector('.place-price').textContent;
    const new3 = Number(new2.replace("$", ""));
    if (new3 > value) {
      element.style.display = "none";
    } else {
      element.style.display = "";
    }
  });
});