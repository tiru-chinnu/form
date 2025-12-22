import express from 'express'
import hbs from 'hbs'
import path from 'path'
import bodyParser from 'body-parser'
import fs from 'fs'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import os from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL || process.env.NOW_REGION
const rootDir = isVercel ? process.cwd() : process.cwd()

const viewsPath = path.resolve(rootDir, 'assets/views')
const partialPath = path.resolve(rootDir, 'assets/partials')
const storageDir = isVercel ? '/tmp' : path.resolve(rootDir, 'tmp')

if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
}

const getPath = (file) => path.join(storageDir, file)

const initFile = (name, defaultValue = '[]') => {
    const p = getPath(name)
    try {
        if (!fs.existsSync(p)) {
            fs.writeFileSync(p, defaultValue, 'utf-8')
        }
        return JSON.parse(fs.readFileSync(p, 'utf-8'))
    } catch (e) {
        return JSON.parse(defaultValue)
    }
}

var arr = initFile('students.json'),
    arr1 = initFile('faculty.json'),
    ipAddr = initFile('trusted.json'),
    dataX = {
        students: '',
        faculty: '',
        allow: false
    },
    PORT = process.env.PORT || 3000

if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`running at http://localhost:${PORT}`)
    })
}

hbs.registerPartials(partialPath, err => console.log((err) ? err : ''))
app.use(express.static(path.resolve(rootDir, 'public')))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser("something"))
app.use(session({
    secret: "#123just!not",
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
        maxAge: 6000 * 60,
    }
}))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
app.set('trust proxy', true)

app.get('/', (req, res) => {
    if (!req.session.views) req.session.views = 1
    else req.session.views++
    res.render('index', { views: req.session.views })
})

app.get('/students', (req, res) => {
    res.render('students')
})

app.get('/faculty', (req, res) => {
    res.render('faculty')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    const passes = initFile('secured.json')
    const { username, password } = req.body
    
    arr = initFile('students.json')
    arr1 = initFile('faculty.json')
    
    const user = passes.find(u => u.username === username)

    if (user && user.password === password) {
        req.session.userId = username
        dataX.students = ''
        dataX.faculty = ''
        
        arr.forEach(e => {
            dataX.students += `<div class="card">
                <div class="name">name : ${e["name"]}</div>
                <div class="student-id">id : ${e["student-id"]}</div>
                <div class="issue-type">issue : ${e["issue-type"]}</div>
                <div class="location">location : ${e["location"]}</div>
                <div class="description">description : ${e["description"]}</div>
            </div>`
        })
        
        arr1.forEach(e => {
            dataX.faculty += `<div class="card">
                <div class="name">name : ${e["name"]}</div>
                <div class="faculty-id">id : ${e["faculty-id"]}</div>
                <div class="issue-type">issue : ${e["issue-type"]}</div>
                <div class="location">location : ${e["location"]}</div>
                <div class="description">description : ${e["description"]}</div>
            </div>`
        })
        
        dataX.username = username
        return res.render('admin', dataX)
    } else {
        return res.redirect('/login')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) res.send('failed to logout')
        else res.redirect('/')
    })
})

app.post('/submit-student-complaint', (req, res) => {
    arr.push(req.body)
    fs.writeFile(getPath('students.json'), JSON.stringify(arr), 'utf-8', (err) => {
        if (err) res.render('error', { message: 'failed to submit' })
        else res.render('submitted')
    })
})

app.post('/submit-faculty-complaint', (req, res) => {
    arr1.push(req.body)
    fs.writeFile(getPath('faculty.json'), JSON.stringify(arr1), 'utf-8', (err) => {
        if (err) res.render('error', { message: 'failed to submit' })
        else res.render('submitted')
    })
})

app.get('/data', (req, res) => {
    res.render('dot')
})

app.get('/chat', (req, res) => {
    res.render('chat')
})

app.get('*', (req, res) => {
    res.render('error', {
        message: 'Oops! The page you are looking for does not exist.'
    })
})

export default app