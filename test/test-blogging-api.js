'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaiHttp);

function seedBlogData(){
    console.info('seeding restaurant data')
    const seedData = [];

    for (let i=1; i<=10; i++){
        seedData.push(generateSeedData());
    }
    return Restaurant.insertMany(seedData);
}

function generateBlogData(){
    return {
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
        author: {firstName: faker.name.firstName(), lastName: faker.name.lastName()},
        created: faker.date.past()
    };
}