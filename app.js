const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

const client = new Client({
	database: 'd25krtj6fcj9qm',
	user: 'goqgyehevalloc',
	password: '32fac540a8a6e8f3c046fb03e49b914edb874bbf6b5b1327779ec95a4a806495',
	host: 'ec2-23-23-216-40.compute-1.amazonaws.com',
	port: 5432,
	ssl: true
});
/*
const client = new Client({
	database: 'storedb',
	user: 'postgres',
	password: 'admin',
	host: 'localhost',
	port: 5432
});
*/
client.connect()
	.then(function() {
		console.log('connected to database!');
	})
	.catch(function() {
		console.log('Ayaw ng database! Mali');
	})

/*
CREATE TABLE products_m1(id SERIAL PRIMARY KEY, name varchar(80), type varchar(80), description varchar(300), brand varchar(80), price float(10), pic varchar(80));
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP ZBook Studio x360 G5', 'Laptop', '8th Generation Intel Core i7 processor with 16 GB memory and 512 GB SSD', 'HP', '142812.19', '/one.png');
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP EliteBook x360 1020 G2', 'Laptop', '7th Generation Intel Core i5 processor with 8 GB memory and 128 GB SSD storage', 'HP', '76670.94','/two.png');
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP mt21 Mobile Thin Client', 'Laptop', 'Intel® Celeron® 3865u with Intel HD Graphics with 4 GB DDR$-2400 SDRAM', 'HP', '25874.46','/three.png');
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP ProBook x360 11 G2 EE Notebook PC', 'Laptop','7th Generation Intel® Core™ m3 processor with 4 GB memory and 128 GB SSD storage', 'HP', 40160.97,'/four.png');
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP 255 G6 Notebook PC (ENERGY STAR)', 'Laptop','AMD A6 APU with 8 GB memory and 256 GB SSD storage', 'Empire Ears', 27461.85,'/five.png');
INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('HP Stream 11 Pro G4 EE Notebook PC', 'Laptop','Intel® Celeron® processor with 4 GB memory and 128 GB eMMC storage', 'HP', 25345.33,'/six.png');


INSERT INTO products_m1(name, type, description, brand, price, pic) VALUES('ZBook Studio x360 G5', 'Laptop', '8th Generation Intel Core i7 processor with 16 GB memory and 512 GB SSD', 'HP', '142812.19', '/one.png'), ('EliteBook x360 1020 G2', 'Laptop', '7th Generation Intel Core i5 processor with 8 GB memory and 128 GB SSD storage', 'HP', '76670.94','/two.png'), ('Nitro 5', 'Laptop', 'Intel Core i7 with DDR$ 8GB memory and 256 GB SSD', 'Acer', '72999', '/three.png'), ('Aspire E1-572G', 'Laptop', 'Intel Core i7 with DDR3 4GB RAM and 1TB Storage', 'Acer', '37990', '/four.png'), ('GL63 8RC', 'Laptop', 'Intel Core i7 with 8GB RAM and 1TB Storage', 'MSI', '84000', '/five.png'), ('GV62 7RD', 'Laptop', 'Intel Core i7 with 8GB RAM and 2TB Storage', 'MSI', '74000', '/six.png');

*/
//View engine setup

//View engine setup
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req,res) {
	client.query('SELECT * FROM products_m1', (req, data)=>{
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

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM products_m1', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		res.render('products',{
			data: list
		});
	});
});

app.get('/brands', function(req,res){
	client.query("SELECT * FROM	products_brand")
	.then((result)=>{
			res.render('brands',result);
	})
	.catch((err)=>{
		console.log('error',err);
		res.send('ERROR!');
	});
	
});

app.get('/brands/create', function(req, res) {
	res.render('brand_create',{
	});
})


app.get('/category/create', function(req,res){
	res.render('category_create',{

	});
});

app.get('/categories', function(req,res){
	client.query("SELECT * FROM	products_category")
	.then((result)=>{
			res.render('categories',result);

	})
	.catch((err)=>{
		console.log('error',err);
		res.send('ERROR!');
	});

	
});
app.post('/categories', function(req,res){ //category list with insert new category query
	var values =[];
	values = [req.body.category_name];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO products_category(name) VALUES($1)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/categories');
});


app.post('/brands', function(req,res) { //brand list insert 
	var values =[];
	values = [req.body.brand_name,req.body.brand_description];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO products_brand(brand_name, brand_description) VALUES($1, $2)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/brands');
});

app.get('/edit', (req,res)=>{
	var id = req.params.id;
	res.render('edit');
});

app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity: ${req.body.quantity}</li>
		</ul>
	`;

	//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'iemaniamailer@yahoo.com', 
            pass: 'custominearmonitor' 
            /*
            user: 'iemaniamailer@google.com', 
            pass: 'custominearmonitor' 
        host: 'smtp.mail.yahoo.com'
            */
        }
    });

    let mailOptions = {
        from: '"IEMania Mailer" <iemaniamailer@yahoo.com>',
        to: 'angelikafillon@gmail.com',
        subject: 'IEMania Contact Request',
        //text: req.body.name,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        client.query('SELECT * FROM products_m1', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: '---Email has been sent---'
			});
		});
     });
});






app.get('/product/update/:id', function(req, res) {
     var category = []; 
	 var brand = [];
	 var both =[];
	  client.query('SELECT * FROM products_brand;')
	.then((result)=>{
		brand = result.rows;
	    console.log('brand:',brand);
	    both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category;')
	.then((result)=>{
		category = result.rows;
	  
	    both.push(category);
	      console.log('both',both);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	client.query('SELECT * FROM products_m1;')
	.then((result)=>{
		res.render('product_update', {
			rows: result.rows[0],
			brand: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});



app.post('/updateproduct/:id', function(req, res) {
	client.query("UPDATE products_m1 SET name = '"+req.body.productsname+"', descriptions = '"+req.body.productsdesc+"', price = '"+req.body.productsprice+"', category_id = '"+req.body.category+"', brand_id = '"+req.body.brand+"', img = '"+req.body.productsimg+"'WHERE id = '"+req.params.id+"' ;");
	client.query("UPDATE products_brand SET description = '"+req.body.branddesc+"' WHERE id ='"+req.params.id+"';");
	
	res.redirect('/store');
});



app.get('/product/create', function(req, res) {
	 var category = []; 
	 var brand = [];
	 var both =[];
	 client.query('SELECT * FROM products_brand')
	.then((result)=>{
	    brand = result.rows;
	    console.log('brand:',brand);
	     both.push(brand);
	})
	.catch((err) => {       
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category')
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
		res.send('Error!');
	});

});
app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products_m1 (name, type, description, brand, price, pic) VALUES ('"+req.body.product_name+"','"+req.body.product_type+"','"+req.body.product_description+"', '"+req.body.product_brand+"', '"+req.body.product_price+"','"+req.body.product_pic+"')");
	res.redirect('/');
});

app.listen(5000,function() {
	console.log('Server started at port 5000');
});

// app.listen(PORT);
