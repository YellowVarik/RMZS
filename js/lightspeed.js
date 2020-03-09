
getLightspeedData();
function getLightspeedData(){
    var data = '';

    var options = {
        hostname: "api.webshopapp.com",
        path: `/nl/products.json`,
        method: "GET",
        encoding: null,
        headers:{
          "Host": "api.webshopapp.com",
          "Content-Type": "text/json"
        }
      }

    var request = https.request(options, function(result){
        result.on('data', (d)=>{
            data += d;
        })

        result.on('end', ()=>{
            console.log(data);
        })
    })

    request.on('error', (e)=>{
        console.error(e);
    })

    request.end();
}