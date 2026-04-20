let tasks = JSON.parse(localStorage.getItem('reminders-tasks') || '[]');

function save() {
  localStorage.setItem('reminders-tasks', JSON.stringify(tasks));
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const personInput = document.getElementById('personInput');
  const errorMsg = document.getElementById('errorMsg');

  const text = taskInput.value.trim();
  const person = personInput.value.trim();

  if (!text) {
    showError('Please enter a task description.');
    return;
  }
  if (!person) {
    showError('Please assign the task to someone.');
    return;
  }

  errorMsg.classList.add('hidden');

  tasks.push({
    id: Date.now(),
    text,
    person,
    done: false,
  });

  save();
  taskInput.value = '';
  personInput.value = '';
  taskInput.focus();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    save();
    renderTasks();
  }
}

function reassign(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const newPerson = prompt('Reassign to:', task.person);
  if (newPerson === null) return;
  const trimmed = newPerson.trim();
  if (!trimmed) return;
  task.person = trimmed;
  save();
  renderTasks();
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function getFilteredTasks() {
  const filter = document.getElementById('filterPerson').value;
  return filter ? tasks.filter(t => t.person === filter) : tasks;
}

function updateFilterDropdown() {
  const select = document.getElementById('filterPerson');
  const current = select.value;
  const people = [...new Set(tasks.map(t => t.person))].sort();

  select.innerHTML = '<option value="">Everyone</option>';
  people.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    if (p === current) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderTasks() {
  updateFilterDropdown();

  const list = document.getElementById('taskList');
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
    return;
  }

  list.innerHTML = filtered.map(task => `
    <div class="task-card ${task.done ? 'done' : ''}">
      <div class="task-check ${task.done ? 'checked' : ''}" onclick="toggleDone(${task.id})" title="Mark complete"></div>
      <div class="task-body">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <span class="task-assignee">${escapeHtml(task.person)}</span>
      </div>
      <div class="task-actions">
        <button class="btn-edit" onclick="reassign(${task.id})">Reassign</button>
        <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.getElementById('taskInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('personInput').focus();
});

document.getElementById('personInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

renderTasks();
