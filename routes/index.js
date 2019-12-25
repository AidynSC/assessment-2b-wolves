const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models/users');
const { Bring } = require('../models/brings');
const Potluck = require('../models/potlucks');
const saltRounds = 10;

router.get('/', async(req, res, next)=>{
    res.redirect('/login')
});
router.get('/login', async(req, res, next)=>{
    res.render('login')
});
router.get('/signup', async(req, res, next)=>{
    res.render('signup')
});
router.get('/busymail', async(req, res, next)=>{
    res.render('./mistakes/busymail')
});
router.get('/busyusername', async(req, res, next)=>{
    res.render('./mistakes/busyusername')
});
router.get('/wrongemail', async(req, res, next)=>{
    res.render('./mistakes/wrongemail')
});
router.get('/wrongpassword', async(req, res, next)=>{
    res.render('./mistakes/wrongpassword')
});
router.get('/newpotluck', async (req, res, next)=>{
    res.render('potluck')
});
router.get('/potlucks/bringmistake', async (req, res, next)=>{
    res.render('bringmistake')
});
router.get('/potlucks', async (req, res, next)=>{
    const potlucks = await Potluck.find();
    let upcoming = [];
    let currentDate = Date.now();
    potlucks.forEach((element)=>{
       if(element.date>currentDate){
           upcoming.push(element);
       }
    });

    upcoming.sort(function(a, b) {
        return a.date - b.date;
    });

    res.render('index', { upcoming })
});

router.post('/signuped', async function (req, res, next) {
    try {
        let users = await User.find();
        let user;
        let used = [];
        console.log(req.body);
        let  {username, email, password} = req.body;
        users.forEach((element)=> {
            if (element.email === email) {
                res.redirect('busymail');
                used.push(element);
            } else if(element.username===username){
                res.redirect('busyusername');
                used.push(element)
            }
        });

        if(used.length===0){
            user = await new User({
                username,
                email,
                password: await bcrypt.hash(password, saltRounds)
            });
        await user.save();
        req.session.user = user;
        res.redirect('/potlucks')
        }

    } catch (error) {
        next(error);
    }
});

router.post('/logined', async function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({email});
    if(!user){
        res.redirect("/wrongemail");
    } else if(!(await bcrypt.compare(password, user.password))){
        res.redirect('/wrongpassword')
    } else if (user && (await bcrypt.compare(password, user.password))) {
        req.session.user = user;
        res.redirect('/potlucks')
    }

});

router.post("/logout", async (req, res, next) => {
    if (req.session.user) {
        try {
            await req.session.destroy();
            res.clearCookie("user_sid");
            res.redirect("/");
        } catch (error) {
            next(error);
        }
    } else {
        res.redirect("/login");
    }
});

router.post('/partyadd', async (req, res, next)=>{
    const { name, location, date } = req.body;
    const host = req.session.user;
    console.log(host);
    await Potluck.create({
        name,
        location,
        date,
        host
    });
    res.redirect('/potlucks')
});

router.get('/potlucks/:id', async (req, res, next)=>{
    // const follow = await Potluck.find({name: req.params.id}, {brings: 1});
    // console.log(follow);
    const brings = await Bring.find({potluck: req.params.id});
    const currentUser = req.session.user.username;
    const vew = await Bring.find({username: currentUser, potluck: req.params.id});
const asd = vew[0];
   const pot = await Potluck.find({name: req.params.id});
   const potluck = pot[0];
    let array = potluck.followers;
    let arr = [];
    array.forEach((element)=>{
        if(element.username===req.session.user.username){
            arr.push("tut")
        }
    });
    const year = potluck.date.getFullYear();
   const month = potluck.date.getMonth();
   const day = potluck.date.getDay();
   const hour = potluck.date.getHours();
   const minute = potluck.date.getMinutes();

   const author = potluck.host.username;
    let bool2;
    if(arr.length>0){
        bool2 = true;
    } else {bool2= false}
   let bool;
   if(req.session.user){
        bool = (req.session.user.username===author)
   }

    res.render('exactpotluck', { potluck, year, month, day, hour, minute, bool, brings, bool2, currentUser, asd })
});

router.put('/potlucks/:id', async (req, res, next)=>{
    if(req.body.name && req.body.location && req.body.date){
    await Potluck.updateOne({name: req.params.id},{name: req.body.name, location: req.body.location, date: req.body.date});
    res.send('good')
    }
    else {
        res.render('./mistakes/full', {
            layout: false
        })
    }
});

router.delete('/potlucks/:id', async (req, res, next)=>{
    await Potluck.deleteOne({name: req.params.id});
    res.send('success')
});

router.get('/potlucks/:id/edit', async (req, res, next)=>{
    const potluck = await Potluck.find({name: req.params.id});
    const author = potluck[0].host.username;
    let bool;
    if(req.session.user){
        bool = (req.session.user.username===author)
    }
    res.render('potluckedit', {potluck: potluck[0], bool})
});

router.get('/potlucks/:id/join', async (req, res, next)=>{
    const pot = req.params.id;
   res.render('joining', {
       pot
   })
});

router.post('/potlucks/:id/join', async (req, res, next)=>{
    const bring = req.body.bring;
    await Bring.create({username: req.session.user.username, bringing: bring, potluck: req.params.id});
    const currentUser = req.session.user;
    const bringer = req.session.user.username;
    const pot = req.params.id;
    let joined = [];
    let stuff = [];
    let followers = await Potluck.find({name: req.params.id},{followers: 1});
    let brings = await Potluck.find({name: req.params.id},{"_id":0, brings: 1});
    console.log(brings);
    brings.forEach((element)=>{
        if(element.bringing===bring){
            stuff.push(element)
        }
    });

    followers.forEach((element)=>{
       if(element.username===currentUser){
           joined.push(element)
       }
    });

    if(joined.length===0 && stuff.length===0) {
        followers.push(currentUser);
        console.log(await Bring.find({bringing: bring}));




        await Potluck.updateOne({name: pot}, {followers: followers, brings: brings});
        res.redirect(`/potlucks/${pot}`)
    }
    res.redirect('/potlucks/bringmistake')

});

module.exports = router;
