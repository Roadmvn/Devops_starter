const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendVerificationEmail(email, verificationLink) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Vérifiez votre adresse email',
            html: `
                <h1>Bienvenue !</h1>
                <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                <a href="${verificationLink}">Vérifier mon email</a>
                <p>Ce lien expirera dans 24 heures.</p>
            `
        };
        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordResetEmail(email, resetLink) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <h1>Réinitialisation du mot de passe</h1>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
                <a href="${resetLink}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expirera dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `
        };
        return this.transporter.sendMail(mailOptions);
    }

    async sendWelcomeEmail(email, firstName) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Bienvenue sur notre plateforme !',
            html: `
                <h1>Bienvenue ${firstName || ''} !</h1>
                <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
                <p>Voici quelques fonctionnalités clés de notre plateforme :</p>
                <ul>
                    <li>Recherche de produits</li>
                    <li>Gestion de votre profil</li>
                    <li>Et bien plus encore...</li>
                </ul>
            `
        };
        return this.transporter.sendMail(mailOptions);
    }
}

module.exports = new MailService();