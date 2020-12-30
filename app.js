var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express();

mongoose.connect("mongodb://localhost/GalaxyCardAssignment",{ useNewUrlParser: true ,useFindAndModify:false ,useUnifiedTopology:true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//structure of the event
var eventSchema = new mongoose.Schema({
    title: String,
    owner: String,
    image: String,
    body : String,
    created: {type: Date, default: Date.now}
});

//mongoose model
var Event = mongoose.model("Event", eventSchema);

//get route of the home page
app.get("/",function(req, res){
    res.redirect("/events");
});

app.get("/events",function(req, res){
     
Event.find({},function(err,events){
    if(err)    
    console.log(err);
    else
    res.render("index.ejs",{events: events});
    
  });
});

//route to add new events via UI
app.get("/events/new",function(req, res) {
   res.render("new.ejs"); 
});

app.post("/events",function(req,res){
   
   Event.create(req.body.event, function(err, newevent){
      if(err)
      console.log(err);
      else
      res.redirect("/events");
   });
    
});

//route to show a specific event
app.get("/events/:id",function(req, res) {
   Event.findById(req.params.id, function(err,foundevent){
       if(err)
         console.log(err);
       else
         res.render("show.ejs",{event:foundevent});
   }) ;
});


//route to edit or update events via UI
app.get("/events/:id/edit",function(req, res) {
    Event.findById(req.params.id, function(err,foundevent){
        if(err)
         console.log(err);
        else
         res.render("edit.ejs",{event: foundevent});
        
    });
    
});

//route for updating the database
app.put("/events/:id",function(req,res){
    
    Event.findByIdAndUpdate(req.params.id, req.body.event,function(err,updatedevent){
        if(err)
         console.log(err);
        else
         res.redirect("/events/" + req.params.id);
        
    });
    
});


//route for deleting the event
app.delete("/events/:id", function(req, res){

   Event.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/events");
       } else {
           res.redirect("/events");
       }
   })

});


//---------     API's    -------------//


//api for getting all the data
app.get("/api",function(req,res){
    Event.find(function(err,foundevent){
        if(!err){
            res.send(foundevent);
        }
        else{
            res.send(err);
        }
    });
});

//api for posting data
app.post("/api",function(req,res){

    const newevent=new Event({
        title:req.body.title,
        owner:req.body.owner,
        image:req.body.image,
        body:req.body.body
    })
    newevent.save(function(err){
        if(!err){
            res.send("Successfull added an event")
        }
        else{
            res.send(err);
        }
    });
})

//api for deleting all the data
app.delete("/api",function(req,res){
    Event.deleteMany(function(err){
        if(!err){
            res.send("Successful deleted all events");
        }
        else{
            res.send(err);
        }
    });
});

//api for getting specific data (multiple if any)
app.get("/api/:owner",function(req,res){
    Event.find({owner:req.params.owner},function(err,foundevent){
        if(!err){
            if(foundevent){
                foundevent.forEach(function(event){
                    res.write(event.toString());
                });
                res.end();
            }
            else{
                res.send("No matching data found");
            }
        }
        else{
            res.send(err);
        }
    });
});

//api for updating the data
app.put("/api/:owner",function(req,res){
    Event.update(
        {owner:req.params.owner},
        {
        title:req.body.title,
        owner:req.body.owner,
        image:req.body.image,
        body:req.body.body,
        },
        {overwrite:true},
        function(err){
            if(!err){
                res.send("Successfully updated the data");
            }
            else{
                res.send(err);
            }
        }
    );
});

//api for patching the data
app.patch("/api/:owner",function(req,res){
    Event.update(
        {owner:req.params.owner},
        {$set:req.body},
        function(err){
            if(!err){
                res.send("Successfully updated the data");
            }
            else{
                res.send(err);
            }
        }
    );
});

//api for deleting specific data
app.delete("/api/:owner",function(req,res){
    Event.deleteOne(
        {owner:req.params.owner},
        function(err){
            if(!err){
                res.send("Successfully deleted");
            }
            else{
                res.send(err);
            }
        }
    );
});

let port=process.env.PORT;
if(port==null || port==""){
    port=3000;
}

app.listen(port, function() {
    console.log("Server started on port 3000");
  })






