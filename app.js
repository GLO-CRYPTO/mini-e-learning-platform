// Course data (prototype)
const courses = [
  {
    id: 'graphics',
    title: 'Graphics',
    description: 'Learn the fundamentals of graphic design: color, typography, and layout.',
    lessons: [
      { id: 'g-1', title: 'Color Theory Basics' },
      { id: 'g-2', title: 'Typography Principles' },
      { id: 'g-3', title: 'Layout and Composition' },
      { id: 'g-4', title: 'Practical Project: Poster' }
    ]
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    description: 'Analyze data using descriptive statistics, visualization, and simple modeling.',
    lessons: [
      { id: 'd-1', title: 'Intro to Analytics' },
      { id: 'd-2', title: 'Data Cleaning Essentials' },
      { id: 'd-3', title: 'Exploratory Visualization' },
      { id: 'd-4', title: 'Descriptive Statistics' },
      { id: 'd-5', title: 'Mini Case Study' }
    ]
  },
  {
    id: 'writing',
    title: 'Writing',
    description: 'Improve clarity, structure, and style across different writing formats.',
    lessons: [
      { id: 'w-1', title: 'Clarity and Concision' },
      { id: 'w-2', title: 'Structuring Arguments' },
      { id: 'w-3', title: 'Voice and Style' },
      { id: 'w-4', title: 'Editing Workshop' }
    ]
  }
];

// Storage helpers
const STORAGE_KEY = 'mini-elearn-progress-v1';
function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (e) {
    return {};
  }
}
function writeProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
function getCourseState(courseId) {
  const state = readProgress();
  const courseState = state[courseId] || { completedLessons: [], isCompleted: false };
  return { state, courseState };
}
function setCourseState(courseId, updater) {
  const { state, courseState } = getCourseState(courseId);
  const next = updater(courseState);
  state[courseId] = next;
  writeProgress(state);
  return next;
}

// Router
const routes = {
  '/': renderHome,
  '/course/:id': renderCourseDetail
};

function parseLocation() {
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#/, '');
  return path;
}

function matchRoute(path) {
  if (path === '/') return { handler: routes['/'], params: {} };
  const match = path.match(/^\/course\/([^\/]+)$/);
  if (match) return { handler: routes['/course/:id'], params: { id: decodeURIComponent(match[1]) } };
  return { handler: renderNotFound, params: {} };
}

function navigateTo(path) {
  window.location.hash = `#${path}`;
}

function render() {
  const path = parseLocation();
  const { handler, params } = matchRoute(path);
  handler(params);
}

// UI helpers
function percent(n) {
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function progressFor(course) {
  const { courseState } = getCourseState(course.id);
  const total = course.lessons.length;
  const done = new Set(courseState.completedLessons || []).size;
  const p = total > 0 ? (done / total) * 100 : 0;
  return { total, done, p: percent(p), isCompleted: !!courseState.isCompleted };
}

function buttonBase(extra = '') {
  return `inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 ${extra}`;
}

function secondaryButton(extra = '') {
  return `inline-flex items-center justify-center px-4 py-2 rounded-md font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 hover:-translate-y-0.5 ${extra}`;
}

// Views
function renderHome() {
  const app = document.getElementById('app');
  const cards = courses.map((course) => {
    const prog = progressFor(course);
    const progressBar = `
      <div class="mt-4">
        <div class="flex items-center justify-between text-xs text-slate-600">
          <span>${prog.done}/${prog.total} lessons</span>
          <span>${prog.p}%</span>
        </div>
        <div class="mt-1 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div class="h-full bg-brand-600 transition-all" style="width: ${prog.p}%"></div>
        </div>
      </div>`;
    return `
      <article class="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <h3 class="text-lg font-semibold text-slate-900 group-hover:text-slate-950">${course.title}</h3>
        <p class="mt-1 text-sm text-slate-600">${course.description}</p>
        ${progressBar}
        <div class="mt-5 flex items-center gap-3">
          <button class="${buttonBase()}" data-nav="/course/${encodeURIComponent(course.id)}">View course</button>
          ${prog.isCompleted ? `<span class="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>` : ''}
        </div>
      </article>`;
  }).join('');

  app.innerHTML = `
    <section>
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Courses</h1>
          <p class="mt-1 text-slate-600">Start learning: Graphics, Data Analytics, and Writing.</p>
        </div>
        <button class="${secondaryButton()}" id="resetProgressBtn" title="Reset all progress">Reset progress</button>
      </div>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        ${cards}
      </div>
    </section>`;

  // Events
  app.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const path = el.getAttribute('data-nav');
      if (path) navigateTo(path);
    });
  });
  const resetBtn = document.getElementById('resetProgressBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      render();
    });
  }
}

function renderCourseDetail(params) {
  const app = document.getElementById('app');
  const course = courses.find((c) => c.id === params.id);
  if (!course) return renderNotFound();

  const prog = progressFor(course);
  const lessonsHtml = course.lessons.map((lesson) => {
    const { courseState } = getCourseState(course.id);
    const isDone = new Set(courseState.completedLessons).has(lesson.id);
    return `
      <li class="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div class="flex items-center gap-3">
          <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" data-lesson-id="${lesson.id}" ${isDone ? 'checked' : ''} />
          <span class="text-sm md:text-base ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}">${lesson.title}</span>
        </div>
      </li>`;
  }).join('');

  app.innerHTML = `
    <section>
      <div class="flex items-start justify-between gap-4">
        <div>
          <button class="${secondaryButton('text-sm')}" data-nav="/">← Back</button>
          <h1 class="mt-3 text-2xl md:text-3xl font-bold tracking-tight">${course.title}</h1>
          <p class="mt-1 text-slate-600">${course.description}</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-slate-600">${prog.done}/${prog.total} lessons • ${prog.p}%</div>
          <div class="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden w-48">
            <div class="h-full bg-brand-600 transition-all" style="width: ${prog.p}%"></div>
          </div>
          <button id="completeCourseBtn" class="${buttonBase('mt-4 w-full')}" ${prog.isCompleted ? 'disabled' : ''}>${prog.isCompleted ? 'Course completed' : 'Mark course as completed'}</button>
        </div>
      </div>

      <ul class="mt-8 space-y-3">
        ${lessonsHtml}
      </ul>
    </section>`;

  // Events
  app.querySelector('[data-nav]')?.addEventListener('click', () => navigateTo('/'));

  app.querySelectorAll('input[type="checkbox"][data-lesson-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const lessonId = checkbox.getAttribute('data-lesson-id');
      setCourseState(course.id, (prev) => {
        const set = new Set(prev.completedLessons || []);
        if (checkbox.checked) set.add(lessonId);
        else set.delete(lessonId);
        const newCompleted = Array.from(set);
        const isCompletedNow = newCompleted.length >= course.lessons.length ? true : prev.isCompleted;
        return { completedLessons: newCompleted, isCompleted: isCompletedNow };
      });
      render();
    });
  });

  const completeBtn = document.getElementById('completeCourseBtn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      setCourseState(course.id, () => ({
        completedLessons: course.lessons.map((l) => l.id),
        isCompleted: true
      }));
      render();
    });
  }
}

function renderNotFound() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="text-center py-16">
      <h1 class="text-2xl font-semibold">Page not found</h1>
      <p class="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <button class="${buttonBase('mt-6')}" data-nav="/">Go home</button>
    </section>`;
  app.querySelector('[data-nav]')?.addEventListener('click', () => navigateTo('/'));
}

// Init
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) navigateTo('/');
  render();
});

