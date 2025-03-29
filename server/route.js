const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');


// Rest of your code

const app = express();
// Connection URL for your MongoDB database
//const url = "mongodb+srv://lakshin2563:nirma123@cluster0.qtmkizi.mongodb.net/?retryWrites=true&w=majority";


const url = "mongodb+srv://shreyanahta17:B7jBhJcjrBjvXc0n@cluster0.rc5yt.mongodb.net/?retryWrites=true&w=majority"
//below link is working
//const url = "mongodb+srv://lakshinpathak:nirma123@cluster0.gl8xaey.mongodb.net/?retryWrites=true&w=majority";

// Name of the database
const dbName = 'test'; // Change this to your database name



//const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });



router.post('/login', async (req, res) => {
    try {
      const { p_name, p_pass } = req.body;
  
      // Connect to MongoDB
      await client.connect();
      //console.log('ok');
      // Access the database
      const db = client.db(dbName);
  
      // Check if the username exists
      const existingUser = await db.collection('users').findOne({username: p_name  });
      //console.log(p_name+p_pass+"lakshit");
      
      if (!existingUser) {
        return res.json({ success: false, message: 'Username not found. Please register first.',  admin_var: false , doc_var: false});
      }
  
      // Validate password
      if (existingUser.password !== p_pass) {
        return res.json({ success: false, message: 'Incorrect password.', admin_var: false, doc_var: false });
      }
  
      var is_admin=false;
      var is_doctor=false;
      if(existingUser.isAdmin == true)
      {
       // console.log("hahahah");
        is_admin=true;
      }
      if(existingUser.isDoctor == true)
      {
          is_doctor=true;
      }
  
      // Respond with a success message
      res.json({ success: true, message: 'Login successful!', admin_var: is_admin , doc_var: is_doctor});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' , admin_var: false , doc_var: false});
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });

  async function sendRegistrationEmail(email, username) {
    try {
        // Create a transporter with your SMTP server details
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "patientservice.mp7@gmail.com",
              pass: "nyqe kgub wwwk xxbj",
            },
        });
  
        // Email content
        const mailOptions = {
            from: "patientservice.mp7@gmail.com", // Update with your email
            to: email,
            subject: "Welcome to our Doctor Appointment App!",
            text:  `Dear ${username},\n\nWelcome to our Doctor Appointment App! We’re excited to have you with us. With our Doctor Appointment App, connecting with trusted doctors and managing your health is now more convenient than ever.
            \n\nBook appointments, access expert advice, and stay on top of your health—all at your fingertips.\n\nThank you for being a part of our community. Here’s to a healthier, happier you!\n\nBest regards,\nThe Synergy Hospital
            `  ,
         
        };
  
        // Send email
        const info = await transporter.sendMail(mailOptions);
  
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending registration email:", error);
    }
  }
  router.post('/register', async (req, res) => {
    try {
      const { p_name, p_email, p_pass } = req.body;
  
      // Connect to MongoDB
      await client.connect();
      
    
  
      // Access the database
      const db = client.db(dbName);
  
  
      console.log('');
  
      // Check if the username already exists
      const existingUser = await db.collection('users').findOne({ p_name });
      if (existingUser) {
        return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
      }
  
      // Insert the new user into the database
      await db.collection('users').insertOne({username: p_name,email: p_email, password: p_pass,isAdmin: false,isDoctor: false, Dr_type:null });
  
      await sendRegistrationEmail(p_email,p_name);
      // Respond with a success message
      res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });
  
  router.delete('/deleteUser', async (req, res) => {
    try {
      const { username } = req.query;
  
      // Connect to MongoDB
      await client.connect();
  
      // Access the database
      const db = client.db(dbName);
  
      // Delete the user
      const result = await db.collection('users').deleteOne({username: username });
     
     // const result2= await db.collection('events').deleteOne({ loggedInUser: username , isApproved: true});
     //see this later
     //ayya change karyu che 22/5/ na




     const del_bookapp = await BookedAppointment.find({
      $or: [
        { D_name: username },
        { P_name: username }
      ]
    });

    let d_name_value = [];

    if (del_bookapp) { // Assuming 'del_bookapps' is the correct variable name
      for (const appointment of del_bookapp) {
        if (appointment.P_name === username) {
          d_name_value.push(appointment.D_name);
        }
      }
    }






      const result2 = await db.collection('BookedApp').deleteMany({ 
//P_name: username
        $or: [
          { D_name: username },
          { P_name: username }
        ]
        
       });


       function_change_doctor_status(d_name_value);


       
  



  const result3 = await db.collection('events').deleteMany({loggedInUser: username});
  //&& result2.deletedCount>0 
  
      if (result.deletedCount > 0 &&(result2.deletedCount>0 || result3.deletedCount>0) ) {
        res.json({ success: true, message: 'User deleted successfully!' });
      } else {
        res.json({ success: false, message: 'User not found or already deleted.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });
  

  async  function function_change_doctor_status(d_name_value)
  {

    for (let i = 0; i < d_name_value.length; i++) {
      console.log(d_name_value[i]);

      try {

     
          // Update user settings in the collection
          const result = await Appointment.updateOne(
              { loggedInUser: d_name_value[i]},
              {
                  $set: {
                   isApproved:false,
                  },
              }
          );
            //  console.log(result);
  
        
      } catch (error) {
          console.error(error);
      }

    }


  }

  router.post('/createadmin', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
      // Connect to MongoDB
      await client.connect();
  
      // Access the database
      const db = client.db(dbName);
  
  
        const existingUser = await db.collection('users').findOne({ username: username,email: email, password: password,isAdmin: true,isDoctor: false });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
        }
  
        // // Create the admin user
        const adminUser = {
            username,
            email,
            password,
            isAdmin: true,
            isDoctor: false,
        };
  
        // // Insert the new admin user into the database
         await db.collection('users').insertOne(adminUser);
  
        // Respond with a success message
        res.json({ success: true, message: 'Admin user created successfully!' });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
  });


  router.post('/doctor_register', async (req, res) => {
    try {
      const { d_name, d_email, d_pass, d_type } = req.body;
  
      // Connect to MongoDB
      await client.connect();
      
    
  
      // Access the database
      const db = client.db(dbName);
  
  
      console.log('');
  
      // Check if the username already exists
      const existingUser = await db.collection('users').findOne({ d_name });
      if (existingUser) {
        return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
      }
  
      // Insert the new user into the database
      await db.collection('users').insertOne({username: d_name,email: d_email, password: d_pass,isAdmin: false,isDoctor: true, Dr_type: d_type });
  
      // Respond with a success message
      res.json({ success: true, message: 'Registration successful!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });
  
  router.get('/getAllUsers', async (req, res) => {
    try {
      // Connect to MongoDB
      await client.connect();
  
      // Access the database
      const db = client.db(dbName);
  
      // Fetch all users
      const allUsers = await db.collection('users').find().toArray();
  
      // Respond with the user details
      res.json(allUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  });



  router.post('/updateuser', async (req, res) => {
    const { username, newEmail, newPassword } = req.body;
  
    try {
        // Find the user by username
        const user = await User.findOne({username: username });
  
        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }
  
        // Update user details
        user.email = newEmail || user.email; // Update email if provided, otherwise keep the existing one
        user.password = newPassword || user.password; // Update password if provided, otherwise keep the existing one
  
        // Save the updated user details
        await user.save();
  
        return res.json({ success: true, message: 'User details updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  router.post('/getDoctorsByType', async (req, res) => {
    try {
        const { types } = req.body;

        // Connect to MongoDB
        await client.connect();

        // Access the database
        const db = client.db(dbName);

        // Find doctors with matching types
        const doctors = await db.collection('users').find({ isDoctor: true, Dr_type: { $in: types } }).toArray();

        // Respond with the list of doctors
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
});



// router.route('/addEvent')
//   .get(async (req, res) => {
//     try {
//       const { user } = req.query;

//       await client.connect();
//       const db = client.db(dbName);
//       console.log(user);
//       const userEvents = await db.collection('events').find({ username: user }).toArray();
//       res.json(userEvents);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     } finally {
//       await client.close();
//     }
//   })
//   .post(async (req, res) => {
//     try {
    
//       const {  appointmentDate, appointmentDay, availableTime, username } = req.body;
//       console.log('haha');
//       await client.connect();
//       const db = client.db(dbName);

//       const existingUser = await db.collection('users').findOne({ loggedInUser: username });
//       if (!existingUser) {
//         return res.json({ success: false, message: 'User not found. Please register first.' });
//       }

//       // Check if the event name already exists for the current user
//       const existingEvent = await db.collection('events').findOne({ loggedInUser: username,availableTime: availableTime });
//       if (existingEvent) {
//         return res.json({ success: false, message: 'Event name already exists. Please choose a different one.' });
//       }

//       await db.collection('events').insertOne({ Appointment_Date:appointmentDate, Appointment_Day: appointmentDay,availableTime:  availableTime, loggedInUser: username,isApproved: false });

//       res.json({ success: true, message: 'Event registration successful!' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     } finally {
//       await client.close();
//     }
//   });



router.route('/addEvent')
  .get(async (req, res) => {
    try {
      const { user } = req.query;

      await client.connect();
      const db = client.db(dbName);
      console.log(user);
      const userEvents = await db.collection('events').find({ loggedInUser: user }).toArray();
      res.json(userEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      await client.close();
    }
  })
  .post(async (req, res) => {
    try {
      const { appointmentDate, appointmentDay, availableTime, loggedInUser } = req.body;

      await client.connect();
      const db = client.db(dbName);

      const existingUser = await db.collection('users').findOne({ username: loggedInUser });
      if (!existingUser) {
        return res.json({ success: false, message: 'User not found. Please register first.' });
      }

      // Check if the event name already exists for the current user
      const existingEvent = await db.collection('events').findOne({ loggedInUser: loggedInUser, availableTime: availableTime });
      if (existingEvent) {
        return res.json({ success: false, message: 'Event name already exists. Please choose a different one.' });
      }

      // Generate a unique appointment number
      let uniqueAppointmentId;
      let isUnique = false;

      while (!isUnique) {
        uniqueAppointmentId = generateRandomFourDigitNumber();
        // Check if the generated appointment number already exists
        const existingAppointment = await db.collection('events').findOne({ Appointment_id: uniqueAppointmentId });
        if (!existingAppointment) {
          isUnique = true;
        }
      }

      await db.collection('events').insertOne({
        Appointment_id: uniqueAppointmentId,
        appointmentDate: appointmentDate,
        appointmentDay: appointmentDay,
        availableTime: availableTime,
        loggedInUser: loggedInUser,
        isApproved: false
      });

      res.json({ success: true, message: 'Event registration successful!', Appointment_id: uniqueAppointmentId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      await client.close();
    }
  });




  function generateRandomFourDigitNumber() {
    return Math.floor(1000 + Math.random() * 9000);
}



  router.get('/getAllEvents', async (req, res) => {
    try {
      const { user } = req.query;
  
      await client.connect();
      const db = client.db(dbName);
  
      // Fetch all events for the logged-in user
      const userEvents = await db.collection('events').find({ loggedInUser: user }).toArray();
  
      res.json(userEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      await client.close();
    }
  });



  router.delete('/deleteEvent', async (req, res) => {
    try {
    //  console.log("delete this fast!!");
      const {  availableTime , loggedInUser} = req.query;
  
      await client.connect();
      const db = client.db(dbName);
  
      const result = await db.collection('events').deleteOne({ loggedInUser: loggedInUser, availableTime: availableTime });

      const result2= await db.collection('bookedapps').delete({ D_name: loggedInUser, availableTime: availableTime });
  
      if (result.deletedCount > 0 ||  result2.deletedCount > 0) {
        res.json({ success: true, message: 'Appointment deleted successfully!' });
      } else {
        res.json({ success: false, message: 'Appointment not found or already deleted.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      await client.close();
    }
  });




// Route handler for '/getDoctors' endpoint
router.post('/getDoctors', async (req, res) => {
  try {
      const { specializations } = req.body;

      // Connect to MongoDB
      await client.connect();

      // Access the database
      const db = client.db(dbName);

      // Find doctors with matching specializations
      const doctors = await db.collection('users').find({ isDoctor: true, Dr_type: { $in: specializations } }).toArray();

      // Respond with the list of doctors
      res.json(doctors);
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
});



// router.post('/updateevent', async (req, res) => {
//   try {
//     const { loggedInUser, Appointment_Date, availableTime, Appointment_id,Appointment_Day } = req.body;

//     // Connect to MongoDB
//     const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
//     await client.connect();

//     // Access the database
//     const db = client.db(dbName);

//     // Update user settings in the collection
//     const result = await db.collection('events').updateOne(
//       { loggedInUser: loggedInUser, 'events.eventName': eventName },
//       {
//         $set: {
//           'events.$.eventDetails': eventDetails,
//           'events.$.eventDate': eventDate,
//         },
//       }
//     );

//     if (result.modifiedCount > 0) {
//       // Event updated successfully
//       res.json({ success: true, message: 'Event updated successfully!' });
//     } else {
//       // No matching user or event found or no changes made
//       res.json({ success: false, message: 'No matching user or event found or no changes made.' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   } finally {
//     // Close the MongoDB connection
//     await client.close();
//   }
// });







router.post('/updateevent', async (req, res) => {
  try {
    const { loggedInUser, Appointment_Date, availableTime, Appointment_id, Appointment_Day } = req.body;

    // Connect to MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the database
    const db = client.db(dbName);

    // Update appointment details in the collection
    const result = await db.collection('events').updateOne(
      { loggedInUser: loggedInUser, Appointment_id: Appointment_id },
      {
        $set: {
          Appointment_Date: Appointment_Date,
          availableTime: availableTime,
          Appointment_Day: Appointment_Day,
        },
      }
    );


 // Update appointment details in the collection
 
 const result2 = await db.collection('bookedapps').updateOne(
  { Appointment_id: Appointment_id },
  {
    $set: {
      Appointment_Date: Appointment_Date,
      availableTime: availableTime,
      Appointment_Day: Appointment_Day,
    },
  }
);



    if (result.modifiedCount > 0 ||  result2.modifiedCount>0) {
      // Appointment updated successfully
      res.json({ success: true, message: 'Appointment updated successfully!' });
    } else {
      // No matching user or appointment found or no changes made
      res.json({ success: false, message: 'No matching user or appointment found or no changes made.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});


router.post('/settings', async (req, res) => {
  try {
    const { username, newEmail, newPassword } = req.body;
     
    // Connect to MongoDB
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the database
    const db = client.db(dbName);

    // Update user settings in the collection
    const result = await db.collection('users').updateOne(
      { username: username },
      { $set: { email: newEmail, password: newPassword } }
    );

    if (result.modifiedCount > 0) {
      // Settings updated successfully
      res.json({ success: true, message: 'Settings updated successfully!' });
    } else {
      // No matching user found or no changes made
      res.json({ success: false, message: 'No matching user found or no changes made.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});






router.post('/getDoctorsnew', async (req, res) => {
  try {
    const { username } = req.body;

      // Connect to MongoDB
      await client.connect();

      // Access the database
      const db = client.db(dbName);

      // Find doctors with matching specializations
      const apmts = await db.collection('events').find({ loggedInUser: username , isApproved: false }).toArray();

      // Respond with the list of doctors
      res.json(apmts);
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
});










router.post('/getDoctorsnew_app', async (req, res) => {
  try {
    const { patientName } = req.body;

      // Connect to MongoDB
      await client.connect();

      // Access the database
      const db = client.db(dbName);

      // Find doctors with matching specializations
      const apmts = await db.collection('BookedApp').find({ P_name: patientName , isApproved: true }).toArray();

      //const apmts2 = await db.collection('BookedApp').find({ Appointment_id: apmts.Appointment_id }).toArray();


      // if(apmts.success == false)
      //   {
            // Respond with the list of matching doctors
        res.json(apmts);
        //}

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
});

async function sendapmtEmail(P_name, Appointment_id, Appointment_Date, availableTime, Appointment_Day, D_name) {

  try {
      // Create a transporter with your SMTP server details
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "patientservice.mp7@gmail.com",
            pass: "nyqe kgub wwwk xxbj",
          },
      });

      const user = await User.findOne({ username: P_name });
      //console.log(user);
      //console.log("hiiiiiiiiii");
      // Email content for appointment booking confirmation
      const mailOptions = {
          from: "patientservice.mp7@gmail.com", // Update with your email
          to: user.email, // Assume 'email' variable is set to recipient's email address
          subject: "Appointment Confirmation",
          text: `Dear ${P_name},\n\nYour appointment has been successfully booked!\n\nDetails of the appointment:\n- Appointment ID: ${Appointment_id}\n- Date: ${Appointment_Date}\n- Day: ${Appointment_Day}\n- Time: ${availableTime}\n- Doctor: Dr. ${D_name}\n\nPlease arrive 10 minutes before your scheduled time.\n\nThank you,\nYour Healthcare Team`,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log("Email sent: " + info.response);
  } catch (error) {
      console.error("Error sending appointment email:", error);
  }
}



router.post('/bookapmt', async (req, res) => {
  try {
    const { P_name, Appointment_id, Appointment_Date, availableTime,Appointment_Day, D_name } = req.body;

    // Connect to MongoDB
    await client.connect();
    // Access the database
    const db = client.db(dbName);
    console.log('');

    // Check if the username already exists
    const existingUser = await db.collection('BookedApp').findOne({Appointment_id: Appointment_id, D_name: D_name , P_name: P_name});
    if (existingUser) {
      return res.json({ success: false, message: 'This Appointment is already booked. Please choose a different one.' });
    }
    
    // Insert the new user into the database
    await db.collection('BookedApp').insertOne({P_name: P_name,Appointment_id: Appointment_id, Appointment_Date: Appointment_Date, availableTime: availableTime, Appointment_Day: Appointment_Day, D_name: D_name, isApproved: false});

    await sendapmtEmail(P_name, Appointment_id,Appointment_Date,availableTime,Appointment_Day,D_name);
    // Respond with a success message
    res.json({ success: true, message: 'Appointment Booking in Progress' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
});





router.get('/getAllapmts_Doctor', async (req, res) => {
  try {
    const { D_name } = req.query;

    await client.connect();
    const db = client.db(dbName);

    // Fetch all events for the logged-in user
    const userEvents = await db.collection('BookedApp').find({D_name: D_name}).toArray();

    res.json(userEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
});




router.post('/approveUserApmt', async (req, res) => {
  try {
      const { P_name, Appointment_id } = req.body;

      // Connect to MongoDB
      await client.connect();

      // Access the database
      const db = client.db(dbName);

      // Update the isApproved field for the specific user event
      const result = await db.collection('BookedApp').updateOne(
          { P_name: P_name, Appointment_id: Appointment_id },
          { $set: { isApproved: true } }
      );


      const result2 = await db.collection('events').updateOne(
        {  Appointment_id: Appointment_id },
        { $set: { isApproved: true } }
    );

      if (result.modifiedCount > 0  && result2.modifiedCount > 0 ) {
          // Event approval successful
          res.json({ success: true, message: 'Appointment approval successful!' });
      } else {
          // No matching user or event found or no changes made
          res.json({ success: false, message: 'No matching user or Appointment found or no changes made.' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
});



router.delete('/delete_apmt', async (req, res) => {
  try {
  //  console.log("delete this fast!!");
    const {Appointment_id, P_name} = req.query;

    await client.connect();
    const db = client.db(dbName);

    const result = await db.collection('BookedApp').deleteOne({ Appointment_id: Appointment_id, P_name: P_name });



    const result2 = await db.collection('events').updateOne(
      {  Appointment_id: Appointment_id },
      { $set: { isApproved: false } }
  );

    if (result.deletedCount > 0 && result2.modifiedCount > 0) {
      res.json({ success: true, message: 'Booked Appointment deleted successfully!' });
    } else {
      res.json({ success: false, message: 'Appointment not found or already deleted.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
});






router.delete('/delete_apmt_doctor', async (req, res) => {
  try {
  //  console.log("delete this fast!!");
    const {Appointment_id, D_name} = req.query;

    await client.connect();
    const db = client.db(dbName);

    const result = await db.collection('BookedApp').deleteOne({ Appointment_id: Appointment_id, D_name: D_name });



    const result2 = await db.collection('events').updateOne(
      {  Appointment_id: Appointment_id },
      { $set: { isApproved: false } }
  );

    if (result.deletedCount > 0 && result2.modifiedCount > 0) {
      res.json({ success: true, message: 'Booked Appointment deleted successfully!' });
    } else {
      res.json({ success: false, message: 'Appointment not found or already deleted.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    await client.close();
  }
});



  
const axios = require('axios');

async function makeRequestWithRetry(url, data, config, retries = 3, delay = 1000) {
    try {
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`Rate limited. Retrying in ${delay} milliseconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return makeRequestWithRetry(url, data, config, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}







module.exports = router;
