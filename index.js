const express = require("express");
const User = require("./User");
const auth = require("./api/auth")

const app = express();


app.use(express.json());

app.use('/auth', auth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));