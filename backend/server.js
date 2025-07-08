require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Augmenter la limite pour la taille du PDF en base64
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Route pour l'envoi de PDF
app.post('/api/send-pdf', async (req, res) => {
    const { email, pdf } = req.body;

    if (!email || !pdf) {
        return res.status(400).json({ message: 'Email et PDF sont requis.' });
    }

    // Configuration du transporteur Nodemailer
    // IMPORTANT : Remplacez les valeurs ci-dessous par vos propres informations.
    // Utilisez les variables d'environnement pour la sécurité.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // ex: 'smtp.office365.com' pour Outlook
        port: process.env.SMTP_PORT, // ex: 587
        secure: false, // true pour le port 465, false pour les autres
        auth: {
            user: process.env.SMTP_USER, // Votre adresse e-mail
            pass: process.env.SMTP_PASS, // Votre mot de passe d'application
        },
    });

    // Options de l'e-mail
    const mailOptions = {
        from: `"Simulateur Beyond Avocats" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Votre simulation de mécénat personnalisée',
        html: `
            <p>Bonjour,</p>
            <p>Veuillez trouver en pièce jointe votre simulation de réduction d'impôt pour le mécénat.</p>
            <p>Ce document a été généré via le simulateur de Beyond Avocats.</p>
            <br>
            <p>Cordialement,</p>
            <p><strong>L'équipe de Beyond Avocats</strong></p>
        `,
        attachments: [
            {
                filename: 'simulation-mecenat.pdf',
                content: pdf,
                encoding: 'base64',
                contentType: 'application/pdf',
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'E-mail envoyé avec succès !' });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail." });
    }
});

// Rediriger toutes les autres requêtes vers l'index.html pour que le routing côté client fonctionne
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
