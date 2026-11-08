import type { EntryLesson } from '../episodes/episode-01/entry';

export class TutorialPanel {
    private readonly root = document.createElement('dialog');
    private readonly events = new AbortController();
    private lesson: EntryLesson | null = null;

    constructor(onPractise: (id: EntryLesson['id']) => void) {
        this.root.id = 'street-instructions';
        this.root.className = 'tutorial-panel';
        this.root.setAttribute('aria-labelledby', 'lesson-title');
        this.root.setAttribute('aria-describedby', 'lesson-text');
        this.root.innerHTML = `
            <p class="eyebrow">On the way to the beach</p>
            <h2 id="lesson-title"></h2>
            <p id="lesson-text"></p>
            <p class="lesson-controls desktop-controls" data-lesson-desktop></p>
            <p class="lesson-controls touch-controls" data-lesson-touch></p>
            <button type="button" data-lesson-practise>Try it</button>
        `;
        const practise = () => {
            if (this.lesson) onPractise(this.lesson.id);
        };
        const options = { signal: this.events.signal };
        this.root.querySelector('[data-lesson-practise]')!.addEventListener('click', practise, options);
        this.root.addEventListener(
            'cancel',
            (event) => {
                event.preventDefault();
                practise();
            },
            options
        );
        this.root.addEventListener(
            'keydown',
            (event) => {
                if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
            },
            options
        );
        document.body.append(this.root);
    }

    render(lesson: EntryLesson | null) {
        this.lesson = lesson;
        if (!lesson) {
            this.root.close();
            return;
        }
        this.root.dataset.lesson = lesson.id;
        this.root.querySelector('#lesson-title')!.textContent = lesson.title;
        this.root.querySelector('#lesson-text')!.textContent = lesson.text;
        this.root.querySelector('[data-lesson-desktop]')!.textContent = lesson.desktop;
        this.root.querySelector('[data-lesson-touch]')!.textContent = lesson.touch;
        if (!this.root.open) this.root.showModal();
        this.root.querySelector<HTMLButtonElement>('[data-lesson-practise]')!.focus({ preventScroll: true });
    }

    destroy() {
        this.events.abort();
        this.root.close();
        this.root.remove();
    }
}
