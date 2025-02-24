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

import { type InlineParser, type Element } from '@lezer/markdown'

function space (ch: number) { return ch == 32 || ch == 9 || ch == 10 || ch == 13 }

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

    const keywordsRE = /([A-Z][\w]+\.\w{1,})/g
    const keywords = ctx.text.slice(relativePosition).split('\n')[0].split(keywordsRE)
    const keywordElems: Element[] = []

    let offset = pos
    keywords.forEach(x => {
      if (x.includes('.') && x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
        keywordElems.push(ctx.elt('RmlConditionalKeyword', offset, offset + x.length))
      }
      offset += x.length
    })

    return ctx.addElement(ctx.elt('RmlConditionalStart', pos, pos + match[0].length, keywordElems))
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
    const match = /((elif .+|else):)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const keywordsRE = /([A-Z]\w+\.\w{1,})/g
    const keywords = ctx.text.slice(relativePosition).split('\n')[0].split(keywordsRE)
    const keywordElems: Element[] = []

    let offset = pos
    keywords.forEach(x => {
      if (x.includes('.') && x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
        keywordElems.push(ctx.elt('RmlConditionalKeyword', offset, offset + x.length))
      }
      offset += x.length
    })

    return ctx.addElement(ctx.elt('RmlConditionalBranch', pos, pos + match[0].length, keywordElems))
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
    const match = /^\s*(\. )(.+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const elems: Element[] = []

    elems.push(ctx.elt('RmlPlayerName', pos, pos + match[1].length))

    // Check for any dialogue segments and flag those as well
    const narrationRE = /(".+?(?:[\.\?!\-\*,"]"(?![a-z])|"\-|[a-z]"(?![\s\.\?!\*,"])|\."(?![a-z])))/gi
    const italicRE = /(\*.+?\*)/gi

    const textPieces: Element[] = []

    const textStart = pos + match[1].length

    const narrations = match[match.length - 1].split(narrationRE)
    if (narrations.length === 1) {
      const italics = narrations[0].split(italicRE)
      const italicElements: Element[] = []
      let iAdjust = textStart
      let iOffset = 0
      italics.forEach(x => {
        if (x.startsWith('*')) {
          if (iAdjust + x.length === narrations[0].length - 1)
            iOffset = -1
          italicElements.push(ctx.elt('RmlPlayerDialogueItalic', iAdjust, iAdjust + x.length + iOffset))
        }
        iAdjust += x.length
      })
      textPieces.push(ctx.elt('RmlPlayerDialogue', textStart, textStart + match[0].length - 1, italicElements))
    } else {
      let offset = textStart
      narrations.forEach((x, i) => {
        const italicElements: Element[] = []

        let adjust = 0
        let type = 'RmlPlayerNarration'
        if (x.startsWith('"')) {
          type = 'RmlPlayerDialogue'
        }
        // Newline at end
        if (i == narrations.length - 1) {
          adjust = -1
        }

        const italics = x.split(italicRE)
        let iAdjust = offset
        let iOffset = 0
        italics.forEach((y, j) => {
          if (y.startsWith('*')) {
            if (j === italics.length - 1)
              iOffset = adjust
            italicElements.push(ctx.elt(`${type}Italic`, iAdjust, iAdjust + y.length + iOffset))
          }
          iAdjust += y.length
        })

        textPieces.push(ctx.elt(type, offset, offset + x.length + adjust, italicElements))
        offset += x.length
      })
    }

    elems.push(ctx.elt('RmlPlayerText', pos + match[1].length, pos + match[0].length - 1, textPieces))

    return ctx.addElement(ctx.elt('RmlPlayer', pos, pos + match[0].length - 1, elems))
  }
}

export const characterParser: InlineParser = {
  name: 'rml-character',
  parse (ctx, next, pos) {
    if (next !== 64) { // @
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Check that there's nothing but whitespace before this and the start of the paragraph
    for (let i = relativePosition - 1; i >= 0; i--) {
      if (ctx.text[i] === '\n')
        break
      if (ctx.text[i] !== '\t' && ctx.text[i] !== ' ')
        return -1
    }

    // Matches . ...:
    const match = /^\s*(@[a-zA-Z]+ )(.+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const elems: Element[] = []

    elems.push(ctx.elt('RmlCharacterName', pos, pos + match[1].length))

    // Check for any dialogue segments and flag those as well
    const narrationRE = /(".+?(?:[\.\?!\-\*,"]"(?![a-z])|"\-|[a-z]"(?![\s\.\?!\*,"])|\."(?![a-z])))/gi
    const italicRE = /(\*.+?\*)/gi

    const textPieces: Element[] = []

    const textStart = pos + match[1].length

    const narrations = match[match.length - 1].split(narrationRE)
    if (narrations.length === 1) {
      const italics = narrations[0].split(italicRE)
      const italicElements: Element[] = []
      let iAdjust = textStart
      let iOffset = 0
      italics.forEach((x, i) => {
        if (x.startsWith('*')) {
          if (i === italics.length - 1)
            iOffset = -match[1].length
          italicElements.push(ctx.elt('RmlCharacterDialogueItalic', iAdjust, iAdjust + x.length + iOffset))
        }
        iAdjust += x.length
      })
      textPieces.push(ctx.elt('RmlCharacterDialogue', textStart, textStart + match[0].length - match[1].length, italicElements))
    } else {
      let offset = textStart
      narrations.forEach((x, i) => {
        const italicElements: Element[] = []

        let adjust = 0
        let type = 'RmlCharacterNarration'
        if (x.startsWith('"'))
          type = 'RmlCharacterDialogue'
        // Newline at end
        if (i == narrations.length - 1)
          adjust = -match[1].length

        const italics = x.split(italicRE)
        let iAdjust = offset
        let iOffset = 0
        italics.forEach((y, j) => {
          if (y.startsWith('*')) {
            if (j === italics.length - 1)
              iOffset = adjust
            italicElements.push(ctx.elt(`${type}Italic`, iAdjust, iAdjust + y.length + iOffset))
          }
          iAdjust += y.length
        })

        textPieces.push(ctx.elt(type, offset, offset + x.length + adjust, italicElements))
        offset += x.length
      })
    }

    elems.push(ctx.elt('RmlCharacterNarration', pos + match[1].length, pos + match[0].length - match[1].length, textPieces))

    return ctx.addElement(ctx.elt('RmlCharacter', pos, pos + match[0].length - match[1].length, elems))
  }
}

