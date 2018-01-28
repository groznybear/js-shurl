// server.js
// where your node app starts

// init project
var express = require('express');
var client = require('mongodb').MongoClient;
var app = express();

var dbConnect = (success) => {
  client.connect(process.env.MONGOLAB_URI, (error, db) => {
    if (error) {
      console.log('Unable to connect to the mongoDB server. Error:', error);
    } else {
      success(db);
    }      
  });  
};

app.use(express.static('public'));

app.get("/", function (request, response) { response.sendFile(__dirname + '/views/index.html'); });
app.get('/new/*', (req, res) => { res.redirect('/'); });

function testURL(url) {
  
  if(url === '')
    return false;  
  if(!url.includes('.') || url.length == 1)
    return false;
  if(url.indexOf('.') == 0)
    return false;
  return true;
}

app.post('/shorten', (req, res) => { 
  if(testURL(req.query.url))
  {
    dbConnect(db => OnDBConnected(db, req.query.url, x => res.send(x))); 
  }
  else
  {
    res.send(JSON.stringify({error: "Incorrect URL format"}));
  }
});

app.all('/*', (req, res, next) => {
  var shortUrl = parseInt(req.path.substr(1).trim());
  var isId = !isNaN(shortUrl);
  console.log(isId);
  // next();
  if(isId)
  {
    dbConnect(db => db.db(process.env.DB_NAME)
                      .collection(process.env.COL_NAME)
                      .findOne({short_url: shortUrl}, (err, result) =>{
      if(err)
      {
        res.send(JSON.stringify({error: 'URL not found'}));
        db.close();
        return;
      }
      console.log(JSON.stringify(result));
      res.redirect(result.original_url);
      db.close();
    }));   
  }
  else
  {
    res.send(JSON.stringify({error: 'Short URL not registered'}));
  }
});

function OnDBConnected(db, url, callback) {  
  console.log('connected');
  var collection = db.db(process.env.DB_NAME).collection(process.env.COL_NAME);  
  
  collection.count((err, count) => {
    if(err)
    {
      console.log(err);
      callback(JSON.stringify({error: err}));
      db.close
      return;
    }  
    
    var response = {
      original_url: repairUrl(url),
      short_url: count,
    };

    collection.insertOne(response, (e, s) => {
      var x = {
        original_url: response.original_url,
        short_url: 'https://shurl.glitch.me/'+ response.short_url,
      }
      if(e)
        x.error = e;

      callback(JSON.stringify(x));
      db.close();  
    });
  });       
}

function repairUrl(url)
{
  if(!url.includes('https://'))
  {
    url = 'https://' + url;
  }
  
  return url;
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
