const twitchController = require("../controllers/twitch.controller");

let express = require('express');
let router = express.Router();

/**
 * Get user's meta data based off their user name
 */
router.get('/get_user', function(req, res, next) {
    twitchController.getUserData(req.query.user, (err, rez, body)=>{
        if(err){
            res.status(500).json(err.message);
        } else{
            res.status(200).json(JSON.parse(body));
        }
    });
});

/**
 * Get user's meta data based off their user name
 */
router.get('/get_unfollowers', function(req, res, next) {
    twitchController.getUnfollowers(req.query.userId, (err, unfollowers)=>{
        if(err){
            res.status(500).json(err.message);
        } else{
            res.status(200).json(unfollowers);
        }
    });
});


module.exports = router;