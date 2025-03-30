
const nodemailer = require("nodemailer");
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const pdf = require('html-pdf');
// const pdfkit = require('pdfkit');
// const { PassThrough } = require('stream');
// const fs = require('fs');
// const http = require('http');
//const socketIo = require('socket.io');
// const fetch = require('node-fetch');
// const path = require('path');
const Razorpay = require('razorpay');


const razorpayInstance = new Razorpay({

    // Replace with your key_id
    key_id: "rzp_test_8lEtdi5oYWoGD9",

    // Replace with your key_secret
    key_secret: "lqUA9AxQM0TtmyrN8FKbABcj"
});


app.use(bodyParser.json({ limit: '100mb' }));
//const { MongoClient } = require('mongodb');
const port = 3000;
app.use(cors());


app.post('/createOrder', (req, res)=>{ 

    // STEP 1:
    const {amount,currency,receipt, notes}  = req.body;      
        
    // STEP 2:    
    razorpayInstance.orders.create({amount, currency, receipt, notes}, 
        (err, order)=>{
        
          //STEP 3 & 4: 
          if(!err)
            res.json(order)
          else
            res.send(err);
        }
    )
});



//const uri = "mongodb+srv://lakshin2563:nirma123@cluster0.qtmkizi.mongodb.net/?retryWrites=true&w=majority";
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const uri = "mongodb+srv://shreyanahta17:B7jBhJcjrBjvXc0n@cluster0.rc5yt.mongodb.net/?retryWrites=true&w=majority"

//below link is working
//const uri = "mongodb+srv://lakshinpathak:nirma123@cluster0.gl8xaey.mongodb.net/?retryWrites=true&w=majority";







//mongodb+srv://lakshinpathak2003:<password>@cluster0.53mqvik.mongodb.net/


app.use(express.static('public'));
app.use(express.json());


async function connect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
    }
}


const User = mongoose.model('User', {
    username: String,
    password: String,
    email: String, 
    isAdmin: Boolean,
    isDoctor: Boolean,
    Dr_type:String,
});



const Appointment = mongoose.model('Event', {
    Appointment_Date: String,
    Appointment_Day: String,
    loggedInUser: String,
    availableTime: String,
    Appointment_id: String,
    isApproved: Boolean,
});



const BookedAppointment= mongoose.model('BookedApp',{
Appointment_id: String,
Appointment_Date: String,
availableTime: String,
Appointment_Day: String,
P_name: String,
D_name: String,
isApproved: Boolean,
});


let l=[]

