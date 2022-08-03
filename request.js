import {init} from 'script.js'

let headers = new Headers();
let url = 'https://cryptic-shelf-15906.herokuapp.com/getAll';
let jsonResponse

headers.append("Authorization", "Basic Og==");

var requestOptions = {
  method: 'GET',
  headers: headers,
  redirect: 'follow'
};

res = fetch(url, requestOptions)
.then(res => res.json())
.then(out => generateTree(out))


function generateTree(json){
    console.log(json) 
    init(json)
}
    
generateTree()