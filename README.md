# ✨ Space Interactive Christmas Tree

<div align="center">

A mesmerizing 3D interactive experience featuring a luxury gold and emerald Christmas tree that transforms between scattered particles and an elegant structured form, set against the cosmos.

[View Demo](#) • [Report Bug](https://github.com/zetanisthebest/space-christmas-tree/issues) • [Request Feature](https://github.com/zetanisthebest/space-christmas-tree/issues)

</div>

---

## 🎄 Features

- **Interactive 3D Morphing** - Watch particles dance between chaos and structure
- **Luxury Aesthetic** - Gold and emerald color palette with premium visual effects
- **Immersive Audio** - Synchronized Christmas music that evolves with the tree state
- **Space Environment** - Beautiful starfield background with ambient lighting
- **Smooth Animations** - Fluid transitions powered by React Three Fiber
- **Post-Processing Effects** - Bloom and depth-of-field for cinematic quality

## 🚀 Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **@react-three/postprocessing** - Post-processing effects
- **Vite** - Fast build tool

## 📦 Installation

**Prerequisites:** Node.js 16+ and npm

1. **Clone the repository**
   ```bash
   git clone https://github.com/zetanisthebest/space-christmas-tree.git
   cd space-christmas-tree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Christmas music** (optional)
   - Place your audio file at `public/christmas-music.mp3`
   - Or use the default provided

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🎮 Usage

- **Click anywhere** to toggle between scattered particles and tree form
- **Click the speaker icon** to toggle audio on/off
- The experience starts muted by default (browser autoplay policy)

## 📁 Project Structure

```
├── components/
│   ├── Scene.tsx           # Main 3D scene wrapper
│   ├── Foliage.tsx         # Particle system for tree
│   ├── Ornaments.tsx       # Decorative spheres
│   ├── Ribbon.tsx          # Animated ribbon effect
│   ├── UIOverlay.tsx       # UI controls
│   └── AudioController.tsx # Audio management
├── utils/
│   └── math.ts            # Mathematical utilities
├── public/                # Static assets
├── App.tsx                # Main application
└── types.ts               # TypeScript definitions
```

## 🎨 Customization

### Colors
Edit the color palette in `components/Foliage.tsx` and `components/Ornaments.tsx`:
```tsx
const GOLD_COLOR = new THREE.Color(0xFFD700);
const EMERALD_COLOR = new THREE.Color(0x50C878);
```

### Audio
Replace `public/christmas-music.mp3` with your preferred track, or modify the audio URLs in `App.tsx`.

### Particle Count
Adjust the number of particles in `components/Foliage.tsx`:
```tsx
const PARTICLE_COUNT = 3000; // Increase for denser foliage
```

## 🏗️ Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🌐 Deployment

Deploy easily to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

## 📝 License

MIT © zetanisthebest

## 🙏 Acknowledgments

- Created with inspiration from holiday magic and cosmic wonder
- Built with React Three Fiber community resources
- Music: [Add your music credits here]

---

<div align="center">
Made with ❤️ and ✨ for the holiday season
</div>
