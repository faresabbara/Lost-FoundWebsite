// Importing required modules
const pool = require('./database.js');
const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');
const validator = require('email-validator');
const bcrypt = require("bcrypt");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const port = 3300;


// Express configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  }
}));

// redirection to the login page if the session is expired
app.use((req, res, next) => {
  // Setting headers to prevent caching
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  // Redirect to login page if the session is expired
  if (req.session && req.session.cookie && req.session.cookie.expires < Date.now()) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/pro.html');
    });
  } else {
    next();
  }
});



// Handling root URL based on user session
app.get('/', function (req, res) {
  if (!req.session.loggedin) {
    res.redirect('/pro.html');
  }
  else {
    if (req.session.role === 'User') {
      res.redirect('/santrals-lf/user.html');
    }
    else res.redirect('/santrals-lf/staff.html');
  }
});

// Serving HTML files
app.get('/pro.html', function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/pro.html'));
});

app.get('/prostaff.html', function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/prostaff.html'));
});
// Serving HTML files with user authentication check
app.get('/santrals-lf/user.html', isAuthenticatedUser, (req, res) => {
  res.sendFile(path.join(__dirname + '/santrals-lf/user.html'));
});

app.get('/santrals-lf/staff.html', isAuthenticatedStaff, (req, res) => {
  res.sendFile(path.join(__dirname + '/santrals-lf/staff.html'));
});

app.get('/santrals-lf/myrequests.html', isAuthenticatedUser, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/myrequests.html'));
});

app.get('/santrals-lf/L&FOfficeUser.html', isAuthenticatedUser, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/L&FOffice.html'));
});

app.get('/santrals-lf/Itemsfound.html', isAuthenticatedStaff, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/Itemsfound.html'));
});

app.get('/santrals-lf/L&FOfficeStaff.html', isAuthenticatedStaff, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/L&FOfficeStaff.html'));
});

app.get('/santrals-lf/user_chat.html', isAuthenticatedUser, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/user_chat.html'));
});

app.get('/santrals-lf/staff_chat.html', isAuthenticatedStaff, function (request, response) {
  response.sendFile(path.join(__dirname + '/santrals-lf/staff_chat.html'));
});

// adding images
app.get('/img/bilgi-logotype-en-light.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/bilgi-logotype-en-light.png'));
});

app.get('/santrals-lf/img/bilgi-logotype-en-light.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/bilgi-logotype-en-light.png'));
});

app.get('/img/moon.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/moon.png'));
});

app.get('/img/sun.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/sun.png'));
});

app.get('/img/bilgibw.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/bilgibw.png'));
});

app.get('/img/bilgilloo.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/bilgilloo.png'));
});

app.get('/santrals-lf/img/Profile.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/Profile.png'));
});

app.get('/img/smain.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/smain.png'));
});

app.get('/img/ssmainw.png', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/ssmainw.png'));
});

app.get('/santrals-lf/img/campusmap.jpg', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/img/campusmap.jpg'));
});

// adding styles
app.get('/santrals-lf/style.css', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/style.css'));
});

app.get('/style1.css', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/style1.css'));
});

// adding js files
app.get('/santrals-lf/user.js', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/user.js'));
});

app.get('/santrals-lf/myrequests.js', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/myrequests.js'));
});

app.get('/santrals-lf/Itemsfound.js', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/Itemsfound.js'));
});

app.get('/santrals-lf/staff.js', function (_, res) {
  res.sendFile(path.join(__dirname + '/santrals-lf/staff.js'));
});


// GET route to fetch user profile information
app.get('/profile', function (req, res) {
  const userFirstName = req.session.first_name || '';
  const userID = req.session.userID || '';
  res.json({ userFirstName, userID });
});

// Route to fetch lost items for staff
app.get('/staff.html', function (req, res) {
  pool.query('SELECT user_id, itemID, item_name, category, date_lost, item_status, item_description, last_loc, image_path, date_added FROM items', function (error, results) {
    if (error) {
      console.error('Error fetching missing items:', error);
      return res.status(500).send('Internal Server Error');
    }
    // Filter and map the results to desired format     
    const items = results
      .filter(resultx => resultx.item_status === 'Lost')
      .map(result => ({
        user_id: result.user_id,
        itemID: result.itemID,
        item_name: result.item_name,
        item_description: result.item_description,
        category: result.category,
        date_lost: result.date_lost,
        last_loc: result.last_loc,
        image_path: result.image_path,
        date_added: result.date_added,
        image_path: result.image_path ? `/${result.image_path}` : ''
      }));
    res.json(items);
  });

});

