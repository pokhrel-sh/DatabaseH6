//Query5: (30pts) Create a structure that lets you get all the tweets for an specific user. Use lists for each screen_name e.g. a list with key tweets:duto_guerra that points to a list of all the tweet ids for duto_guerra, e.g. [123, 143, 173, 213]. and then a hash that links from tweetid to the tweet information e.g. tweet:123 which points to all the tweet attributes (i.e. user_name, text, created_at, etc)
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

const mongoDB = await MongoClient.connect('mongodb://localhost:27017/');
const coll = mongoDB.db('ieeevisTweets').collection('tweet');

const redis = createClient();
redis.on('error', err => console.log('Redis Client Error', err));
await redis.connect();

try {
    const tweets = await coll.find().toArray();
    for (const tweet of tweets) {
        const tweetInfo = {
            'user_name': tweet.user.screen_name,
            'text': tweet.text,
            'created_at': tweet.created_at
        };

        await redis.rPush(`tweets:${tweet.user.screen_name}`, tweet.id_str);
        await redis.hSet(`tweet:${tweet.id_str}`, tweetInfo);
    }
    const user = 'duto_guerra';
    const tweetIds = await redis.lRange(`tweets:${user}`, 0, -1);
    console.log(`Tweets for ${user}`);

    for (const tweetId of tweetIds) {
        const tweet = await redis.hGetAll(`tweet:${tweetId}`);
        console.log(tweet);
    }
    
} catch (error) {
    console.error('Error:', error);
}

await mongoDB.close();
await redis.disconnect();