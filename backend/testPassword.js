
const bcrypt = require("bcryptjs");

const hash = "$2b$10$5jpOVORlG72xhTP8FDv7GudyZaqW.1AgJN7rvgyCk6oWcq3jh/mmu";
const password = "ChangeMe123!";

bcrypt.compare(password, hash).then((result) => {
  console.log("Password matches:", result);
}).catch((error) => {
  console.error(error);
});
