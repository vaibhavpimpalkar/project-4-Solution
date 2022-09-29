const express = require("express")
const router = express.Router()
const urlController = require("../controllers/urlController")



router.get('/url/shorten',urlController)











module.exports = router;