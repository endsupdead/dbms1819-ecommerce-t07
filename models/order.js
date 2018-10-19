var Order = {
  zeroDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE
          AND purchase_date < CURRENT_DATE + INTERVAL '1 DAY';
      `;
      client.query(query, (req, result) => {
        // console.log(result.rows)
        callback(result.rows)
      });
  },
  oneDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '1 DAY'
          AND purchase_date < CURRENT_DATE;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  twoDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '2 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  threeDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '3 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '2 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  fourDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '4 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '3 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  fiveDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '5 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '4 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  sixDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '6 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '5 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  sevenDaysAgo: (client, filter, callback) => {
    const query =  `
          SELECT COUNT(purchase_date) FROM orders
          WHERE purchase_date >= CURRENT_DATE - INTERVAL '7 DAYS'
          AND purchase_date < CURRENT_DATE - INTERVAL '6 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  totalSalesLast7days: (client, filter, callback) => {
    const query =  `
          SELECT SUM(orders.quantity * products.price)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id WHERE purchase_date BETWEEN CURRENT_DATE - INTERVAL '7 DAYS'
          AND CURRENT_DATE + INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  totalSalesLast30days: (client, filter, callback) => {
    const query =  `
          SELECT SUM(orders.quantity * products.price)
          FROM orders
          INNER JOIN products ON products.id = orders.product_id
          INNER JOIN customers ON customers.id = orders.customer_id WHERE purchase_date BETWEEN CURRENT_DATE - INTERVAL '30 DAYS'
          AND CURRENT_DATE + INTERVAL '1 DAYS';
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
};

module.exports = Order;