const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var Handlebars = require("handlebars");
var MomentHandler = require("handlebars.moment");
var dateFormat = require('dateformat');
var moment = require('moment');
moment().format();
const renderLayouts = require('layouts');
MomentHandler.registerHelpers(Handlebars);
const PORT = process.env.PORT || 8080


const Category = require('./models/category');



const client = new Client({
  database: 'd25krtj6fcj9qm',
  user: 'goqgyehevalloc',
  password: '32fac540a8a6e8f3c046fb03e49b914edb874bbf6b5b1327779ec95a4a806495',
  host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

client.connect()
  .then(function() {
    console.log('Connected to database!');
  })
  .catch(function() {
    console.log('Ayaw ng database! Wala ka atang internet?');
  })


//View engine setup
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// customer

// product list
app.get('/', function(req, res) {
  res.redirect('/home');
});

app.get('/home', function(req,res) {
  client.query("SELECT id, model_name, picture FROM products")
    .then((result) =>{
      res.render('customer/customer_home', result);
    })
    .catch((err)=>{
        res.send('Error customer product list!');
    });
});

// product details
app.get('/products/:id', (req, res) => {
  client.query('SELECT products.id AS id, products.model_name AS model_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS price, products.specification AS specification, products.picture AS picture, brands.brand_name AS brand_name, categories.category_name AS category_name FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
    .then((results)=>{
      res.render('customer/customer_order',{
        rows: results.rows[0]
      })
    })
    .catch((err) => {
      res.send('Error product details!');
    });
});


app.post('/order/:id', function(req, res) {
  client.query("INSERT INTO customers (email,first_name,last_name,street,city,state,zipcode) VALUES ('"+req.body.email+"','"+req.body.first_name+"','"+req.body.last_name+"','"+req.body.street+"','"+req.body.city+"','"+req.body.state+"','"+req.body.zipcode+"') ON CONFLICT (email) DO UPDATE SET first_name = '"+req.body.first_name+"', last_name = '"+req.body.last_name+"', street = '"+req.body.street+"',city = '"+req.body.city+"',state = '"+req.body.state+"',zipcode = '"+req.body.zipcode+"' WHERE customers.email ='"+req.body.email+"';");
  client.query("SELECT id FROM customers WHERE email = '"+req.body.email+"';")
    .then((results)=>{
      var id = results.rows[0].id;
      console.log(id);
      client.query("INSERT INTO orders (customer_id,product_id,quantity) VALUES ("+id+","+req.params.id+",'"+req.body.quantity+"')")
      .then((results)=>{
      var maillist = ['dbms1819team07@gmail.com',req.body.email];
      var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'dbms1819team07@gmail.com',
          pass: 'angelikaelton'
        }
      });
      const mailOptions = {
          from: '"Lappy Shop" <dbms1819team07@gmail.com>', // sender address
          to: maillist, // list of receivers
          subject: 'Order Details from Lappy Shop', // Subject line
          html: 
        '<p>You have a new contact request</p>'+
        '<h3>Customer Details</h3>'+
          '<ul>'+
            '<li>Customer Name: '+req.body.first_name+' '+req.body.last_name+'</li>'+
            '<li>Email: '+req.body.email+'</li>'+
            '<li>Product Name: '+req.body.name+'</li>'+
            '<li>Quantity: '+req.body.quantity+'</li>'+
          '</ul>'
      };

      transporter.sendMail(mailOptions, (error, info) => {  
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);;
          res.redirect('/');
          });
      })
      .catch((err)=>{
      console.log('error',err);
    res.send('Error sa e-mail!');
      });
    })
    .catch((err) => {
    console.log('error',err);
    res.send('Error sa products send!');
  });
});




//brands
app.get('/brands', function(req,res){
  client.query("SELECT * FROM brands")
  .then((result)=>{
      res.render('customer/customer_brands',result);
  })
  .catch((err)=>{
    res.send('Error brands list!');
  });
});

// categories
app.get('/categories', function (req, res) {
  Category.list(client, {}, function(categories) {
    res.render('customer/customer_categories', {
      categories: categories
    });
  });
});


// admin
app.get('/admin', function(req, res) {
  res.render('admin/admin');
});

// product list
app.get('/adminproducts', function(req,res) {
  client.query("SELECT products.id AS id, products.model_name AS model_name, products.picture AS picture FROM products")
  .then((result) =>{
    res.render('admin/admin_productslist', result);
  })
  .catch((err)=>{
    res.send('Error admin product list!');
  });
});


