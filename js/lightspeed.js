const axios = require('axios').default

var api_key = "cc5959f83335efb4b42184c9031889f4";
var api_secret = "402de22a12e9b4a65e71c4309b55f548"

var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`


getLightspeedData();
function getLightspeedData() {
    axios.get(`${lsUrl}/shipments.json`).then(response => {
        console.log(response.data)
    }).catch(error => {
        console.log(error);
    });
}