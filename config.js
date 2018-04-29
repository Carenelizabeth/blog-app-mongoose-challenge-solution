'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/blog-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-blog-app' || 'mongodb://<dbuser>:<dbpassword>@ds161529.mlab.com:61529/blog-test-data';
exports.PORT = process.env.PORT || 8080;