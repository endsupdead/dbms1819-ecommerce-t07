var Category = {
  list: (client, filter, callback) => {
    const categoryListQuery = 'SELECT categories.id AS category_id, categories.category_name AS category_name FROM categories';
    client.query(categoryListQuery, (req, data) => {
      callback(data.rows);
    });
  }
};

module.exports = Category;