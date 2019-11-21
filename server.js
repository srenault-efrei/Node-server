
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
                        const json = require(`./${LOCAL_DATABASE}`) // ON LIT ET PARSE EN STRING
                        // IL FAUT GERER LERREUR QUAND ON DELETE ET POST POUR NE PAS Q'UN USER A MM ID QU'UN AUTRE
                        user.id = json.length + 1
                        json.push(user)
                        data = json
                    }
                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(data, null, 4))
                    console.log("L'utilisateur avec l'id " + user.id + " a bien été crée")

                })
            }
        }


        /* -------------------------PUT------------------------*/

        if (req.method == 'PUT') {
            let splitPathname = pathname.split('/')
            let putId = splitPathname[2]
            let matchPut = []
            let json = ""
            let data = ''

            req.on('data', chunk => {
                data += chunk.toString()

            })

            req.on('end', () => {
                let putData = JSON.parse(data)
                let putName = putData.name
                let putSchool = putData.school
                let isExist = false

                matchPut = putId.match(/(^[0-9]+$)/g) // ON VERIFIE SI ON MATCH AVEC UN NOMBRE

                if (matchPut != null) {// ON VERIFIE SI IL Y UN NOMBRE
                    putId = parseInt(matchPut[0])
                    if (fs.existsSync(LOCAL_DATABASE)) {
                        json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                        //ON VERIFIE SI L'ID EXISTE
                        for (const k in json) {
                            if (json[k].id == putId) {
                                isExist = true
                            }
                        }
                        // SI IL EXISTE ON CHERCHE LA LIGNE A MODIFIER
                        if (isExist == true) {
                            for (const key in json) {
                                if (json[key].id == putId) {
                                    if (putName != undefined) {
                                        json[key].name = putName
                                    }
                                    if (putSchool != undefined) {
                                        json[key].school = putSchool
                                    }
                                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(json, null, 4))
                                    console.log("La modification a bien été aplliqué")
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

            })
        }

        /* -------------------------DELETE------------------------*/

        if (req.method == 'DELETE') {

            let splitPathname = pathname.split('/')
            let matchDelete = []
            let json = ""
            let globalJson = []
            let isExist = false

            if (splitPathname.length == 3) { // JE VERIFIE SI ON A AU MOINS 2 TRUCS DANS LE TAB (CHAINE VIDE,LA RESSOURCE, L'ID)
                let ressource = splitPathname[1]
                let deleteId = splitPathname[2]

                matchDelete = deleteId.match(/(^[0-9]+$)/g) // ON VERIFIE SI ON MATCH AVEC UN NOMBRE
                if (ressource == 'students') { // ON VERIFIE SI LA RESSOURCE EST STUDENTS
                    if (matchDelete != null) { // ON VERIFIE SI IL Y UN NOMBRE
                        deleteId = parseInt(matchDelete[0])
                        if (fs.existsSync(LOCAL_DATABASE)) {
                            json = require(`./${LOCAL_DATABASE}`) //on lit et parse en string
                            //ON VERIFIE SI L'ID EXISTE
                            for (const k in json) {
                                if (json[k].id == deleteId) {
                                    isExist = true
                                }
                            }
                            // SI IL EXISTE ON VA CHERCHE LA LIGNE A SUPPRIMER
                            if (isExist == true) {
                                for (const key in json) {
                                    if (json[key].id != deleteId) {
                                        globalJson.push(json[key]) // ON AJOUTE TOUT LES OBJECTS QUI N'ONT PAS L'ID MENTIONNE
                                        fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(globalJson, null, 4))
                                    }
                                }
                                console.log("l'objet avec l'id " + deleteId + " a été supprimé")
                            } else {
                                console.log("l'id " + deleteId + " n'existe pas")
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
            // /* -------------------------DELETE_ALL_STUDENT------------------------*/

            else {
                if (pathname === '/students') {
                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify([], null, 4))
                    console.log("Vous avez supprimé tout les étudiants")
                }
            }
        }

        res.end();

    }).listen(port)

}
