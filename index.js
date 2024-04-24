const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mysql = require('mysql');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment');
const app = express();
const server = http.createServer(app);
const cors=require("cors");

const saltRounds = 10;
let signed = false;
let emai = ' ';

dotenv.config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// chat code open
app.use(cors())



const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err)
    return
  }
  console.log('Connected to MySQL!')

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      doctor_id VARCHAR(50),
      hospital VARCHAR(255),
      hospital_address VARCHAR(255),
      specalist VARCHAR(255),
      experience VARCHAR(255),
      phone VARCHAR(20),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255) 
        )
  `

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating doctors table:', err)
    } else {
      console.log('Doctors table created or already exists')
    }
  })

  const patientTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      phone VARCHAR(20),
      age INT,
      email VARCHAR(255) UNIQUE,
      address VARCHAR(400),
      password VARCHAR(255),
      Subscription INT
    )
    `

  connection.query(patientTableQuery, (err) => {
    if (err) {
      console.error('Error creating patient table:', err)
    } else {
      console.log('Patients table created or already exists')
    }
  })
  const questiontablequery = `
  CREATE TABLE IF NOT EXISTS questions(
    id INT AUTO_INCREMENT PRIMARY KEY,
    que TEXT,
    answer VARCHAR(1000) DEFAULT 'we will answer soon',
    UNIQUE(que(255))  -- Specify a key length of 255 characters
  )
`
  connection.query(questiontablequery, (err) => {
    if (err) {
      console.error('Error creating questions table:', err)
    } else {
      console.log('Questions table created or already exists')
    }
  })
  const hospitaltablequery = `
    CREATE TABLE IF NOT EXISTS hospitals(
      id INT AUTO_INCREMENT PRIMARY KEY,
      hospname varchar(100),
      hospdesc varchar(1000),
      hosploc varchar(1000),
      hospimg varchar(1000) DEFAULT 'assets/logo.png'
       )
    `
  connection.query(hospitaltablequery, (err) => {
    if (err) {
      console.error('Error creating hospitals table:', err)
    } else {
      console.log('hospitals table created or already exists')
    }
  })
})
app.get('/', function (req, res) {
  let name = 'guest'
  if (signed === true) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `

    connection.query(loginQuery, [emai], (err, results) => {
      const loginQuery = `
  SELECT * FROM patients WHERE email = ? 
`

      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          console.log('Email:', emai)

          name = results[0].name

          console.log(name)
        }
        res.render('home', { signed, nm: name })
      }
    })
  } else {
    res.render('home', { signed, nm: name })
  }
})
app.get('/hospitals', function (req, res) {
  let name = 'guest'
  if (signed) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `
    connection.query(loginQuery, [emai], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          name = results[0].name
        }
      }
    })
  }
  const hospQuery = 'select * from hospitals'
  connection.query(hospQuery, (error, hospita, fields) => {
    if (error) {
      console.error('Error fetching data:', error)
      res.status(500).send('Error fetching data')
    } else {
      res.render('hospitals', { hospita, signed, nm: name })
    }
  })
})
app.use(cors())
app.get('/FAQ', (req, res) => {
  let name = 'guest'
  if (signed) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `
    connection.query(loginQuery, [emai], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          name = results[0].name
          console.log(name)
        }
      }
    })
  }
  const faqs = [
    {
      question: 'What is an online doctor-patient consultation?',
      answer:
        'An online doctor-patient consultation is a virtual appointment where patients can communicate with a qualified medical professional using video or audio calls.',
    },
    {
      question: 'How does an online consultation work?',
      answer:
        'During an online consultation, patients use a secure platform to connect with a doctor via messages. The doctor reviews medical history, discusses symptoms, and provides medical advice.',
    },
    {
      question: 'Is an online consultation as effective as an in-person visit?',
      answer:
        'Online consultations can be effective for many non-emergency medical issues, allowing patients to receive medical advice, prescriptions, and referrals without the need for an in-person visit.',
    },
    {
      question:
        'What types of medical issues can be addressed through online consultations?',
      answer:
        'Online consultations can address a wide range of medical issues, including general health concerns, follow-up appointments, mental health consultations, dermatology, and minor illnesses.',
    },
    {
      question:
        'Is my medical information kept private during an online consultation?',
      answer:
        'Yes, online platforms for doctor-patient consultations are designed to be secure and comply with privacy regulations to ensure the confidentiality of your medical information.',
    },
    {
      question: 'How do I schedule an online consultation?',
      answer:
        'To schedule an online consultation, you can visit our website, select a suitable time slot, and provide information about your medical issue. Our team will confirm the appointment.',
    },
    {
      question: 'What technology do I need for an online consultation?',
      answer:
        "You'll need a smartphone, tablet, or computer with a working camera, microphone, and internet connection to participate in an online consultation.",
    },
    {
      question: 'Can I get a prescription through an online consultation?',
      answer:
        'Yes, doctors can provide prescriptions for certain medications through online consultations if deemed appropriate for your medical condition.',
    },
    {
      question: 'How do I pay for an online consultation?',
      answer:
        'Payment for online consultations is typically done through secure online payment gateways on our website. We accept various payment methods.',
    },
    {
      question:
        'What if I need to see a specialist after the online consultation?',
      answer:
        'If a specialist referral is required based on the online consultation, the doctor will provide you with a referral and necessary information for the next steps.',
    },
    {
      question: 'Are online consultations covered by insurance?',
      answer:
        "Some insurance plans may cover online consultations. It's recommended to check with your insurance provider to confirm coverage details.",
    },
    {
      question: 'What if I need urgent medical assistance?',
      answer:
        'Online consultations are not suitable for emergencies. If you require urgent medical assistance, please visit the nearest medical facility or call emergency services.',
    },
    {
      question: 'Can I request medical records from an online consultation?',
      answer:
        'Yes, you can request medical records from the online consultation. Our team can provide you with a summary or a copy of the consultation notes upon request.',
    },
    {
      question: 'How do I follow up after an online consultation?',
      answer:
        'Doctors may recommend follow-up appointments based on your medical condition. You can schedule a follow-up online consultation through our website.',
    },
    {
      question:
        'What if I experience technical difficulties during the consultation?',
      answer:
        'If you encounter technical difficulties during the consultation, please contact our technical support team for assistance.',
    },
  ]
  const selectQuery = 'select * from questions'
  connection.query(selectQuery, (error, faq2, fields) => {
    if (error) {
      console.error('Error fetching data:', error)
      res.status(500).send('Error fetching data')
    } else {
      res.render('faq', { faqs, faq2, signed, nm: name })
    }
  })
})
app.post('/faq', (req, res) => {
  console.log('Received  question Form Data:', req.body)
  try {
    const qu = req.body.userQuestion

    const questionQuery = `
      INSERT INTO questions (que)
      VALUES (?)
    `

    connection.query(questionQuery, qu)

    res.redirect('/faq')
  } catch (error) {
    console.error('Error signing up:', error)
    res.status(500).send('Error signing up')
  }
})
app.get('/about_us', (req, res) => {
  let name = 'guest'
  if (signed) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `
    connection.query(loginQuery, [emai], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          name = results[0].name
        }
        res.render('about_us', { signed, nm: name })
      }
    })
  } else {
    res.render('about_us', { signed, nm: name })
  }
})

