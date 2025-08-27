// code.js
figma.showUI(__html__, { width: 350, height: 400 });

// Predefined text templates
const tones = {
    "Professional": [
        "Please complete the form below to proceed.",
        "Kindly review the attached document for details.",
        "Our team will get back to you shortly with a response.",
        "Ensure all required fields are filled correctly before submission.",
        "We appreciate your prompt attention to this matter.",
        "This document contains important guidelines that should be followed.",
        "Your timely feedback will help us improve our services.",
        "Please adhere to the outlined protocols when responding.",
        "We are committed to providing you with accurate information.",
        "Thank you for your cooperation and understanding."
    ],
    "Playful": [
        "Hey there! Tap the button and let’s get started 🚀",
        "Ready for some fun? Click here!",
        "Let’s do this! Adventure awaits 😎",
        "Who’s ready for some excitement? Let’s go!",
        "Time to make things happen — join the fun!",
        "Feeling adventurous today? Let’s dive in!",
        "Click, play, repeat — your journey starts here!",
        "Surprise! You’re about to unlock something cool!",
        "Let’s turn boredom into a fun experience!",
        "High five! You’re one step closer to awesome!"
    ],
    "Marketing": [
        "Boost your sales with our latest solution today!",
        "Don’t miss out on our exclusive offer!",
        "Experience innovation like never before!",
        "Unlock premium benefits with our latest deal!",
        "Transform your workflow with our cutting-edge tools!",
        "Limited-time offer — grab it before it’s gone!",
        "Discover the future of efficiency and growth!",
        "Act now and enjoy unmatched value today!",
        "Upgrade your experience with our new features!",
        "Be the first to experience our revolutionary product!"
    ],
    "Casual": [
        "Hey! Let’s get this done.",
        "No worries, we’ve got you covered 😎",
        "Quick heads up: you’re all set to start!",
        "Catch you later if you’re busy!",
        "Just a friendly reminder to check this out.",
        "Take it easy — we’ll handle the rest.",
        "Feeling good today? Let’s make it happen!",
        "Don’t sweat it, we’ll sort everything.",
        "Grab a coffee and let’s do this together.",
        "Everything’s under control — you got this!"
    ],
    "Inspirational": [
        "Believe in yourself and all that you are.",
        "Every small step counts toward greatness.",
        "Stay positive and keep pushing forward.",
        "Challenges are opportunities in disguise.",
        "Your hard work will pay off in the end.",
        "Dream big, start small, act now.",
        "Success is a journey, not a destination.",
        "Push your limits and embrace growth.",
        "Consistency is the key to mastery.",
        "Make today count — future you will thank you."
    ],
    "Friendly": [
        "Hey buddy! How’s it going?",
        "Just checking in — hope everything’s cool!",
        "Can’t wait to see what you think about this!",
        "Hi there! Let’s tackle this together.",
        "Good news! Here’s something you’ll like.",
        "Friendly reminder: you’re awesome!",
        "Let’s make this simple and fun.",
        "Here’s a tip that might help you today.",
        "Hope this brings a smile to your face!",
        "Let’s make things happen, one step at a time."
    ],
    "Humorous": [
        "Why did the chicken click this? To see more fun!",
        "Keep calm and pretend this is easy 😂",
        "Did someone say awesome? That’s you!",
        "Life’s short — generate some text and enjoy!",
        "Oops! Did I just generate brilliance?",
        "Warning: reading this may cause smiles 😎",
        "Hold onto your keyboard — fun incoming!",
        "I promise this is more exciting than it looks!",
        "Click wisely, young padawan — text awaits!",
        "Caution: May induce laughter and creativity."
    ],
    "Motivational": [
        "You can do this — keep moving forward.",
        "Small steps lead to big changes.",
        "Don’t wait for opportunity — create it.",
        "Stay focused, stay strong, keep going.",
        "Your effort today builds your success tomorrow.",
        "Challenges are fuel for growth.",
        "Never underestimate your own potential.",
        "Push past fear and embrace the journey.",
        "Consistency beats intensity every time.",
        "Believe, act, achieve — repeat daily."
    ]
};

// Function to adjust text length
function adjustTextLength(text, targetWords) {
    let words = text.split(' ');
    if (words.length > targetWords) {
        return words.slice(0, targetWords).join(' ');
    } else {
        while (words.length < targetWords) {
            words = words.concat(words);
        }
        return words.slice(0, targetWords).join(' ');
    }
}

figma.ui.onmessage = async msg => {
    if (msg.type === 'generate-text') {
        const nodes = figma.currentPage.selection;

        if (nodes.length === 0) {
            figma.notify("⚠️ Please select at least one text layer!");
            return;
        }

        const selectedTone = msg.tone;
        const targetWords = msg.wordCount || 10;

        const textOptions = tones[selectedTone];
        if (!textOptions) {
            figma.notify("❌ Invalid tone selected!");
            return;
        }

        // Generate text and adjust length
        const baseText = textOptions[Math.floor(Math.random() * textOptions.length)];
        const finalText = adjustTextLength(baseText, targetWords);

        // Collect unique fonts
        const fontMap = {};
        for (const node of nodes) {
            if (node.type === 'TEXT') {
                const fontKey = JSON.stringify(node.fontName);
                fontMap[fontKey] = node.fontName;
            }
        }

        // Load all fonts once
        for (const font of Object.values(fontMap)) {
            try {
                await figma.loadFontAsync(font);
            } catch (e) {
                console.error("Font load failed:", e);
            }
        }

        // Set text preserving layout
        for (const node of nodes) {
            if (node.type === 'TEXT') {
                try {
                    const originalResize = node.textAutoResize;
                    node.characters = finalText;
                    node.textAutoResize = originalResize;
                } catch (err) {
                    console.error("Failed to set text:", err);
                    figma.notify("⚠️ Failed to set text for one text layer.");
                }
            }
        }

        figma.notify(`✅ Inserted ${selectedTone} text!`);

        // Send the generated text back to UI for copy panel
        figma.ui.postMessage({ type: 'show-generated', text: finalText });
    }
};
