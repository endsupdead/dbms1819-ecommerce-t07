var Customer = {
    getByEmail: (client,email,callback) => {
      const query =  `
          select * from customers where email = '${email}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows[0]);
      });
    },
    getById: (client,id,callback) => {
      const query =  `
          SELECT * FROM customers WHERE id = '${id}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows[0]);
      });
    },
    signup: (client,customerData,callback) => {
    var customerData = [customerData.email,customerData.fName,customerData.lName,customerData.street,customerData.mun,customerData.prov,customerData.zip,customerData.pass,customerData.userType];
    const query =  `
     INSERT INTO customers (email,first_name,last_name,street,municipality,province,zipcode,password,user_type) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    client.query(query,customerData)
    .then(res => callback('SUCCESS'))
    .catch(e => callback('ERROR'))
  },
      getCustomerData: (client,id,callback) => {
      const query =  `
          select * from customers where id = '${id.id}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows);
      });
    },
    update: (client,customerId,customerData,callback) => {
      const query =  `
        UPDATE
          customers
        SET
          email = '${customerData.email}', first_name = '${customerData.fName}', last_name = '${customerData.lName}', street = '${customerData.street}', municipality = '${customerData.mun}', province = '${customerData.prov}', zipcode = '${customerData.zip}', password = '${customerData.pass}'
        WHERE id = '${customerId.id}'
      `;
      client.query(query,(req,result)=>{
      //  console.log(result.rows)
        callback(result)
      });
    },
    topCustomersHighestPayment: (client,filter,callback) => {
      const query =  `
          SELECT DISTINCT customers.first_name, customers.last_name,
          SUM (products.price * orders.quantity)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id
          GROUP BY customers.first_name, customers.last_name 
          ORDER BY SUM DESC LIMIT 10;
      `;
      client.query(query,(req,result)=>{
        // console.log(result.rows)
        callback(result.rows)
      });
    },
    topCustomersMostOrder: (client,filter,callback) => {
      const query =  `
          SELECT first_name, last_name, 
          COUNT (orders.customer_id)
          FROM customers
          INNER JOIN orders ON orders.customer_id = customers.id
          GROUP BY customer_id, customers.first_name, customers.last_name
          ORDER BY COUNT DESC LIMIT 10;
      `;
      client.query(query,(req,result)=>{
        // console.log(result.rows)
        callback(result.rows)
      });
    }
};

module.exports = Customer;