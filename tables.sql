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
  "brand_description" VARCHAR(255)
);

CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "category_name" VARCHAR(80)
);

CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(80),
  "description" VARCHAR(255),
  "tagline" VARCHAR(50),
  "price" FLOAT(2),
  "picture" VARCHAR(255),
  "warranty" INT,
  "category_id" INT REFERENCES categories(id),
  "brand_id" INT REFERENCES brands(id)
);

CREATE TABLE "orders" (
  "order_id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id),
  "purchase_date" timestamp default current_timestamp,
  "quantity" INT
);

CREATE TABLE "customer_fave_products" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INT REFERENCES customers(id),
  "product_id" INT REFERENCES products(id)
);