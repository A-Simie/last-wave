import type { DialogueDefinition } from '../systems/DialogueSystem';

export const GUIDE_DIALOGUE = {
    id: 'foundation-guide',
    speaker: 'Guide',
    start: 'greeting',
    nodes: {
        greeting: {
            text: 'Welcome to the test area. What would you like to try?',
            choices: [
                { id: 'movement', label: 'How do I move around?', next: 'movement' },
                { id: 'signal', label: 'What should I investigate?', next: 'signal' },
                { id: 'goodbye', label: 'I will explore on my own.', next: null }
            ]
        },
        movement: {
            text: 'Use WASD to walk, Shift to sprint, and Space to jump. Move the mouse to look around.\n\nOn touch screens, drag on the left to move and on the right to look. Drag farther to sprint; double-tap on the right to jump.',
            choices: [
                { id: 'back', label: 'I have another question.', next: 'greeting' },
                { id: 'goodbye', label: 'Thanks. I am ready to explore.', next: null }
            ]
        },
        signal: {
            text: 'Try the amber signal box in front of me. Get close with a clear view, then press E or tap the interaction button. A confirmation message will show that you checked it.',
            choices: [
                { id: 'back', label: 'I have another question.', next: 'greeting' },
                { id: 'goodbye', label: 'I will check the signal box.', next: null }
            ]
        }
    }
} satisfies DialogueDefinition;
