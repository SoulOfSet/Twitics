let querystring = require('querystring');
let request = require('request');

const CONFIG = require("../config/config");
const TWITCH_USER_BY_ID_BASE_URL = "https://api.twitch.tv/kraken/users?login=";

exports.getUserData = (user, callback) => {
    request({
        headers: {
            'Client-ID': CONFIG.twitchKey,
            'Accept': 'application/vnd.twitchtv.v5+json'
        },
        uri: TWITCH_USER_BY_ID_BASE_URL+user,
        method: 'GET'
    }, callback);
};
