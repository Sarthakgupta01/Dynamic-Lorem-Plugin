// code.js
figma.showUI(__html__, { width: 300, height: 200 });

// Predefined text templates
const tones = {
    "Professional": [
        "Please complete the form below to proceed.",
        "Kindly review the attached document for details.",
        "Our team will get back to you shortly with a response."
    ],
    "Playful": [
        "Hey there! Tap the button and let’s get started 🚀",
        "Ready for some fun? Click here!",
        "Let’s do this! Adventure awaits 😎"
    ],
    "Marketing": [
        "Boost your sales with our latest solution today!",
        "Don’t miss out on our exclusive offer!",
        "Experience innovation like never before!"
    ]
};

figma.ui.onmessage = async msg => {
    if (msg.type === 'generate-text') {
        const nodes = figma.currentPage.selection;

        if (nodes.length === 0) {
            figma.notify("⚠️ Please select at least one text layer!");
            return;
        }

        const selectedTone = msg.tone;
        const textOptions = tones[selectedTone];

        if (!textOptions) {
            figma.notify("❌ Invalid tone selected!");
            return;
        }

        const randomText = textOptions[Math.floor(Math.random() * textOptions.length)];

        for (const node of nodes) {
            if (node.type === 'TEXT') {
                try {
                    // Load the font of the node before setting text
                    await figma.loadFontAsync(node.fontName);

                    // Now safe to set characters
                    node.characters = randomText;
                } catch (err) {
                    console.error("Font load failed:", err);
                    figma.notify("⚠️ Failed to load font for one text layer.");
                }
            }
        }

        figma.notify(`✅ Inserted ${selectedTone} text!`);
    }
};
