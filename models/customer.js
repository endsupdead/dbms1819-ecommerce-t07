var Customer = {
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
        console.log(result.rows)
        callback(result.rows)
      });
    }
};

module.exports = Customer;