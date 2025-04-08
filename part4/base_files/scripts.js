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