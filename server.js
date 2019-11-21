
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

        /* -------------------------GET------------------------*/
        
        if (req.method == 'GET') {
            if (pathname === '/') {
                const { name } = query
                res.write(` <h1>Hello ${name || 'World'} </h1>`);
                // res.write('<h1>Hello ' +name+'</h1>');

            }
        }

        /* -------------------------POST------------------------*/

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

      
        /* -------------------------PUT------------------------*/

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

        /* -------------------------DELETE------------------------*/

        if (req.method == 'DELETE') {
            let splitPathname = pathname.split('/')
            let ressource = splitPathname[1]
            let putId = splitPathname[2]
            let matchDelete = []
            let json = ""
            let globalJson = []
            let isExist = false

            matchDelete = putId.match(/(^[0-9]+$)/g) // ON VERIFIE SI ON MATCH AVEC UN NOMBRE
            if (ressource == 'students') { // ON VERIFIE SI LA RESSOURCE EST STUDENTS
                if (matchDelete != null) { // ON VERIFIE SI IL Y UN NOMBRE
                    putId = parseInt(matchDelete[0])
                    if (fs.existsSync(LOCAL_DATABASE)) {
                        json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                        //ON VERIFIE SI L'ID EXISTE
                        for (const k in json) {
                            if (json[k].id == putId) {
                                isExist = true
                            }
                        }
                        // SI IL EXISTE ON VA CHERCHE LA LIGNE A SUPPRIMER
                        if (isExist == true) {
                            for (const key in json) {
                                if (json[key].id != putId) {
                                    globalJson.push(json[key]) // ON AJOUTE TOUT LES OBJECTS QUI N'ONT PAS L'ID MENTIONNE
                                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(globalJson, null, 4))
                                    console.log("l'objet avec l'id " + json[key].id + " a été ajouté")
                                }
                            }
                        } else {
                            console.log("l'id " + putId + " n'existe pas")
                        }
                    } else {
                        console.log(` le fichier ${LOCAL_DATABASE} ne peut pas etre modifié si il n'existe pas`)
                    }
                } else {
                    console.log("l'id renseigné n'est pas un nombre ")
                }
            } else {
                console.log("Votre ressource doit être 'students'")
            }
        }
        res.end();

    }).listen(port)

}
