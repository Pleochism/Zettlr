/* eslint-disable */
/* global CodeMirror define */
// This plugin renders Bear-style heading indicators

(function (mod) {
  if (typeof exports === 'object' && typeof module === 'object') { // CommonJS
    mod(require('codemirror/lib/codemirror'))
  } else if (typeof define === 'function' && define.amd) { // AMD
    define(['codemirror/lib/codemirror'], mod)
  } else { // Plain browser env
    mod(CodeMirror)
  }
})(function (CodeMirror) {
  'use strict'

var colourArray = [
    "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#0d5ac1" ,
    "#f205e6" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
    "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
    "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635", "#b11573" ,"#4bb473" ,"#75d89e" ,
    "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f", "#ca4751" ,"#7e50a8" ,
    "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0",
    "#935b6d" ,"#916988" ,"#513d98", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#cb5bea", "#ac3e1b", "#df514a",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#48b41b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#986b53", "#983f7a", "#ea24a3",
    "#79352c", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#983f7a", "#ea24a3",
    "#79352c", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#64820f", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#ef6e3c", "#243eeb", "#dd93fd",
    "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#cb2582",
    "#32d5d6", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#96e591", "#21d52e", "#d00043",
    "#b47162", "#947002", "#bde052",
    "#28fcfd", "#36486a", "#d02e29", "#1ae6db",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#30cc49",
    "#3d6751", "#640fc1", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c",
    "#b46238", "#2dfff6", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101",
    "#71b1f4", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#2d7d2a", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#b2c24f", "#de73c2", "#d70a9c",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"];

function getForegroundColour(c) {
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);

  var sum = Math.round(((r * 299) + (g * 587) + (b * 114)) / 1000);
  return (sum > 128) ? 'black' : 'white';
}


  CodeMirror.commands.markdownRenderAtTags = function (cm) {
    let match

    const indentSize = cm.getOption('indentUnit')
    var headRE = new RegExp(`^((\\s{${indentSize}})*)(@[A-Za-z0-9]+)\\s([^\\n]+)$`, "g")

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown-zkn') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let cursor = cm.getCursor('from')
	  let curFrom = { line: i, ch: match.index }
      let curTo = { line: i, ch: match.index + match[0].length }

      if (cursor.line === curFrom.line && cursor.ch >= curFrom.ch && cursor.ch <= curTo.ch) {
        // We're directly in the formatting so don't render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) {
        continue
      }

      let wrapper = document.createElement('span')
      wrapper.textContent = match[1].slice(0, -indentSize);
      let tag = document.createElement('span')
      const name = match[match.length - 2].trim();

      // Choose a colour based in the name
      let int = 0;
      for(let i = 0; i < name.length; i++)
        int += name.charCodeAt(i);
      const colour = colourArray[int % colourArray.length];

      tag.className = 'at-tag'
      tag.textContent = name + ' '.repeat(Math.max(0, indentSize - name.length));
      tag.style = `color: ${colour} !important;`;
      wrapper.appendChild(tag)

      let rest = document.createElement('span')
      rest.textContent = match[match.length - 1].trimEnd()
      rest.className = 'cm-person'
      wrapper.appendChild(rest)

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': wrapper,
          'inclusiveLeft': false,
          'inclusiveRight': true
        }
      )

      wrapper.onclick = (e) => {
        e.stopPropagation();
        textMarker.clear()
		let cc = cm.coordsChar({ 'left': e.clientX, 'top': e.clientY })
		cc.ch += name.length + 1;
        cm.setCursor(cc)
        cm.focus()
      }
    }
  }

  CodeMirror.commands.markdownRenderListTags = function (cm) {
    let match

    const indentSize = cm.getOption('indentUnit')
    var headRE2 = new RegExp(`^((\\s{${indentSize}})*)(\\*|\\/\\/)\\s([^\\n]*)$`, "g")

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown-zkn') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE2.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i);
      if ((match = headRE2.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = cm.getCursor('from')
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      if (curFrom.line === i && curTo.ch >= curFrom.ch && curFrom.ch <= curTo.ch) {
        // We're directly in the formatting so don't render.
        continue
      }

      curFrom = { 'line': i, 'ch': match.index }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) {
        continue
      }

      let wrapper = document.createElement('span')
      wrapper.textContent = match[1]
      let arrow = document.createElement('span')
      arrow.textContent = '✱';
      arrow.style = 'display: inline-block; width: 1em; text-indent: -3px;color: orange;';
      wrapper.appendChild(arrow);
      let tag = document.createElement('span')
      tag.className = 'branch-tag'
      tag.textContent = match[match.length - 1]
      //tag.style = 'margin-left: 1em;'
      wrapper.appendChild(tag)

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': wrapper,
          'inclusiveLeft': false,
          'inclusiveRight': true
        }
      )

      wrapper.onclick = (e) => {
        e.stopPropagation();
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  CodeMirror.commands.markdownRenderActions = function (cm) {
    let match

    const indentSize = cm.getOption('indentUnit')
    var headRE3 = new RegExp(`^((\\s{${indentSize}})*)([>$~])( [^\\n]+)$`, "g")

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown-zkn') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE3.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE3.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = cm.getCursor('from')
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      if (curFrom.line === i && curTo.ch >= curFrom.ch && curFrom.ch <= curTo.ch) {
        // We're directly in the formatting so don't render.
        continue
      }

      curFrom = { 'line': i, 'ch': match.index }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) {
        continue
      }

      let tag = document.createElement('span')
      const indent = match[1]

      if (match[match.length - 2] === '>') {
        // If it's a hash, we're linking to another heading
        tag.className = 'dialogue-heading-tag'
        tag.textContent = indent + '➜' + match[match.length - 1]
      } else if (match[match.length - 2] === '$') {
        // If it's a bracket, we're running a command
        tag.className = 'dialogue-command-tag'
        tag.textContent = indent + '⊕' + match[match.length - 1]
      } else if (match[match.length - 2] === '~') {
        // If it's a tilde, it's a call commamd
        tag.className = 'dialogue-call-tag'
        tag.textContent = indent + '⮡' + match[match.length - 1]
      }

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': tag,
          'inclusiveLeft': false,
          'inclusiveRight': true
        }
      )

      tag.onclick = (e) => {
        e.stopPropagation();
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  var headRE4 = /^-{4,}$/g

  CodeMirror.commands.markdownRenderHrTags = function (cm) {
    let match

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown-zkn') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE4.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE4.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = cm.getCursor('from')
      let curTo = { 'line': i, 'ch': match.index + line.length }

      if (curFrom.line === i && curTo.ch >= curFrom.ch && curFrom.ch <= curTo.ch) {
        // We're directly in the formatting so don't render.
        continue
      }

      curFrom = { 'line': i, 'ch': match.index }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) {
        continue
      }

      let aTag = document.createElement('hr')

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': aTag,
          'inclusiveLeft': false,
          'inclusiveRight': true
        }
      )

      aTag.onclick = (e) => {
        e.stopPropagation();
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  CodeMirror.commands.markdownRenderPlayerTags = function (cm) {
    let match

    const indentSize = cm.getOption('indentUnit')
    var headRE5 = new RegExp(`^((\\s{${indentSize}})*)([a-zA-Z0-9\\.\\-\\*\\(\\)\\{\\}\\"\\'][^\\n]+)$`, "g")

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown-zkn') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE5.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE5.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = cm.getCursor('from')
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      if (curFrom.line === i && curTo.ch >= curFrom.ch && curFrom.ch <= curTo.ch) {
        // We're directly in the formatting so don't render.
        continue
      }

      curFrom = { 'line': i, 'ch': match.index }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) {
        continue
      }

      if (!line.startsWith(' '.repeat(indentSize)))
        continue;

      // Check the indent level to determine if it really is a player tag
      var indent = (line.length - line.trimStart().length) / indentSize;
      var buffer;
      if (indent > 0) {
        // Figure out the current indentation level to know if this is a speaking character or narration
        var isPlayer = false;
        // Search backwards for a lower-level indentation, or a branch block identifier
        for (let j = i - 1; j > 0; j--) {
          let line2 = cm.getLine(j);
          let indent2 = (line2.length - line2.trimStart().length) / indentSize
          buffer = cm.getLine(j + 1);
          if (line2.trim() === "")
            continue;

          if (line2.trimStart().startsWith("* ") || line2.trimStart().startsWith("// ")) {
            // Indentation is optional for branches. If we hit a branch, check if the first line in it is indented. If not, treat the branch line as nonexistent.
            if (indent2 === (buffer.length - buffer.trimStart().length) / indentSize)
              continue;

            if (indent2 === indent - 2)
              isPlayer = true;
            break;
          }
          else if (line2.trimStart().startsWith("$") && line2.trimEnd().endsWith("?")) {
            // Indentation is optional for conditionals. If we hit a conditional, check if the first line in it is indented. If not, treat the conditional line as nonexistent.
            if (indent2 === (buffer.length - buffer.trimStart().length) / indentSize)
              continue;

            if (indent2 === indent - 2)
              isPlayer = true;
            break;
          }
          else if (line2.trimStart().startsWith("@")) {
            if (indent2 === indent)
              isPlayer = true;
            break;
          }
          else if ((/^(\s{4})*[a-zA-Z0-9\-\*\.\(\)\{\}\"\'][a-zA-Z0-9\-\*\.\s\(\)\{\}\"\']/gi).test(line2)) {
            if(indent2 === indent)
              continue;
            if (indent2 === indent - 1)
              isPlayer = true;
            break;
          }
        }

        if (!isPlayer)
          continue;
      }

      let wrapper = document.createElement('span')
      wrapper.textContent = match[1];
      let tag = document.createElement('span')

      tag.className = 'player-tag'
      tag.textContent = match[match.length - 1]
      wrapper.appendChild(tag);

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': wrapper,
          'inclusiveLeft': false,
          'inclusiveRight': true
        }
      )

      wrapper.onclick = (e) => {
        e.stopPropagation();
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }
})
