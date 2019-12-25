const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { User } = require('../models/users');
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
   const pot = await Potluck.find({name: req.params.id});
   const potluck = pot[0];
   const year = potluck.date.getFullYear();
   const month = potluck.date.getMonth();
   const day = potluck.date.getDay();
   const hour = potluck.date.getHours();
   const minute = potluck.date.getMinutes();

   const author = potluck.host.username;

   let bool;
   if(req.session.user){
        bool = (req.session.user.username===author)
   }



    res.render('exactpotluck', { potluck, year, month, day, hour, minute, bool })
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

module.exports = router;
