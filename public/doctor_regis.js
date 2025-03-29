document.addEventListener('DOMContentLoaded', function () {
    // Assuming the form has an ID of 'sub_id'
    const loginForm = document.getElementById('sub_id3');
  
    loginForm.addEventListener('click', async function (event) {
      event.preventDefault();


const d_name=document.getElementById('fusername').value;
const d_pass=document.getElementById('fpassword').value;
const d_email=document.getElementById('femail').value;
const d_type=document.getElementById('d_type').value;


console.log(d_name+ d_pass+d_email+d_type);



  // Basic form validation
  if (!d_name || !d_email || !d_pass || !d_type) {
    console.error('Username, email,type, and password are required for registration');
    return;
  }

  try {
    // Perform AJAX request to the server register endpoint
    const response = await fetch('/doctor_register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ d_name, d_email, d_pass , d_type }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    console.log('Response from server:', result);

    // Handle success or error response from the server
    if (result.success) {
      console.log('Doctor Registration successful!');
      alert(result.message);

      // Automatically log in after successful registration
      // You can customize this behavior based on your requirements
      sessionStorage.setItem('loggedInUser', d_name);
      window.location.href = '/dashboard_doctor.html';
    //  window.location.reload(true);
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