// Route to fetch lost items for users
app.get('/user.html', function (req, res) {
  pool.query('SELECT user_id, itemID, item_name, category, date_lost, item_status, item_description, last_loc, image_path, date_added FROM items', function (error, results) {
    if (error) {
      console.error('Error fetching missing items: ', error);
      return res.status(500).send('Internal Server Error');
    }   
    const items = results
      .filter(resultx => resultx.item_status === 'Lost')
      .map(result => ({
        itemID: result.itemID,
        item_name: result.item_name,
        item_description: result.item_description,
        category: result.category,
        date_lost: result.date_lost,
        last_loc: result.last_loc,
        date_added: result.date_added,
        image_url: result.image_path ? `/${result.image_path}` : ''
      }));
    res.json(items);
  });

});

// Route to fetch items for user's requests
app.get('/myrequests.html', function (req, res) {
  pool.query('SELECT * FROM items', function (error, results) {
    if (error) {
      console.error('Error fetching missing items:', error);
      return res.status(500).send('Internal Server Error');
    }
    // Filter and map the results to desired format based on user ID
    const items = results
      .filter(resultx => req.session.userID === resultx.user_id)
      .map(result => ({
        itemID: result.itemID,
        item_name: result.item_name,
        item_description: result.item_description,
        category: result.category,
        date_lost: result.date_lost,
        last_loc: result.last_loc,
        image_url: result.image_path ? `/${result.image_path}` : '',
        item_status: result.item_status,
        return_status: result.return_status,
        date_added: result.date_added,
        date_found: result.date_found,
        date_returned: result.date_returned,
        found_loc: result.found_loc
      }));
    res.json(items);

  });

});
// Route to fetch found items for staff
app.get('/itemsfound.html', function (req, res) {
  pool.query('SELECT * FROM items', function (error, results) {
    if (error) {
      console.error('Error fetching missing items:', error);
      return res.status(500).send('Internal Server Error');
    }  
    const items = results
      .filter(resultx => resultx.item_status === 'Found')
      .map(result => ({
        user_id: result.user_id,
        itemID: result.itemID,
        item_name: result.item_name,
        item_description: result.item_description,
        category: result.category,
        date_lost: result.date_lost,
        last_loc: result.last_loc,
        image_path: result.image_path ? `/${result.image_path}` : '',
        item_status: result.item_status,
        return_status: result.return_status,
        date_added: result.date_added,
        date_found: result.date_found,
        date_returned: result.date_returned,
        found_loc: result.found_loc
      }));
    res.json(items);
  });

});


// post methods

// sign up authentication
app.post('/auth', async function (req, res) {
  // Extract user registration information from the request body
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const phone_no = req.body.number;
  const pass = req.body.pass;
  const pass_ver = req.body.pass_ver;

  // Validate email 
  const isValid = validator.validate(email);

  // Regular expression for validating phone number
  const phoneRegex = /^\d{10}$/;

  // Generate salt and hash the password using bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashpass = await bcrypt.hash(pass, salt);

  // some logic and error handling
  if (!fname || !lname || !email || !pass || !phone_no) {
    console.error('All fields must be filled.');
    return res.status(400).send('Bad Request');
  }

  if (fname.length > 60 || lname.length > 60) {
    return res.status(400).json({ error: 'First name and last name must be at most 60 characters long' });
  }

  if (!isValid) {
    return res.status(400).json({ error: 'Email is not valid' });
  }

  if (pass.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  if (pass.length > 255) {
    return res.status(400).json({ error: 'Password length can not exceed 255 characters' });
  }

  if (pass != pass_ver) {
    return res.status(400).json({ error: "Passwords given don't match" });
  }

  if (email.length > 320) {
    return res.status(400).json({ error: 'Email length can not exceed 320 characters' });
  }

  if (!phoneRegex.test(phone_no)) {
    return res.status(400).json({ error: 'Phone number must be 10 digits' });
  }

  // inserting values into the database with some error handling
  pool.query(`INSERT INTO users (first_name, last_name, email, passhash, role, phone_no) VALUES (?,?,?,?,?,?);`, [fname, lname, email, hashpass, 'User', phone_no], function (error, result) {

    if (error) {
      // Handle duplicate entry errors for email and phone number
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          return res.status(400).json({ error: 'Email already exists' });
        } else if (error.message.includes('phone_no')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
      }

      console.error('Error inserting record:', error);
      return res.status(500).send('Internal Server Error');

    }
    // Check if the record was successfully inserted
    const insertId = result && result.insertId;

    if (insertId) {
      console.log('Record inserted successfully');
      res.redirect('/pro.html');

    } else {
      console.error('Error inserting record. No rows affected.');
      res.status(500).send('Internal Server Error');
    }

  });
});

