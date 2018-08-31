const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var Handlebars = require("handlebars");
var MomentHandler = require("handlebars.moment");
const renderLayouts = require('layouts');
MomentHandler.registerHelpers(Handlebars);
const PORT = process.env.PORT || 8080

const client = new Client({
  database: 'd25krtj6fcj9qm',
  user: 'goqgyehevalloc',
  password: '32fac540a8a6e8f3c046fb03e49b914edb874bbf6b5b1327779ec95a4a806495',
  host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

// const client = new Client({
//  database: 'storedb',
//  user: 'postgres',
//  password: 'admin',
//  host: 'localhost',
//  port: 5432
// });

client.connect()
  .then(function() {
    console.log('Connected to database!');
  })
  .catch(function() {
    console.log('Ayaw ng database! May mali ka sa code');
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
  client.query("SELECT * FROM products")
    .then((result) =>{
      res.render('customer/customer_home', result);
    })
    .catch((err)=>{
        console.log('error',err);
        res.send('Error customer product list!');
    });
});

// product details
app.get('/products/:id', (req, res) => {
  client.query('SELECT products.id AS id, products.model_name AS model_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS product_price, products.specification AS product_specification, products.picture AS product_picture, brands.brand_name AS brand_name, categories.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
    .then((results)=>{
      console.log ('results?',results);
      res.render('customer/customer_order',{
        id: results.rows[0].id,
        model_name: results.rows[0].model_name,
        specification: results.rows[0].product_specification,
        price: results.rows[0].product_price,
        picture: results.rows[0].product_picture,
        brand_name: results.rows[0].brand_name,
        category_name: results.rows[0].category_name,
      })
    })
    .catch((err) => {
      console.log('error',err);
      res.send('Error product details!');
    });
});

//brands
app.get('/brands', function(req,res){
  client.query("SELECT * FROM brands")
  .then((result)=>{
    console.log('results?',result);
      res.render('customer/customer_brands',result);
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error brands list!');
  });
});

// categories
app.get('/categories', function(req,res){
  client.query("SELECT * FROM categories")
    .then((result)=>{
        res.render('customer/customer_categories',result);
    })
    .catch((err)=>{
        console.log('error',err);
        res.send('Error category list!');
    });
});

// admin
app.get('/admin', function(req, res) {
  res.render('admin/admin');
});

// product list
app.get('/adminproducts', function(req,res) {
  client.query("SELECT * FROM products")
  .then((result) =>{
    res.render('admin/admin_productslist', result);
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error admin product list!');
  });
});

// product details
// app.get('/adminproducts/:id', (req, res) => {
//   client.query('SELECT products.id AS id, products.model_name AS model_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS product_price, products.specification AS product_specification, products.picture AS product_picture, brands.brand_name AS brand_name, categories.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
//     .then((results)=>{
//       console.log ('results?',results);
//       res.render('admin/admin_productupdate',{
//         id: results.rows[0].id,
//         model_name: results.rows[0].model_name,
//         specification: results.rows[0].product_specification,
//         price: results.rows[0].product_price,
//         picture: results.rows[0].product_picture,
//         brand_name: results.rows[0].brand_name,
//         category_name: results.rows[0].category_name,
//       })
//     })
//     .catch((err) => {
//       console.log('error',err);
//       res.send('Error admin product details and update form!');
//     });
// });


// product details and update
app.get('/adminproducts/:id', function(req,res) {
  var category = [];
  var brand = [];
  var product = [];
  var both = [];
  client.query('SELECT * FROM categories')
  .then((result)=>{
    category = result.rows;
    console.log('category:', category);
    both.push(category);
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error dito!');
  });
  client.query('SELECT * FROM brands')
  .then((result)=>{
    brand = result.rows;
    console.log('brand:', brand);
    both.push(brand);
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error sa product update 1!');
  });
  client.query('SELECT products.id AS id, products.model_name AS model_name, products.category_id AS category_id, categories.category_name AS category_name, brands.brand_name AS brand_name, products.brand_id AS brand_id, products.price AS price, products.specification AS specification, products.picture AS picture FROM products INNER JOIN brands ON products.brand_id=brands.id INNER JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
  .then((result)=>{
    // product = result.rows[0];
    // both.push(product);
    // console.log(product);
    // console.log(both);
    res.render('admin/admin_productupdate', {
      rows: result.rows[0],
      brand: both
    });
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error sa product update 2!');
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
      console.log('brand:',brand);
       both.push(brand);
  })
  .catch((err) => {       
    console.log('error',err);
    res.send('Error product create 1!');
  });
    client.query('SELECT * FROM categories')
  .then((result)=>{
      category = result.rows;
      both.push(category);
      console.log(category);
      console.log(both);
    res.render('admin/admin_productcreate',{
    rows: both
    });
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error product create 2!');
  });
});

app.post('/adminproductcreate', function(req, res) {
  client.query("INSERT INTO products (model_name, specification, price, picture, category_id, brand_id) VALUES ('"+req.body.model_name+"','"+req.body.specification+"', '"+req.body.price+"', '"+req.body.picture+"', '"+req.body.category_id+"', '"+req.body.brand_id+"')")
    .then((results)=>{
      console.log ('results?',results);
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
      console.log('brand:',brand);
       both.push(brand);
  })
  .catch((err) => {       
    console.log('error',err);
    res.send('Error product create 1!');
  });
    client.query('SELECT * FROM categories')
  .then((result)=>{
      category = result.rows;
      both.push(category);
      console.log(category);
      console.log(both);
    res.render('admin/admin_productcreateerror',{
    rows: both
    });
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error product create 2!');
  });
});





// brand list and create
app.get('/adminbrandcreate', function(req, res) {
  client.query("SELECT * FROM brands")
  .then((result)=>{
    console.log('results?',result);
      res.render('admin/admin_brandcreate',result);
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error brands list!');
  });
});

app.post('/adminbrandcreate', function(req,res) { //brand list insert 
  client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('"+req.body.brand_name+"','"+req.body.brand_description+"')")
    .then((results)=>{
      console.log ('results?',results);
      res.render('admin/admin_categorycreate')
    })
    .catch((err) => {
      console.log('error',err);
      res.redirect('/adminbrandcreater');
    });
});

app.get('/adminbrandcreater', function(req, res) {
  client.query("SELECT * FROM brands")
  .then((result)=>{
    console.log('results?',result);
      res.render('admin/admin_brandcreateerror',result);
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error brands list!');
  });
});

// category list and create
app.get('/admincategorycreate', function(req, res) {
  client.query("SELECT * FROM categories")
  .then((result)=>{
  res.render('admin/admin_categorycreate',result);
    published: true
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error category list!');
  });
});

app.post('/admincategorycreate', function(req,res){
  client.query("INSERT INTO categories (category_name) VALUES ('"+req.body.category_name+"')")
    .then((results)=>{
    console.log ('results?',results);
    res.render('admin/admin_categorycreate')
    })
    .catch((err) => {
      console.log('error',err);
      res.redirect('/admincategorycreater');
    });
});

app.get('/admincategorycreater', function(req, res) {
  client.query("SELECT * FROM categories")
  .then((result)=>{
  res.render('admin/admin_categorycreateerror',result);
    published: true
  })
  .catch((err)=>{
    console.log('error',err);
    res.send('Error category list!');
  });
});




// category list and create with error keme
// app.get('/admincategorycreateerror', function(req, res) {
//   client.query("SELECT * FROM categories")
//   .then((result)=>{
//   res.render('admin/admin_error_category_create',result);
//     published: true
//   })
//   .catch((err)=>{
//     console.log('error',err);
//     res.send('Error category list!');
//   });
// });

// orders list
app.get('/adminorders', function(req, res) {
 client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,products.model_name AS model_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id ORDER BY purchase_date DESC;")
  .then((result)=>{
      console.log('results?', result);
    res.render('admin/admin_orderslist', result);
    })
  .catch((err) => {
    console.log('error',err);
    res.send('Error sa order list!');
  });
});

// customers list
app.get('/admincustomers', function(req, res) {
  client.query('SELECT * FROM customers ORDER BY id DESC')
  .then((result)=>{
    console.log('results?', result);
    res.render('admin/admin_customerslist', result);
  })
  .catch((err) => {
    console.log('error',err);
    res.send('Error sa customer list!');
  });
});

app.get('/admincustomer/:id', (req, res) => {
  client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,customers.street AS street,customers.city AS city,customers.state AS state,customers.zipcode AS zipcode,products.model_name AS model_name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id WHERE customers.id = "+req.params.id+"ORDER BY purchase_date DESC;")
  .then((result)=>{
      console.log('results?', result);
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
    console.log('error',err);
    res.send('Error sa customer details!');
  });

});

app.listen(8080,function() {
  console.log('Server started at port 8080');
});

app.listen(PORT);