app.post('/login', async (req, res) => {
    const { p_name, p_pass } = req.body;

    try {
        // Check if the username exists
        const existingUser = await User.findOne({username: p_name });
       // console.log(p_name+p_pass+"lakshit"+existingUser);
        if (!existingUser) {
            return res.json({ success: false, message: 'Username not found. Please register first.' , admin_var: false, doc_var: false});
        }

        // Validate password
        if (existingUser.password !== p_pass) {
            return res.json({ success: false, message: 'Incorrect password.' , admin_var: false , doc_var: false });
        }
        var is_admin=false;
        var is_doctor=false;
        if(existingUser.isAdmin == true)
        {
           // console.log("hahahah1");
          is_admin=true;
        }
        if(existingUser.isDoctor == true)
        {
            is_doctor=true;
        }

        return res.json({ success: true, message: 'Login successful.' , admin_var: is_admin, doc_var: is_doctor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' , admin_var: false, doc_var: false});
    }
});




app.post('/addEvent', async (req, res) => {
    const { appointmentDate, appointmentDay, availableTime, loggedInUser } = req.body;
    
    try {
        // Check if an event with the same name already exists for the loggedInUser
        const existingEvent = await Appointment.findOne({ availableTime: availableTime, loggedInUser: loggedInUser });
        if (existingEvent) {
            return res.json({ success: false, message: 'Appointment with the same time already exists for the user.' });
        }



        let uniqueAppointmentId;
        let isUnique = false;

        try {
            // Generate a unique 4-digit appointment number
           
           
            while (!isUnique) {
                uniqueAppointmentId = generateRandomFourDigitNumber();
                // Check if the generated appointment number already exists
                const existingEvent = await Appointment.findOne({ Appointment_id: uniqueAppointmentId });
                if (!existingEvent) {
                    isUnique = true;
                }
            }

        }
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }

        let flag = false;


        // Create a new event
        const newEvent = new Appointment({
            Appointment_Date: appointmentDate, //
            Appointment_Day: appointmentDay,
            availableTime: availableTime,//
            loggedInUser: loggedInUser, //
            Appointment_id: uniqueAppointmentId, //
            isApproved: flag,
        });

   
    //     // Save the new event
        await newEvent.save();


        return res.json({ success: true, message: 'Appointment added successfully', event: newEvent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


function generateRandomFourDigitNumber() {
    return Math.floor(1000 + Math.random() * 9000);
}


app.get('/getAllEvents', async (req, res) => {
    try {
        const { loggedInUser } = req.query;

       
        // Fetch all events for the logged-in user
        const userEvents = await Appointment.find({ loggedInUser }).exec();
      
        res.json(userEvents);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



app.delete('/deleteEvent', async (req, res) => {
    //console.log("haha2");
     const { availableTime, loggedInUser } = req.body;
 
     try {
       
         // Find the event in the collection and delete it
         const result = await Appointment.deleteOne({ availableTime: availableTime,loggedInUser: loggedInUser });



         const result2 = await BookedAppointment.deleteOne({ D_name: loggedInUser, availableTime: availableTime });
       
         if (result.deletedCount > 0  || result2.deletedCount > 0) {
             // Event deleted successfully
             
             res.json({ success: true, message: 'Appointment deleted successfully' });
         } else {
             // No matching event found
             res.json({ success: false, message: 'No matching Appointment found' });
         }
     } catch (error) {
         console.error(error);
         res.status(500).json({ success: false, message: 'Internal server error' });
     }
 });

app.post('/createadmin', async (req, res) => {
    try {
        const { username, email, password } = req.body;


          const authorizationHeader = req.headers['authorization'];
      
        const isAdminRequest = authorizationHeader === 'GIVEUSERRIGHTS'; 
       // console.log(authorizationHeader);
        if (!isAdminRequest) {
            return res.status(403).json({ success: false, message: 'Unauthorized request' });
        }
        // Check if the username already exists
        const existingUser = await User.findOne({ username: username,email: email, password: password,isAdmin: true,isDoctor: false });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
        }

        // Create the admin user
        const adminUser = new User({
            username,
            email,
            password,
            isAdmin: true,
            isDoctor: false,
        });

        // Save the new admin user to the database
        await adminUser.save();

        // Respond with a success message
        res.json({ success: true, message: 'Admin user created successfully!' });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/getAllUsers', async (req, res) => {
    try {
        // Connect to MongoDB
        await connect();

        // Access the database
        const db = mongoose.connection;

        // Fetch all users
        const allUsers = await User.find().exec();

        // Respond with the user details
        res.json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Function to send registration email
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
            text:  `Dear ${username},\n\nWelcome to our Doctor Appointment App! We're thrilled to have you join our community.\n\nWith our Doctor Appointment App, you can connect with doctors anytime conveniently.\n\nBest regards,\nThe Synergy multispecialist hospital
            `  ,
         
        };
  
        // Send email
        const info = await transporter.sendMail(mailOptions);
  
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending registration email:", error);
    }
  }
app.post('/register', async (req, res) => {
    const { p_name,p_email, p_pass } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ p_name });
        //console.log("shrutii");
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
        }

        //console.log(p_name+ p_email+p_pass+"shruti");
        // Create a new user
        const newUser = new User({username: p_name,email: p_email, password: p_pass,isAdmin: false,isDoctor: false, Dr_type:null });
        await newUser.save();

        //console.log("mishra");
        
        await sendRegistrationEmail(p_email,p_name);

        return res.json({ success: true, message: 'Registration successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
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

//"shreyanahta172004@gmail.com"
        const user = await User.findOne({ username: P_name });
        console.log(user);
        console.log("hiiiiiiiiii");
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



app.post('/bookapmt', async (req, res) => {
    const { P_name, Appointment_id, Appointment_Date, availableTime,Appointment_Day, D_name } = req.body;

    l.push(P_name);
    l.push(Appointment_id);
    l.push(Appointment_Date);
    l.push(availableTime);
    l.push(Appointment_Day);
    l.push( D_name);

    try {
        // Check if the username already exists
        const existingUser = await BookedAppointment.findOne({ Appointment_id: Appointment_id , D_name: D_name, P_name: P_name });
       
        if (existingUser) {
            return res.json({ success: false, message: 'This Appointment is already booked. Please choose a different one.' });
        }

        //console.log(p_name+ p_email+p_pass+"shruti");
        // Create a new user
        const newUser = new BookedAppointment({ P_name: P_name, Appointment_id: Appointment_id, Appointment_Date: Appointment_Date, availableTime: availableTime, Appointment_Day: Appointment_Day, D_name: D_name, isApproved: false});
        await newUser.save();

    
        console.log("lakshin1");
      //  await sendapmtEmail(P_name, Appointment_id,Appointment_Date,availableTime,Appointment_Day,D_name);
        console.log("lakshin2");
        return res.json({ success: true, message: 'Appointment Booking in Progress' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});







app.delete('/deleteUser', async (req, res) => {
    const { username } = req.body;
    //console.log(req.body);
    //console.log(username);

    try {

        // Check if the username exists
        const existingUser = await User.findOne({username: username });

        console.log("hellooooooooooo1");
        

        if (!existingUser) {
            return res.json({ success: false, message: 'User not found.' });
        }
//|| D_name: username
//below line is working before
       // const del_bookapp = await BookedAppointment.findOne({D_name: username });



        const del_bookapp = await BookedAppointment.find({
            $or: [
              { D_name: username },
              { P_name: username }
            ]
          });



        const del_docapp = await Appointment.findOne({loggedInUser: username });


 
        // Delete the user
        await User.deleteOne({ username });
        
       // below line working before
        // if(del_bookapp)
        // {
        //      // Delete the bookedapmt
        // await BookedAppointment.deleteMany({ P_name: username });
        // }



//         let d_name_value=[];

// if (del_bookapp ) {

// for(var i=0;i<del_bookapp.size();i++)
//     {
//         if(del_bookapp[i].P_name === username)
//             {              
//              d_name_value[i]= del_bookapp[i].D_name;
//             }
//    }
 
// }

let d_name_value = [];

if (del_bookapp) { // Assuming 'del_bookapps' is the correct variable name
  for (const appointment of del_bookapp) {
    if (appointment.P_name === username) {
      d_name_value.push(appointment.D_name);
    }
  }
}




        if (del_bookapp) {


  
            // Delete the booked appointment
            const pr =  await BookedAppointment.deleteMany({
              $or: [
                { D_name: username },
                { P_name: username }
              ]

             
            });


                    change_is_approved(d_name_value);

     
          }



          


        if(del_docapp)
        {
             // Delete the docapmt
        await Appointment.deleteMany({ loggedInUser: username });

        }


       // Delete the user's  registered event
       // await Event.deleteOne({loggedInUser: username , isApproved: true});  
      //see this later
       // await Event.deleteMany({ loggedInUser: username, isApproved: true });
     

        return res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


           async  function change_is_approved(d_name_value)
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
                  
                  
//                    console.log(D_name);


                    // try {

                   
                    //        // Update user settings in the collection
                    //        const result = await Appointment.updateOne(
                    //            { loggedInUser: d_name_value[0]},
                    //            {
                    //                $set: {
                    //                 isApproved:false,
                    //                },
                    //            }
                    //        );
                    //          //  console.log(result);
                   
                         
                    //    } catch (error) {
                    //        console.error(error);
                    //    }



            }


app.post('/getDoctorsByType', async (req, res) => {
    try {
        // Extract selected doctor types from the request body
        const selectedTypes = req.body.types;

        // Query the database to find doctors with matching types
        const doctors = await User.find({ isDoctor: true, Dr_type: { $in: selectedTypes } });
       // console.log(doctors);
        // Respond with the list of matching doctors
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors by type:', error);
        res.status(500).json({ error: 'Failed to fetch doctors by type' });
    }
});




app.post('/doctor_register', async (req, res) => {
    const { d_name,d_email, d_pass, d_type } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ d_name });
        //console.log("shrutii");
        if (existingUser) {
            return res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
        }

        //console.log(p_name+ p_email+p_pass+"shruti");
        // Create a new user
        const newUser = new User({username: d_name,email: d_email, password: d_pass,isAdmin: false,isDoctor: true,Dr_type: d_type });
        await newUser.save();

        //console.log("mishra");
        
      //  await sendRegistrationEmail(email, username);

        return res.json({ success: true, message: 'Registration successful.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


app.post('/updateuser', async (req, res) => {
    const { username, newEmail, newPassword } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username:username });

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

app.post('/getDoctors', async (req, res) => {
    try {
        // Extract selected specializations from the request body
        const selectedSpecializations = req.body.specializations;

        // Query the database to find doctors with matching specializations
        const doctors = await User.find({ isDoctor: true, Dr_type: { $in: selectedSpecializations } });

        // Respond with the list of matching doctors
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});





app.post('/updateevent', async (req, res) => {
    const { loggedInUser, Appointment_Date, availableTime, Appointment_id,Appointment_Day } = req.body;


   // console.log(loggedInUser+ Appointment_Date+ availableTime+ Appointment_id+Appointment_Day);

    try {
     //   console.log(username+" "+eventDetails);

        // Update user settings in the collection
        const result = await Appointment.updateOne(
            { loggedInUser: loggedInUser, Appointment_id: Appointment_id },
            {
                
                $set: {
                    Appointment_Date: Appointment_Date,
                    availableTime: availableTime,
                    Appointment_Day: Appointment_Day,
                },
            }
        );
      
        console.log(Appointment_id+ availableTime+Appointment_Date+Appointment_Day);

        const result2 = await BookedAppointment.updateOne(
            { Appointment_id: Appointment_id },
            {
                
                $set: {
                    Appointment_Date: Appointment_Date,
                    availableTime: availableTime,
                    Appointment_Day: Appointment_Day,
                },
            }
        );

        console.log("pathak1");
        console.log(result2);
        console.log(result2.modifiedCount);
        console.log("pathak2");

          //  console.log(result);

        if (result.modifiedCount > 0 ||  result2.modifiedCount > 0) {
            // Event updated successfully
            res.json({ success: true, message: 'Appointment updated successfully!' });
        } else {
            // No matching user or event found or no changes made
            res.json({ success: false, message: 'No matching user or Appointment found or no changes made.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get('/getAllapmts_Doctor', async (req, res) => {
    try {
        const { D_name } = req.query;

       
        // Fetch all events for the logged-in user
        const userEvents = await BookedAppointment.find({ D_name:D_name }).exec();
      
        res.json(userEvents);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});






app.post('/settings', async (req, res) => {
    const { username, newEmail, newPassword } = req.body;

    try {
        // Update user settings in the collection
        const result = await User.updateOne(
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
    }
});





app.post('/getDoctorsnew', async (req, res) => {
    try {
       
        const { username } = req.body;

        // Query the database to find doctors with matching specializations
        const apmts = await Appointment.find({ loggedInUser: username, isApproved: false });

        // Respond with the list of matching doctors
        res.json(apmts);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});





app.post('/getDoctorsnew_app', async (req, res) => {
    try {
       
        const { patientName } = req.body;

        // Query the database to find doctors with matching specializations
        const apmts = await BookedAppointment.find({ P_name: patientName, isApproved: true });
        console.log(apmts);

        // const apmts2 = await BookedAppointment.find({ Appointment_id: apmts.Appointment_id });
        // if(apmts.success == false)
        // {
            // Respond with the list of matching doctors
        res.json(apmts);
        //}
        
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
});



app.post('/approveUserApmt', async (req, res) => {
    const { P_name, Appointment_id } = req.body;
    
    console.log("nirma12345");
    console.log(l[0]);

    try {
        // Check if the user has admin privileges (you may want to implement proper admin authentication)
        const isAdmin = true; // Replace with your admin authentication logic
       
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: 'Unauthorized request' });
        }

        // Update the isApproved field for the specific user event
        const result = await BookedAppointment.updateOne(
            { P_name: P_name, Appointment_id: Appointment_id },
            { $set: { isApproved: true } }
        );


        const result2 = await Appointment.updateOne(
            { Appointment_id: Appointment_id },
            { $set: { isApproved: true } }
        );
       
       
        if (result.modifiedCount > 0  &&  result2.modifiedCount > 0) {
            // Event approval successful

            console.log("shreya1");
            await sendapmtEmail(l[0], l[1],l[2],l[3],l[4],l[5]);
          console.log("shreya2");
            res.json({ success: true, message: 'Appointment approval successful!' });
        } else {
            // No matching user or event found or no changes made
            
            res.json({ success: false, message: 'No matching user or Appointment found or no changes made.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



app.delete('/delete_apmt', async (req, res) => {
    //console.log("haha2");
     const { Appointment_id, P_name} = req.body;
 
     try {
       
         // Find the event in the collection and delete it
         const result = await BookedAppointment.deleteOne({Appointment_id: Appointment_id , P_name: P_name});
       

         const result2 = await Appointment.updateOne(
            { Appointment_id: Appointment_id },
            { $set: { isApproved: false } }
        );

         if (result.deletedCount > 0  &&  result2.modifiedCount > 0) {
             // Event deleted successfully
             
             res.json({ success: true, message: 'Booked Appointment deleted successfully' });
         } else {
             // No matching event found
             res.json({ success: false, message: 'No matching Appointment found' });
         }
     } catch (error) {
         console.error(error);
         res.status(500).json({ success: false, message: 'Internal server error' });
     }
 });






 app.delete('/delete_apmt_doctor', async (req, res) => {
    //console.log("haha2");
     const { Appointment_id, D_name} = req.body;
 
     try {
       
         // Find the event in the collection and delete it
         const result = await BookedAppointment.deleteOne({Appointment_id: Appointment_id , D_name: D_name});
       

         const result2 = await Appointment.updateOne(
            { Appointment_id: Appointment_id },
            { $set: { isApproved: false } }
        );

         if (result.deletedCount > 0  &&  result2.modifiedCount > 0) {
             // Event deleted successfully
             
             res.json({ success: true, message: 'Booked Appointment deleted successfully' });
         } else {
             // No matching event found
             res.json({ success: false, message: 'No matching Appointment found' });
         }
     } catch (error) {
         console.error(error);
         res.status(500).json({ success: false, message: 'Internal server error' });
     }
 });




app.listen(port, () => {
    connect();
    console.log(`Server is running on port ${port}`);
});
