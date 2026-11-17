/* Admin panel – CRUD for questions */

const $ = (sel) => document.querySelector(sel);

function buildAnswerInputs() {
  const grid = $('#answers-grid');
  grid.innerHTML = `
    <div class="header">Answer text</div>
    <div class="header">Points</div>
  `;

  for (let i = 0; i < 8; i++) {
    grid.innerHTML += `
      <div class="answer-row">
        <input type="text" id="answer-${i}" placeholder="Answer ${i + 1}" />
        <input type="number" id="points-${i}" placeholder="0" min="0" max="100" />
      </div>
    `;
  }
}

function clearForm() {
  $('#question-id').value = '';
  $('#question-text').value = '';
  for (let i = 0; i < 8; i++) {
    $(`#answer-${i}`).value = '';
    $(`#points-${i}`).value = '';
  }
  $('#save-btn').textContent = 'Save Question';
  $('#cancel-btn').style.display = 'none';
}

function fillForm(q) {
  $('#question-id').value = q.id;
  $('#question-text').value = q.question;

  for (let i = 0; i < 8; i++) {
    $(`#answer-${i}`).value = q.answers[i] || '';
    $(`#points-${i}`).value = q.points[i] || '';
  }

  $('#save-btn').textContent = 'Update Question';
  $('#cancel-btn').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadQuestions() {
  const list = $('#questions-list');
  list.innerHTML = '<p class="empty">Loading...</p>';

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    $('#question-count').textContent = `(${data.length})`;

    if (!data || data.length === 0) {
      list.innerHTML = '<p class="empty">No questions yet. Add your first one above!</p>';
      return;
    }

    list.innerHTML = data.map(q => {
      const preview = (q.answers || [])
        .map((a, i) => a ? `${a} (${q.points[i] || 0})` : null)
        .filter(Boolean)
        .join(' · ');

      return `
        <div class="question-item" data-id="${q.id}">
          <div>
            <div class="q-text">${escapeHtml(q.question)}</div>
            <div class="answers-preview">${escapeHtml(preview)}</div>
          </div>
          <div class="actions">
            <button class="btn btn-edit" onclick="editQuestion('${q.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteQuestion('${q.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    list.innerHTML = `<p class="empty" style="color:#f87171">Error loading questions. Check your Supabase config and table.</p>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function saveQuestion(e) {
  e.preventDefault();

  const id = $('#question-id').value;
  const question = $('#question-text').value.trim();
  if (!question) return alert('Please enter a question');

  const answers = [];
  const points = [];

  for (let i = 0; i < 8; i++) {
    const a = $(`#answer-${i}`).value.trim();
    const p = parseInt($(`#points-${i}`).value) || 0;
    if (a) {
      answers.push(a);
      points.push(p);
    }
  }

  if (answers.length === 0) {
    return alert('Add at least one answer');
  }

  // Sort by points descending (classic Family Feud style)
  const combined = answers.map((a, i) => ({ a, p: points[i] }));
  combined.sort((x, y) => y.p - x.p);

  const payload = {
    question,
    answers: combined.map(c => c.a),
    points: combined.map(c => c.p)
  };

  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from('questions')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('questions')
        .insert([payload]);
      if (error) throw error;
    }

    clearForm();
    await loadQuestions();
  } catch (err) {
    console.error(err);
    alert('Error saving: ' + (err.message || err));
  }
}

async function editQuestion(id) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    fillForm(data);
  } catch (err) {
    alert('Could not load question');
  }
}

async function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;

  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await loadQuestions();
  } catch (err) {
    alert('Error deleting');
  }
}

// Make functions available to onclick
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;

// Init
buildAnswerInputs();
$('#question-form').addEventListener('submit', saveQuestion);
$('#cancel-btn').addEventListener('click', clearForm);
loadQuestions();
