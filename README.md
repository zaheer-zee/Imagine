# DreamForge (Imagine) 🎨✨

An elegant, real-time AI image generation application powered by React, Vite, and the Hugging Face Inference API (Stable Diffusion XL). DreamForge provides a sleek, glassmorphic user interface to easily write prompts and instantly generate stunning AI art.

## Features
- **State-of-the-art Image Generation:** Uses `stable-diffusion-xl-base-1.0` to generate high-quality images.
- **Modern UI/UX:** A stunning dark-themed interface built using vanilla CSS with glassmorphism, responsive design, and smooth micro-animations.
- **Easy Download:** One-click downloads for your generated masterpieces.
- **Prior Generations Gallery:** Keeps track of images you've generated during your session.

## Technologies Used
- **Frontend Stack:** React, Vite
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **AI Integration:** Hugging Face Inference API (`fetch`)

## Prerequisites
To run this project locally, you will need:
- Node.js installed

You will also need a **Hugging Face API Token**:
1. Create an account at [Hugging Face](https://huggingface.co/).
2. Go to your settings and generate an Access Token (Read role is fine).

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zaheer-zee/Imagine.git
   cd Imagine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` (or create a new `.env` file) and add your token:
   ```env
   VITE_HF_API_TOKEN=your_hugging_face_token_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

## Deployment

This app is easily deployable to modern frontend hosting services like **Vercel** or **Netlify**. 

> **Important Security Note:** Because this is a purely client-side React application, any environment variable prefixed with `VITE_` (like your Hugging Face Token) will be exposed in the browser's bundle. Since Hugging Face tokens are tied to your account, deploying this app publicly means anyone inspecting the network tab could potentially see and use your token. 

If this is just a personal portfolio piece or a private app, it is fine! Just be mindful of sharing the public link.

---
*Built with ❤️.*
