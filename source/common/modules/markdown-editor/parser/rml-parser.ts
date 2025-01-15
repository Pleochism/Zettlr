/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        RML Parser
 *
 * Description:     This parser detects all RML (Ren'Py Markdown Language) elements inside Markdown.
 *
 * END HEADER
 */

import { type InlineParser, type BlockParser } from '@lezer/markdown'

export const conditionalStartParser: InlineParser = {
  name: 'rml-conditional-start',
  parse (ctx, next, pos) {
    if (next !== 105) { // i
      return -1
    }

    const relativePosition = pos - ctx.offset
    // Matches if...:
    const match = /(if .+:)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    // At this point we have a footnote and it's at the current pos
    return ctx.addElement(ctx.elt('RmlConditionalStart', pos, pos + match[0].length))
  }
}

export const conditionalBranchParser: InlineParser = {
  name: 'rml-conditional-branch',
  parse (ctx, next, pos) {
    if (next !== 101) { // e
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches if...:
    const match = /(elif .+:)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    // At this point we have a footnote and it's at the current pos
    return ctx.addElement(ctx.elt('RmlConditionalBranch', pos, pos + match[0].length))
  }
}

export const playerParser: InlineParser = {
  name: 'rml-player',
  parse (ctx, next, pos) {
    if (next !== 46) { // .
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Check that there's nothing but whitespace before this and the previous newline
    for (let i = relativePosition - 1; i >= 0; i--) {
      if (ctx.text[i] === '\n')
        break
      if (ctx.text[i] !== '\t' && ctx.text[i] !== ' ')
        return -1
    }

    // Matches . ...:
    const match = /^\s*\. (.+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    ctx.addElement(ctx.elt('RmlPlayerName', pos, pos + 2))

    // Check for any dialogue segments and flag those as well
    const narrationRE = /(".+?(?:[\.\?!\-\*,"]"(?![a-z])|"\-|[a-z]"(?![\s\.\?!\*,"])|\."(?![a-z])))/gi

    const narrations = match[match.length - 1].split(narrationRE)
    if (narrations.length === 1) {
      ctx.addElement(ctx.elt('RmlPlayerTextDialogue', pos + 2, pos + 1 + match[0].length))
    } else {
      let offset = 2
      narrations.forEach(x => {
        let type = 'RmlPlayerText'
        if (x.startsWith('"'))
          type = 'RmlPlayerTextDialogue'
        ctx.addElement(ctx.elt(type, pos + offset, pos + offset + x.length))
        offset += x.length
      })
    }

    return ctx.addElement(ctx.elt('RmlPlayer', pos, pos + 1 + match[0].length))
  }
}

export const characterParser: InlineParser = {
  name: 'rml-character',
  parse (ctx, next, pos) {
    if (next !== 64) { // @
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Check that there's nothing but whitespace before this and the previous newline
    for (let i = relativePosition - 1; i >= 0; i--) {
      if (ctx.text[i] === '\n')
        break
      if (ctx.text[i] !== '\t' && ctx.text[i] !== ' ')
        return -1
    }

    // Matches . ...:
    const match = /\s*(@[a-zA-Z]+) (.+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    console.log(pos, ctx.offset, match[0])

    ctx.addElement(ctx.elt('RmlCharacterName', pos, pos + match[1].length))

    // Check for any dialogue segments and flag those as well
    const narrationRE = /(".+?(?:[\.\?!\-\*,"]"(?![a-z])|"\-|[a-z]"(?![\s\.\?!\*,"])|\."(?![a-z])))/gi

    const narrations = match[match.length - 1].split(narrationRE)
    if (narrations.length === 1) {
      ctx.addElement(ctx.elt('RmlCharacterTextDialogue', pos + 1 + match[1].length, pos + 1 + match[0].length))
    } else {
      let offset = 1 + match[1].length
      narrations.forEach(x => {
        let type = 'RmlCharacterText'
        if (x.startsWith('"'))
          type = 'RmlCharacterTextDialogue'
        ctx.addElement(ctx.elt(type, pos + offset, pos + offset + x.length))
        offset += x.length
      })
    }

    return ctx.addElement(ctx.elt('RmlCharacter', pos, pos + match[0].length))
  }
}
