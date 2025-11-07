import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Your verification code is <b>${code}</b>. It expires in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