export const jumpParser: InlineParser = {
  name: 'rml-jump',
  parse (ctx, next, pos) {
    if (next !== 62) { // >
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches (>|>>) .....
    const match = /(\s*(>{1,2}) .+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    return ctx.addElement(ctx.elt('RmlJump', pos, pos + match[0].length))
  }
}

export const codeParser: InlineParser = {
  name: 'rml-code',
  parse (ctx, next, pos) {
    if (next !== 36) { // $
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches $ ....
    const match = /(\s*\$ .+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const keywordsRE = /([A-Z]\w+\.\w{1,})/g
    const keywords = ctx.text.slice(relativePosition + 2).split('\n')[0].split(keywordsRE)
    const keywordElems: Element[] = []

    if (keywords.length > 1) {
      let offset = pos + 2
      keywords.forEach(x => {
        if (x.includes('.') && x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
          keywordElems.push(ctx.elt('RmlCodeKeyword', offset, offset + x.length))
        }
        offset += x.length
      })
    }

    return ctx.addElement(ctx.elt('RmlCode', pos, pos + match[0].length, keywordElems))
  }
}

export const callParser: InlineParser = {
  name: 'rml-call',
  parse (ctx, next, pos) {
    if (next !== 126) { // ~
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches (~|~~) ...
    const match = /((\~|\~\~) .+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    return ctx.addElement(ctx.elt('RmlCall', pos, pos + match[0].length))
  }
}

export const choiceParser: InlineParser = {
  name: 'rml-choice',
  before: 'Emphasis',
  parse (ctx, next, pos) {
    if (next !== 42) { // *
      return -1
    }

    const relativePosition = pos - ctx.offset

    if (relativePosition !== 0 && !space(ctx.text.charCodeAt(relativePosition - 1)))
      return -1

    // Matches * .....
    const match = /(\s*\* )(.+)/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const keywordElems: Element[] = []

    // If this choice is emote-flagged
    if (match[2].startsWith('[')) {
      const endsAt = match[2].indexOf(']')
      keywordElems.push(ctx.elt('RmlChoiceEmote', pos + match[1].length, pos + match[1].length + endsAt + 1))
    }


    const keywordsRE = /([A-Z]\w+\.\w{1,})/g
    const keywords = (ctx.text.slice(relativePosition).split('\n')[0].split('?')[1] ?? '').split(keywordsRE)
    if (keywords.length > 1) {
      let offset = pos + ctx.text.slice(relativePosition).indexOf('?') + 1
      keywords.forEach(x => {
        if (x.includes('.') && x.charCodeAt(0) >= 65 && x.charCodeAt(0) <= 90) {
          keywordElems.push(ctx.elt('RmlChoiceKeyword', offset, offset + x.length))
        }
        offset += x.length
      })
    }

    const italicRE = /(\*.+?\*)/gi
    const italics = ctx.text.slice(relativePosition + match[1].length).split('\n')[0].split('?')[0].split(italicRE)
    let iAdjust = pos + match[1].length
    let iOffset = 0
    italics.forEach(x => {
      if (x.startsWith('*')) {
        keywordElems.push(ctx.elt('RmlChoiceItalic', iAdjust, iAdjust + x.length + iOffset))
      }
      iAdjust += x.length
    })

    return ctx.addElement(ctx.elt('RmlChoice', pos, pos + match[0].length, keywordElems))
  }
}

export const blockJumpStartParser: InlineParser = {
  name: 'rml-jumpstart',
  parse (ctx, next, pos) {
    if (next !== 47) { // /
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches / .....
    const match = /(\s*)(\/\/\s?).*/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const mark = ctx.elt('RmlBlockJumpStartMark', pos + match[1].length, pos + match[1].length + match[2].length)

    return ctx.addElement(ctx.elt('RmlBlockJumpStart', pos, pos + match[0].length, [mark]))
  }
}

export const blockJumpEndParser: InlineParser = {
  name: 'rml-jumpend',
  parse (ctx, next, pos) {
    if (next !== 92) { // \
      return -1
    }

    const relativePosition = pos - ctx.offset

    // Matches \
    const match = /(\s*)(\\\\\s?).*/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    const mark = ctx.elt('RmlBlockJumpEndMark', pos + match[1].length, pos + match[1].length + match[2].length)

    return ctx.addElement(ctx.elt('RmlBlockJumpEnd', pos, pos + match[0].length, [mark]))
  }
}
