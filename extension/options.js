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
  document.getElementById('colors').appendChild(li);
}

function removeColor(event) {
  event.target.parentNode.remove();
}

function save() {
  var colors = Array.from(document.querySelectorAll('#colors span'))
                    .map(it => it.textContent);

  chrome.storage.sync.set({
    colors: colors
  });
}

function restore() {
  chrome.storage.sync.get({ colors: ReColor.CONFIG.MY_COLORS },
                          item => {
                            if (item.colors.length > 0)
                              item.colors.forEach(addColor);
                            else
                              ReColor.CONFIG.MY_COLORS.forEach(addColor);
                          });
}

document.getElementById('add').onclick = () =>
  addColor(document.getElementById('new-color').value);

document.getElementById('save').onclick = save;

restore();

