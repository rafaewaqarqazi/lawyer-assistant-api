const CronJob = require('cron').CronJob;
const Cases = require('../models/cases')
const moment = require('moment')
const {sendEmail} = require("./index");
const job = new CronJob('00 6 * * *', function() {
  Cases.find()
    .populate('client', 'email')
    .populate('lawyer', 'email')
    .then(result => {
      result.map(sCase => {
        const hearingsTomorrow = sCase.details.hearings.filter(hearing => moment(new Date()).isSame(moment(hearing.date).subtract(1, 'day'), 'day'))
        hearingsTomorrow.map(tHearings => {
          if (tHearings.status && tHearings.status === 'Pending') {
            const emailData = {
              to: [sCase.client.email, sCase.lawyer.email],
              subject: "Hearing Reminder",
              html: `
                  <p>Dear User,</p>
                  <p>This is the reminder that you next hearing of case <b>${sCase.details.title}</b> followed by hearing <b>${tHearings.title}</b> is scheduled tomorrow</p>
                `
            };

            sendEmail(emailData);
          }

        })
      })
    })
});

module.exports = job
