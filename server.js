
const args = process.argv.slice(2)
const http = require('http')
const url = require('url');
const LOCAL_DATABASE = 'students.json'
const fs = require('fs');

if (args.length !== 1) {
    console.log("usage: node server.js <PORT_Name>");
}
else {
    const port = parseInt(args[0])
    http.createServer((req, res) => {

        res.writeHead(200, { 'Content-Type': 'text/html' });
        const request_url = req.url;
        const { pathname, query } = url.parse(request_url, true)


        if (req.method == 'GET') {
            if (pathname === '/') {
                const { name } = query
                res.write(` <h1>Hello ${name || 'World'} </h1>`);
                // res.write('<h1>Hello ' +name+'</h1>');

            }
        }

        if (req.method == 'POST') {
            if (pathname === '/students') {
                let body = ''
                req.on('data', chunk => {
                    body += chunk.toString()

                })

                req.on('end', () => {
                    //console.log(body)
                    const user = JSON.parse(body)
                    //console.log(user)

                    let data
                    if (!fs.existsSync(LOCAL_DATABASE)) {
                        user.id = 1
                        data = [user] // tableau de user 
                        //console.log(data)
                    } else {
                        const json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                        user.id = json.length + 1
                        json.push(user)
                        data = json
                    }
                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(data, null, 4))


                })
                // 1 get DATA
                // 2 file System Management 
            }
        }

        // il faut verifie si on met des lettres ou si l'id n'existe pas 

        if (req.method == 'PUT') {
            let putId = pathname.split('/')
            putId = putId[2]

            let data = ''
            req.on('data', chunk => {
                data += chunk.toString()

            })
            req.on('end', () => {
                // console.log(data)
                let putNamed = JSON.parse(data)
                let putName = putNamed.name
                let putSchool = putNamed.school
                console.log(typeof putId)
                putId = parseInt(putId)

                let json = ""
                if (typeof putId === 'number') {
                    if (fs.existsSync(LOCAL_DATABASE)) {
                        json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                        for (const key in json) {
                            console.log(json[key])
                            if (json[key].id == putId) {
                                if (putName != undefined) {
                                    json[key].name = putName
                                }
                                if (putSchool != undefined) {
                                    json[key].school = putSchool
                                }
                                console.log("La modification a bien été aplliqué")
                            }
                        }
                    } else {
                        console.log(` le fichier ${LOCAL_DATABASE} ne peut pas etre modifié si il n'existe pas`)
                    }
                } else {
                    console.log("l'id renseigné n'est pas un nombre ")
                }
                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(json, null, 4))
            })
        }

        if (req.method == 'DELETE'){
            let putId = pathname.split('/')
            putId = putId[2]
            let json = ""
            let globalJson = []
            putId = parseInt(putId)
    
            if (typeof putId === 'number') {
                if (fs.existsSync(LOCAL_DATABASE)) {
                    json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                    for (const key in json) {
                        if (json[key].id != putId) {
                            globalJson.push(json[key])
                            console.log("l'objet avec l'id "+json[key].id+" a été ajouté")
                        }
                    }
                } else {
                    console.log(` le fichier ${LOCAL_DATABASE} ne peut pas etre modifié si il n'existe pas`)
                }
            } else {
                console.log("l'id renseigné n'est pas un nombre ")
            }
            console.log(globalJson)
            fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(globalJson, null, 4))

            
        }

        res.end();

    }).listen(port)

}
