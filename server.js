'use strict';

import express from 'express';
import session from 'express-session';
import path from 'path';
import fetch from 'node-fetch';

import bodyParser from 'body-parser';
import ejs from 'ejs';
import _ from 'lodash';
import res from "express/lib/response.js";
import {parse} from "nodemon/lib/cli/index.js";
import req from "express/lib/request.js";
import * as console from "node:console";
import cart from "lodash/_SetCache.js";
// Constants
const PORT = 8080;
const HOST = 'localhost';

const productsResponse = await fetch('https://dummyjson.com/products?limit=100');
const productsJson = await productsResponse.json();
const products = productsJson.products;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.resolve(path.dirname(''), 'views'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        firstname: 'Mi',
    });
});

app.get('/products', async (req, res) => {
    // await sleep(1000);
    res.render('products', {
        products
    })
})

app.get('/product', async (req, res) => {
    const id = parseInt(req.query.pid);
    const product =  _.find(products, {'id': id});
    // await sleep(1000);

    res.render('product', {
        product
    });
})

app.post('/addToCart', async (req, res) => {
    const cartData = req.body;
    const pid = parseInt(req.query.pid);
    const quantity = parseInt(cartData.quantity) || 1;
    //console.log('quantity', quantity)

    const cart = req.session.cart || [];
    const cartItem = cart.find(item => item.id === pid);
    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        const cartItem = products.find(product => product.id === pid);
        cartItem.quantity = quantity;
        cart.push(cartItem);
    }
    req.session.cart = cart;


    res.setHeader('content-type', 'text/vnd.turbo-stream.html');
    res.render('cart-update', { cart });
})

app.get('/recommendations', async (req, res) => {
    // await sleep(1000);

    const pid = parseInt(req.query.pid);
    const page = parseInt(req.query.page) || 0;
    const recommendations = _(products).slice( pid + page * 5, pid + page*5 +5).value();
    res.render('recommendations', {
        recommendations,
        pid,
        page
    });
})
app.get('/cartContent', (req, res) => {
    const cart = req.session.cart || [];
    res.render('partials/cartContent', { cart })
})

app.get('/content-C', (req, res) => {
    const lastname = req.query.lastname;
    res.render('content-C', { lastname })
})

app.post('/turbo-stream', (req, res) => {
    res.setHeader('content-type', 'text/vnd.turbo-stream.html');
    res.render('turbo-stream', {})
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
