# DigiTantra — The Future of Tech Education

![DigiTantra UI Screenshot](https://images.unsplash.com/photo-1616191637151-2eb45284f27b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkaWdpdGFsJTIwbGFuZHNjYXBlfGVufDB8fHx8MTc2MTYyMjY3NXww&ixlib=rb-4.1.0&q=80&w=1080)

DigiTantra is a modern, AI-powered online learning platform designed to showcase the future of tech education. Built with a sophisticated stack including Next.js, Firebase, and Google's Generative AI (Genkit), this project features a futuristic glassmorphic UI, dynamic 3D animations, and powerful AI-driven functionalities.

---

## ✨ Key Features

-   **🤖 Generative AI Content Creation:** A server-side Genkit flow that leverages Google's AI models to generate complete, high-quality blog posts from a single user-provided topic.
-   **🔮 Dynamic 3D Animated Backgrounds:** Immersive, page-specific 3D animations built with `three.js` and `@react-three/fiber` to create a futuristic and engaging user experience.
-   **🔐 Secure User Authentication:** Full user management (sign-up/login) implemented with Firebase Authentication, ensuring secure and scalable access control.
-   **💬 Conversational AI Chatbot ("AI Saarthi"):** An interactive front-end chatbot powered by Google AI that delivers context-aware responses to user queries, providing instant assistance.
-   **💎 Modern Glassmorphic UI/UX:** A sleek, fully responsive interface built with Next.js, ShadCN UI, and Tailwind CSS, featuring a dark theme, neon-glow effects, and a glassmorphic design for a cutting-edge aesthetic.
-   **📊 Interactive Data Visualization Dashboard:** An analytics dashboard using Recharts to display platform metrics and key performance indicators with visually appealing charts.

---

## 🛠️ Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
-   **UI Components:** [React](https://react.dev/) 18, [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI:** [Google AI](https://ai.google/) via [Genkit](https://firebase.google.com/docs/genkit)
-   **3D Graphics:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction), [@react-three/drei](https://github.com/pmndrs/drei)
-   **Authentication & Database:** [Firebase Authentication](https://firebase.google.com/docs/auth), [Firestore](https://firebase.google.com/docs/firestore)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Deployment:** Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/en) (v18 or later recommended)
-   `npm` or `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Firebase and Google AI credentials. You can get these from your Firebase project settings and Google AI Studio.

    ```env
    # Firebase Configuration (from your Firebase project)
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    # ... and so on for the rest of your firebaseConfig object.

    # Google AI API Key (for Genkit)
    GEMINI_API_KEY="AIza..."
    ```
    *Note: For a more secure setup, it is recommended to use the Firebase and Genkit SDKs' automatic initialization when deployed to Firebase App Hosting, which removes the need to hardcode keys.*


4.  **Run the Genkit Development Server:**
    In a separate terminal, start the Genkit development server to enable the AI features.

    ```bash
    npm run genkit:watch
    ```

5.  **Run the Development Server:**
    In your main terminal, start the Next.js development server.
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

---

This project was bootstrapped and developed in **Firebase Studio**.
