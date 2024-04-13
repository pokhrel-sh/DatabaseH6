//Query1: (20pts) How many tweets are there? Create a tweetCount key that contains the total number of tweets in the database. For this, initialize tweetCount in 0 (SET), then query the tweets collection in Mongo and increase (INCR) tweetCount. Once the query is done, get the last value of tweetCount (GET) and print it in the console with a message that says "There were ### tweets", with ### being the actual number

import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

const filter = {};
const sort = {
    'name': -1
};

const mongo = await MongoClient.connect(
    'mongodb://localhost:27017/'
);
const coll = mongo.db('ieeevisTweets').collection('tweet');
const cursor = coll.find(filter, { sort });
const tweets = await cursor.toArray();

await mongo.close();

const redis = createClient();
redis.on('error', err => console.log('Redis Client Error', err));
await redis.connect();

await redis.set('tweetCount', 0);
for (const tweet of tweets) {
    await redis.incr('tweetCount');
}

const tweetCount = await redis.get('tweetCount');
console.log(`There were ${tweetCount} tweets`);


await redis.disconnect();