// sign in authentication
app.post('/signin', function (req, res) {
  // Extract login information from the request body
  const email = req.body.email;
  const pass = req.body.passhash;
  const loginType = req.body.loginType;
  if (email && pass) {
    // Query the database to retrieve user information based on email
    pool.query('SELECT * FROM users WHERE email = ?', [email], function (err, results, fields) {
      if (err) {
        console.error('Error: ', err);
      }
      else if (results.length > 0) {
        // Check if the entered password matches the stored password hash
        const storedPassHash = results[0].passhash;

        const passwordMatch = bcrypt.compareSync(pass, storedPassHash);

        const role = results[0].role;

        // checks if the input field is coming from the user login or the staff login before validating password
        if (loginType === 'staff' && role === 'Staff') {
          if (passwordMatch) {
            // Set session variables and redirect to staff page
            req.session.loggedin = true;
            req.session.first_name = results[0].first_name;
            req.session.email = results[0].email;
            req.session.userID = results[0].userID;
            req.session.role = results[0].role;
            res.redirect('/santrals-lf/staff.html');
          } else {
            res.send('Incorrect Email and/or Password!');
          }
        }
        else if (loginType === 'user' && role === 'User') {

          if (passwordMatch) {
            // Set session variables and redirect to user page
            req.session.loggedin = true;
            req.session.first_name = results[0].first_name;
            req.session.email = results[0].email;
            req.session.userID = results[0].userID;
            req.session.role = results[0].role;
            res.redirect('/santrals-lf/user.html');
          } else {
            res.send('Incorrect Email and/or Password!');
          }
        } else {
          res.send('Please input your information in the correct fields');
        }

      } else {
        res.send('Incorrect Email and/or Password!');
      }
      res.end();
    });
  } else {
    res.send('Please enter both the Email and Password!');
    res.end();
  }
});

// logout
app.post('/logout', function (req, res) {
  // Destroy the session on logout
  req.session.destroy(function (err) {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('logging out...', req.session);
      res.redirect('/pro.html');
    }
  });
})

// edit button db operation
app.post('/editItem', function (req, res) {
  // Extract updated item information from the request body
  const updatedItem = req.body;
  const itemId = updatedItem.itemID;
  console.log('Sending request:', JSON.stringify(updatedItem));
  // Update the item in the database with the new information
  pool.query(
    'UPDATE items SET item_name=?, date_lost=?, category=?, item_description=?, last_loc=?, image_path=? WHERE itemID=?',
    [updatedItem.item_name, updatedItem.date_lost, updatedItem.category, updatedItem.item_description, updatedItem.last_loc, updatedItem.image_path, itemId],
    function (error, result) {
      if (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Item updated successfully');
        res.status(200).send('Item updated successfully');
      }
    }
  );
});

// Delete item from the database
app.post('/deleteItem', function (req, res) {
  const itemId = req.body.itemID;

  if (itemId) {
    pool.query('DELETE FROM items WHERE itemID = ?', [itemId], function (error, result) {
      if (error) {
        console.error('Error deleting item:', error);
      } else {
        console.log('Item deleted!');
      }
    });
  } else {
    res.status(400).send('Error mate');
  }
});

