const express = require('express');
const router = express.Router();
const config = require('../config/database');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const keycloakapi = require('./keycloak');

// Register
router.post('/register', function (req, res, next) {
    let newUser = new User({
        username: req.body.user.username,
        password: req.body.user.password
    });

    User.addUser(newUser, function (err, user) {
        console.log(user);
        if (err) {
            res.json({
                error: true,
                error_description: 'Failed to register user'
            });
        } else {
            keycloakapi.register(req.body.user, function (result) {
                res.send(result);
            });
        }
    });
});

// Authenticate
router.post('/login', function (req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return res.json({
                error: true,
                error_description: 'User not found'
            });
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 604800
                });

                keycloakapi.login(username, password, function (result) {
                    res.send(result);
                })


                // First We need a token
                // request.post({ url: keycloak.baseUrl + keycloak.tokenUrl, form: keycloak.config }, function (err, res, body) {
                //     if (err) {
                //         console.log(err);
                //         return;
                //     }
                //     var jsonBody = JSON.parse(body);
                //     var accessToken = jsonBody.access_token;

                //     var auth = {
                //         bearer: accessToken
                //     };

                //     request.post({
                //         url: `${keycloak.baseUrl}/admin/realms/demo/users`,
                //     }, function (err, response, body) {
                //         if (err) {
                //             console.log(err);
                //             return;
                //         }
                //     });
                // });

            } else {
                return res.json({
                    error: true,
                    error_description: 'Wrong password'
                });
            }
        });

    });
});

router.post('/logout', function (req, res, next) {
    keycloakapi.logout(req.body.accesstocken, req.body.refreshtocken, function (result) {
        res.send(result);
    })
})

router.post('/getclient', function (req, res, next) {
    keycloakapi.getclient(function (result) {
        res.send(result);
    })
})

router.post('/createclient', function (req, res, next) {
    var data = {
        clientId: req.body.clientid,
        name: req.body.name,
        enabled: true,
        protocol: 'openid-connect',
        standardFlowEnabled: true,
        serviceAccountsEnabled: true,
        authorizationServicesEnabled: true
    }

    console.log(data);
    keycloakapi.createclient(data, function (result) {
        res.send(result);
    })
})
module.exports = router;