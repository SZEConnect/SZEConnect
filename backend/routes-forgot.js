import express from "express";
import bcrypt from "bcrypt";
import pool from "./database.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Email küldő beállítás
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ideiglenes jelszó generálása
function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

// POST /api/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ msg: "Email cím megadása kötelező." });

  try {
    // 1) Megnézzük, létezik-e user
    const userQuery = await pool.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      // Biztonsági ok: nem áruljuk el, ha nincs ilyen email
      return res.status(200).json({
        msg: "Ha van ilyen fiók, elküldtük a jelszót."
      });
    }

    const userId = userQuery.rows[0].id;

    // 2) Generálunk egy új jelszót
    const newPassword = generatePassword(10);

    // 3) Bcrypt hash létrehozása
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4) DB frissítése
    await pool.query(
      `
      UPDATE users
      SET password_hash = $1,
          updated_at = NOW()
      WHERE id = $2
    `,
      [hashedPassword, userId]
    );

    // 5) Email kiküldése
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Új jelszavad",
      text: `Az új jelszavad:

${newPassword}

Ezzel most már be tudsz jelentkezni. Belépés után érdemes módosítani a profil oldalon.`
    });

    return res.status(200).json({
      msg: "Ha van ilyen fiók, elküldtük az új jelszót."
    });

  } catch (err) {
    console.error("forgot-password error:", err);
    return res.status(500).json({ msg: "Szerverhiba történt." });
  }
});

export default router;

