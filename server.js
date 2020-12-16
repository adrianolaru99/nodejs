const express = require('express');
const Sequalize = require('sequelize');
const _USERS = require('./users.json');

const root = {
    content: () => 'Hello World'
}
const app = express();
const port = 8001;

const connection = new Sequalize('db','user','pass',{
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'db.sqlite',
    operatorAliases:false,
    define: {
        freezeTableName: true
    }
})
const User = connection.define('User',{
    name: Sequalize.STRING,
    email: {
        type: Sequalize.STRING,
        validate: {
            isEmail: true
        }
    },
    password:{
        type: Sequalize.STRING,
        validate: {
            isAlphanumeric: true,

        }
    }
}
)
const Post = connection.define('Post',{
    id:{
        primaryKey: true,
        type: Sequalize.UUID,
        defaultValue: Sequalize.UUIDV4
    },
    title: Sequalize.STRING,
    content: Sequalize.TEXT
})
app.get('/allposts',(req,res)=>{
    Post.findAll({
        include: [User]
    })
    .then(posts => {
        res.json(posts);
    })
    .catch(error => {
        console.log(error);
        res.status(404).send(error);
    })
})
app.get('/findOne',(req,res)=>{
    User.findById(55).then(user=>{
        res.json(user)
    })
    .catch(err =>{
        console.log(error);
        res.status(404).send(error)
    })
});

app.put('/update',(req,res)=>{
    User.update(req.body).then(user=>{
        res.json(user)
    })
    .catch(err =>{
        console.log(error);
        res.status(404).send(error)
    })
});
Post.belongsTo(User); 

connection.sync({
    force:true
}).then(()=>{
    User.bulkCreate(_USERS)
    .then(users=>{
        console.log('Users have been added')
    }).catch(error=>{
        console.log(error)
    })});
app.post('/post',(req,rest)=>{
    const newUser = req.body.user;
    User.create(newUser)
    .then(user=>{
        rest.json(user)
    })
    .catch(err =>{
        console.log(error);
        rest.status(404).send(error)
    })
})
app.listen(port, ()=> console.log('Running server on port ' + port))