// product details and update
app.get('/adminproducts/:id', function(req, res) {
   var category = []; 
   var brand = [];
   var both =[];
   client.query('SELECT * FROM brands')
  .then((result)=>{
      brand = result.rows;
       both.push(brand);
  });
    client.query('SELECT * FROM categories')
  .then((result)=>{
      category = result.rows;
      both.push(category);
  });
  client.query('SELECT products.id AS id, products.model_name AS model_name, products.category_id AS category_id, categories.category_name AS category_name, brands.brand_name AS brand_name, products.brand_id AS brand_id, products.price AS price, products.specification AS specification, products.picture AS picture FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
    .then((result) => {
      res.render('admin/admin_productupdate', {
        rows: result.rows[0],
        brand: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});


app.post('/updateproduct/:id', function(req, res) {
  client.query("UPDATE products SET model_name = '"+req.body.model_name+"', specification = '"+req.body.specification+"', price = '"+req.body.price+"', category_id = '"+req.body.category_id+"', brand_id = '"+req.body.brand_id+"', picture = '"+req.body.picture+"'WHERE id = '"+req.params.id+"' ;"); 
  res.redirect('/adminproducts');
});

// product create
app.get('/adminproductcreate', function(req, res) {
   var category = []; 
   var brand = [];
   var both =[];
   client.query('SELECT * FROM brands')
  .then((result)=>{
       brand = result.rows;
       both.push(brand);
  })
  .catch((err) => {       
    res.send('Error product create 1!');
  });
    client.query('SELECT * FROM categories')
  .then((result)=>{
      category = result.rows;
      both.push(category);
    res.render('admin/admin_productcreate',{
    rows: both
    });
  })
  .catch((err) => {
    res.send('Error product create 2!');
  });
});

app.post('/adminproductcreate', function(req, res) {
  client.query("INSERT INTO products (model_name, specification, price, picture, category_id, brand_id) VALUES ('"+req.body.model_name+"','"+req.body.specification+"', '"+req.body.price+"', '"+req.body.picture+"', '"+req.body.category_id+"', '"+req.body.brand_id+"')")
    .then((results)=>{
      res.render('admin/admin_productcreate')
    })
    .catch((err) => {
      console.log('error',err);
      res.redirect('/adminproductcreater');
    });
});

app.get('/adminproductcreater', function(req, res) {
   var category = []; 
   var brand = [];
   var both =[];
   client.query('SELECT * FROM brands')
  .then((result)=>{
      brand = result.rows;
       both.push(brand);
  })
  .catch((err) => {       
    res.send('Error product create 1!');
  });
    client.query('SELECT * FROM categories')
  .then((result)=>{
      category = result.rows;
      both.push(category);
    res.render('admin/admin_productcreateerror',{
    rows: both
    });
  })
  .catch((err) => {
    res.send('Error product create 2!');
  });
});

// brand list and create
app.get('/adminbrandcreate', function(req, res) {
  client.query("SELECT * FROM brands")
  .then((result)=>{
      res.render('admin/admin_brandcreate',result);
  })
  .catch((err)=>{
    res.send('Error brands list!');
  });
});

app.post('/adminbrandcreate', function(req,res) { //brand list insert 
  client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('"+req.body.brand_name+"','"+req.body.brand_description+"')")
    .then((results)=>{
      res.render('admin/admin_brandcreate')
    })
    .catch((err) => {
      res.redirect('/adminbrandcreater');
    });
});

app.get('/adminbrandcreater', function(req, res) {
  client.query("SELECT * FROM brands")
  .then((result)=>{
      res.render('admin/admin_brandcreateerror',result);
  })
  .catch((err)=>{
    res.send('Error brands list!');
  });
});

// category list and create
app.get('/admincategorycreate', function (req, res) {
  Category.list(client, {}, function(categories) {
    res.render('admin/admin_categorycreate', {
      categories: categories
    });
  });
});

app.post('/admincategorycreate', function(req,res){
  client.query("INSERT INTO categories (category_name) VALUES ('"+req.body.category_name+"')")
    .then((results)=>{
    res.render('admin/admin_categorycreate')
    })
    .catch((err) => {
      res.redirect('/admincategorycreater');
    });
});

app.get('/admincategorycreater', function (req, res) {
  Category.list(client, {}, function(categories) {
    res.render('admin/admin_categorycreateerror', {
      categories: categories
    });
  });
});

// orders list
app.get('/adminorders', function(req, res) {
 client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,products.model_name AS model_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id ORDER BY purchase_date DESC;")
  .then((result)=>{
    res.render('admin/admin_orderslist', result);
    })
  .catch((err) => {
    res.send('Error sa order list!');
  });
});

// customers list
app.get('/admincustomers', function(req, res) {
  client.query('SELECT * FROM customers ORDER BY id DESC')
  .then((result)=>{
    res.render('admin/admin_customerslist', result);
  })
  .catch((err) => {
    res.send('Error sa customer list!');
  });
});

// admin customer details
app.get('/admincustomer/:id', (req, res) => {
  client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,customers.street AS street,customers.city AS city,customers.state AS state,customers.zipcode AS zipcode,products.model_name AS model_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id WHERE customers.id = "+req.params.id+" ORDER BY purchase_date DESC;")
  .then((result)=>{
      res.render('admin/admin_customerdetails', {
      first_name: result.rows[0].first_name,
      last_name: result.rows[0].last_name,
      email: result.rows[0].email,
      street: result.rows[0].street,
      city: result.rows[0].city,
      state: result.rows[0].state,
      zipcode: result.rows[0].zipcode,
      rows: result.rows
      })
  })
  .catch((err) => {
    res.send('Error sa customer details!');
  });
});

app.listen(8080,function() {
  console.log('Server started at port 8080');
});

// app.listen(PORT);