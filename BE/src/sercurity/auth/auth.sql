CREATE ROLE Role_Admin;
CREATE ROLE Role_Shop;
CREATE ROLE Role_Customer;

-- Admin Role
GRANT CONTROL TO Role_Admin;

-- Shop Role
GRANT INSERT,UPDATE,DELETE ON SAN_PHAM TO Role_Shop;
GRANT

-- Customer Role