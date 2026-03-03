const bcrypt = require('bcryptjs');

const password = '123'; // Your current password
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Bcrypt Hash:', hash);