app.get('/patient', function (req, res) {
  let name = 'guest'
  if (signed) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `
    connection.query(loginQuery, [emai], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          name = results[0].name
        }
        res.render('patient_profile', { signed, nm: name, pmail: emai })
      }
    })
  } else {
    res.render('patient_profile', { signed, nm: name, pmail: emai })
  }
})

app.get('/doctor', (req, res) => {
  res.render('doctor_portal')
})

app.post('/doctor/sign-up', async (req, res) => {
  console.log('Received doctor Form Data:', req.body)
  try {
    const {
      doctor_name,
      doctor_id,
      hospital,
      hospital_address,
      specialist,
      experience,
      phone,
      email,
      password,
    } = req.body
    bcrypt.hash(password, saltRounds, async function(err, hash) {
      // Store hash in your password DB.
      const insertQuery = `
      INSERT INTO doctors (name, doctor_id, hospital, hospital_address, specialist, experience, phone, email, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await connection.query(insertQuery, [
      doctor_name,
      doctor_id,
      hospital,
      hospital_address,
      specialist,
      experience,
      phone,
      email,

      hash,
    ])

    console.log('User signed up successfully')
    res.json({ redirectTo: `/doctor/${encodeURIComponent(doctor_name)}` })
  });
    
  } catch (error) {
    console.error('Error signing up:', error)
    res.status(500).send('Error signing up')
  }
})

app.post('/doctor/login', (req, res) => {
  const { name, password } = req.body;

  const getUserQuery = `
    SELECT name, password FROM doctors WHERE name = ?
  `;

  connection.query(getUserQuery, [name], async (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      res.status(500).send('Error fetching user details');
    } else {
      if (results.length > 0) {
        const storedHashedPassword = results[0].password;

        bcrypt.compare(password, storedHashedPassword, function(err, result) {
          if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).send('Error authenticating');
          } else {
            if (result) {
              const doctorName = results[0].name;
              res.json({ redirectTo: `/doctor/${encodeURIComponent(doctorName)}` });
            } else {
              res.status(401).send('Invalid credentials');
            }
          }
        });
      } else {
        res.status(401).send('Invalid credentials');
      }
    }
  });
});

