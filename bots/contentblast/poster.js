'use strict';
const axios = require('axios');
const logger = require('../lib/logger');

/**
 * Post a Twitter/X thread using twitter-api-v2.
 * Requires: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 * @param {string[]} thread  Array of tweet strings
 * @returns {Promise<string[]>}  Posted tweet IDs
 */
async function postToTwitter(thread) {
  const { TwitterApi } = require('twitter-api-v2');
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;

  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    logger.warn('Twitter credentials not set — skipping Twitter post. Set TWITTER_API_KEY etc. in .env');
    return [];
  }

  const client = new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });

  const ids = [];
  let replyToId = null;

  for (const tweet of thread) {
    const payload = { text: tweet };
    if (replyToId) payload.reply = { in_reply_to_tweet_id: replyToId };

    const { data } = await client.v2.tweet(payload);
    ids.push(data.id);
    replyToId = data.id;
    logger.success(`  Tweeted: ${tweet.slice(0, 60)}...`);
    await new Promise((r) => setTimeout(r, 1000));
  }

  return ids;
}

/**
 * Post to LinkedIn using the UGC Posts REST API.
 * Requires: LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN (urn:li:person:XXXXXXX)
 * @param {string} text  Full post text including hashtags
 * @returns {Promise<string>}  Posted URN
 */
async function postToLinkedIn(text) {
  const { LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN } = process.env;

  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_PERSON_URN) {
    logger.warn('LinkedIn credentials not set — skipping LinkedIn post. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in .env');
    return null;
  }

  const body = {
    author: LINKEDIN_PERSON_URN,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
    headers: {
      Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  logger.success(`  Posted to LinkedIn: ${res.headers['x-restli-id'] || 'success'}`);
  return res.headers['x-restli-id'];
}

module.exports = { postToTwitter, postToLinkedIn };
