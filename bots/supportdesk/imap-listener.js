'use strict';
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const logger = require('../lib/logger');

/**
 * Poll an IMAP mailbox for UNSEEN messages.
 * @param {function} onEmail  Callback receiving parsed email { from, subject, text, date }
 * @returns {Promise<number>}  Number of new emails processed
 */
async function pollInbox(onEmail) {
  const { IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS } = process.env;

  if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS) {
    throw new Error('IMAP credentials not set. Set IMAP_HOST, IMAP_USER, IMAP_PASS in .env');
  }

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      host: IMAP_HOST,
      port: parseInt(IMAP_PORT || '993', 10),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      user: IMAP_USER,
      password: IMAP_PASS,
      authTimeout: 10000,
    });

    let processedCount = 0;

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) { imap.end(); return reject(err); }

        imap.search(['UNSEEN'], (err, uids) => {
          if (err) { imap.end(); return reject(err); }

          if (!uids || uids.length === 0) {
            logger.info('  No new emails.');
            imap.end();
            return resolve(0);
          }

          logger.info(`  Found ${uids.length} unread email(s)`);
          const fetch = imap.fetch(uids, { bodies: '', markSeen: true });
          const pending = [];

          fetch.on('message', (msg) => {
            const parsePromise = new Promise((res) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) { res(); return; }

                  const email = {
                    from: parsed.from?.text || 'unknown',
                    subject: parsed.subject || '(no subject)',
                    text: parsed.text || parsed.html || '',
                    date: parsed.date || new Date(),
                    messageId: parsed.messageId,
                  };

                  try {
                    await onEmail(email);
                    processedCount++;
                  } catch (callbackErr) {
                    logger.error(`  Error processing email: ${callbackErr.message}`);
                  }
                  res();
                });
              });
            });
            pending.push(parsePromise);
          });

          fetch.once('end', async () => {
            await Promise.all(pending);
            imap.end();
            resolve(processedCount);
          });

          fetch.once('error', (err) => {
            imap.end();
            reject(err);
          });
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
}

module.exports = { pollInbox };