// Update item status in the database
app.post('/updateStatus', function (req, res) {
  try {
    // Extract information from the request body
    const { itemID, item_status, return_status, found_loc, date_found, date_returned } = req.body;
    const sanitizedDateFound = date_found || null;
    const sanitizedDateReturned = date_returned || null;
    // Update the item status in the database
    pool.query(
      'UPDATE items SET item_status=?, return_status=?, found_loc=?, date_found=?, date_returned=? WHERE itemID=?',
      [item_status, return_status, found_loc, sanitizedDateFound, sanitizedDateReturned, itemID],
      (error, results) => {
        if (error) {
          console.error('Error updating status:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Check if the item was found and updated successfully
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Item not found' });
        }
        res.status(200).json({ message: 'Status updated successfully' });
      }
    );
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Item report - Add a new item to the database
app.post('/itemreport', upload.single('image'), function (req, res) {

  if (req.session.loggedin) {
    // Extract item information from the request body
    const itemName = req.body.itemName || req.body.item_name;
    const category = req.body.category;
    const lastLocation = req.body.lastLocation || req.body.last_loc;
    const dateLost = req.body.dateLost || req.body.date_lost;
    const itemDescription = req.body.itemDescription || req.body.item_description;
    const imagePath = req.file ? req.file.path : null;

    // Validate required item fields
    if (!itemName || !category || !dateLost || !itemDescription || !lastLocation) {
      console.error('All fields must be filled.');
      return res.status(400).send('Bad Request');
    }

    if (countWords(itemDescription) > 200) {
      console.error('Item description must not exceed 200 words.');
      return res.status(400).send('Bad Request');
    }
    if (countWords(itemName) > 15) {
      console.error('Item name must not exceed 15 words.');
      return res.status(400).send('Bad Request');
    }

    // date validation
    const currentDate = new Date();
    const enteredDate = new Date(dateLost);
    if (enteredDate > currentDate) {
      return res.status(400).send('Date Lost cannot be in the future.');
    }

    const max = new Date();
    max.setFullYear(max.getFullYear() - 3);

    if (enteredDate < max) {
      return res.status(400).send(`Date Lost cannot be more than 3 years in the past.`);
    }

    // Insert item information into the database with error handling
    const sql = `INSERT INTO items (user_id, item_name, category, item_description, date_lost, image_path, item_status, last_loc) VALUES (?,?,?,?,?,?,?,?);`
    pool.query(sql, [req.session.userID, itemName, category, itemDescription, dateLost, imagePath, 'Lost', lastLocation], function (err, results) {

      if (err) {
        console.error('Error inserting record:', err);
        return res.status(500).send('Internal Server Error');
      }
      // Check if the item was inserted successfully
      const insertId = results && results.insertId;

      if (insertId) {
        console.log('Record inserted successfully');
        // Redirect user based on their role
        if (req.session.role === 'User') {
          res.redirect('/santrals-lf/user.html');
        } else res.redirect('/santrals-lf/staff.html');

      } else {
        console.error('Error inserting record. No rows affected.');
        res.status(500).send('Internal Server Error');
      }

    });
  } else { res.send("Session timeout, please login again"); }
});


// Function to count the number of words in a text
function countWords(text) {
  const words = text.trim().split(/\s+/);
  return words.length;
}

// Middleware function to check if a staff user is authenticated before allowing access
function isAuthenticatedStaff(req, res, next) {
  if (req.session && req.session.loggedin === true && req.session.role === 'Staff') {
    return next();
  }
  // If not authenticated, destroy the session and redirect to the login page
  req.session.destroy(function (err) {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('logging out...', req.session);
      res.redirect('/pro.html');
    }
  });
}
// Middleware function to check if a user is authenticated before allowing access
function isAuthenticatedUser(req, res, next) {
  if (req.session && req.session.loggedin === true && req.session.role === 'User') {
    return next();
  }
  // If not authenticated, destroy the session and redirect to the login page
  req.session.destroy(function (err) {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('logging out...', req.session);
      res.redirect('/pro.html');
    }
  });
}
// Server listening on the specified port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});