//Query4: (20pts) Create a leaderboard with the top 10 users with more tweets. Use a sorted set called leaderboard


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

await redis.del('leaderboard');

const tweetsCount = {};
for (const tweet of tweets) {
    const userName = tweet.user.screen_name;
    if (!tweetsCount[userName]) {
        tweetsCount[userName] = 0;
    }
    tweetsCount[userName]++;
}

for (const userName in tweetsCount) {
    await redis.zIncrBy('leaderboard', tweetsCount[userName], userName);
}

const leaderboard = await redis.zRange('leaderboard', 0, 19, 'WITHSCORES', 'rev');
console.log('Leaderboard');
for (let i = 0; i < leaderboard.length; i += 2) {
    console.log(`${i / 2 + 1}. ${leaderboard[i]}: ${leaderboard[i + 1]}`);
}

await redis.disconnect();
