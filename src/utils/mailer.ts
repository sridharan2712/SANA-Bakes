import nodemailer from 'nodemailer';

export async function sendOTPEmail(to: string, otp: string) {
  try {
    // Simulating SMTP credentials using test account
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"SANA Bakes Security" <security@sanabakes.com>',
      to: to,
      subject: "Your SANA Bakes Password Reset OTP",
      text: `Your heavily secure OTP for password reset is: ${otp}. It is valid for 10 minutes strictly.`,
      html: `<b>Your OTP for password reset is: <span style="font-size: 24px;">${otp}</span></b><br>It is valid for 10 minutes strictly. Do not share this with anybody.`,
    });

    console.log("OTP Message dispatched. ID: %s", info.messageId);
    console.log("View the dispatched email practically at: %s", nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("Critial Error interacting with external SMTP block:", error);
    return false;
  }
}
