var Brand = {
  list: (client, filter, callback) => {
    const brandListQuery = 'SELECT categories.id AS category_id, categories.category_name AS category_name FROM categories';
    client.query(brandListQuery, (req, data) => {
      callback(data.rows);
    });
  }
};

module.exports = Brand;