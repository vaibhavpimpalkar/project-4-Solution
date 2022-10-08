const express = require('express');
const { shortUrl, getUrl } = require('../Controllers/urlController');
const router = express.Router();




router.post("/url/shorten", shortUrl)

router.get("/:urlCode", getUrl)




module.exports = router