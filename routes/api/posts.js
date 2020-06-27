const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route           POST api/posts
// @Description     Creating a post 
// @Access          Private route
router.post('/', [auth, [
    
    // validations using express-validator. 
    check('text', 'text is required').not().isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        try {
            // Fetching the user from DB using user id.
            const user = await User.findById(req.user.id).select('-password');

            // Creating the new post obj.
            const newPost = new Post ({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            // Saving the new post.
            const post = await newPost.save();

            // sending response.
            res.json(post);
            
        } catch (err) {
            console.error(err.message);
            res.status(500).json('Server Error');
        }
});



// @route           GET api/posts
// @Description     Get All posts
// @Access          Private route
router.get('/', auth, async(req, res) => {
    try {
        // Fetching the all posts from DB.
        const posts = await Post.find().sort({date: -1});
        res.json(posts); 
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});



// @route           GET api/posts/:id
// @Description     Get All posts based on id
// @Access          Private route
router.get('/:id', auth, async(req, res) => {
    try {
        // Fetching the post from DB using post id.
        const posts = await Post.findById(req.params.id);

        // Handling the error is not post available.
        if(!posts) {
            return res.status(404).json({msg: 'Posts Not Found.'});
        }
        res.json(posts); 
        
    } catch (err) {
        console.error(err.message);
        // Handling error if wrong in id.
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Posts Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});



// @route           DELETE api/posts/:id
// @Description     Delete post based on id
// @Access          Private route
router.delete('/:id', auth, async(req, res) => {
    try {
        // Fetching the post using id.
        const post = await Post.findById(req.params.id);

        // Handling the error is not post available.
        if(!posts) {
            return res.status(404).json({msg: 'Posts Not Found.'});
        }

        // Handling the error is not AUTHORIZED user.
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User Not Authorized.'});
        }

        await post.remove();
        res.json({msg: 'Successfully deleted post.'}); 
        
    } catch (err) {
        console.error(err.message);
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Posts Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});



// @route           PUT api/posts/like/:id
// @Description     like a post
// @Access          Private route
router.put('/like/:id', auth, async(req, res) => {
    try {
        // Fetching the post using id.
        const post = await Post.findById(req.params.id);

        // Check current/ logedin user already liked post if yes, Handling that.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: 'User already liked the post.'})
        }

        // Saving the like into array of likes.
        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});



// @route           PUT api/posts/unlike/:id
// @Description     like a post
// @Access          Private route
router.put('/unlike/:id', auth, async(req, res) => {
    try {
        // Fetching the post using id.
        const post = await Post.findById(req.params.id)

        // Check current/ logedin user already liked post, Handling that.
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'Post not yet been liked.'})
        }

        // removing the likes from array of likes using map method.
        const removeIndex = post.likes.map(like => like.user.toString()).indexof(req.user.id);

        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});



// @route           POST api/posts/comment/:id
// @Description     Creating comment for a post 
// @Access          Private route
router.post('/comment/:id', [auth, [
    check('text', 'text is required').not().isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        try {
            // Fetching the user using id.
            const user = await User.findById(req.user.id).select('-password');

            // Fetching the post using id.
            const post = await Post.findById(req.params.id);


            // Creating new comment obj.
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            // Saving the new comment to array of comments.
            post.comments.unshift(newComment);

            await post.save();
            res.json(post.comments);
            
        } catch (err) {
            console.error(err.message);
            res.status(500).json('Server Error');
        }
});



// @route           DELETE api/posts/comment/:id/:comment_id
// @Description     Delete the comment 
// @Access          Private route
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try {
        // fetching the post with post id from DB.
        const post = Post.findById(req.params.id);

        // finding the comment from array of comments.
        const comment = Post.comments.find(comment => comment.id === req.params.comment_id);

        // check comment exists or not.
        if(!comment) {
            return res.status(404).json({msg: 'Comment not exists.'});
        }

        // check user
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'});
        }

        // remove comment
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexof(req.user.id);

        post.comment.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});


module.exports = router;