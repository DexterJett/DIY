const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const roleCheck = require('./middleware/roleCheck');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Verbindung
mongoose.connect('mongodb://localhost:27017/diy_community', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB verbunden');
}).catch(err => {
  console.error('MongoDB Verbindungsfehler:', err);
});

// Beispiel-Route
app.get('/', (req, res) => {
  res.send('Willkommen zur DIY Community API');
});

// Weitere Routen und Logik hier hinzufügen
app.get('/', (req, res) => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    await user.save();
    res.status(201).send('Benutzer erfolgreich registriert');
  } catch (error) {
    res.status(400).send('Fehler bei der Registrierung');
  }
});

// Beispiel für die Login-Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Benutzer nicht gefunden' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

const secretKey = 'deinGeheimesSchlüsselwort';

// Beispiel für eine geschützte Route
app.get('/geschützter-endpunkt', authMiddleware, (req, res) => {
  res.send('Dies ist ein geschützter Endpunkt');
});

app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).send('Serverfehler');
  }
});

app.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Konfiguration für Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

app.post('/upload-profile-pic', authMiddleware, upload.single('profilePic'), (req, res) => {
  try {
    res.json({ filePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Hochladen des Bildes' });
  }
});

app.post('/link-youtube-video', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.body;
    // Hier könntest du die Video-ID in der Benutzerdatenbank speichern
    // Beispiel: user.youtubeVideos.push(videoId);
    res.status(200).json({ message: 'Video erfolgreich verknüpft' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Verknüpfen des Videos' });
  }
});

app.get('/admin-dashboard', authMiddleware, roleCheck('admin'), (req, res) => {
  res.send('Willkommen im Admin-Dashboard');
});