app.get('/doctor/:doctor_name', (req, res) => {
  const doctorName = req.params.doctor_name

  const getDoctorQuery = `
    SELECT specialist, hospital, hospital_address, email FROM doctors WHERE name = ?
  `

  connection.query(getDoctorQuery, [doctorName], (err, results) => {
    if (err) {
      console.error('Error fetching doctor details:', err)
      res.status(500).send('Error fetching doctor details')
    } else {
      const doctorDetails = results[0]
      if (doctorDetails) {
        const specialist = doctorDetails.specialist
        const hospital = doctorDetails.hospital
        const location = doctorDetails.hospital_address
        const contactEmail = doctorDetails.email

        const researchItems = [
          'Advances in Heart Disease Treatment - Journal of Cardiology, 2022',
          'Innovations in Cardiovascular Surgery - Journal of Medical Science, 2021',
        ]

        const degreeItems = [
          'MD in Cardiology - Medical University, 2010',
          'Board Certified Cardiologist - American Board of Cardiology, 2012',
        ]

        res.render('doctor_profile', {
          doctorName,
          specialist,
          hospital,
          location,
          contactEmail,
          researchItems,
          degreeItems,
        })
      }
    }
  })
})

app.get('/doctor/:doctor_name/profile', (req, res) => {
  const doctorName = req.params.doctor_name

  res.redirect(`/doctor/${encodeURIComponent(doctorName)}`)
})

app.get('/doctor/:doctor_name/notifications', (req, res) => {
  const doctorName = req.params.doctor_name

  const notifications = [
    { title: 'New Message', content: 'You have a new message from Patient A.' },
    {
      title: 'Appointment Reminder',
      content: 'Upcoming appointment at 2:00 PM.',
    },
  ]

  res.render('doctor_notifications', { doctorName, notifications })
})
app.post('/psignup', async (req, res) => {
 
  console.log('Received  Patient Form Data:', )
  try {
    const {
      p_name,
      p_phone,
      p_age,
      p_email,
      p_address,
      p_password,
      p_cpassword,
    } = req.body
    if (p_cpassword != p_password) {
      alert(
        'Password and confirm password not matched please try to siign up once again',
      )
      res.redirect('/')
    } else {
      bcrypt.hash( p_password, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        const patientQuery = `
        INSERT INTO patients (name,phone,age,email,address,password)
        VALUES (?, ?, ?, ?, ?,?)
      `
        signed = true
  
        await connection.query(patientQuery, [
          p_name,
          p_phone,
          p_age,
          p_email,
          p_address,
          hash,
        ])
        emai = p_email
        console.log('User signed up successfully')
        res.redirect('/patient')
    });
     
    }
  } catch (error) {
    console.error('Error signing up:', error)
    res.status(500).send('Error signing up')
  }
})
app.post('/logout', (req, res) => {
  signed = false
  res.redirect('/')
})
app.get('/disease/:specalist',(req,res)=>{
  let name = 'guest';
  const t=decodeURIComponent(req.params.specalist).toLowerCase();
  const diseaseQuery = `
     SELECT * FROM doctors WHERE specalist = ?
   `;
   if (signed) {
    const loginQuery = `
    SELECT * FROM patients WHERE email = ? 
  `
    connection.query(loginQuery, [emai], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err)
        res
          .status(700)
          .send('No account is corrected with given mail id or wrong password')
      } else {
        if (results.length > 0) {
          name = results[0].name
          // console.log(name)
        }
      }
    })
  }
   
  connection.query(diseaseQuery, t,(error, docts, fields) => {
    if (error) {
      console.error('Error fetching data:', error)
      res.status(500).send('Error fetching data')
    } else {
      
      res.render('doctor', { title:t, signed, nm: name,docts })
    }
  })
})


app.post('/plogin', (req, res) => {
  try {
    const { mailid, password } = req.body;
    const loginQuery = `
     SELECT * FROM patients WHERE email = ?
   `;

    connection.query(loginQuery, [mailid], async (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.status(500).send('Error fetching user details');
      } else {
        if (results.length > 0) {
          const storedHashedPassword = results[0].password;

          bcrypt.compare(password, storedHashedPassword, function(err, result) {
            if (err) {
              console.error('Error comparing passwords:', err);
              res.status(500).send('Error authenticating');
            } else {
              if (result) {
                signed = true;
                emai = mailid;
                res.redirect('/');
              } else {
                res.send('Login failed. Please check your credentials.');
              }
            }
          });
        } else {
          res.send('Login failed. Please check your credentials.');
        }
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error signing up');
  }
});

// chat page code


const users = [{}]; // Initialize users array as an empty array

const io = socketIo(server);

app.get("/chat", (req, res) => {
  res.send("hello");
});

io.on("connection", (socket) => {
  console.log("New connection");

  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.emit('welcome', { user: "Doctor", message: `Welcome to the chat ,${users[socket.id]}`});
    socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has Joined` });
  });
  
  
  socket.on('message',({message,id})=>{
     io.emit('sendmessage',{user:users[id],message,id});
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` })
    console.log('user disconnected');
  });  
});

const PORT = 4000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
