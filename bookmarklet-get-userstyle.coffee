downloadFile = (file) ->
  blob = new Blob([file.text], { type: "text/plain" })
  link = document.createElement "a"
  link.href = window.URL.createObjectURL blob
  link.download = file.name
  document.body.appendChild link
  link.click()
  setTimeout((-> link.remove()), 1000)

getUserstyle = ->
  Array.from(document.querySelectorAll('#recolor > style'))
    .map (style) -> style.textContent
    .join "\n"

downloadFile { name: document.domain + '.userstyle.css', \
               text: getUserstyle()
             }

