document.addEventListener('DOMContentLoaded', function () {
    // Assuming the form has an ID of 'sub_id'
    const loginForm = document.getElementById('sub_id');
  
    loginForm.addEventListener('click', async function (event) {
      event.preventDefault();


const p_name=document.getElementById('username').value;
const p_pass=document.getElementById('password').value;
console.log(p_name+ p_pass);
if (!p_name || !p_pass) {
    console.error('Username and password are required');
    return;
  }

  try {
    // Perform AJAX request to the server login endpoint

    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_name, p_pass }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    console.log('Response from server:', result);


    if (result.success) {
      console.log('Login successful!');
       const loggedInUser = document.getElementById('username').value;
       sessionStorage.setItem("loggedInUser", loggedInUser);
    
      //Check if the user is an admin
      if (result.admin_var) {
         // Redirect to the Admin dashboard
        window.location.href = `/admin_dashboard.html?script4=true&ffusername=${loggedInUser}`
      } 
      else if(result.doc_var)
      {
        //Redirect to the doctor dashboard
        window.location.href = "/dashboard_doctor.html";
      }
      else {

        sessionStorage.setItem('flag', 0);
        // Redirect to the patient dashboard
        window.location.href = "/dashboard.html";
      }
    } else {
      // If the server indicates failure, logs an error message and displays an alert with the server's message.
      console.error('Login failed:', result.message);
      alert(result.message);
    }


  }

  catch (error) {
    console.error('Error:', error);
    // Handle errors here
    alert('An unexpected error occurred. Please try again later.');
  }

});
});


