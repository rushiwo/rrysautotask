#!/usr/bin/env node
var http=require('http')
var fs = require('fs')
var program = require('commander')

program
  .version('0.1.0')
  .option('-c, --config <config>', 'add config file ')
  .parse(process.argv)
console.log(program.config)
var obj = JSON.parse(fs.readFileSync(program.config, 'utf8'))
console.log(obj)

// var command=require('commander')
for(item of obj){
    vm_process(item['ip'],item['port'],item['username'],item['passwd'],item['unlock_passwd'])
}

function vm_process(myip,myport,login_name,login_passwd,unlock_passwd){

let cookie=''
let filelisturl='http://file.rushiwo.ga/json'
let num_files = 4
unlock(myip,myport,unlock_passwd,login_name,login_passwd)


function unlock(ip,port,unlock_passwd,name,passwd){
    let url = 'http://'+ip+':'+port+'/api/unlock?passwd='+unlock_passwd
    console.log(url)
    http.get(url, (res) => {
  const { statusCode } = res
  let setCookie=res.headers['set-cookie']
        cookie=setCookie[0].split(';')[0]
        console.log(cookie)
  let error
  if (statusCode !== 200) {
    console.log('unlock Request Failed.\n' +
                      `Status Code: ${statusCode}`)
    // consume response data to free up memory
    res.resume()
    return
  }
  res.setEncoding('utf8')
  let rawData = ''
  res.on('data', (chunk) => { rawData += chunk; })
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData)
      if(parsedData.code==200) {
      login(ip,port,name,passwd)
    }

    } catch (e) {
      console.error(e.message)
    }
  })
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`)
})
}


function login(ip,port,name,passwd){
    let url = 'http://'+ip+':'+port+'/api/login?uname='+name+'&passwd='+passwd
    const options = {
        //host: ip+':'+port,
        // port: port,
        // path: '/upload',
        // method: 'POST',
        headers: {
        //   'Content-Type': 'application/x-www-form-urlencoded',
        //   'Content-Length': Buffer.byteLength(postData)
             'Cookie': cookie
        }
      }
    http.get(url,options, (res) => {
  const { statusCode } = res

  let error
  if (statusCode !== 200) {
    console.log('login Request Failed.\n' +
                      `Status Code: ${statusCode}`)
    // consume response data to free up memory
    res.resume()
    return false
  }
  // console.log(options)
  res.setEncoding('utf8')
  let rawData = ''
  res.on('data', (chunk) => { rawData += chunk; })
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(rawData)
      if(parsedData.code==200) {

        monitor()
      return
    }

    } catch (e) {
      console.error(e.message)
    }
  })
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`)
})
}

function addtask(ip,port,filelist){
    // const postData = querystring.stringify({
    //     'ids': '['+ids+']'
    //   })
        let postData=''
        let tasks='['

        let num = filelist.length/10
        console.log(tasks+':'+num)
        for(let i=0;i<num_files;i++){
          //console.log(filelist[i])

            tasks=tasks+'"yyets://H='+filelist[i].fileid+'|S='+filelist[i].file_size+'|N='+filelist[i].file_name+'|",'
          }
        postData = 'tasks='+encodeURIComponent(tasks.substring(0,tasks.length-1)+']')
    console.log('\n POSTDATA'+postData)
    // const postData = 'ids=["'+ids+'"]'
      const options = {
        hostname: ip,
        port: port,
        path: '/api/addtask',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Cookie': cookie
        }
      }

      const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`)
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`)
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`)
        })
        res.on('end', () => {
          console.log('No more data in response.')
        })
      })

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`)
      })

      // write data to request body
      req.write(postData)
      req.end()
}



function getfilelist(callback){
    console.log(filelisturl)

    http.get(filelisturl, (res) => {
  const { statusCode } = res

  let error
  if (statusCode !== 200) {
    console.log('get filelist Request Failed.\n' +
                      `Status Code: ${statusCode}`)
    // consume response data to free up memory
    res.resume()
    return null
  }

  res.setEncoding('utf8')
  let rawData = ''
  res.on('data', (chunk) => { rawData += chunk ;})

  res.on('end', () => {

    try {
      const parsedData = JSON.parse(rawData)
      //console.log(parsedData)
      //if(parsedData.code==200) {
      for (item of parsedData){
        console.log('yyets://H='+item.fileid+'|S='+item.file_size+'|N='+item.file_name+'|')
      }
      if(callback)
        callback(myip,myport,parsedData)
      return parsedData
    //}else return null

    } catch (e) {
      console.error(e.message)
    }
  })
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`)
})
}



function monitor(){
    getfilelist(addtask)
}
}

