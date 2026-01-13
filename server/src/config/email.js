import nodemailer from 'nodemailer';

export const transporter =  nodemailer.createTransport({
    service: 'gamil',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})