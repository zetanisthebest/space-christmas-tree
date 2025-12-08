# ✨ Space Interactive Christmas Tree 🎄

<div align="center">

A mesmerizing 3D interactive experience featuring a luxury gold and emerald Christmas tree that transforms between scattered particles and an elegant structured form, set against the cosmos.

<img width="1302" height="647" alt="space christmas tree-thumbnail" src="https://github.com/user-attachments/assets/97399882-d788-417c-9f15-9239eff4abd0" />

[View Demo](https://space-christmas-tree.vercel.app/) • [Report Bug](https://github.com/zetanisthebest/space-christmas-tree/issues) • [Request Feature](https://github.com/zetanisthebest/space-christmas-tree/issues)

</div>

---

## 📦 Installation

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


## 🙏 Acknowledgments

- Created with inspiration from holiday magic and cosmic wonder
- Built with React Three Fiber community resources
- Music: Anson Seabra - Christmas List

---

<div align="center">
Made with ❤️ and ✨ for the holiday season
</div>
