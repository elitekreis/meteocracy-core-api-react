'use strict';
const AdminClient = require('../lib/adminClient');
const request = require('request');
const querystring = require('querystring');
const btoa = require('btoa');
const config = require('../config/keycloak');

var adminClient = new AdminClient(config.setting);

function register(user, callback) {
    adminClient.createTestUser(user).then(function (result) {
        callback(result);
    }).catch(function (result) {
        callback(result);
    });
}

function login(username, password, callback) {
    var verb = 'POST';
    var path = '/auth/realms/master/protocol/openid-connect/token';
    var data = {
        grant_type: 'password',
        client_id: config.client.id,
        username: username,
        password: password
    };

    var postBody = querystring.stringify(data);
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'authorization': 'Basic ' + btoa(data.client_id + ':' + config.client.secret)
    };
    const requestOptions = {
        headers: headers,
        url: 'http://localhost:8080' + path,
        method: verb,
        body: postBody
    };

    request(requestOptions, function (err, res, body) {
        body = JSON.parse(body);
        callback(body);
    })
}

function logout(accesstocken, refreshtocken, callback) {
    var verb = 'POST';
    var path = '/auth/realms/master/protocol/openid-connect/logout';
    var data = {
        client_id: config.client.id,
        client_secret: config.client.secret,
        refresh_token: refreshtocken
    };

    var postBody = querystring.stringify(data);
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + accesstocken
    };

    const requestOptions = {
        headers: headers,
        url: 'http://localhost:8080' + path,
        method: verb,
        body: postBody
    };

    request(requestOptions, function (error, response, body) {
        callback(body);
    });
}

function getclient(callback) {
    adminClient.getclient().then(function (result) {
        callback(result);
    }).catch(function (result) {
        callback(result);
    });
}

function createclient(data, callback) {
    adminClient.createclient(data).then(function (result) {
        console.log(result);
        callback(result);
    }).catch(function (result) {
        console.log("error", result);
        callback(result);
    });
}

module.exports = {
    login: login,
    logout: logout,
    register: register,
    getclient: getclient,
    createclient: createclient
};