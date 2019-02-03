const twitchController = require("../controllers/twitch.controller");

let express = require('express');
let router = express.Router();

/**
 * Get user's meta data based off their user name
 */
router.get('/get_user', function(req, res, next) {
    twitchController.getUserData(req.query.user, (err, rez, body)=>{
        if(err){
            res.status(500).json({error: err.message});
        } else{
            res.status(200).json(JSON.parse(body));
        }
    });
});

router.get('/get_following', function(req, res, next) {
    twitchController.getFollowing(req.query.userId, req.query.offset, (err, unfollowers)=>{
        if(err){
            res.status(500).json({error: err.message});
        } else{
            res.status(200).json(unfollowers);
        }
    });
});


router.get('/get_followers', function(req, res, next) {
    twitchController.getFollowers(req.query.userId, req.query.offset, req.query.cursor, (err, unfollowers)=>{
        if(err){
            res.status(500).json({error: err.message});
        } else{
            res.status(200).json(unfollowers);
        }
    });
});

router.get('/get_is_following', function(req, res, next) {

    if(req.query.followee === undefined || req.query.follower === undefined){
        res.status(500).json({error: "Not all parameters provided"});
    } else if(req.query.followee === req.query.follower){
        res.status(500).json({error: "Nice try weirdo"});
    } else{
        twitchController.checkIsFollowing(req.query.followee, req.query.follower, (err, isFollowing)=>{
            if(err){
                res.status(500).json({error: err.message});
            } else{
                res.status(200).json({status: isFollowing});
            }
        });
    }
});



module.exports = router;