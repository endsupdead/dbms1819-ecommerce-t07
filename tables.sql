CREATE TABLE "customers" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(80),
  "first_name" VARCHAR(80),
  "last_name" VARCHAR(80),
  "state" VARCHAR(80),
  "city" VARCHAR(80),
  "street" VARCHAR(80),
  "zipcode" INT
);

CREATE TABLE "brands" (
  "id" SERIAL PRIMARY KEY,
  "brand_name" VARCHAR(80),
  "brand_description" VARCHAR(1000)
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "category_name" VARCHAR(20)
);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(80),
  "specification" VARCHAR(500),
  "price" FLOAT(2),
  "picture" VARCHAR(500),
  "category_id" INT REFERENCES categories(id),
  "brand_id" INT REFERENCES brands(id)
);

CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id),
  "purchase_date" VARCHAR(50),
  "quantity" INT
);

CREATE TABLE "faveproducts" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id)
);