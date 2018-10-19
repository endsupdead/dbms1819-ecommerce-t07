var Product = {
  mostOrderedProduct: (client, filter, callback) => {
    const query =  `
          SELECT products.model_name AS model_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) DESC) AS ROW,
          SUM(orders.quantity) AS TOTAL
          FROM orders
          INNER JOIN products ON orders.product_id = products.id
          GROUP BY model_name
          ORDER BY SUM(orders.quantity) DESC
          LIMIT 10;
      `;
      client.query(query, (req, result) => {
        // console.log(result.rows)
        callback(result.rows)
      });
  },
  leastOrderedProduct: (client, filter, callback) => {
    const query =  `
          SELECT products.model_name AS model_name,
          ROW_NUMBER() OVER (ORDER BY SUM(orders.quantity) ASC) AS ROW ,
          SUM(orders.quantity) AS COUNT
          FROM orders
          LEFT JOIN products ON orders.product_id = products.id
          GROUP BY model_name
          ORDER BY COUNT(orders.quantity) ASC
          LIMIT 10;
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
  productLists: (client, filter, callback) => {
    const query =  `
          SELECT
            products.id,
            model_name, picture,
            brand_name
          FROM products
            INNER JOIN brands
              ON brands.id = products.brand_id
      `;
      client.query(query, (req, result) => {
        callback(result.rows)
      });
  },
};

module.exports = Product;