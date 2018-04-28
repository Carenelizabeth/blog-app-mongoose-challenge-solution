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
    console.info('seeding blog data')
    const seedData = [];

    for (let i=1; i<=10; i++){
        seedData.push(generateBlogData());
    }
    return BlogPost.insertMany(seedData);
}

function generateBlogData(){
    return {
        title: faker.lorem.words(),
        content: faker.lorem.paragraph(),
        author: {firstName: faker.name.firstName(), lastName: faker.name.lastName()}
    };
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog API interface', function(){
    before(function(){
        return runServer(TEST_DATABASE_URL);
    });
    beforeEach(function(){
        return seedBlogData();
    });
    afterEach(function(){
        return tearDownDb();
    });
    after(function(){
        return closeServer();
    });

    describe('Get endpoint', function(){

        it('should return all existing blog posts', function(){
            let res;
            return chai.request(app)
                .get('/posts')
                .then(function(_res){
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('array');
                    expect(res.body).to.have.length.of.at.least(1);
                    return BlogPost.count()
                .then(function(count){
                    expect(res.body).to.have.lengthOf(count);
                });
            });
        });
        
        it('should return correct post when called by id', function(){
            let singlePost;
            return chai.request(app)
                .get('/posts')
                .then(function(res){
                    res.body.forEach(function(post){
                        expect(post).to.be.an('object');
                        expect(post).to.include.keys(
                            'id', 'title', 'content', 'author', 'created'
                        );
                    });
                    singlePost = res.body[0];
                    return BlogPost.findById(singlePost.id);
                })
                .then(function(post){
                    expect(singlePost.id).to.equal(post.id);
                    expect(singlePost.title).to.equal(post.title);
                    expect(singlePost.content).to.equal(post.content);
                    expect(singlePost.author).to.contain(post.author.firstName);
                    expect(singlePost.created).to.equal(post.created);
                });
        });
    });

    describe('POST endpoint', function(){
        it('should add a new blog post', function(){
            const newPost = generateBlogData();

            return chai.request(app)
                .post('/posts')
                .send(newPost)
                .then(function(res){
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.include.keys(
                        'id', 'title', 'content', 'author', 'created'
                    );
                    expect(res.body.title).to.equal(newPost.title);
                    expect(res.body.content).to.equal(newPost.content);
                    expect(res.body.author).to.contain(newPost.author.firstName);
                    return BlogPost.findById(res.body.id);
                })
                .then(function(npost){
                    expect(npost.title).to.equal(newPost.title);
                    expect(npost.content).to.equal(newPost.content);
                    expect(npost.author.firstName).to.equal(newPost.author.firstName);
                    expect(npost.author.lastName).to.equal(newPost.author.lastName);
                });
                
        });

        it('should return an error if missing required fields', function(){
            const testPost = {
                title: faker.lorem.words(),
                content: faker.lorem.paragraph()
            };
            return chai.request(app)
                .post('/posts')
                .send(testPost)
                .then(function(res){
                    expect(res).to.have.status(400);
            });
        });
    });

    describe('PUT endpoint', function(){
        it('should update fields', function(){
            const updatePost = {
                title: faker.lorem.words(),
                content: faker.lorem.paragraph()
            };
            return BlogPost
                .findOne()
                .then(function(post){
                    updatePost.id = post.id;

                return chai.request(app)
                    .put(`/posts/${updatePost.id}`)
                    .send(updatePost)
            })
            .then(function(res){
                expect (res).to.have.status(204);
                return BlogPost.findById(updatePost.id);
            })
            .then(function(upost){
                expect(upost.title).to.equal(updatePost.title);
                expect(upost.content).to.equal(updatePost.content);
            })
        });
    });
});