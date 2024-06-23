CREATE DATABASE santral_lfdb;

use santral_lfdb;

CREATE TABLE IF NOT EXISTS users (
    userID BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    passhash VARCHAR(255) NOT NULL,
    role ENUM('User', 'Staff') NOT NULL,
    phone_no VARCHAR(10) NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS items (
    itemID BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    item_name VARCHAR(255) NOT NULL,
    category ENUM('Personal Items', 'Electronics', 'Transportation', 'Clothing', 'Jewelry', 'Bags', 'Keys', 'Wallets and Purses', 'Books and Stationery', 'Documents and ID', 'Miscellaneous') NOT NULL,
    item_description TEXT NOT NULL,
    date_lost DATE DEFAULT NULL,
    date_found DATE DEFAULT NULL,
    item_status ENUM('Lost', 'Found') NOT NULL,
    return_status ENUM('NotReturned', 'Returned') DEFAULT NULL,
    image_path VARCHAR(255) DEFAULT NULL,
    last_loc ENUM('E1','E2','E3','E4','E5','E6','E7','A1','A2','EN1','EN2',
    'ÇSM', 'Library', 'Faculty of Architecture', 'Museum of Energy', 'Starbucks', 'Espressolab','Lokma',
    'Nero Cafe', 'Sant','Gastronomy Kitchen','Cafeteria','BLAB' ,'Other') NOT NULL,
    found_loc ENUM('E1','E2','E3','E4','E5','E6','E7','A1','A2','EN1','EN2',
    'ÇSM', 'Library', 'Faculty of Architecture', 'Museum of Energy', 'Starbucks', 'Espressolab','Lokma',
    'Nero Cafe', 'Sant','Gastronomy Kitchen','Cafeteria','BLAB' ,'Other') DEFAULT NULL,
    date_returned DATE DEFAULT NULL,
	date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(userID)
);

CREATE TABLE IF NOT EXISTS messages(
	msg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_userid BIGINT NOT NULL,
    to_userid BIGINT NOT NULL,
    message_txt TEXT NOT NULL,
    itemID BIGINT DEFAULT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_userid) REFERENCES users(userID),
	FOREIGN KEY (to_userid) REFERENCES users(userID),
    FOREIGN KEY (itemID) REFERENCES items(itemID)
);

SELECT * FROM users;

SELECT * FROM items;

SELECT * FROM messages;

set global sql_mode='';

