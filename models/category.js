var Category = {
  list: (client, filter, callback) => {
    const categoryListQuery = 'SELECT categories.id AS category_id, categories.category_name AS category_name FROM categories';
    client.query(categoryListQuery, (req, data) => {
      callback(data.rows);
    });
  },
  mostOrderedCategory: (client, filter, callback) => {
    const query =  `
          SELECT categories.category_name AS category_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) DESC) AS ROW,
          SUM(orders.quantity) as TOTAL
          FROM orders
          INNER JOIN products ON orders.product_id=products.id
          INNER JOIN categories
          ON products.category_id=categories.id
          GROUP BY category_name
          ORDER BY SUM(orders.quantity) DESC
          LIMIT 3;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  }
};

module.exports = Category;