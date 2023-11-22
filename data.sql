create database if not exists contactsList;
use contactslist;

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(15) NOT NULL
);

Select * from contacts;