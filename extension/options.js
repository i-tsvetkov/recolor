function addColor(color) {
  var li     = document.createElement('li');
  var div    = document.createElement('div');
  var span   = document.createElement('span');
  var remBtn = document.createElement('button');

  div.className = 'color-box';
  div.style.background = color;

  span.textContent = color;

  remBtn.className = 'remBtn';
  remBtn.textContent = 'remove';
  remBtn.onclick = removeColor;

  li.appendChild(div);
  li.appendChild(span);
  li.appendChild(remBtn);
  var list = document.getElementById('colors');
  list.insertBefore(li, list.firstChild);
}

function removeColor(event) {
  event.target.parentNode.remove();
}

function save() {
  var colors = Array.from(document.querySelectorAll('#colors span'))
                    .map(it => it.textContent);

  ReColor.CONFIG.MY_COLORS = colors;

  chrome.storage.local.set({
    config: ReColor.CONFIG
  });
}

function restore() {
  chrome.storage.local.get({ config: ReColor.CONFIG },
                          item => {
                            item.config.MY_COLORS.sort().forEach(addColor);
                          });
}

function loadTheme(file) {
  if (file.type !== 'application/json') {
    alert("File type not supported.");
    return;
  }

  var reader = new FileReader();

  reader.onload = function(event) {
    try {
      var config = JSON.parse(reader.result);
      Array.from(document.querySelectorAll('.remBtn')).forEach(b => b.click());
      config.MY_COLORS.sort().forEach(addColor);
      ReColor.CONFIG = config;
    }
    catch (e) {
      console.error(e);
      alert('Unable to parse the theme.');
    }
  };

  reader.readAsText(file);
}

document.getElementById('add').onclick = () =>
  addColor(document.getElementById('new-color').value);

document.getElementById('save').onclick = save;

document.getElementById('load').onclick = () => {
  var fileInput = document.getElementById('file-input');
  fileInput.value = '';
  fileInput.click();
};

document.getElementById('file-input').onchange = (e) =>
  loadTheme(e.target.files[0]);

restore();

