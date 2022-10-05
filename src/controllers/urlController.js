const urlModel = require("../Models/urlModel")
const shortId = require("shortid")
const validUrl = require("valid-url")
const redis = require('redis')
const { promisify } = require('util');

function isPresent(value) {
    if (typeof (value) === "undefined" || typeof (value) === null) return false
    if (typeof (value) === "string" && value.trim().length == 0) return false
    return true
}

const redisClient = redis.createClient(             //syntax
    18561, //redis port
    "redis-18561.c212.ap-south-1-1.ec2.cloud.redislabs.com",  //redis db url

    { no_ready_check: true }
);
redisClient.auth("iFA13JDh4THujExqFlm0CHSnJpSLHsP9", function (err) {   // in callback function catch the error  redis password
    if (err) throw err;
});

redisClient.on("connect", async function () {  //build connection with redis db
    console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//-------------------------------post--------------------------------------//
const shortUrl = async function (req, res) {
    try {
        let { longUrl } = req.body;

        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Plz enter some data in body" })

        if (!isPresent(longUrl)) return res.status(400).send({ status: false, message: "longUrl is mandatory" })

        if (!validUrl.isWebUri(longUrl)) return res.status(400).send({ status: false, message: "longUrl is not Valid" })

        const checkUrl = await urlModel.findOne({ longUrl }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })

        if (!checkUrl) {
            let urlCode = shortId.generate(longUrl).toLowerCase()
            let shortUrl = "http://localhost:3000/" + urlCode

            let urlDetails = await urlModel.create({ longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode })
            let filter = { urlCode: urlDetails.urlCode, longUrl: urlDetails.longUrl, shortUrl: urlDetails.shortUrl }
            return res.status(201).send({ status: true, data: filter })

        }

        return res.status(200).send({ status: true, data: checkUrl })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



//-------------------------------get--------------------------------------//

const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        if (!shortId.isValid(urlCode)) {
            return res.status(400).send({ status: false, message: "enter valid code" })
        }
        let cachedUrl = await GET_ASYNC(`${urlCode}`)
        if (cachedUrl) {
            cachedUrl = JSON.parse(cachedUrl)
            return res.status(302).redirect(cachedUrl.longUrl)
        }
        else {
            let result = await urlModel.findOne({ urlCode }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
            if (!result) {
                return res.status(404).send({ staus: false, message: "no url exists" })
            }
            let longUrl = result.longUrl
            await SET_ASYNC(`${longUrl}`, JSON.stringify(`${result}`)) //key
            await SET_ASYNC(`${urlCode}`, JSON.stringify(`${result}`)) //key
            return res.status(302).redirect(longUrl)

        }

    } catch (err) {
        return res.status(500).send({ staus: false, error: err.message })
    }
}

module.exports = { shortUrl, getUrl };