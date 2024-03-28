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
import { partialParse } from './partial-parse'

// TODO: Docs for this: https://github.com/lezer-parser/markdown#user-content-blockparser
export const conditionalEndParser: InlineParser = {
  // This parser should only match inline footnotes
  name: 'rmd-conditional-end',
  //before: 'Link', // [^1] will otherwise be detected as a link
  parse (ctx, next, pos) {
    if (next !== 91 && next !== 94) { // [, ^
      return -1
    }

    const relativePosition = pos - ctx.offset
    // Matches [^identifier] (alternative 1) and ^[inline] (alternative 2)
    const match = /\[\^[^\s]+?\]|\^\[.+?\]/.exec(ctx.text.slice(relativePosition))

    if (match === null || match.index > 0) {
      return -1
    }

    // At this point we have a footnote and it's at the current pos
    return ctx.addElement(ctx.elt('Footnote', pos, pos + match[0].length))
  }
}

export const conditionalParser: BlockParser = {
  name: 'rml-conditional',
  parse (ctx, line) {
    const match = /^(\s*)(if .+:)$/.exec(line.text)
    if (match === null) {
      return false
    }

    const refFrom = ctx.lineStart
    const indentSize = match[0].length
    const indent = " ".repeat(indentSize)

    const label = ctx.elt('RmlConditionalStart', refFrom, ctx.lineStart + match[0].length + match[1].length)

    let from = ctx.lineStart + match[0].length + match[1].length
    let to = ctx.lineStart + line.text.length + 1

    const elems = [label]
    const conditionalBody: string[] = [line.text.slice(match[0].length + match[1].length)]

    // Everything at least indented by 4 spaces OR empty lines AND not another conditional line at the same indentation
    // belongs to this conditional
    while (ctx.nextLine() && line.text !== `${indent}endif:` && new RegExp(`^\\s{${indent},}|^\\s*$`).test(line.text)) {
      if (line.text.startsWith(`${indent}elif `)) {
        // We're starting a new block, save the previous one
        const treeElem = partialParse(ctx, ctx.parser, conditionalBody.join('\n'), from)
        const body = ctx.elt('RmlConditionalBody', from, to, [treeElem])
        elems.push(body)
        conditionalBody.length = 0
        const elif = ctx.elt('RmlConditionalBranch', ctx.lineStart, ctx.lineStart + line.text.length)
        elems.push(elif)
        from = ctx.lineStart + line.text.length
        to = ctx.lineStart + line.text.length
      }
      else {
        conditionalBody.push(line.text)
        to += line.text.length
      }
    }

    // Remove trailing empty lines from the body itself
    //let bodyTo = to
    //while (conditionalBody.length > 0 && conditionalBody[conditionalBody.length - 1].trim() === '') {
    //  const lastline = conditionalBody.pop() as string
    //  bodyTo = bodyTo - lastline.length - 1
    //}

    // Since footnotes can be empty, the above while loop will substract one too
    // much from empty footnotes (so that bodyTo = from - 1). Here we correct
    // for that.
    //if (bodyTo < from) {
    //  bodyTo = from
    //}

    const treeElem = partialParse(ctx, ctx.parser, conditionalBody.join('\n'), from)
    const body = ctx.elt('RmlConditionalBody', from, to, [treeElem])
    elems.push(body)

    // This will be the endif
    if (line.text.startsWith(`${indent}endif:`)) {
      const endif = ctx.elt('RmlConditionalEnd', ctx.lineStart, ctx.lineStart + line.text.length)
      elems.push(endif)
    }

    const wrapper = ctx.elt('RmlConditional', refFrom, ctx.lineStart + line.text.length, elems)
    ctx.addElement(wrapper)

    return true
  }
}
