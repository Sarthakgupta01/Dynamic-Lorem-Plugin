// code.js
figma.showUI(__html__, { width: 350, height: 400 });

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
