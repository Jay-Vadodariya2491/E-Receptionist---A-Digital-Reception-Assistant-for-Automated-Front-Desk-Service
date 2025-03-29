document.addEventListener('DOMContentLoaded', function () {
    // Assuming the form has an ID of 'sub_id'
    const loginForm = document.getElementById('sub_id2');
  
    loginForm.addEventListener('click', async function (event) {
      event.preventDefault();


const p_name=document.getElementById('fusername').value;
const p_pass=document.getElementById('fpassword').value;
const p_email=document.getElementById('femail').value;

console.log(p_name+ p_pass+p_email);



  // Basic form validation
  if (!p_name || !p_email || !p_pass) {
    console.error('Username, email, and password are required for registration');
    return;
  }

  try {
    // Perform AJAX request to the server register endpoint
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_name, p_email, p_pass }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    console.log('Response from server:', result);

    // Handle success or error response from the server
    if (result.success) {
      console.log('Registration successful!');
      alert(result.message);

      // Automatically log in after successful registration
      // You can customize this behavior based on your requirements
     sessionStorage.setItem('loggedInUser', p_name);
      window.location.href = '/dashboard.html';
     // window.location.reload(true);
       // Redirect to the dashboard
    } else {
      // Registration failed, display an error message or take appropriate action
      console.error('Registration failed:', result.message);
      alert(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    // Handle errors here
    alert('An unexpected error occurred. Please try again later.');
  }
 

});
});
