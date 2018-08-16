const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

// const client = new Client({
// 	database: 'd25krtj6fcj9qm',
// 	user: 'goqgyehevalloc',
// 	password: '32fac540a8a6e8f3c046fb03e49b914edb874bbf6b5b1327779ec95a4a806495',
// 	host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
// 	port: 5432,
// 	ssl: true
// });

const client = new Client({
	database: 'storedb',
	user: 'postgres',
	password: 'admin',
	host: 'localhost',
	port: 5432
});

client.connect()
	.then(function() {
		console.log('connected to database!');
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


app.get('/', function(req,res) {
	client.query('SELECT * FROM products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home',{
			data: list,
			title: 'Lappy Products'
		});
	});
});




app.get('/brands', function(req,res){
	client.query("SELECT * FROM	brands")
	.then((result)=>{
		console.log('results?',result);
			res.render('brands',result);
	})
	.catch((err)=>{
		console.log('error',err);
		res.send('Error brands list!');
	});
	
});

app.get('/brands/create', function(req, res) {
	res.render('brand_create');
});

app.post('/insertbrand', function(req,res) { //brand list insert 
	client.query("INSERT INTO brands (brand_name,brand_description) VALUES ('"+req.body.brand_name+"','"+req.body.brand_description+"')");
	res.redirect('/brands');
});

app.get('/category/create', function(req,res){
	res.render('category_create',{

	});
});

app.get('/categories', function(req,res){
	client.query("SELECT * FROM	categories")
	.then((result)=>{
			res.render('categories',result);

	})
	.catch((err)=>{
		console.log('error',err);
		res.send('Error category list!');
	});
});


app.post('/insertcategory', function(req,res){
	client.query("INSERT INTO categories (category_name) VALUES ('"+req.body.category_name+"')");
	res.redirect('/categories');
});


app.get('/products/:id', (req, res) => {
	client.query('SELECT products.id AS id, products.name AS product_name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS product_price, products.specification AS product_specification, products.picture AS product_picture, brands.brand_name AS brand_name,  categories.category_name AS category_name FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
		.then((results)=>{
		console.log ('results?',results);
		res.render('products',{
			id: results.rows[0].id,
			name: results.rows[0].product_name,
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


app.post('/products/:id/send', function(req, res) {
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



app.get('/product/update/:id', function(req,res) {
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
	client.query('SELECT products.id AS id, products.name AS name, products.category_id AS category_id, products.brand_id AS brand_id, products.price AS price, products.specification AS specification, products.picture AS picture FROM products LEFT JOIN brands ON products.brand_id=brands.id RIGHT JOIN categories ON products.category_id=categories.id WHERE products.id = '+req.params.id+';')
	.then((result)=>{
		product = result.rows[0];
		both.push(product);
		console.log(product);
		console.log(both);
		res.render('product_update', {
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
	client.query("UPDATE products SET name = '"+req.body.name+"', specification = '"+req.body.specification+"', price = '"+req.body.price+"', category_id = '"+req.body.category_id+"', brand_id = '"+req.body.brand_id+"', picture = '"+req.body.picture+"'WHERE id = '"+req.params.id+"' ;");	
	res.redirect('/');
});



app.get('/product/create', function(req, res) {
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
		res.render('product_create',{
		rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error product create 2!');
	});

});
app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products (name, specification, price, picture, category_id, brand_id) VALUES ('"+req.body.name+"','"+req.body.specification+"', '"+req.body.price+"', '"+req.body.picture+"', '"+req.body.category_id+"', '"+req.body.brand_id+"')");
	res.redirect('/');
});



app.get('/customers', function(req, res) {
	client.query('SELECT * FROM customers ORDER BY id DESC')
	.then((result)=>{
		console.log('results?', result);
		res.render('customers', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error sa customer list!');
	});
});

app.get('/customer/:id', (req, res) => {
	client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,customers.street AS street,customers.city AS city,customers.state AS state,customers.zipcode AS zipcode,products.name AS name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id WHERE customers.id = "+req.params.id+"ORDER BY purchase_date DESC;")
	.then((result)=>{
	   console.log('results?', result);
		res.render('customer_details', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error sa customer details!');
	});

});


app.get('/orders', function(req, res) {
	 client.query("SELECT customers.first_name AS first_name,customers.last_name AS last_name,customers.email AS email,products.name AS name,orders.quantity AS quantity,orders.purchase_date AS purchase_date FROM orders INNER JOIN customers ON customers.id=orders.customer_id INNER JOIN products ON products.id=orders.product_id ORDER BY purchase_date DESC;")
	.then((result)=>{
	    console.log('results?', result);
		res.render('orders', result);
		})
	.catch((err) => {
		console.log('error',err);
		res.send('Error sa order list!');
	});

});


app.listen(5000,function() {
	console.log('Server started at port 5000');
});

app.listen(PORT);