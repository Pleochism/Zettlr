/* global CodeMirror define */
/**
 * THIS IS A FORK OF ADDON/FOLD/MARKDOWN-FOLD
 *
 * See: https://codemirror.net/addon/fold/markdown-fold.js
 *
 * This is necessary, because our mode basically _is_
 * Markdown, but it can't be named as such.
 */

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

  CodeMirror.registerHelper('fold', 'markdown', function (cm, start) {
    const maxDepth = 100

    const firstLine = cm.getLine(start.line)
    const lastLineNo = cm.lastLine()

    function isHeader (lineNo) {
      const tokentype = cm.getTokenTypeAt(CodeMirror.Pos(lineNo, 0))
      return tokentype && /\bheader\b/.test(tokentype)
    }

    function headerLevel (lineNo, line, nextLine) {
      let match = line && line.match(/^#+/)
      if (match && isHeader(lineNo)) return match[0].length
      match = nextLine && nextLine.match(/^[=-]+\s*$/)
      if (match && isHeader(lineNo + 1)) return nextLine[0] === '=' ? 1 : 2
      return maxDepth
    }

    function collapseHeaders() {
      let nextLine = cm.getLine(start.line + 1)
      const level = headerLevel(start.line, firstLine, nextLine)
      if (level === maxDepth) return undefined

      let end = start.line
      let nextNextLine = cm.getLine(end + 2)
      while (end < lastLineNo) {
        if (headerLevel(end + 1, nextLine, nextNextLine) <= level) break
        ++end
        nextLine = nextNextLine
        nextNextLine = cm.getLine(end + 2)
      }

      return {
        from: CodeMirror.Pos(start.line, firstLine.length),
        to: CodeMirror.Pos(end, cm.getLine(end).length)
      }
    }

    function collapseBranch() {
      let end = start.line
      const level = (firstLine.length - firstLine.trimStart().length) / 8

      let nextLine = cm.getLine(end + 1)
      while (end < lastLineNo) {
        const newLevel = (nextLine.length - nextLine.trimStart().length) / 8;
        if (nextLine.trim() != "" && newLevel <= level) break
        ++end
        nextLine = cm.getLine(end + 1)
      }

      return {
        from: CodeMirror.Pos(start.line, firstLine.length),
        to: CodeMirror.Pos(end, cm.getLine(end).length)
      }
    }

    function collapseConditional() {
      let end = start.line
      const level = (firstLine.length - firstLine.trimStart().length) / 8

      let nextLine = cm.getLine(end + 1)
      let ifLevel = 1;
      while (end < lastLineNo) {
        const newLevel = (nextLine.length - nextLine.trimStart().length) / 8;
        if (nextLine.trimStart() === "$ else")
          if (ifLevel === 1) break;
        if (nextLine.trimStart().startsWith("$ elif"))
          if (ifLevel === 1) break;
        if (nextLine.trimStart() === "$ endif")
          ifLevel--;
        else if (nextLine.trimStart().startsWith("$ ") && nextLine.endsWith("?"))
          ifLevel++;

        if (nextLine.trim() != "" && newLevel === level && ifLevel === 0) break
        ++end
        nextLine = cm.getLine(end + 1)
      }

      return {
        from: CodeMirror.Pos(start.line, firstLine.length),
        to: CodeMirror.Pos(end, cm.getLine(end).length)
      }
    }

    if (firstLine.trimStart().startsWith("* ") || firstLine.trimStart().startsWith("// "))
      return collapseBranch();

    if ((firstLine.trimStart().startsWith("$ ") && firstLine.endsWith("?")) || firstLine.trimStart().startsWith("$ else") || firstLine.trimStart().startsWith("$ elif"))
      return collapseConditional();

    return collapseHeaders();
  })
})
