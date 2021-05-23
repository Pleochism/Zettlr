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

  var headRE = /^(\s{8})*(@[A-Za-z0-9]+)( .+)$/g

  CodeMirror.commands.markdownRenderAtTags = function (cm) {
    let match

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = { 'line': i, 'ch': match.index }
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      let cur = cm.getCursor('from')
      if (cur.line === curFrom.line && cur.ch >= curFrom.ch && cur.ch <= curTo.ch) {
        // Cursor is in selection: Do not render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) continue

      let aWrapper = document.createElement('span')
      let atTag = document.createElement('span')
      const indent = match[0].split(match[match.length - 2])[0]
      atTag.className = 'at-tag'
      atTag.textContent = match[match.length - 2] + indent.slice(match[match.length - 2].length + Math.ceil(indent.slice(match[match.length - 2].length).length / 8)).split('').map(x => ' ').join('')
      if (atTag.textContent.trim() === '@me') {
        atTag.className += ' me-tag'
      }
      aWrapper.appendChild(atTag)

      let rest = document.createElement('span')
      rest.textContent = match[match.length - 1].trim()
      rest.className = 'cm-comment cm-person'
      rest.style = 'padding-left: 6px; border-bottom-left-radius: 4px; border-top-left-radius: 4px;'
      aWrapper.appendChild(rest)

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': aWrapper,
          'inclusiveLeft': false,
          'inclusiveRight': false
        }
      )

      aWrapper.onclick = (e) => {
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  var headRE2 = /^(\s{4})*(\*)( .+)$/g

  CodeMirror.commands.markdownRenderListTags = function (cm) {
    let match

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE2.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE2.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = { 'line': i, 'ch': match.index }
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      let cur = cm.getCursor('from')
      if (cur.line === curFrom.line && cur.ch >= curFrom.ch && cur.ch <= curTo.ch) {
        // Cursor is in selection: Do not render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) continue

      let tag = document.createElement('span')
      const indent = match[0].split('*')[0]
      tag.className = 'dialogue-tag'
      tag.textContent = indent + '●' + match[match.length - 1]

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': tag,
          'inclusiveLeft': false,
          'inclusiveRight': false
        }
      )

      tag.onclick = (e) => {
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  var headRE3 = /^(\s{4})*([>$~])( .+)$/g

  CodeMirror.commands.markdownRenderListSubtags = function (cm) {
    let match

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE3.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE3.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = { 'line': i, 'ch': match.index }
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      let cur = cm.getCursor('from')
      if (cur.line === curFrom.line && cur.ch >= curFrom.ch && cur.ch <= curTo.ch) {
        // Cursor is in selection: Do not render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) continue

      let tag = document.createElement('span')
      const indent = match[0].split(match[match.length - 2])[0]

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
          'inclusiveRight': false
        }
      )

      tag.onclick = (e) => {
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
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE4.lastIndex = 0

      // First get the line and test if the contents contain an @
      let line = cm.getLine(i)
      if ((match = headRE4.exec(line)) == null) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = { 'line': i, 'ch': match.index }
      let curTo = { 'line': i, 'ch': match.index + line.length }

      let cur = cm.getCursor('from')
      if (cur.line === curFrom.line && cur.ch >= curFrom.ch && cur.ch <= curTo.ch) {
        // Cursor is in selection: Do not render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) continue

      let aTag = document.createElement('hr')

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': aTag,
          'inclusiveLeft': false,
          'inclusiveRight': false
        }
      )

      aTag.onclick = (e) => {
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }

  /*
  var headRE5 = /^(\s{4})*([^*>~\-$#].+)$/g

  CodeMirror.commands.markdownRenderNarrationTags = function (cm) {
    let match

    // We'll only render the viewport
    const viewport = cm.getViewport()
    for (let i = viewport.from; i < viewport.to; i++) {
      if (cm.getModeAt({ 'line': i, 'ch': 0 }).name !== 'markdown') continue
      // Always reset lastIndex property, because test()-ing on regular
      // expressions advances it.
      headRE5.lastIndex = 0

      // First get the line and test if the contents match
      let line = cm.getLine(i)
      if ((match = headRE5.exec(line)) == null) {
        continue
      }

      console.log(match, match[0].split('    ').length)

      // Now check if the indentation offset matches the requirement (must be an even number of 4's)
      if (match[0].split('    ').length % 2 === 0) {
        continue
      }

      // Now get the precise beginning of the match and its end
      let curFrom = { 'line': i, 'ch': match.index }
      let curTo = { 'line': i, 'ch': match.index + match[0].length }

      let cur = cm.getCursor('from')
      if (cur.line === curFrom.line && cur.ch >= curFrom.ch && cur.ch <= curTo.ch) {
        // Cursor is in selection: Do not render.
        continue
      }

      // We can only have one marker at any given position at any given time
      if (cm.findMarks(curFrom, curTo).length > 0) continue

      let tag = document.createElement('span')
      const indent = match[0].split(match[match.length - 1])[0]
      tag.className = 'narration-tag'
      tag.textContent = indent + match[match.length - 1]

      let textMarker = cm.markText(
        curFrom, curTo,
        {
          'clearOnEnter': true,
          'replacedWith': tag,
          'inclusiveLeft': false,
          'inclusiveRight': false
        }
      )

      tag.onclick = (e) => {
        textMarker.clear()
        cm.setCursor(cm.coordsChar({ 'left': e.clientX, 'top': e.clientY }))
        cm.focus()
      }
    }
  }
  */
})
