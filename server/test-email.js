const { Resend } = require('resend');

const resend = new Resend('re_WQ2Dkk8W_7F2uxgzoST28eX43petUVGbz');

async function sendTestEmail() {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'haroonfarhang2000@gmail.com',
      subject: 'Test Email',
      html: '<h1>This is a test email</h1><p>Please confirm receipt.</p>',
    });
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();